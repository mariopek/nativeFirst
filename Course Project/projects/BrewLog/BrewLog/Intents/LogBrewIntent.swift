import AppIntents
import SwiftData

struct LogBrewIntent: AppIntent {
    static var title: LocalizedStringResource = "Log a Brew"
    static var description = IntentDescription(
        "Logs a brew using whichever method you used last — the same one-tap action as BrewLog's home screen quick-add button."
    )

    /// AppIntents has its own DI for this — `@Dependency` plus `AppDependencyManager`.
    /// It doesn't survive contact with a unit test: calling `perform()` directly
    /// throws "AppDependency ... was not initialized prior to access" because the
    /// property only resolves inside the system's own perform flow (Siri, Shortcuts,
    /// a real widget tap), which a direct Swift call never establishes. A plain
    /// static provider, set once at launch, is the boring seam that's actually testable.
    static var modelContainerProvider: () -> ModelContainer = {
        fatalError("LogBrewIntent.modelContainerProvider must be set before the intent runs")
    }

    @MainActor
    func perform() async throws -> some IntentResult {
        try Self.logBrew(in: Self.modelContainerProvider())
        return .result()
    }

    @MainActor
    static func logBrew(in container: ModelContainer) throws {
        let context = container.mainContext
        let mostRecent = try context.fetch(
            FetchDescriptor<Brew>(sortBy: [SortDescriptor(\.date, order: .reverse)])
        ).first

        let brew = Brew(method: mostRecent?.method ?? .espresso, rating: 4)
        context.insert(brew)
        try context.save()
    }
}

struct BrewLogShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: LogBrewIntent(),
            phrases: [
                "Log a brew in \(.applicationName)",
                "Quick brew in \(.applicationName)"
            ],
            shortTitle: "Log a Brew",
            systemImageName: "cup.and.saucer.fill"
        )
    }
}
