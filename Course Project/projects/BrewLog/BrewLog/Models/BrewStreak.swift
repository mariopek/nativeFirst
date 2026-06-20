import Foundation

/// How many consecutive days in a row have at least one logged brew,
/// counting backward from `referenceDate`. Pure function — no SwiftData,
/// no view, nothing to mock. The decision the view used to fake with "0".
///
/// Today gets a one-day grace period: if yesterday was logged but today
/// hasn't happened yet, the streak still counts — the day isn't over.
func currentStreak(
    brewDates: [Date],
    asOf referenceDate: Date = .now,
    calendar: Calendar = .current
) -> Int {
    let loggedDays = Set(brewDates.map { calendar.startOfDay(for: $0) })
    let today = calendar.startOfDay(for: referenceDate)

    var day = today
    if !loggedDays.contains(today) {
        guard let yesterday = calendar.date(byAdding: .day, value: -1, to: today) else { return 0 }
        day = yesterday
    }

    var streak = 0
    while loggedDays.contains(day) {
        streak += 1
        guard let previous = calendar.date(byAdding: .day, value: -1, to: day) else { break }
        day = previous
    }
    return streak
}
