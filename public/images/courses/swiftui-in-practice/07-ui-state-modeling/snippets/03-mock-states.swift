import SwiftUI

#Preview("Loading") {
    ContentView()
        .environment(
            WatchlistViewState(
                repository: MockMarketsRepository(delay: .seconds(60))
            )
        )
}

#Preview("Loaded (6 items)") {
    ContentView()
        .environment(
            WatchlistViewState(
                repository: MockMarketsRepository()
            )
        )
}

#Preview("Empty") {
    ContentView()
        .environment(
            WatchlistViewState(
                repository: MockMarketsRepository(fixtures: [])
            )
        )
}

#Preview("Failed") {
    ContentView()
        .environment(
            WatchlistViewState(
                repository: MockMarketsRepository(failure: APIError.server(status: 503))
            )
        )
}

// Five lines per #Preview block. Every UI state visible in the canvas
// without launching the simulator. This is what the protocol abstraction
// from lesson 5 unlocks.
