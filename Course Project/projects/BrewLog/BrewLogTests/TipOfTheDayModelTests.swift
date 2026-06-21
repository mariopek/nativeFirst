import Testing
@testable import BrewLog

private struct StubBrewTipsService: BrewTipsService {
    let tip: String
    func fetchTipOfTheDay() async throws -> String { tip }
}

private struct FailingBrewTipsService: BrewTipsService {
    struct DummyError: Error {}
    func fetchTipOfTheDay() async throws -> String { throw DummyError() }
}

@Suite("TipOfTheDayModel")
struct TipOfTheDayModelTests {

    @Test("starts idle, not loading, before anyone calls load()")
    func startsIdle() {
        let model = TipOfTheDayModel(service: StubBrewTipsService(tip: "unused"))
        #expect(model.state == .idle)
    }

    @Test("load() on a working service ends in loaded with the fetched tip")
    func loadSucceeds() async {
        let model = TipOfTheDayModel(service: StubBrewTipsService(tip: "Pre-heat your cup before pulling a shot."))
        await model.load()
        #expect(model.state == .loaded("Pre-heat your cup before pulling a shot."))
    }

    @Test("load() on a throwing service ends in failed, not a crash")
    func loadFailureEndsInFailedState() async {
        let model = TipOfTheDayModel(service: FailingBrewTipsService())
        await model.load()
        #expect(model.state == .failed)
    }
}
