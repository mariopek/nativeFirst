import SwiftUI

struct ContentView: View {
    @State private var state = WatchlistViewState()
    @State private var path = NavigationPath()

    var body: some View {
        NavigationStack(path: $path) {
            List(state.entries) { entry in
                NavigationLink(value: entry) {
                    MarketRow(entry: entry)
                }
            }
            .navigationTitle("Pulse")
            .navigationDestination(for: MarketEntry.self) { entry in
                MarketDetailView(entry: entry)
            }
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Top mover", systemImage: "bolt.fill") {
                        if let top = state.entries.first {
                            path.append(top)   // programmatic push
                        }
                    }
                }
            }
        }
    }
}
