import ABNetworking

do {
    let coins: [CoinGeckoCoin] = try await service.request(request)
    return coins.map(MarketEntry.init(coin:))
} catch let error as NetworkingError {
    switch error {
    case .noConnection:
        // User is offline. Show the cached snapshot or an inline banner.
        throw APIError.offline

    case .serverError(let code):
        // 5xx — ABNetworking already retried with exponential backoff.
        // If we still got here, the server is genuinely down.
        throw APIError.server(status: code)

    case .decodingError:
        // The model doesn't match the response. Almost always our bug.
        // Log it, ship a hotfix, don't crash.
        throw APIError.decoding(error)

    case .timeout:
        // Slow network. Retry was already attempted; let the caller decide.
        throw APIError.timeout

    default:
        throw APIError.unknown(error)
    }
}
