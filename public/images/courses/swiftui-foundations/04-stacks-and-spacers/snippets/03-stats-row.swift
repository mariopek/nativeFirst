import SwiftUI

private struct StatsRow: View {
    var body: some View {
        HStack(spacing: 12) {
            StatCard(label: "This week", value: "0", icon: "calendar")
            StatCard(label: "Avg rating", value: "—", icon: "star.fill")
            StatCard(label: "Streak", value: "0", icon: "flame.fill")
        }
    }
}

private struct StatCard: View {
    let label: String
    let value: String
    let icon: String

    var body: some View {
        VStack(spacing: 6) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundStyle(.tint)
            Text(value)
                .font(.title2)
                .fontWeight(.semibold)
            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 16)
        .background(.thinMaterial, in: .rect(cornerRadius: 12))
    }
}
