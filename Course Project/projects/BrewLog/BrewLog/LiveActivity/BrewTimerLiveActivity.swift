import ActivityKit
import WidgetKit
import SwiftUI

/// The Lock Screen and Dynamic Island presentation for `BrewTimerAttributes`.
/// It compiles fine sitting in the app target — that's how `BrewTimerModelTests`
/// and friends get to import `BrewLog` and run at all — but, same gap Day 25
/// hit with `BrewStreakWidget`, it will not actually appear on a Lock Screen
/// or in the Dynamic Island from here. `ActivityConfiguration` only renders
/// out of a real Widget Extension target with `NSSupportsLiveActivities`
/// set in the main app's Info.plist, and standing one up needs an App Group
/// plus its own `@main` — the same unattended-signing risk this series has
/// declined every day it's come up.
struct BrewTimerLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: BrewTimerAttributes.self) { context in
            BrewTimerLockScreenView(context: context)
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    Image(systemName: context.attributes.method.iconName)
                        .foregroundStyle(.tint)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text(timerInterval: context.state.startDate...context.state.endDate)
                        .monospacedDigit()
                        .multilineTextAlignment(.trailing)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text("Brewing \(context.attributes.method.label)")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            } compactLeading: {
                Image(systemName: context.attributes.method.iconName)
            } compactTrailing: {
                Text(timerInterval: context.state.startDate...context.state.endDate)
                    .monospacedDigit()
                    .frame(width: 44)
            } minimal: {
                Image(systemName: "timer")
            }
        }
    }
}

struct BrewTimerLockScreenView: View {
    let context: ActivityViewContext<BrewTimerAttributes>

    var body: some View {
        HStack {
            Label(context.attributes.method.label, systemImage: context.attributes.method.iconName)
                .font(.headline)
            Spacer()
            Text(timerInterval: context.state.startDate...context.state.endDate)
                .font(.title3.monospacedDigit())
        }
        .padding()
        .activityBackgroundTint(Color.black.opacity(0.7))
        .activitySystemActionForegroundColor(Color.white)
    }
}

private extension BrewTimerAttributes.ContentState {
    var endDate: Date { startDate.addingTimeInterval(totalDuration) }
}
