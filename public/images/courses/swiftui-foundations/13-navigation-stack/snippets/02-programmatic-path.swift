import SwiftUI

struct BrewListRoot: View {
    @Environment(UserPreferences.self) private var prefs
    @State private var path = NavigationPath()

    var body: some View {
        NavigationStack(path: $path) {
            List(prefs.recentBrews) { brew in
                NavigationLink(value: brew) {
                    Text(brew.method.label)
                }
            }
            .toolbar {
                Button("Open most recent") {
                    if let latest = prefs.recentBrews.first {
                        path.append(latest)
                    }
                }
            }
            .navigationDestination(for: Brew.self) { brew in
                BrewDetailView(brew: brew)
            }
        }
    }
}
