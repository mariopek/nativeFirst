import SwiftUI

// Show a small banner when the displayed data came from cache and the
// most recent network refresh failed.
struct CacheStalenessBanner: View {
    let lastRefresh: Date?
    let error: String?

    var body: some View {
        if let error {
            HStack(spacing: 8) {
                Image(systemName: "exclamationmark.triangle.fill")
                    .foregroundStyle(.orange)
                VStack(alignment: .leading, spacing: 2) {
                    Text("Showing cached data")
                        .font(.caption.weight(.semibold))
                    if let lastRefresh {
                        Text("Last updated \(lastRefresh, format: .relative(presentation: .named))")
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                    }
                    Text(error)
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                        .lineLimit(2)
                }
                Spacer()
            }
            .padding(12)
            .background(.orange.opacity(0.12), in: .rect(cornerRadius: 10))
            .padding(.horizontal)
        }
    }
}
