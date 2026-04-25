import SwiftUI

struct AdaptiveCard: View {
    @Environment(\.colorScheme) private var colorScheme
    @Environment(\.dismiss) private var dismiss
    @Environment(\.dynamicTypeSize) private var typeSize
    @Environment(\.locale) private var locale

    var body: some View {
        VStack {
            Text(colorScheme == .dark ? "Dark side" : "Bright side")
                .font(typeSize.isAccessibilitySize ? .title : .headline)

            Text(locale.identifier)
                .font(.caption)
                .foregroundStyle(.secondary)

            Button("Close") { dismiss() }
        }
    }
}
