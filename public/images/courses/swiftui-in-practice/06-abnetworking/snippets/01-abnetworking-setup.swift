import ABNetworking
import Foundation

// 1. Install via SPM:
//    https://github.com/mariopek/ABNetworking
//
// 2. Wire up a client + service once. Production code reuses these instances.
let httpClient = URLSessionHTTPClient()
let service = NetworkingService(httpClient: httpClient)

// 3. Build typed requests. ABURLRequestBuilder owns URL composition,
//    headers, body, and method — no string concatenation.
let request = try ABURLRequestBuilder(
    baseURL: "https://api.coingecko.com",
    path: "/api/v3/coins/markets",
    method: .get,
    queryItems: [
        URLQueryItem(name: "vs_currency", value: "usd"),
        URLQueryItem(name: "per_page", value: "8"),
        URLQueryItem(name: "page", value: "1")
    ]
).build()

// 4. Call. Decoding into a Decodable type happens inside `request`.
let coins: [CoinGeckoCoin] = try await service.request(request)

// One-time setup. Three lines per call site after that.
