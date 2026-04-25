import SwiftUI

struct ContentView: View {
    var body: some View {
        ScrollView {
            VStack(spacing: 32) {
                HeroCard()
                StatsRow()
                TipOfTheDay()
                ComingNextSection()
            }
            .padding()
        }
        .background(
            LinearGradient(
                colors: [Color.accentColor.opacity(0.10), .clear],
                startPoint: .top,
                endPoint: .center
            )
            .ignoresSafeArea()
        )
    }
}
