import SwiftUI

// A reusable visual treatment expressed as a ViewModifier.
// Wherever Pulse used `.padding(16).background(.thinMaterial, in: .rect(cornerRadius: 16))`
// it now reads `.pulseCard()`. One place to change the system, every screen follows.
struct PulseCardModifier: ViewModifier {
    var radius: CGFloat = 16
    var padding: CGFloat = 16

    func body(content: Content) -> some View {
        content
            .padding(padding)
            .background(.thinMaterial, in: .rect(cornerRadius: radius))
            .shadow(color: .black.opacity(0.06), radius: 8, x: 0, y: 4)
    }
}

extension View {
    func pulseCard(radius: CGFloat = 16, padding: CGFloat = 16) -> some View {
        modifier(PulseCardModifier(radius: radius, padding: padding))
    }
}

// Usage:
//   VStack { ... }.pulseCard()
//   VStack { ... }.pulseCard(radius: 12, padding: 12)
