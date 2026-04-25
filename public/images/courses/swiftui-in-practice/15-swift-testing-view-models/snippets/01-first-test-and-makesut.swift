import Testing
@testable import Pulse

// Swift Testing replaces XCTest. The new ergonomics:
//   • @Test instead of `func testThing()`
//   • #expect(...) instead of XCTAssertEqual / XCTAssertTrue
//   • plain `throws async` test functions
//   • parameterized tests with @Test(arguments: [...])

@Suite("WatchlistViewState")
@MainActor
struct WatchlistViewStateTests {

    // makeSUT is the pattern that runs through the rest of this course
    // and all of Course 3. It builds the System Under Test and returns
    // both the SUT and the collaborators we want to inspect.
    //
    // Why a function and not a setup() method?
    //   • each test gets a fresh instance — no shared mutable state
    //   • each test can override only the dependencies it cares about
    //   • the SUT's dependencies are explicit at the call site
    //
    // This is the cornerstone of fast, isolated, deterministic tests.
    private func makeSUT(
        fixtures: [MarketEntry] = MarketEntry.previewSet,
        failure: Error? = nil,
        delay: Duration = .zero
    ) -> (sut: WatchlistViewState, repo: MockMarketsRepository) {
        let repo = MockMarketsRepository(
            fixtures: fixtures,
            delay: delay,
            failure: failure
        )
        let cache = MarketsCache(suite: UserDefaults(suiteName: UUID().uuidString)!)
        let sut = WatchlistViewState(repository: repo, cache: cache)
        return (sut, repo)
    }

    @Test("load() with successful repo populates entries and flips to .loaded")
    func loadSuccess() async throws {
        let (sut, _) = makeSUT(fixtures: Array(MarketEntry.previewSet.prefix(3)))

        await sut.load()

        #expect(sut.entries.count == 3)
        #expect(sut.loadState == .loaded)
        #expect(sut.lastRefresh != nil)
    }

    @Test("load() with empty fixtures flips to .empty")
    func loadEmpty() async throws {
        let (sut, _) = makeSUT(fixtures: [])

        await sut.load()

        #expect(sut.entries.isEmpty)
        #expect(sut.loadState == .empty)
    }

    @Test("load() failure with no cache flips to .failed")
    func loadFailureNoCache() async throws {
        let (sut, _) = makeSUT(failure: APIError.offline)

        await sut.load()

        if case .failed = sut.loadState { } else {
            Issue.record("Expected .failed state, got \(sut.loadState)")
        }
    }
}
