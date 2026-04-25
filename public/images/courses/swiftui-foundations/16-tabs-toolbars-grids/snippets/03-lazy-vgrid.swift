import SwiftUI

struct MethodGrid: View {
    let columns = [
        GridItem(.flexible()),
        GridItem(.flexible()),
        GridItem(.flexible())
    ]

    var body: some View {
        ScrollView {
            LazyVGrid(columns: columns, spacing: 12) {
                ForEach(BrewMethod.allCases) { method in
                    VStack(spacing: 6) {
                        Image(systemName: method.iconName)
                            .font(.title3)
                            .foregroundStyle(.tint)
                        Text(method.label)
                            .font(.caption)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(.thinMaterial, in: .rect(cornerRadius: 12))
                }
            }
            .padding()
        }
    }
}

// Adaptive — column count adjusts to available width
struct AdaptiveGrid: View {
    let columns = [GridItem(.adaptive(minimum: 100))]

    var body: some View {
        ScrollView {
            LazyVGrid(columns: columns, spacing: 12) {
                ForEach(BrewMethod.allCases) { method in
                    Image(systemName: method.iconName)
                        .frame(width: 100, height: 100)
                        .background(.tint.opacity(0.15), in: .rect(cornerRadius: 12))
                }
            }
            .padding()
        }
    }
}
