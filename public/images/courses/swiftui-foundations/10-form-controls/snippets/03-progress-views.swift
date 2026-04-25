import SwiftUI

struct ProgressViewExamples: View {
    @State private var progress = 0.45

    var body: some View {
        VStack(alignment: .leading, spacing: 24) {
            // Determinate, linear — most common
            ProgressView("Weekly goal", value: progress)
                .tint(.accentColor)

            // Determinate with explicit total — when bounds aren't 0...1
            ProgressView(value: 7, total: 14) {
                Text("Brews this week")
            }

            // Indeterminate — endless spinner, for unknown duration
            ProgressView("Loading…")
                .progressViewStyle(.circular)

            // .circular with a value — circular gauge, iOS 17+
            ProgressView(value: progress)
                .progressViewStyle(.circular)
                .controlSize(.large)
                .tint(.accentColor)
        }
    }
}
