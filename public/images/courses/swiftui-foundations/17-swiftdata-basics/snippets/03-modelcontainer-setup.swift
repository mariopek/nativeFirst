import SwiftUI
import SwiftData

@main
struct BrewLogApp: App {
    @State private var prefs = UserPreferences()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(prefs)
        }
        .modelContainer(for: Brew.self)
    }
}

// In Previews, use an in-memory container so each preview run starts fresh
#Preview {
    ContentView()
        .environment(UserPreferences())
        .modelContainer(for: Brew.self, inMemory: true)
}
