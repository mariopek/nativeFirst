import Foundation

// Cancellation in Swift Concurrency is cooperative.
// The runtime sets a flag on the Task. Your code has to check it.
// If you never check, your work runs to completion — even after the user
// has navigated away and the result is no longer needed.

// Two ways to react to cancellation:
//
//   Task.checkCancellation()   — throws CancellationError if cancelled
//   Task.isCancelled           — returns Bool, doesn't throw

func loadMarkets() async throws -> [MarketEntry] {
    try Task.checkCancellation()           // bail before expensive work
    let url = URL(string: "https://api.coingecko.com/api/v3/coins/markets")!
    let (data, _) = try await URLSession.shared.data(from: url)
    try Task.checkCancellation()           // bail before decoding
    return try JSONDecoder().decode([MarketEntry].self, from: data)
}

// URLSession.data(from:) and most async system APIs already check
// cancellation internally. So if the user navigates away mid-fetch,
// the request is torn down and you'll get a CancellationError back.
//
// Handle it the same way you handle any other thrown error — just don't
// treat it as a "real" failure to surface in the UI.

func load() async {
    do {
        let entries = try await loadMarkets()
        // assign to view-state…
    } catch is CancellationError {
        return                              // expected — task was cancelled
    } catch {
        // real failure → show error state
    }
}

struct MarketEntry: Decodable, Sendable { let symbol: String }
