import ABNetworking
import Foundation

// Same MarketsRepository contract from lesson 5 — the view-state doesn't change.
// We only swap the implementation underneath the protocol.
struct ABLiveMarketsRepository: MarketsRepository {
    private let service: NetworkingService

    init(httpClient: HTTPClient = URLSessionHTTPClient()) {
        self.service = NetworkingService(httpClient: httpClient)
    }

    func fetchTopMarkets(limit: Int) async throws -> [MarketEntry] {
        let request = try ABURLRequestBuilder(
            baseURL: "https://api.coingecko.com",
            path: "/api/v3/coins/markets",
            method: .get,
            queryItems: [
                URLQueryItem(name: "vs_currency", value: "usd"),
                URLQueryItem(name: "per_page", value: String(limit)),
                URLQueryItem(name: "page", value: "1")
            ]
        ).build()

        let coins: [CoinGeckoCoin] = try await service.request(request)
        return coins.map(MarketEntry.init(coin:))
    }
}

// In production code, swap one line:
//   WatchlistViewState(repository: ABLiveMarketsRepository())
//
// Everything else — the view, the protocol, the view-state, the mock —
// stays exactly as it was in lesson 5.
