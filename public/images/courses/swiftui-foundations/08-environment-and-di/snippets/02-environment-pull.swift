import SwiftUI

private struct PreferencesCard: View {
    @Environment(UserPreferences.self) private var prefs

    var body: some View {
        @Bindable var prefs = prefs

        VStack(alignment: .leading, spacing: 18) {
            Toggle("Show milk-based methods", isOn: $prefs.showMilkBased)

            Slider(value: $prefs.defaultStrength, in: 1...10, step: 1)

            Stepper("Daily cups: \(prefs.dailyCups)", value: $prefs.dailyCups, in: 1...8)

            Button("Reset", role: .destructive) {
                prefs.reset()
            }
        }
        .padding(20)
        .background(.thinMaterial, in: .rect(cornerRadius: 16))
    }
}
