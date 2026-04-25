import SwiftUI

struct ContentView: View {
    @State private var prefs = UserPreferences()

    var body: some View {
        ScrollView {
            VStack(spacing: 32) {
                HeroCard(summary: prefs.summary)
                StatsRow()
                TipOfTheDay(prefs: prefs)
                PreferencesCard(prefs: prefs)
            }
            .padding()
        }
        .background(
            LinearGradient(
                colors: [Color.accentColor.opacity(0.10), .clear],
                startPoint: .top,
                endPoint: .center
            )
            .ignoresSafeArea()
        )
    }
}
