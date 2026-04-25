import SwiftUI

struct OverlayExamples: View {
    @State private var showResetAlert = false
    @State private var showInfoPopover = false

    var body: some View {
        VStack(spacing: 16) {
            Button("Reset preferences", role: .destructive) {
                showResetAlert = true
            }
            .buttonStyle(.bordered)
            .alert("Reset preferences?", isPresented: $showResetAlert) {
                Button("Reset", role: .destructive) { /* reset */ }
                Button("Cancel", role: .cancel) { }
            } message: {
                Text("Clears all preferences and recent brews.")
            }

            Button {
                showInfoPopover = true
            } label: {
                Label("What's this?", systemImage: "info.circle")
            }
            .popover(isPresented: $showInfoPopover, arrowEdge: .top) {
                Text("Tip: this stat resets every Monday at 00:00.")
                    .padding()
                    .presentationCompactAdaptation(.popover)
            }
        }
    }
}
