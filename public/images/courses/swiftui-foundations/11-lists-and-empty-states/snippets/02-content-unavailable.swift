import SwiftUI

struct EmptyStates: View {
    var body: some View {
        VStack(spacing: 24) {
            // Plain — title + system image
            ContentUnavailableView(
                "No brews yet",
                systemImage: "cup.and.saucer"
            )

            // With description
            ContentUnavailableView(
                "No brews yet",
                systemImage: "cup.and.saucer",
                description: Text("Tap **Log a brew** to record your first one.")
            )

            // Search-specific overload
            ContentUnavailableView.search(text: "espresso double")

            // Custom layout — full closure if you need a button or richer content
            ContentUnavailableView {
                Label("No brews this week", systemImage: "calendar.badge.exclamationmark")
            } description: {
                Text("Your weekly goal resets every Monday.")
            } actions: {
                Button("Log a brew") { }
                    .buttonStyle(.borderedProminent)
            }
        }
    }
}
