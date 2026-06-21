import Foundation

@Observable
final class TipOfTheDayModel {
    enum State: Equatable {
        case idle
        case loading
        case loaded(String)
        case failed
    }

    static let fallbackTip = "Grind size matters more than dose. If your espresso pulls fast and tastes sour, go finer. If it pulls slow and tastes bitter, go coarser. Tune one variable at a time."

    private(set) var state: State = .idle
    private let service: BrewTipsService

    init(service: BrewTipsService) {
        self.service = service
    }

    func load() async {
        state = .loading
        do {
            let tip = try await service.fetchTipOfTheDay()
            state = .loaded(tip)
        } catch {
            state = .failed
        }
    }
}
