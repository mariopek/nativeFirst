import SwiftUI

struct TextExample: View {
    var body: some View {
        Text("Brew Log")
            .font(.largeTitle)
            .fontWeight(.bold)
            .foregroundStyle(.primary)
    }
}

struct ImageExample: View {
    var body: some View {
        Image(systemName: "cup.and.saucer.fill")
            .font(.system(size: 48))
            .foregroundStyle(.tint)
    }
}

struct ColorExample: View {
    var body: some View {
        Color.brown
            .frame(width: 60, height: 60)
            .clipShape(.circle)
    }
}
