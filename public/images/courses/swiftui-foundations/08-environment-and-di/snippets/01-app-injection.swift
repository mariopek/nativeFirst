import SwiftUI

@main
struct BrewLogApp: App {
    @State private var prefs = UserPreferences()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(prefs)
        }
    }
}
