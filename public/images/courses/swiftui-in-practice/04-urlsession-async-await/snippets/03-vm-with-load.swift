import Foundation

@Observable
@MainActor
final class WatchlistViewState {
    var entries: [MarketEntry] = []
    var isLoading: Bool = false
    var errorMessage: String?

    private let api = MarketsAPI()

    func load() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            entries = try await api.fetchTopMarkets()
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

// View calls .task { await state.load() } on appear and .refreshable for pull-to-refresh.
