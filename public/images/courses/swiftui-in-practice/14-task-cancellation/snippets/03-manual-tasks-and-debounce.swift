import SwiftUI

// When `.task` isn't enough, you reach for manual Task management.
// The two most common cases: search debouncing, and explicit retry.

@Observable
@MainActor
final class SearchViewState {
    var query: String = ""
    var results: [MarketEntry] = []
    private var searchTask: Task<Void, Never>?

    // Cancel the prior search before kicking off a new one. This is the
    // standard debounce pattern — store the task, cancel on next call.
    func search(_ text: String) {
        searchTask?.cancel()                       // ← kill prior in-flight
        searchTask = Task {
            try? await Task.sleep(for: .milliseconds(300))   // debounce
            if Task.isCancelled { return }                   // cancel check
            do {
                results = try await searchAPI(text)
            } catch is CancellationError {
                return                                         // expected
            } catch {
                // surface real failure
            }
        }
    }

    func cancelSearch() {
        searchTask?.cancel()
        searchTask = nil
    }

    private func searchAPI(_ text: String) async throws -> [MarketEntry] {
        try Task.checkCancellation()
        // … fetch …
        return []
    }
}


// SwiftUI side — the .onChange + manual task pattern:

struct SearchBar: View {
    @State private var state = SearchViewState()

    var body: some View {
        TextField("Search", text: $state.query)
            .onChange(of: state.query) { _, new in
                state.search(new)                  // each keystroke
            }
            .onDisappear { state.cancelSearch() }  // belt + braces
    }
}

// Three rules of thumb:
//
//   1. Prefer `.task` — it cancels for you when the view goes away.
//   2. Use `.task(id:)` when the work depends on a parameter.
//   3. Reach for stored Task<_,_> only for debouncing, retries, or
//      tasks that outlive a single view (background prefetch, sync).

struct MarketEntry: Identifiable { let id: String }
