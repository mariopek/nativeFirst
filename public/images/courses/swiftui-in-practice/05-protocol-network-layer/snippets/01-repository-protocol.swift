import Foundation

protocol MarketsRepository: Sendable {
    func fetchTopMarkets(limit: Int) async throws -> [MarketEntry]
}

// Production implementation — hits CoinGecko via the URLSession layer from lesson 4.
struct LiveMarketsRepository: MarketsRepository {
    private let api = MarketsAPI()

    func fetchTopMarkets(limit: Int) async throws -> [MarketEntry] {
        try await api.fetchTopMarkets(limit: limit)
    }
}
