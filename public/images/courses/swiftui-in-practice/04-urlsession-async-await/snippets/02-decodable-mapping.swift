import Foundation

// What CoinGecko's /coins/markets actually sends — just the fields we use.
struct CoinGeckoCoin: Decodable {
    let id: String
    let symbol: String
    let name: String
    let currentPrice: Double?
    let priceChangePercentage24h: Double?

    // Explicit CodingKeys are more reliable than .convertFromSnakeCase here.
    // Auto-conversion is fine until you hit edge cases like "_24h".
    enum CodingKeys: String, CodingKey {
        case id, symbol, name
        case currentPrice = "current_price"
        case priceChangePercentage24h = "price_change_percentage_24h"
    }
}

// Translate the API shape into the domain shape — keep the two separate.
extension MarketEntry {
    init(coin: CoinGeckoCoin) {
        let priceValue = Decimal(coin.currentPrice ?? 0)
        // CoinGecko returns percent (0.12). We store fraction (0.0012).
        let percentValue = (coin.priceChangePercentage24h ?? 0) / 100
        self.init(
            symbol: coin.symbol.uppercased(),
            name: coin.name,
            price: priceValue,
            changePercent24h: percentValue
        )
    }
}
