import SwiftUI

struct EffectGallery: View {
    @State private var blur: CGFloat = 0
    @State private var enabled = true

    var body: some View {
        VStack(spacing: 24) {
            // .shadow — soft drop shadow on a card
            RoundedRectangle(cornerRadius: 16)
                .fill(.thinMaterial)
                .frame(height: 80)
                .shadow(color: .black.opacity(0.15), radius: 12, x: 0, y: 6)

            // .blur — animatable, useful for "loading" or "disabled" overlays
            Image(systemName: "cup.and.saucer.fill")
                .font(.system(size: 64))
                .foregroundStyle(.tint)
                .blur(radius: blur)

            // .opacity — fade out without removing from layout
            Text("Half-transparent text")
                .opacity(0.45)

            // .saturation — desaturate disabled state
            HStack(spacing: 12) {
                Image(systemName: "star.fill")
                Image(systemName: "heart.fill")
                Image(systemName: "flame.fill")
            }
            .font(.title)
            .foregroundStyle(.pink)
            .saturation(enabled ? 1.0 : 0.0)

            // .hueRotation — animated color shift, common in shimmer / live effects
            Image(systemName: "sun.max.fill")
                .font(.system(size: 44))
                .foregroundStyle(.yellow)
                .hueRotation(.degrees(blur * 4))
        }
    }
}
