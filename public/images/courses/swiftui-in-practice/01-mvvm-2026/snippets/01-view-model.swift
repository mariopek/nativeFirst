import Foundation

@Observable
@MainActor
final class WatchlistViewState {
    var entries: [MarketEntry] = []

    init() {
        loadSample()
    }

    func loadSample() {
        entries = [
            MarketEntry(symbol: "BTC",  name: "Bitcoin",  price: 67_523.20, changePercent24h: 0.0241),
            MarketEntry(symbol: "ETH",  name: "Ethereum", price: 3_812.45,  changePercent24h: -0.0112),
            MarketEntry(symbol: "SOL",  name: "Solana",   price: 178.92,    changePercent24h: 0.0523),
            MarketEntry(symbol: "AAPL", name: "Apple",    price: 230.45,    changePercent24h: 0.0032),
            MarketEntry(symbol: "TSLA", name: "Tesla",    price: 252.10,    changePercent24h: -0.0318),
        ]
    }
}
