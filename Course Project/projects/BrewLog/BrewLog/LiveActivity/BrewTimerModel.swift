import Foundation
import Observation

/// The countdown logic behind a brewing Live Activity — deliberately with
/// no `import ActivityKit` in sight. Same lesson as Day 25's static
/// provider: the system's own glue (`Activity.request`/`.update`/`.end`)
/// only really works inside the system's own call path, so it doesn't
/// belong inside the thing you want to unit test. These three closures are
/// that seam; `BrewTimerActivityController` is the untestable glue that
/// fills them in for real.
@Observable
final class BrewTimerModel {
    enum Phase: Equatable {
        case idle
        case brewing(method: BrewMethod, startDate: Date, totalDuration: TimeInterval)
        case finished(method: BrewMethod)
    }

    private(set) var phase: Phase = .idle

    var onActivityStart: (BrewMethod, Date, TimeInterval) -> Void = { _, _, _ in }
    var onActivityUpdate: (Date, TimeInterval) -> Void = { _, _ in }
    var onActivityEnd: () -> Void = {}

    func start(method: BrewMethod, now: Date = .now) {
        guard let totalDuration = recommendedBrewDuration(for: method) else { return }
        phase = .brewing(method: method, startDate: now, totalDuration: totalDuration)
        onActivityStart(method, now, totalDuration)
    }

    func tick(now: Date = .now) {
        guard case .brewing(let method, let startDate, let totalDuration) = phase else { return }
        guard now.timeIntervalSince(startDate) < totalDuration else {
            phase = .finished(method: method)
            onActivityEnd()
            return
        }
        onActivityUpdate(startDate, totalDuration)
    }

    func remaining(now: Date = .now) -> TimeInterval {
        guard case .brewing(_, let startDate, let totalDuration) = phase else { return 0 }
        return max(0, totalDuration - now.timeIntervalSince(startDate))
    }
}
