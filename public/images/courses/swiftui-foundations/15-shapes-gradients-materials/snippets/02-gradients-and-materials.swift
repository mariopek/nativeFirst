import SwiftUI

struct PaintGallery: View {
    var body: some View {
        VStack(spacing: 16) {
            // Linear — top to bottom
            RoundedRectangle(cornerRadius: 12)
                .fill(LinearGradient(
                    colors: [.tint, .tint.opacity(0.3)],
                    startPoint: .top,
                    endPoint: .bottom
                ))
                .frame(height: 80)

            // Radial — center outward
            Circle()
                .fill(RadialGradient(
                    colors: [.yellow, .orange, .red],
                    center: .center,
                    startRadius: 0,
                    endRadius: 80
                ))
                .frame(width: 100, height: 100)

            // Angular — sweep around center (great for charts/dials)
            Circle()
                .fill(AngularGradient(
                    colors: [.red, .orange, .yellow, .green, .blue, .purple, .red],
                    center: .center
                ))
                .frame(width: 100, height: 100)

            // Material — system blur. Great for cards over photos.
            ZStack {
                LinearGradient(
                    colors: [.purple, .blue],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                Text("Card on a busy background")
                    .padding()
                    .background(.ultraThinMaterial, in: .rect(cornerRadius: 12))
            }
            .frame(height: 120)
            .clipShape(.rect(cornerRadius: 12))
        }
    }
}
