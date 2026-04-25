import Foundation

// @MainActor — every method, every property access on the main thread.
// Required for anything SwiftUI touches. Pulse's view-state uses this.
@Observable
@MainActor
final class WatchlistViewState {
    var entries: [MarketEntry] = []
    func load() async { /* main-actor isolated; safe to assign to entries */ }
}

// actor — your own isolated state. Like a class, but only one task can
// touch its mutable state at a time. The compiler enforces it.
actor PriceCache {
    private var cache: [String: Decimal] = [:]

    func price(for symbol: String) -> Decimal? {
        cache[symbol]                   // safe: actor-isolated read
    }

    func record(_ price: Decimal, for symbol: String) {
        cache[symbol] = price            // safe: actor-isolated write
    }
}

// Crossing actors needs await:
//   let priceCache = PriceCache()
//   await priceCache.record(67_523.20, for: "BTC")   // hops onto the actor
//   let value = await priceCache.price(for: "BTC")   // hops back

// nonisolated — opt-out for code that doesn't touch isolated state.
// Useful for static helpers, immutable computed properties, etc.
extension PriceCache {
    nonisolated static func defaultCurrencyCode() -> String { "USD" }
}
