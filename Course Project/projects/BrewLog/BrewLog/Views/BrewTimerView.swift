import SwiftUI

/// What used to be a lie ends up here: tapping Filter or Aeropress in the
/// quick-add cluster no longer inserts a finished `Brew` on the spot. It
/// starts this countdown instead — backed by a real Live Activity attempt
/// on `onAppear`, same `BrewTimerModel` `BrewTimerModelTests` already covers.
struct BrewTimerView: View {
    let method: BrewMethod
    var onFinished: (Int) -> Void

    @Environment(\.dismiss) private var dismiss
    @State private var model = BrewTimerModel()
    @State private var activityController = BrewTimerActivityController()
    @State private var rating = 4

    var body: some View {
        VStack(spacing: 24) {
            Image(systemName: method.iconName)
                .font(.system(size: 44))
                .foregroundStyle(.tint)

            Text(method.label)
                .font(.title2.bold())

            TimelineView(.periodic(from: .now, by: 1)) { context in
                let remaining = model.remaining(now: context.date)
                Text(timeString(remaining))
                    .font(.system(size: 56, weight: .bold, design: .rounded))
                    .monospacedDigit()
                    .contentTransition(.numericText(countsDown: true))
                    .onChange(of: context.date) { _, newDate in
                        model.tick(now: newDate)
                    }
            }
            .accessibilityIdentifier("BrewTimerCountdown")

            if model.phase == .finished(method: method) {
                Stepper("\(rating) / 5 stars", value: $rating, in: 1...5)
                    .accessibilityIdentifier("BrewTimerRatingStepper")
                Button("Save brew") {
                    onFinished(rating)
                    dismiss()
                }
                .buttonStyle(.borderedProminent)
                .accessibilityIdentifier("BrewTimerSaveButton")
            } else {
                Text("Live Activity started on the Lock Screen")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Button("Cancel", role: .cancel) { dismiss() }
                    .accessibilityIdentifier("BrewTimerCancelButton")
            }
        }
        .padding(32)
        .onAppear {
            activityController.attach(to: model)
            model.start(method: method)
        }
        .accessibilityIdentifier("BrewTimerView")
    }

    private func timeString(_ interval: TimeInterval) -> String {
        let total = Int(interval.rounded())
        return String(format: "%d:%02d", total / 60, total % 60)
    }
}
