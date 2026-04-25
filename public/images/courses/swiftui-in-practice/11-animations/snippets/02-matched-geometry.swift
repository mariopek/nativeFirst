import SwiftUI

// matchedGeometryEffect lets two views in different positions/sizes
// share an identity. SwiftUI animates the transition smoothly when one
// disappears and the other appears with the same id.
struct ExpandingPriceCard: View {
    @Namespace private var ns
    @State private var expanded = false

    var body: some View {
        ZStack {
            if !expanded {
                CompactCard()
                    .matchedGeometryEffect(id: "card", in: ns)
                    .onTapGesture {
                        withAnimation(.spring(duration: 0.45)) { expanded = true }
                    }
            } else {
                ExpandedCard()
                    .matchedGeometryEffect(id: "card", in: ns)
                    .onTapGesture {
                        withAnimation(.spring(duration: 0.45)) { expanded = false }
                    }
            }
        }
    }
}

private struct CompactCard: View {
    var body: some View {
        Text("BTC · $77,800")
            .font(.headline)
            .padding(16)
            .frame(maxWidth: 200)
            .background(.thinMaterial, in: .rect(cornerRadius: 12))
    }
}

private struct ExpandedCard: View {
    var body: some View {
        VStack(spacing: 12) {
            Text("BTC").font(.largeTitle.bold())
            Text("$77,800.00").font(.title2.monospacedDigit())
            Text("Tap to collapse").font(.caption).foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, minHeight: 280)
        .padding(24)
        .background(.thinMaterial, in: .rect(cornerRadius: 24))
    }
}
