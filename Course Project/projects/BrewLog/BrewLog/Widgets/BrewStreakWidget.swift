import WidgetKit
import SwiftUI
import SwiftData
import AppIntents

struct StreakWidgetEntry: TimelineEntry {
    let date: Date
    let streak: Int
    let glass: StreakGlass
}

/// Same shape as `currentStreak` from Day 21 — turn brew dates into a number —
/// with one more step a view needs: which glass tier that number earns. A
/// `TimelineProvider` calls this; nothing in here knows WidgetKit exists.
func makeStreakEntry(
    brewDates: [Date],
    asOf referenceDate: Date = .now,
    calendar: Calendar = .current
) -> StreakWidgetEntry {
    let streak = currentStreak(brewDates: brewDates, asOf: referenceDate, calendar: calendar)
    return StreakWidgetEntry(date: referenceDate, streak: streak, glass: streakGlass(streak: streak))
}

struct BrewStreakTimelineProvider: TimelineProvider {
    func placeholder(in context: Context) -> StreakWidgetEntry {
        StreakWidgetEntry(date: .now, streak: 3, glass: .lit)
    }

    func getSnapshot(in context: Context, completion: @escaping (StreakWidgetEntry) -> Void) {
        completion(currentEntry())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<StreakWidgetEntry>) -> Void) {
        let nextRefresh = Calendar.current.date(byAdding: .hour, value: 1, to: .now) ?? .now
        completion(Timeline(entries: [currentEntry()], policy: .after(nextRefresh)))
    }

    private func currentEntry() -> StreakWidgetEntry {
        let context = LogBrewIntent.modelContainerProvider().mainContext
        let dates = (try? context.fetch(FetchDescriptor<Brew>()))?.map(\.date) ?? []
        return makeStreakEntry(brewDates: dates)
    }
}

struct BrewStreakWidgetView: View {
    let entry: StreakWidgetEntry

    var body: some View {
        VStack(spacing: 10) {
            Label("\(entry.streak)", systemImage: "flame.fill")
                .font(.title2.bold())
                .foregroundStyle(entry.glass == .onFire ? .orange : .primary)
            Text(entry.streak == 1 ? "day streak" : "day streak")
                .font(.caption)
                .foregroundStyle(.secondary)
            Button(intent: LogBrewIntent()) {
                Label("Log a brew", systemImage: "plus")
                    .font(.caption.weight(.semibold))
            }
            .buttonStyle(.bordered)
            .tint(.accentColor)
        }
        .padding()
        .containerBackground(.fill.tertiary, for: .widget)
    }
}

struct BrewStreakWidget: Widget {
    let kind = "BrewStreakWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: BrewStreakTimelineProvider()) { entry in
            BrewStreakWidgetView(entry: entry)
        }
        .configurationDisplayName("Brew Streak")
        .description("Shows your current streak and logs a brew without opening the app.")
        .supportedFamilies([.systemSmall])
    }
}
