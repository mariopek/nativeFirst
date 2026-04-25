import SwiftUI

struct ContentView: View {
    var body: some View {
        VStack(spacing: 8) {
            Text("Brew Log")
                .font(.largeTitle)
                .fontWeight(.bold)

            Text("Your daily coffee, logged.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .padding()
    }
}
