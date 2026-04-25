import Foundation

@Observable
@MainActor
final class WatchlistViewState {
    private(set) var entries: [MarketEntry] = []
    private(set) var loadState: LoadState = .idle
    private(set) var lastRefresh: Date?
    private(set) var refreshError: String?

    private let repository: any MarketsRepository
    private let cache: MarketsCache

    init(
        repository: any MarketsRepository = LiveMarketsRepository(),
        cache: MarketsCache = MarketsCache()
    ) {
        self.repository = repository
        self.cache = cache
    }

    /// Stale-while-revalidate: render the cached snapshot immediately,
    /// then refresh from the network in the background.
    func load() async {
        // 1. Cache hit — show what we have right now.
        let cached = cache.load()
        if !cached.isEmpty {
            entries = cached
            lastRefresh = cache.lastRefresh
            loadState = .loaded
        } else {
            loadState = .loading
        }

        // 2. Always try the network. If it fails, keep showing cache.
        do {
            let fresh = try await repository.fetchTopMarkets(limit: 8)
            entries = fresh
            cache.save(fresh)
            lastRefresh = .now
            refreshError = nil
            loadState = fresh.isEmpty ? .empty : .loaded
        } catch {
            refreshError = error.localizedDescription
            // Only flip to .failed if we have nothing to show.
            if entries.isEmpty {
                loadState = .failed(error.localizedDescription)
            }
        }
    }
}
