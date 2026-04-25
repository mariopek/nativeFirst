import SwiftUI

struct HeroMenu: View {
    @Environment(UserPreferences.self) private var prefs

    var body: some View {
        Menu {
            Section("Quick actions") {
                Button("Log a brew", systemImage: "plus.circle") {
                    prefs.logBrew()
                }
            }
            Section {
                Button(
                    "Reset preferences",
                    systemImage: "arrow.counterclockwise",
                    role: .destructive
                ) {
                    prefs.reset()
                }
            }
        } label: {
            Image(systemName: "ellipsis.circle")
                .font(.title2)
        }
    }
}
