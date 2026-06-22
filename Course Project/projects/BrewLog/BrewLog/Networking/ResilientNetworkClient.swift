import Foundation

// Wraps any NetworkClient with the three things every tutorial's networking
// layer skips: retry on a transient failure, refresh-and-retry-once on an
// expired token, and de-duplication so two callers asking for the same thing
// at once only hit the server once. Composition over inheritance — the
// underlying client doesn't know any of this is happening.
struct ResilientNetworkClient: NetworkClient {
    let wrapped: NetworkClient
    let authTokenStore: AuthTokenStore
    let deduplicator: RequestDeduplicator
    var maxRetries: Int = 2

    func send<T: Decodable>(_ endpoint: Endpoint, as type: T.Type) async throws -> T {
        let key = "\(endpoint.method) \(endpoint.path)?\(endpoint.queryItems)"
        return try await deduplicator.value(for: key, as: T.self) {
            try await sendWithRetryAndAuth(endpoint, as: T.self)
        }
    }

    private func sendWithRetryAndAuth<T: Decodable>(
        _ endpoint: Endpoint,
        as type: T.Type,
        attempt: Int = 1,
        didRefreshToken: Bool = false
    ) async throws -> T {
        var request = endpoint
        if request.requiresAuth {
            request.headers["Authorization"] = "Bearer \(await authTokenStore.currentToken)"
        }

        do {
            return try await wrapped.send(request, as: T.self)
        } catch APIError.badStatus(401) where request.requiresAuth && !didRefreshToken {
            // Refreshing is itself just a network call — but it must never
            // route back through this same client, or a 401 on the refresh
            // endpoint would try to refresh itself forever.
            _ = try await authTokenStore.refreshedToken()
            return try await sendWithRetryAndAuth(endpoint, as: T.self, attempt: attempt, didRefreshToken: true)
        } catch let error as APIError where Self.isRetryable(error) && attempt <= maxRetries {
            try await Task.sleep(for: .milliseconds(200 * attempt))
            return try await sendWithRetryAndAuth(endpoint, as: T.self, attempt: attempt + 1, didRefreshToken: didRefreshToken)
        }
    }

    private static func isRetryable(_ error: APIError) -> Bool {
        switch error {
        case .transport:
            return true
        case .badStatus(let code):
            return (500...599).contains(code)
        case .invalidURL, .decoding:
            return false
        }
    }
}
