import Foundation

@Observable
@MainActor
final class WatchlistViewState {
    enum LoadState: Sendable, Equatable {
        case idle              // before the first load fired
        case loading           // load in progress
        case loaded            // we have entries
        case empty             // request succeeded but returned no items
        case failed(String)    // network/decoding/etc, with a user-readable message
    }

    private(set) var entries: [MarketEntry] = []
    private(set) var loadState: LoadState = .idle

    private let repository: any MarketsRepository

    init(repository: any MarketsRepository = LiveMarketsRepository()) {
        self.repository = repository
    }

    func load() async {
        loadState = .loading
        do {
            let fresh = try await repository.fetchTopMarkets(limit: 8)
            entries = fresh
            loadState = fresh.isEmpty ? .empty : .loaded
        } catch {
            loadState = .failed(error.localizedDescription)
        }
    }
}
