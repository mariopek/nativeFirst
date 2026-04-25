import Foundation
import SwiftData

@Model
final class FavoriteMarket {
    @Attribute(.unique) var symbol: String
    var name: String
    var addedAt: Date

    init(symbol: String, name: String, addedAt: Date = .now) {
        self.symbol = symbol
        self.name = name
        self.addedAt = addedAt
    }

    convenience init(from entry: MarketEntry) {
        self.init(symbol: entry.symbol, name: entry.name)
    }
}

// PulseApp.swift gets one new line:
//   .modelContainer(for: FavoriteMarket.self)
//
// SwiftData creates the SQLite store on first launch, handles migrations
// automatically (until they don't — see lesson 9), and injects the
// ModelContext into the environment for every view to use.
