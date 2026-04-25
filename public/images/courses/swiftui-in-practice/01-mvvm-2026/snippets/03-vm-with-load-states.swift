import Foundation

@Observable
@MainActor
final class WatchlistViewState {
    enum LoadState {
        case idle
        case loading
        case loaded([MarketEntry])
        case empty
        case failed(String)
    }

    private(set) var loadState: LoadState = .idle

    var entries: [MarketEntry] {
        if case .loaded(let entries) = loadState { return entries }
        return []
    }

    func loadSample() {
        loadState = .loading
        // (Lesson 4 — replace with real network call)
        Task {
            try? await Task.sleep(for: .milliseconds(400))
            let sample = sampleData
            loadState = sample.isEmpty ? .empty : .loaded(sample)
        }
    }

    private var sampleData: [MarketEntry] {
        [
            MarketEntry(symbol: "BTC",  name: "Bitcoin",  price: 67_523.20, changePercent24h: 0.0241),
            MarketEntry(symbol: "ETH",  name: "Ethereum", price: 3_812.45,  changePercent24h: -0.0112),
        ]
    }
}
