import SwiftUI

struct MarketDetailView: View {
    let entry: MarketEntry

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                VStack(spacing: 8) {
                    Text(entry.name).font(.subheadline).foregroundStyle(.secondary)
                    Text(entry.price, format: .currency(code: "USD"))
                        .font(.system(size: 44, weight: .bold).monospacedDigit())
                    ChangePill(percent: entry.changePercent24h)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)

                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                    MetricCard(label: "24h change", value: entry.changePercent24h.formatted(.percent.precision(.fractionLength(2))))
                    MetricCard(label: "Symbol", value: entry.symbol)
                }
            }
            .padding()
        }
        .navigationTitle(entry.symbol)
        .navigationBarTitleDisplayMode(.inline)
    }
}
