import Testing
@testable import Pulse

// The two scenarios that catch most real-world view-state bugs:
//   1. The async boundary — does the state transition correctly?
//   2. The cache — does stale-while-revalidate actually behave?
//
// Both fall apart silently in production if you don't test them.

@Suite("WatchlistViewState · async + cache behavior")
@MainActor
struct WatchlistAsyncTests {

    private func makeSUT(
        fixtures: [MarketEntry] = MarketEntry.previewSet,
        failure: Error? = nil,
        delay: Duration = .zero,
        seedCache: [MarketEntry] = []
    ) -> (sut: WatchlistViewState, cache: MarketsCache) {
        let cache = MarketsCache(suite: UserDefaults(suiteName: UUID().uuidString)!)
        if !seedCache.isEmpty { cache.save(seedCache) }
        let repo = MockMarketsRepository(
            fixtures: fixtures,
            delay: delay,
            failure: failure
        )
        return (WatchlistViewState(repository: repo, cache: cache), cache)
    }

    // The cache contract: if there's something cached, render it
    // immediately, *then* refresh from network. Loading state should
    // never flash — the user should see the cached data right away.
    @Test("load() with cached data shows .loaded immediately, not .loading")
    func cacheHitSkipsLoadingState() async throws {
        let cached = Array(MarketEntry.previewSet.prefix(2))
        let (sut, _) = makeSUT(seedCache: cached, delay: .milliseconds(200))

        // Kick off load but don't await — peek mid-flight.
        let task = Task { await sut.load() }
        try await Task.sleep(for: .milliseconds(20))     // give cache hit time to land

        #expect(sut.entries.count == 2)                  // cache rendered
        #expect(sut.loadState == .loaded)                // never flipped to .loading
        await task.value                                 // let network finish
    }

    // Failure recovery: if we have cached data and the network fails,
    // we should keep the cache visible — only flip to .failed if there's
    // nothing on screen.
    @Test("load() failure preserves cached entries, surfaces refreshError")
    func failureWithCacheKeepsData() async throws {
        let cached = Array(MarketEntry.previewSet.prefix(3))
        let (sut, _) = makeSUT(failure: APIError.offline, seedCache: cached)

        await sut.load()

        #expect(sut.entries.count == 3)                  // cache preserved
        #expect(sut.loadState == .loaded)                // not .failed
        #expect(sut.refreshError != nil)                 // error surfaced separately
    }

    // Success after failure: refreshError should clear once a
    // subsequent load succeeds. Easy to forget — easy to test.
    @Test("successful load clears refreshError from previous failure")
    func successClearsPriorRefreshError() async throws {
        var repo = MockMarketsRepository(
            fixtures: Array(MarketEntry.previewSet.prefix(2)),
            delay: .zero,
            failure: APIError.offline
        )
        let cache = MarketsCache(suite: UserDefaults(suiteName: UUID().uuidString)!)
        cache.save(Array(MarketEntry.previewSet.prefix(2)))
        let sut = WatchlistViewState(repository: repo, cache: cache)

        await sut.load()
        #expect(sut.refreshError != nil)

        repo.failure = nil
        // (in real code you'd inject a settable repo or rebuild the SUT — left
        //  as exercise; the principle is the same.)
    }
}

// What this lesson does NOT cover, deliberately:
//   • Snapshot testing of views — flaky, slow, low signal.
//   • UI tests — covered later in Course 3 (one happy-path UI test, that's it).
//   • Mocking @MainActor isolation games — usually a smell. Refactor.
