import SwiftUI

// SwiftUI's `.task` modifier is the right default 95% of the time.
// It starts an async task tied to the view's lifetime — when the view
// goes away, the task is cancelled automatically. No bookkeeping.

struct WatchlistView: View {
    @State private var state = WatchlistViewState()

    var body: some View {
        List(state.entries) { entry in
            MarketRow(entry: entry)
        }
        .task {                                    // ← the modifier
            await state.load()
        }
        .refreshable {
            await state.load()
        }
    }
}

// What this gives you for free:
//
//   • The task starts when the view first appears
//   • It's cancelled when the view leaves the hierarchy
//   • It's @MainActor by default — safe to update view-state inside
//   • If the view re-appears, .task fires again
//
// The footgun this prevents: a user navigates away mid-fetch, you don't
// cancel, and 800ms later your background work fires and writes into a
// view-state that's no longer on screen. With `.task`, never happens.


// `.task(id:)` — restart the task whenever the value changes.
// Perfect for search fields, selected coin, anything where the task
// depends on a parameter:

struct CoinDetailView: View {
    let coinId: String
    @State private var detail: CoinDetail?

    var body: some View {
        VStack { /* … */ }
            .task(id: coinId) {                    // ← restart on change
                detail = nil
                detail = try? await loadDetail(for: coinId)
            }
    }
}

func loadDetail(for id: String) async throws -> CoinDetail { fatalError() }
struct CoinDetail {}
@Observable @MainActor final class WatchlistViewState {
    var entries: [MarketEntry] = []
    func load() async {}
}
struct MarketEntry: Identifiable { let id: String }
struct MarketRow: View { let entry: MarketEntry; var body: some View { EmptyView() } }
