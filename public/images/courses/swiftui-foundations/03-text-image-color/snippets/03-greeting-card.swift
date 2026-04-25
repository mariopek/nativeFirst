import SwiftUI

struct ContentView: View {
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "cup.and.saucer.fill")
                .font(.system(size: 56))
                .foregroundStyle(.tint)
                .padding(24)
                .background(.tint.opacity(0.15), in: .circle)

            VStack(spacing: 4) {
                Text("Brew Log")
                    .font(.largeTitle)
                    .fontWeight(.bold)

                Text("Your daily coffee, logged.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
        }
        .padding()
    }
}
