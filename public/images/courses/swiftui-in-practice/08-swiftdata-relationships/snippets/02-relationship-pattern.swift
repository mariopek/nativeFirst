import Foundation
import SwiftData

// One-to-many: a FavoriteMarket can have many Notes; a Note belongs to
// at most one FavoriteMarket.
//
// (Pulse doesn't ship Notes today, but the pattern is what you'll reach
// for the moment a model needs children — comments, tags, brews-per-coffee,
// posts-per-thread, anything.)

@Model
final class FavoriteMarketWithNotes {
    @Attribute(.unique) var symbol: String
    var name: String
    var addedAt: Date

    // Cascade: deleting the favorite deletes all its notes.
    // The `inverse:` keyPath is what makes this a real two-way relationship.
    @Relationship(deleteRule: .cascade, inverse: \Note.market)
    var notes: [Note] = []

    init(symbol: String, name: String, addedAt: Date = .now) {
        self.symbol = symbol
        self.name = name
        self.addedAt = addedAt
    }
}

@Model
final class Note {
    var text: String
    var createdAt: Date
    var market: FavoriteMarketWithNotes?

    init(text: String, market: FavoriteMarketWithNotes? = nil) {
        self.text = text
        self.createdAt = .now
        self.market = market
    }
}
