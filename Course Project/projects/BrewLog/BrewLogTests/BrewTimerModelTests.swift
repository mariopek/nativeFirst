import Testing
import Foundation
@testable import BrewLog

// Quick-add has logged every method the same way since Day 1: tap it, a
// finished Brew appears instantly, rated and all. Fine for espresso — it's
// done in 25 seconds. A four-minute pour-over logged as "finished" the
// moment you tap it is the same kind of lie Day 21 found in the streak stat.
// This file is the decision matrix that ends it, written before the model
// that uses it exists.

@Suite("recommendedBrewDuration: which methods deserve a timer at all")
struct RecommendedBrewDurationTests {

    @Test("instant methods get no timer — done before you could glance at a Live Activity")
    func instantMethodsReturnNil() {
        #expect(recommendedBrewDuration(for: .espresso) == nil)
        #expect(recommendedBrewDuration(for: .mokaPot) == nil)
        #expect(recommendedBrewDuration(for: .cold) == nil)
    }

    @Test("filter brews get a real multi-minute duration")
    func filterGetsFourMinutes() {
        #expect(recommendedBrewDuration(for: .filter) == 240)
    }

    @Test("aeropress gets a shorter but still real duration")
    func aeropressGetsTwoAndAHalfMinutes() {
        #expect(recommendedBrewDuration(for: .aeropress) == 150)
    }
}

@Suite("BrewTimerModel: the part that doesn't need ActivityKit loaded to test")
struct BrewTimerModelTests {

    @Test("starting an instant method is a no-op — no phase change, no activity callback")
    func startingInstantMethodDoesNothing() {
        let model = BrewTimerModel()
        var startCalls = 0
        model.onActivityStart = { _, _, _ in startCalls += 1 }

        model.start(method: .espresso)

        #expect(model.phase == .idle)
        #expect(startCalls == 0)
    }

    @Test("starting a timed method moves to brewing and fires the start callback once")
    func startingTimedMethodBeginsBrewing() {
        let model = BrewTimerModel()
        var started: (method: BrewMethod, duration: TimeInterval)?
        model.onActivityStart = { method, _, duration in started = (method, duration) }

        let now = Date(timeIntervalSince1970: 1_000_000)
        model.start(method: .filter, now: now)

        #expect(model.phase == .brewing(method: .filter, startDate: now, totalDuration: 240))
        #expect(started?.method == .filter)
        #expect(started?.duration == 240)
    }

    @Test("ticking before the duration elapses stays in brewing and reports an update")
    func tickBeforeDoneStaysBrewing() {
        let model = BrewTimerModel()
        var updateCalls = 0
        model.onActivityUpdate = { _, _ in updateCalls += 1 }

        let start = Date(timeIntervalSince1970: 1_000_000)
        model.start(method: .filter, now: start)
        model.tick(now: start.addingTimeInterval(60))

        #expect(model.phase == .brewing(method: .filter, startDate: start, totalDuration: 240))
        #expect(updateCalls == 1)
    }

    @Test("ticking past the duration finishes the brew and ends the activity exactly once")
    func tickPastDurationFinishes() {
        let model = BrewTimerModel()
        var endCalls = 0
        model.onActivityEnd = { endCalls += 1 }

        let start = Date(timeIntervalSince1970: 1_000_000)
        model.start(method: .aeropress, now: start)
        model.tick(now: start.addingTimeInterval(150))

        #expect(model.phase == .finished(method: .aeropress))
        #expect(endCalls == 1)
    }

    @Test("remaining time counts down and never goes negative")
    func remainingTimeClampsAtZero() {
        let model = BrewTimerModel()
        let start = Date(timeIntervalSince1970: 1_000_000)
        model.start(method: .filter, now: start)

        #expect(model.remaining(now: start) == 240)
        #expect(model.remaining(now: start.addingTimeInterval(100)) == 140)
        #expect(model.remaining(now: start.addingTimeInterval(999)) == 0)
    }

    @Test("remaining time is zero when idle")
    func remainingTimeZeroWhenIdle() {
        let model = BrewTimerModel()
        #expect(model.remaining(now: .now) == 0)
    }
}
