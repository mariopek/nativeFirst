import Testing
import Foundation
@testable import BrewLog

// The provider's job is turning brew dates into something WidgetKit can render
// on a timeline. None of that needs WidgetKit loaded to test — `makeStreakEntry`
// is the same kind of pure function as Day 21's `currentStreak`, written first.

@Suite("makeStreakEntry: what the widget's timeline provider hands to its view")
struct BrewStreakWidgetTests {

    @Test("a five-day streak produces an entry with the same number currentStreak would")
    func entryCarriesTheRealStreak() {
        let calendar = Calendar(identifier: .gregorian)
        let today = calendar.startOfDay(for: .now)
        let dates = (0..<5).map { calendar.date(byAdding: .day, value: -$0, to: today)! }

        let entry = makeStreakEntry(brewDates: dates, asOf: today, calendar: calendar)

        #expect(entry.streak == 5)
        #expect(entry.glass == .lit)
    }

    @Test("a week or more lights the onFire glass, matching the in-app badge")
    func sevenDayStreakIsOnFire() {
        let calendar = Calendar(identifier: .gregorian)
        let today = calendar.startOfDay(for: .now)
        let dates = (0..<7).map { calendar.date(byAdding: .day, value: -$0, to: today)! }

        let entry = makeStreakEntry(brewDates: dates, asOf: today, calendar: calendar)

        #expect(entry.glass == .onFire)
    }

    @Test("no history yet hides the glass instead of showing a lying zero")
    func emptyHistoryHidesGlass() {
        let entry = makeStreakEntry(brewDates: [], asOf: .now, calendar: Calendar(identifier: .gregorian))

        #expect(entry.streak == 0)
        #expect(entry.glass == .hidden)
    }
}
