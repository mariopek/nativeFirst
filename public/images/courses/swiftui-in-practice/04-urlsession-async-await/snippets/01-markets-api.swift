import Foundation

struct MarketsAPI {
    private let baseURL = URL(string: "https://api.coingecko.com/api/v3")!
    private let session: URLSession = .shared
    private let decoder: JSONDecoder = JSONDecoder()

    func fetchTopMarkets(limit: Int = 8) async throws -> [MarketEntry] {
        let endpoint = baseURL.appendingPathComponent("/coins/markets")
        var components = URLComponents(url: endpoint, resolvingAgainstBaseURL: false)!
        components.queryItems = [
            URLQueryItem(name: "vs_currency", value: "usd"),
            URLQueryItem(name: "per_page", value: String(limit)),
            URLQueryItem(name: "page", value: "1")
        ]
        guard let url = components.url else { throw APIError.invalidURL }

        let (data, response) = try await session.data(from: url)

        guard let http = response as? HTTPURLResponse else { throw APIError.notHTTP }
        guard (200..<300).contains(http.statusCode) else {
            throw APIError.server(status: http.statusCode)
        }

        do {
            let coins = try decoder.decode([CoinGeckoCoin].self, from: data)
            return coins.map(MarketEntry.init(coin:))
        } catch {
            throw APIError.decoding(error)
        }
    }
}

enum APIError: Error, LocalizedError {
    case invalidURL
    case notHTTP
    case server(status: Int)
    case decoding(Error)

    var errorDescription: String? {
        switch self {
        case .invalidURL:                return "Invalid URL"
        case .notHTTP:                   return "Non-HTTP response"
        case .server(let status):        return "Server error (\(status))"
        case .decoding(let underlying):  return "Decoding failed: \(underlying.localizedDescription)"
        }
    }
}
