import Testing
@testable import BrewLog

@Suite("AuthTokenStore")
struct AuthTokenStoreTests {

    @Test("refreshedToken() returns the refresher's result and updates currentToken")
    func refreshUpdatesCurrentToken() async throws {
        let store = AuthTokenStore(initialToken: "stale") { "fresh" }

        let token = try await store.refreshedToken()

        #expect(token == "fresh")
        #expect(await store.currentToken == "fresh")
    }

    @Test("ten callers racing for a refresh only trigger the network call once")
    func concurrentCallersShareOneRefresh() async throws {
        let refreshCount = Counter()
        let store = AuthTokenStore(initialToken: "stale") {
            await refreshCount.increment()
            try? await Task.sleep(for: .milliseconds(50))
            return "fresh"
        }

        let results = try await withThrowingTaskGroup(of: String.self) { group -> [String] in
            for _ in 0..<10 {
                group.addTask { try await store.refreshedToken() }
            }
            var collected: [String] = []
            for try await token in group {
                collected.append(token)
            }
            return collected
        }

        #expect(results == Array(repeating: "fresh", count: 10))
        #expect(await refreshCount.value == 1)
    }
}

private actor Counter {
    private(set) var value = 0
    func increment() { value += 1 }
}
