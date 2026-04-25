import Foundation

@Observable
final class UserPreferences {
    var defaultStrength: Double = 6
    var dailyCups: Int = 2
    var showMilkBased: Bool = true
    var favoriteTip: Bool = false

    var strengthLabel: String {
        switch Int(defaultStrength) {
        case 1...3: "Light"
        case 4...6: "Medium"
        case 7...10: "Strong"
        default: "Medium"
        }
    }

    var summary: String {
        let cupWord = dailyCups == 1 ? "cup" : "cups"
        return "\(strengthLabel), \(dailyCups) \(cupWord) a day"
    }

    func reset() {
        defaultStrength = 6
        dailyCups = 2
        showMilkBased = true
        favoriteTip = false
    }
}
