import SwiftUI

struct ContentView: View {
    @State private var state = WatchlistViewState()

    var body: some View {
        NavigationStack {
            List(state.entries) { entry in
                MarketRow(entry: entry)
            }
            .listStyle(.plain)
            .navigationTitle("Pulse")
        }
    }
}

private struct MarketRow: View {
    let entry: MarketEntry

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(entry.symbol).font(.headline)
                Text(entry.name).font(.caption).foregroundStyle(.secondary)
            }
            Spacer()
            VStack(alignment: .trailing, spacing: 2) {
                Text(entry.price, format: .currency(code: "USD"))
                    .font(.subheadline.weight(.semibold))
                Text(entry.changePercent24h, format: .percent.precision(.fractionLength(2)))
                    .font(.caption.monospacedDigit())
                    .foregroundStyle(entry.changePercent24h >= 0 ? .green : .red)
            }
        }
        .padding(.vertical, 6)
    }
}
