import Foundation
import Combine

@Observable
final class BrewHistorySearchModel {
    var searchText: String = "" {
        didSet { searchTextSubject.send(searchText) }
    }
    var methodFilter: BrewMethod? {
        didSet { methodFilterSubject.send(methodFilter) }
    }
    var minimumRating: Int = 0 {
        didSet { minimumRatingSubject.send(minimumRating) }
    }

    private(set) var filteredBrews: [Brew] = []
    private(set) var recentSearchTerms: [String] = []

    /// Test-only hook: fires once per settled filter pass, so a test can
    /// count passes instead of guessing from timing alone.
    var onFilterApplied: () -> Void = {}

    private let searchTextSubject = CurrentValueSubject<String, Never>("")
    private let methodFilterSubject = CurrentValueSubject<BrewMethod?, Never>(nil)
    private let minimumRatingSubject = CurrentValueSubject<Int, Never>(0)
    private let allBrewsSubject = CurrentValueSubject<[Brew], Never>([])
    private var cancellables: Set<AnyCancellable> = []

    init(debounceMilliseconds: Int = 300) {
        let debouncedSearchText = searchTextSubject
            .debounce(for: .milliseconds(debounceMilliseconds), scheduler: DispatchQueue.main)
            .removeDuplicates()

        // Subscriber 1: the actual filtered list. It needs all four streams
        // agreeing on a value before it can produce anything, which is the
        // one shape async/await won't give you for free — there's no single
        // "await" point for "whichever of these four changed most recently."
        Publishers.CombineLatest4(debouncedSearchText, methodFilterSubject, minimumRatingSubject, allBrewsSubject)
            .map { searchText, method, minimumRating, brews in
                brews.filter { brew in
                    (method == nil || brew.method == method)
                        && brew.rating >= minimumRating
                        && (searchText.isEmpty
                            || brew.notes.localizedCaseInsensitiveContains(searchText)
                            || brew.method.label.localizedCaseInsensitiveContains(searchText))
                }
            }
            .sink { [weak self] filtered in
                self?.filteredBrews = filtered
                self?.onFilterApplied()
            }
            .store(in: &cancellables)

        // Subscriber 2: recent-searches bookkeeping. It listens to the exact
        // same debounced text stream as subscriber 1 above, but has no idea
        // the filter pipeline exists — it would keep working unchanged even
        // if the filtering logic were deleted entirely. One publisher,
        // two independent consumers, zero coupling between them.
        debouncedSearchText
            .filter { !$0.isEmpty }
            .sink { [weak self] term in self?.recordSearch(term) }
            .store(in: &cancellables)
    }

    func updateSource(_ brews: [Brew]) {
        allBrewsSubject.send(brews)
    }

    private func recordSearch(_ term: String) {
        var terms = recentSearchTerms.filter { $0 != term }
        terms.insert(term, at: 0)
        recentSearchTerms = Array(terms.prefix(5))
    }
}
