import Foundation
import SwiftData

@Model
final class Brew {
    var method: BrewMethod
    var rating: Int
    var notes: String
    var date: Date

    init(
        method: BrewMethod,
        rating: Int,
        notes: String = "",
        date: Date = .now
    ) {
        self.method = method
        self.rating = rating
        self.notes = notes
        self.date = date
    }
}
