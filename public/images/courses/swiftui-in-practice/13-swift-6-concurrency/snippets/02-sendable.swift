import Foundation

// Sendable: "this value is safe to ship across actors / threads."
// The compiler checks this for you — passing a non-Sendable value across
// an actor boundary is an error in Swift 6 strict mode.

// Structs of Sendable values are auto-Sendable. MarketEntry already qualifies:
struct MarketEntry: Identifiable, Hashable, Codable, Sendable {
    let symbol: String
    let name: String
    var price: Decimal
    var changePercent24h: Double
    var id: String { symbol }
}

// Enums of Sendable values are auto-Sendable too:
enum APIError: Error, Sendable {
    case offline
    case server(status: Int)
    case decoding(Error)
}

// Classes need to be marked explicitly. They're not auto-Sendable because
// reference semantics can leak shared mutable state.
//
// Two safe patterns:
//   1. final class with only-immutable stored properties (let)
//   2. @MainActor class — Sendability via actor isolation
//   3. @unchecked Sendable — escape hatch for "I know what I'm doing"
//      (rare and dangerous; only when the class is internally locked)

final class ImmutableTicker: Sendable {
    let symbol: String
    let exchange: String
    init(symbol: String, exchange: String) {
        self.symbol = symbol
        self.exchange = exchange
    }
}

@MainActor
final class WatchlistViewState_isAlreadySendable {
    // Sendable for free because @MainActor isolates all access.
}
