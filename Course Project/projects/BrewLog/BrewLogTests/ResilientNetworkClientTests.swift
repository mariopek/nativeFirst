import Testing
@testable import BrewLog

private struct Widget: Decodable, Equatable {
    let name: String
}

private actor RecordingNetworkClient: NetworkClient {
    private(set) var receivedHeaders: [[String: String]] = []
    private var results: [Result<Any, Error>]
    private var onFirstCallStarted: (() async -> Void)?

    init(results: [Result<Any, Error>], onFirstCallStarted: (() async -> Void)? = nil) {
        self.results = results
        self.onFirstCallStarted = onFirstCallStarted
    }

    var callCount: Int { receivedHeaders.count }

    func send<T: Decodable>(_ endpoint: Endpoint, as type: T.Type) async throws -> T {
        receivedHeaders.append(endpoint.headers)

        // Lets a test prove two calls were genuinely in flight together,
        // instead of one finishing before the other even starts.
        if let hook = onFirstCallStarted {
            onFirstCallStarted = nil
            await hook()
            try? await Task.sleep(for: .milliseconds(20))
        }

        guard !results.isEmpty else {
            throw APIError.transport("RecordingNetworkClient ran out of canned results")
        }
        switch results.removeFirst() {
        case .success(let value):
            guard let typed = value as? T else {
                throw APIError.decoding("RecordingNetworkClient result type mismatch")
            }
            return typed
        case .failure(let error):
            throw error
        }
    }
}

@Suite("ResilientNetworkClient")
struct ResilientNetworkClientTests {

    @Test("retries a transient 5xx and succeeds once the server recovers")
    func retriesTransientFailure() async throws {
        let fake = RecordingNetworkClient(results: [
            .failure(APIError.badStatus(503)),
            .failure(APIError.badStatus(503)),
            .success(Widget(name: "kettle"))
        ])
        let client = ResilientNetworkClient(
            wrapped: fake,
            authTokenStore: AuthTokenStore(initialToken: "unused") { "unused" },
            deduplicator: RequestDeduplicator()
        )

        let widget = try await client.send(Endpoint(path: "widgets/1"), as: Widget.self)

        #expect(widget == Widget(name: "kettle"))
        #expect(await fake.callCount == 3)
    }

    @Test("a non-retryable 404 fails on the first attempt")
    func doesNotRetryClientErrors() async throws {
        let fake = RecordingNetworkClient(results: [.failure(APIError.badStatus(404))])
        let client = ResilientNetworkClient(
            wrapped: fake,
            authTokenStore: AuthTokenStore(initialToken: "unused") { "unused" },
            deduplicator: RequestDeduplicator()
        )

        await #expect(throws: APIError.badStatus(404)) {
            _ = try await client.send(Endpoint(path: "widgets/1"), as: Widget.self)
        }
        #expect(await fake.callCount == 1)
    }

    @Test("a 401 on an authenticated endpoint refreshes the token and retries once with it")
    func refreshesTokenOn401() async throws {
        let fake = RecordingNetworkClient(results: [
            .failure(APIError.badStatus(401)),
            .success(Widget(name: "kettle"))
        ])
        let client = ResilientNetworkClient(
            wrapped: fake,
            authTokenStore: AuthTokenStore(initialToken: "expired") { "fresh" },
            deduplicator: RequestDeduplicator()
        )

        let widget = try await client.send(
            Endpoint(path: "tips/today", requiresAuth: true),
            as: Widget.self
        )

        #expect(widget == Widget(name: "kettle"))
        let headers = await fake.receivedHeaders
        #expect(headers[0]["Authorization"] == "Bearer expired")
        #expect(headers[1]["Authorization"] == "Bearer fresh")
    }

    @Test("a 401 on an endpoint that never opted into auth is not treated as a refresh signal")
    func doesNotRefreshForUnauthenticatedEndpoints() async throws {
        let fake = RecordingNetworkClient(results: [.failure(APIError.badStatus(401))])
        let client = ResilientNetworkClient(
            wrapped: fake,
            authTokenStore: AuthTokenStore(initialToken: "unused") { "unused" },
            deduplicator: RequestDeduplicator()
        )

        await #expect(throws: APIError.badStatus(401)) {
            _ = try await client.send(Endpoint(path: "widgets/1"), as: Widget.self)
        }
        #expect(await fake.callCount == 1)
    }

    @Test("a second call that arrives while the first is still in flight gets the same response, and the wrapped client is hit once")
    func deduplicatesConcurrentCalls() async throws {
        let firstCallStarted = Gate()
        let fake = RecordingNetworkClient(
            results: [.success(Widget(name: "kettle"))],
            onFirstCallStarted: { await firstCallStarted.open() }
        )
        let client = ResilientNetworkClient(
            wrapped: fake,
            authTokenStore: AuthTokenStore(initialToken: "unused") { "unused" },
            deduplicator: RequestDeduplicator()
        )

        let firstTask = Task {
            try await client.send(Endpoint(path: "tips/today"), as: Widget.self)
        }

        await firstCallStarted.wait()

        let secondResult = try await client.send(Endpoint(path: "tips/today"), as: Widget.self)
        let firstResult = try await firstTask.value

        #expect(firstResult == Widget(name: "kettle"))
        #expect(secondResult == Widget(name: "kettle"))
        #expect(await fake.callCount == 1)
    }
}

private actor Gate {
    private var isOpen = false
    private var continuation: CheckedContinuation<Void, Never>?

    func open() {
        isOpen = true
        continuation?.resume()
        continuation = nil
    }

    func wait() async {
        if isOpen { return }
        await withCheckedContinuation { continuation = $0 }
    }
}
