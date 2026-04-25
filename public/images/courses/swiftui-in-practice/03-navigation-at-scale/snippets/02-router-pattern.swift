import SwiftUI

@Observable
@MainActor
final class Router {
    var path = NavigationPath()

    func push<T: Hashable>(_ value: T) { path.append(value) }
    func pop() { if !path.isEmpty { path.removeLast() } }
    func popToRoot() { path = NavigationPath() }

    // Deep-link entry point — parse URL, push typed values
    func openSymbol(_ symbol: String, in entries: [MarketEntry]) {
        guard let entry = entries.first(where: { $0.symbol == symbol }) else { return }
        popToRoot()
        push(entry)
    }
}

struct ContentView: View {
    @State private var router = Router()
    @State private var state = WatchlistViewState()

    var body: some View {
        NavigationStack(path: $router.path) {
            WatchlistView()
                .environment(router)
                .navigationDestination(for: MarketEntry.self) { entry in
                    MarketDetailView(entry: entry)
                        .environment(router)
                }
        }
        .environment(state)
    }
}
