import SwiftUI

private struct PreferencesCard: View {
    @Bindable var prefs: UserPreferences

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            HStack {
                Text("Preferences").font(.headline)
                Spacer()
                Button("Reset", role: .destructive) {
                    prefs.reset()
                }
                .buttonStyle(.bordered)
                .controlSize(.small)
            }

            Toggle("Show milk-based methods", isOn: $prefs.showMilkBased)
                .font(.subheadline)

            Slider(value: $prefs.defaultStrength, in: 1...10, step: 1)

            Stepper("Daily cups: \(prefs.dailyCups)", value: $prefs.dailyCups, in: 1...8)
                .font(.subheadline)
        }
        .padding(20)
        .background(.thinMaterial, in: .rect(cornerRadius: 16))
    }
}
