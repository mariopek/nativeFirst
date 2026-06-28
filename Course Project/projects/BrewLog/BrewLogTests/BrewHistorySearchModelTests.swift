import Testing
@testable import BrewLog

@Suite("BrewHistorySearchModel")
struct BrewHistorySearchModelTests {

    @Test("rapid keystrokes settle into a single filter pass, not one per character")
    func debounceCollapsesRapidTyping() async throws {
        let model = BrewHistorySearchModel(debounceMilliseconds: 20)
        model.updateSource([
            Brew(method: .filter, rating: 5, notes: "bright, fruity, the good batch")
        ])

        var filterPassCount = 0
        model.onFilterApplied = { filterPassCount += 1 }

        for partial in ["b", "br", "bri", "brig", "bright"] {
            model.searchText = partial
            try await Task.sleep(for: .milliseconds(5))
        }

        // Real clock, same honest tradeoff as Day 23's actor-overlap test —
        // debounce has no virtual-time seam to inject, so the wait has to be
        // comfortably longer than the debounce window.
        try await Task.sleep(for: .milliseconds(150))

        #expect(filterPassCount == 1)
        #expect(model.filteredBrews.count == 1)
    }

    @Test("recent-searches bookkeeping is a separate subscriber — it fires even when the filter pipeline finds nothing")
    func recentSearchesAreIndependentOfFilterResults() async throws {
        let model = BrewHistorySearchModel(debounceMilliseconds: 20)
        model.updateSource([Brew(method: .espresso, rating: 5, notes: "fine, nothing special")])

        model.searchText = "decaf yak butter latte"
        try await Task.sleep(for: .milliseconds(150))

        #expect(model.filteredBrews.isEmpty)
        #expect(model.recentSearchTerms == ["decaf yak butter latte"])
    }

    @Test("the filtered list reacts to method, rating, and source together, not just search text")
    func combineLatestMergesAllFourDimensions() async throws {
        let model = BrewHistorySearchModel(debounceMilliseconds: 20)
        model.updateSource([
            Brew(method: .filter, rating: 5, notes: "bright pour-over"),
            Brew(method: .filter, rating: 2, notes: "bitter, over-extracted"),
            Brew(method: .espresso, rating: 5, notes: "perfect crema")
        ])
        model.methodFilter = .filter
        model.minimumRating = 4

        try await Task.sleep(for: .milliseconds(150))

        #expect(model.filteredBrews.count == 1)
        #expect(model.filteredBrews.first?.notes == "bright pour-over")
    }
}
