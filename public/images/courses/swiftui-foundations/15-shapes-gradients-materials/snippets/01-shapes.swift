import SwiftUI

struct ShapeGallery: View {
    var body: some View {
        HStack(spacing: 16) {
            // Filled rectangle with rounded corners
            RoundedRectangle(cornerRadius: 12)
                .fill(.tint)
                .frame(width: 60, height: 60)

            // Stroked circle
            Circle()
                .stroke(.tint, lineWidth: 4)
                .frame(width: 60, height: 60)

            // Pill / capsule
            Capsule()
                .fill(.tint.opacity(0.2))
                .frame(width: 80, height: 32)
                .overlay(Text("Filter").font(.caption))

            // Ellipse
            Ellipse()
                .fill(.tint.gradient)
                .frame(width: 80, height: 50)

            // Rectangle with strokeBorder for inset border
            Rectangle()
                .strokeBorder(.tint, lineWidth: 2)
                .frame(width: 60, height: 60)
        }
    }
}
