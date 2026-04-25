import SwiftUI

@ViewBuilder
private var content: some View {
    switch state.loadState {
    case .idle:
        Color.clear  // .task fires immediately, this state is essentially invisible

    case .loading where state.entries.isEmpty:
        // First-time load — full-screen spinner
        VStack {
            Spacer()
            ProgressView("Loading markets…").controlSize(.large)
            Spacer()
        }

    case .loaded, .loading:
        // Either fully loaded OR refreshing existing data — same list either way
        List(state.entries) { entry in
            NavigationLink(value: entry) { MarketRow(entry: entry) }
        }
        .refreshable { await state.load() }

    case .empty:
        ContentUnavailableView(
            "No markets",
            systemImage: "chart.line.flattrend.xyaxis"
        )

    case .failed(let message):
        VStack(spacing: 16) {
            ContentUnavailableView(
                "Couldn't load markets",
                systemImage: "wifi.exclamationmark",
                description: Text(message)
            )
            Button("Try again") {
                Task { await state.load() }
            }
            .buttonStyle(.borderedProminent)
        }
    }
}
