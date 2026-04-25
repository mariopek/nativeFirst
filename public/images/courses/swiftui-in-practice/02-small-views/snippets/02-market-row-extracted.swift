import SwiftUI

struct MarketRow: View {
    let entry: MarketEntry

    var body: some View {
        HStack(spacing: 12) {
            SymbolBlock(symbol: entry.symbol, name: entry.name)
            Spacer()
            VStack(alignment: .trailing, spacing: 4) {
                Text(entry.price, format: .currency(code: "USD"))
                    .font(.subheadline.weight(.semibold))
                ChangePill(percent: entry.changePercent24h)
            }
        }
        .padding(.vertical, 8)
    }
}

private struct SymbolBlock: View {
    let symbol: String
    let name: String

    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(symbol).font(.headline)
            Text(name).font(.caption).foregroundStyle(.secondary)
        }
    }
}
