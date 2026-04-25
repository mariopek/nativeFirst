import Foundation

struct MockMarketsRepository: MarketsRepository {
    var fixtures: [MarketEntry] = MarketEntry.previewSet
    var delay: Duration = .milliseconds(400)
    var failure: Error?  // set this to test the error UI in previews and tests

    func fetchTopMarkets(limit: Int) async throws -> [MarketEntry] {
        if delay > .zero { try await Task.sleep(for: delay) }
        if let failure { throw failure }
        return Array(fixtures.prefix(limit))
    }
}

extension MarketEntry {
    static let previewSet: [MarketEntry] = [
        MarketEntry(symbol: "BTC",  name: "Bitcoin",  price: 67_523.20, changePercent24h: 0.0241),
        MarketEntry(symbol: "ETH",  name: "Ethereum", price: 3_812.45,  changePercent24h: -0.0112),
        MarketEntry(symbol: "SOL",  name: "Solana",   price: 178.92,    changePercent24h: 0.0523),
        MarketEntry(symbol: "AAPL", name: "Apple",    price: 230.45,    changePercent24h: 0.0032)
    ]
}
