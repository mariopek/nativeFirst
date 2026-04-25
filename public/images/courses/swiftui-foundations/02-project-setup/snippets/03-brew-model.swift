import Foundation

struct Brew: Identifiable, Hashable {
    let id: UUID
    var method: BrewMethod
    var rating: Int
    var notes: String
    var date: Date

    init(
        id: UUID = UUID(),
        method: BrewMethod,
        rating: Int,
        notes: String = "",
        date: Date = .now
    ) {
        self.id = id
        self.method = method
        self.rating = rating
        self.notes = notes
        self.date = date
    }
}

enum BrewMethod: String, CaseIterable, Identifiable, Hashable {
    case espresso, filter, aeropress, mokaPot, cold

    var id: String { rawValue }

    var label: String {
        switch self {
        case .espresso:  "Espresso"
        case .filter:    "Filter"
        case .aeropress: "Aeropress"
        case .mokaPot:   "Moka Pot"
        case .cold:      "Cold Brew"
        }
    }
}
