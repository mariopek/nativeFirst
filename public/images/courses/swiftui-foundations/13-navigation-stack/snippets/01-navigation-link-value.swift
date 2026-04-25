import SwiftUI

struct BrewListRoot: View {
    @Environment(UserPreferences.self) private var prefs

    var body: some View {
        NavigationStack {
            List(prefs.recentBrews) { brew in
                NavigationLink(value: brew) {
                    Text(brew.method.label)
                }
            }
            .navigationTitle("Brew Log")
            .navigationDestination(for: Brew.self) { brew in
                BrewDetailView(brew: brew)
            }
        }
    }
}
