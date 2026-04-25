import SwiftUI

// 2026 Tab API — explicit, supports system selection state, accessibility
struct RootApp: View {
    var body: some View {
        TabView {
            Tab("Home", systemImage: "cup.and.saucer.fill") {
                HomeTab()
            }
            Tab("Settings", systemImage: "gearshape.fill") {
                SettingsTab()
            }
        }
    }
}

// Older tabItem-based API — still works, but the new Tab() form is preferred
struct LegacyRootApp: View {
    var body: some View {
        TabView {
            HomeTab()
                .tabItem { Label("Home", systemImage: "cup.and.saucer.fill") }
            SettingsTab()
                .tabItem { Label("Settings", systemImage: "gearshape.fill") }
        }
    }
}
