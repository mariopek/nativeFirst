import Testing
import SwiftData
import AppIntents
@testable import BrewLog

// The home screen widget's button can't reach into a view's @Environment —
// there's no view. It needs the exact same "log a quick brew" behavior the
// floating + button already has, reachable from outside SwiftUI entirely.
// `logBrew(in:)` is that behavior, written before `LogBrewIntent` exists.

@Suite("LogBrewIntent: the action behind the widget's button")
struct LogBrewIntentTests {

    @MainActor
    private func makeContainer() throws -> ModelContainer {
        try ModelContainer(for: Brew.self, configurations: ModelConfiguration(isStoredInMemoryOnly: true))
    }

    @Test("logging into an empty history inserts exactly one brew")
    @MainActor
    func insertsABrew() throws {
        let container = try makeContainer()

        try LogBrewIntent.logBrew(in: container)

        let brews = try container.mainContext.fetch(FetchDescriptor<Brew>())
        #expect(brews.count == 1)
    }

    @Test("an empty history defaults to espresso, not a crash")
    @MainActor
    func emptyHistoryDefaultsToEspresso() throws {
        let container = try makeContainer()

        try LogBrewIntent.logBrew(in: container)

        let brews = try container.mainContext.fetch(FetchDescriptor<Brew>())
        #expect(brews.first?.method == .espresso)
    }

    @Test("repeats whichever method was logged most recently, not a hardcoded default")
    @MainActor
    func repeatsMostRecentMethod() throws {
        let container = try makeContainer()
        let ctx = container.mainContext
        ctx.insert(Brew(method: .aeropress, rating: 5, date: .now.addingTimeInterval(-86_400)))
        ctx.insert(Brew(method: .cold, rating: 4, date: .now))
        try ctx.save()

        try LogBrewIntent.logBrew(in: container)

        let newest = try container.mainContext.fetch(
            FetchDescriptor<Brew>(sortBy: [SortDescriptor(\.date, order: .reverse)])
        ).first
        #expect(newest?.method == .cold)
    }

    @Test("perform() reads the container from the static provider BrewLogApp configures at launch")
    @MainActor
    func performUsesTheConfiguredProvider() async throws {
        let container = try makeContainer()
        LogBrewIntent.modelContainerProvider = { container }

        _ = try await LogBrewIntent().perform()

        let brews = try container.mainContext.fetch(FetchDescriptor<Brew>())
        #expect(brews.count == 1)
    }
}
