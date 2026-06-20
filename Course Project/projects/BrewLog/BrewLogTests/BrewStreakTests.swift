import Testing
import Foundation
@testable import BrewLog

// The "Streak" stat card in ContentView has shipped hardcoded to "0" since
// Day 1 of this project. Nobody noticed because a stat that's always zero
// doesn't crash, doesn't log a warning, and doesn't fail a single existing
// test. It just quietly lies. This file is where that ends — written before
// a single line of the real implementation exists.

@Suite("currentStreak: consecutive brewing days")
struct BrewStreakTests {

    @Test("five brews on five consecutive days, asked today -> streak of 5")
    func consecutiveDaysCountUp() {
        let calendar = Calendar(identifier: .gregorian)
        let today = calendar.startOfDay(for: .now)
        let dates = (0..<5).map { calendar.date(byAdding: .day, value: -$0, to: today)! }

        #expect(currentStreak(brewDates: dates, asOf: today, calendar: calendar) == 5)
    }

    @Test("no brew yet today, but five in a row through yesterday -> still 5, not 0")
    func todayHasGraceBeforeBreaking() {
        let calendar = Calendar(identifier: .gregorian)
        let today = calendar.startOfDay(for: .now)
        // Five brews ending yesterday — nothing logged for `today`.
        let dates = (1...5).map { calendar.date(byAdding: .day, value: -$0, to: today)! }

        #expect(currentStreak(brewDates: dates, asOf: today, calendar: calendar) == 5)
    }

    @Test("a gap two days back breaks the streak even if today is logged")
    func gapBreaksStreak() {
        let calendar = Calendar(identifier: .gregorian)
        let today = calendar.startOfDay(for: .now)
        // Logged today and yesterday, then a gap, then three more days further back.
        let dates = [0, 1, 3, 4, 5].map { calendar.date(byAdding: .day, value: -$0, to: today)! }

        #expect(currentStreak(brewDates: dates, asOf: today, calendar: calendar) == 2)
    }

    @Test("three brews on the same day only count as one day of streak")
    func sameDayBrewsCollapseToOne() {
        let calendar = Calendar(identifier: .gregorian)
        let today = calendar.startOfDay(for: .now)
        let dates = [today, today.addingTimeInterval(60 * 60), today.addingTimeInterval(60 * 60 * 8)]

        #expect(currentStreak(brewDates: dates, asOf: today, calendar: calendar) == 1)
    }

    @Test("no brews ever logged -> streak of 0, not a crash")
    func emptyHistoryIsZero() {
        #expect(currentStreak(brewDates: [], calendar: Calendar(identifier: .gregorian)) == 0)
    }
}
