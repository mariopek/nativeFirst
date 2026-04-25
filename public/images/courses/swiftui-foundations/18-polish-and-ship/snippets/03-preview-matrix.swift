import SwiftUI

#Preview("Light · default") {
    ContentView()
        .environment(UserPreferences())
        .modelContainer(for: Brew.self, inMemory: true)
}

#Preview("Dark · default") {
    ContentView()
        .environment(UserPreferences())
        .modelContainer(for: Brew.self, inMemory: true)
        .preferredColorScheme(.dark)
}

#Preview("Accessibility · large text") {
    ContentView()
        .environment(UserPreferences())
        .modelContainer(for: Brew.self, inMemory: true)
        .dynamicTypeSize(.accessibility3)
}

#Preview("Empty state") {
    ContentView()
        .environment(UserPreferences())
        .modelContainer(for: Brew.self, inMemory: true)
}
