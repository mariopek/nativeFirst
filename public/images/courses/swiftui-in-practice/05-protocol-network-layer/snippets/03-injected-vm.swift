import Foundation
import SwiftUI

@Observable
@MainActor
final class WatchlistViewState {
    var entries: [MarketEntry] = []
    var isLoading: Bool = false
    var errorMessage: String?

    private let repository: any MarketsRepository

    // Default to the live repo for prod; previews and tests pass a mock.
    init(repository: any MarketsRepository = LiveMarketsRepository()) {
        self.repository = repository
    }

    func load() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            entries = try await repository.fetchTopMarkets(limit: 8)
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

// Previews exercise success, loading, and failure paths without a real network
#Preview("Loaded") {
    ContentView(state: WatchlistViewState(repository: MockMarketsRepository()))
}

#Preview("Failure") {
    ContentView(
        state: WatchlistViewState(
            repository: MockMarketsRepository(failure: APIError.server(status: 503))
        )
    )
}
