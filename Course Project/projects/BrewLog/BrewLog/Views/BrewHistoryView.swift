import SwiftUI

struct BrewHistoryView: View {
    let brews: [Brew]

    @State private var search = BrewHistorySearchModel()
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            List {
                if !search.recentSearchTerms.isEmpty && search.searchText.isEmpty {
                    Section("Recent searches") {
                        ForEach(search.recentSearchTerms, id: \.self) { term in
                            Button(term) { search.searchText = term }
                        }
                    }
                }

                Section {
                    Picker("Method", selection: $search.methodFilter) {
                        Text("All methods").tag(BrewMethod?.none)
                        ForEach(BrewMethod.allCases) { method in
                            Text(method.label).tag(Optional(method))
                        }
                    }
                    .accessibilityIdentifier("HistoryMethodFilterPicker")

                    Stepper(
                        "Minimum rating: \(search.minimumRating)",
                        value: $search.minimumRating,
                        in: 0...5
                    )
                    .accessibilityIdentifier("HistoryMinimumRatingStepper")
                }

                Section("\(search.filteredBrews.count) brew\(search.filteredBrews.count == 1 ? "" : "s")") {
                    if search.filteredBrews.isEmpty {
                        ContentUnavailableView.search
                    } else {
                        ForEach(search.filteredBrews) { brew in
                            NavigationLink(value: brew) {
                                BrewRow(brew: brew)
                            }
                        }
                    }
                }
            }
            .searchable(text: $search.searchText, prompt: "Search notes or method")
            .accessibilityIdentifier("BrewHistorySearchField")
            .navigationTitle("All brews")
            .navigationBarTitleDisplayMode(.inline)
            .navigationDestination(for: Brew.self) { brew in
                BrewDetailView(brew: brew)
            }
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Done") { dismiss() }
                }
            }
            .onAppear { search.updateSource(brews) }
            .onChange(of: brews) { _, newBrews in search.updateSource(newBrews) }
            .accessibilityIdentifier("BrewHistorySheet")
        }
    }
}

#Preview {
    BrewHistoryView(brews: [
        Brew(method: .filter, rating: 5, notes: "Bright, fruity, the good batch"),
        Brew(method: .espresso, rating: 4, notes: "Solid crema"),
        Brew(method: .cold, rating: 3, notes: "Too watered down")
    ])
}
