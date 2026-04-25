import SwiftUI

struct StatCard: View {
    let label: String
    let value: String

    var body: some View {
        VStack(spacing: 6) {
            Text(value)
                .font(.title2.weight(.semibold))
            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        // Cap the dynamic type at .accessibility1 — beyond that, the stats row
        // doesn't fit and we'd switch to a different layout (lesson 5).
        .dynamicTypeSize(...DynamicTypeSize.accessibility1)
    }
}

struct AccessibleHero: View {
    @Environment(\.dynamicTypeSize) private var typeSize

    var body: some View {
        if typeSize.isAccessibilitySize {
            // Stack vertically when text is huge — keeps everything readable
            VStack(spacing: 16) {
                Image(systemName: "cup.and.saucer.fill")
                Text("Brew Log")
            }
        } else {
            HStack(spacing: 16) {
                Image(systemName: "cup.and.saucer.fill")
                Text("Brew Log")
            }
        }
    }
}
