import Testing
@testable import BrewLog

@Suite("RequestDeduplicator")
struct RequestDeduplicatorTests {

    @Test("a second call that arrives while the first is still in flight joins it instead of running its own perform()")
    func concurrentCallsShareOneInFlightTask() async throws {
        let callCount = Counter()
        let deduplicator = RequestDeduplicator()
        let firstHasStarted = Gate()

        // The naive version of this test fires two `async let`s and hopes they
        // overlap. They often don't: with nothing to actually wait on, the
        // first call can run start-to-finish — including clearing the
        // dedup cache — before the second one is even scheduled, and the
        // "concurrent" test quietly stops testing concurrency at all. The
        // gate makes the overlap real instead of hoped-for.
        let firstTask = Task {
            try await deduplicator.value(for: "tips/today", as: String.self) {
                await callCount.increment()
                await firstHasStarted.open()
                try? await Task.sleep(for: .milliseconds(20))
                return "first"
            }
        }

        await firstHasStarted.wait()

        let secondResult = try await deduplicator.value(for: "tips/today", as: String.self) {
            await callCount.increment()
            return "second"
        }
        let firstResult = try await firstTask.value

        #expect(firstResult == "first")
        #expect(secondResult == "first")
        #expect(await callCount.value == 1)
    }

    @Test("different keys are not deduplicated against each other")
    func differentKeysRunIndependently() async throws {
        let deduplicator = RequestDeduplicator()

        async let tip = deduplicator.value(for: "tips/today", as: String.self) { "tip" }
        async let token = deduplicator.value(for: "auth/refresh", as: String.self) { "token" }

        let (tipResult, tokenResult) = try await (tip, token)
        #expect(tipResult == "tip")
        #expect(tokenResult == "token")
    }
}

private actor Counter {
    private(set) var value = 0
    func increment() { value += 1 }
}

/// Lets a test wait for a precise "the other task has reached this point"
/// signal instead of guessing at timing.
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
