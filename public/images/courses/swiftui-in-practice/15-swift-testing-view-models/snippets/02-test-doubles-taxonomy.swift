import Foundation
@testable import Pulse

// A "test double" is anything you swap in for a real dependency in a test.
// Most engineers lump them all under "mock", which loses real meaning.
// Knowing the four types makes your tests express intent clearly.

// =====================================================================
// 1. STUB — returns canned data. No verification. No state. No logic.
// =====================================================================
struct StubMarketsRepository: MarketsRepository {
    let result: [MarketEntry]
    func fetchTopMarkets(limit: Int) async throws -> [MarketEntry] {
        result
    }
}
// Use a stub when the test only cares about the SUT's *output* given
// some input. "Given fixtures X, the view-state should expose Y."

// =====================================================================
// 2. SPY — records every interaction so you can assert on it later.
// =====================================================================
final class SpyMarketsRepository: MarketsRepository, @unchecked Sendable {
    var receivedLimits: [Int] = []
    let result: [MarketEntry]
    init(result: [MarketEntry] = []) { self.result = result }
    func fetchTopMarkets(limit: Int) async throws -> [MarketEntry] {
        receivedLimits.append(limit)            // ← the recording
        return result
    }
}
// Use a spy when the test cares about *what was called and how*.
// "load() should call the repo with limit: 8 exactly once."

// =====================================================================
// 3. MOCK — pre-programmed expectations + verification.
// =====================================================================
// In strict TDD literature, a Mock asserts during the test, not after.
// In Swift Testing, the cleanest form is a Spy whose recorded calls
// you verify with #expect at the end. So most "mocks" you'll see are
// really spies. Don't sweat the vocabulary — the distinction matters
// less than knowing which behavior you actually need.

// =====================================================================
// 4. FAKE — a real-enough implementation, just simpler/in-memory.
// =====================================================================
// MockMarketsRepository in the Pulse project (Networking/MarketsRepository.swift)
// is technically a Fake — it's a working alternative implementation, not
// canned data. It can return fixtures, simulate delays, and throw errors.
// We use it for both previews and tests, which is why it lives in the app
// target. A pure stub would be too dumb for previews to be useful.

// =====================================================================
// Why this matters: tests document intent.
// =====================================================================
// A test using a stub says "I'm testing the output, given this input."
// A test using a spy says "I'm testing the contract — what gets called."
// A test using a fake says "I want close-to-real behavior without a network."
//
// Reach for the simplest one that proves the behavior. Most of the time
// that's a stub. Don't reach for a spy unless you actually care about
// the call. Don't reach for a fake unless you need real-ish behavior.
