import Foundation
import ActivityKit

/// The part `BrewTimerModelTests` can't reach: real calls into `Activity<_>`.
/// Thin on purpose, same argument as `LogBrewIntent.perform()` in Day 25 —
/// you don't unit test the line that just forwards to a tested function,
/// you wire it up and prove it with a real run instead.
@MainActor
final class BrewTimerActivityController {
    private var activity: Activity<BrewTimerAttributes>?

    func attach(to model: BrewTimerModel) {
        model.onActivityStart = { [weak self] method, startDate, totalDuration in
            self?.start(method: method, startDate: startDate, totalDuration: totalDuration)
        }
        model.onActivityUpdate = { [weak self] startDate, totalDuration in
            self?.update(startDate: startDate, totalDuration: totalDuration)
        }
        model.onActivityEnd = { [weak self] in
            self?.end()
        }
    }

    private func start(method: BrewMethod, startDate: Date, totalDuration: TimeInterval) {
        let state = BrewTimerAttributes.ContentState(startDate: startDate, totalDuration: totalDuration)
        activity = try? Activity.request(
            attributes: BrewTimerAttributes(method: method),
            content: .init(state: state, staleDate: startDate.addingTimeInterval(totalDuration))
        )
    }

    private func update(startDate: Date, totalDuration: TimeInterval) {
        guard let activity else { return }
        let state = BrewTimerAttributes.ContentState(startDate: startDate, totalDuration: totalDuration)
        Task { await activity.update(.init(state: state, staleDate: startDate.addingTimeInterval(totalDuration))) }
    }

    private func end() {
        guard let activity else { return }
        Task { await activity.end(nil, dismissalPolicy: .after(.now.addingTimeInterval(5))) }
    }
}
