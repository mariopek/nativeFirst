import SwiftUI

struct ContentView: View {
    @State private var state = WatchlistViewState()

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                WatchlistHeader(entries: state.entries)
                    .padding(.top, 4)

                List(state.entries) { entry in
                    MarketRow(entry: entry)
                }
                .listStyle(.plain)
            }
            .navigationTitle("Pulse")
            .navigationBarTitleDisplayMode(.large)
        }
    }
}
