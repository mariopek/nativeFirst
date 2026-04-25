import SwiftUI

struct PulseSoftButtonStyle: ButtonStyle {
    var tint: Color = .accentColor

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.subheadline.weight(.semibold))
            .foregroundStyle(tint)
            .padding(.horizontal, 14)
            .padding(.vertical, 8)
            .background(
                tint.opacity(configuration.isPressed ? 0.22 : 0.14),
                in: .capsule
            )
            .scaleEffect(configuration.isPressed ? 0.96 : 1.0)
            .animation(.snappy(duration: 0.15), value: configuration.isPressed)
    }
}

// The static-extension trick that makes call sites read like SwiftUI's built-ins.
extension ButtonStyle where Self == PulseSoftButtonStyle {
    static var pulseSoft: PulseSoftButtonStyle { .init() }
    static func pulseSoft(tint: Color) -> PulseSoftButtonStyle { .init(tint: tint) }
}

// Usage:
//   Button("Buy") { }.buttonStyle(.pulseSoft)
//   Button("Sell") { }.buttonStyle(.pulseSoft(tint: .red))
