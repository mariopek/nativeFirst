import Foundation
import ActivityKit

/// Which methods earn a Live Activity. Espresso, the Moka pot, and cold
/// brew (poured from an already-finished batch) are over before you could
/// unlock the phone to look — a Live Activity for them would outlive the
/// brew itself. Filter and Aeropress run long enough that an honest
/// countdown beats a lying "done" the instant you tap the button.
func recommendedBrewDuration(for method: BrewMethod) -> TimeInterval? {
    switch method {
    case .espresso, .mokaPot, .cold: nil
    case .filter: 240
    case .aeropress: 150
    }
}

struct BrewTimerAttributes: ActivityAttributes {
    struct ContentState: Codable, Hashable {
        var startDate: Date
        var totalDuration: TimeInterval
    }

    var method: BrewMethod
}
