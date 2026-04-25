import SwiftUI

private struct PreferencesCard: View {
    @Binding var strength: Double
    @Binding var cups: Int
    @Binding var showMilkBased: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            Text("Preferences")
                .font(.headline)

            Toggle("Show milk-based methods", isOn: $showMilkBased)
                .font(.subheadline)

            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Text("Default strength")
                        .font(.subheadline)
                    Spacer()
                    Text(strengthLabel)
                        .font(.subheadline.monospaced())
                        .foregroundStyle(.secondary)
                }
                Slider(value: $strength, in: 1...10, step: 1)
            }

            Stepper("Daily cups: \(cups)", value: $cups, in: 1...8)
                .font(.subheadline)
        }
        .padding(20)
        .background(.thinMaterial, in: .rect(cornerRadius: 16))
    }

    private var strengthLabel: String {
        switch Int(strength) {
        case 1...3: "Light"
        case 4...6: "Medium"
        case 7...10: "Strong"
        default: "—"
        }
    }
}
