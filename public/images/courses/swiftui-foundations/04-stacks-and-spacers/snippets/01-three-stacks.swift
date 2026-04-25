import SwiftUI

// VStack — vertical
struct VerticalExample: View {
    var body: some View {
        VStack(spacing: 8) {
            Text("Top")
            Text("Middle")
            Text("Bottom")
        }
    }
}

// HStack — horizontal
struct HorizontalExample: View {
    var body: some View {
        HStack(spacing: 12) {
            Text("Left")
            Text("Center")
            Text("Right")
        }
    }
}

// ZStack — layered, back-to-front
struct LayeredExample: View {
    var body: some View {
        ZStack {
            Color.tint.opacity(0.15)
                .frame(width: 120, height: 120)
                .clipShape(.rect(cornerRadius: 16))

            Image(systemName: "cup.and.saucer.fill")
                .font(.largeTitle)
                .foregroundStyle(.tint)
        }
    }
}
