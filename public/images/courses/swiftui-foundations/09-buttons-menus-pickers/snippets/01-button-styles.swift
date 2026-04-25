import SwiftUI

struct ButtonStyles: View {
    var body: some View {
        VStack(spacing: 12) {
            // Primary call-to-action — filled, prominent
            Button("Log a brew") { }
                .buttonStyle(.borderedProminent)
                .controlSize(.large)

            // Secondary action — outlined, less weight
            Button("Cancel") { }
                .buttonStyle(.bordered)

            // Tertiary — text-only, lightest
            Button("Learn more") { }
                .buttonStyle(.borderless)

            // Destructive role — turns red automatically in alerts/menus
            Button("Delete brew", role: .destructive) { }
                .buttonStyle(.bordered)
        }
    }
}
