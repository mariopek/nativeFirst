import SwiftUI
import SwiftData

struct FavoritesView: View {
    // All favorites, sorted by date added (newest first)
    @Query(sort: \FavoriteMarket.addedAt, order: .reverse)
    private var allFavorites: [FavoriteMarket]

    // Filtered: only ones added in the last 24 hours.
    // SwiftData translates the predicate into SQL — efficient even at 10k items.
    @Query(
        filter: #Predicate<FavoriteMarket> { $0.addedAt >= dayAgo },
        sort: \FavoriteMarket.addedAt,
        order: .reverse
    )
    private var recentFavorites: [FavoriteMarket]

    private static var dayAgo: Date {
        Calendar.current.date(byAdding: .day, value: -1, to: .now) ?? .now
    }

    var body: some View {
        List(allFavorites) { fav in
            HStack {
                Text(fav.symbol).font(.headline)
                Text(fav.name).foregroundStyle(.secondary)
                Spacer()
                Text(fav.addedAt, format: .relative(presentation: .named))
                    .font(.caption.monospacedDigit())
            }
        }
        .navigationTitle("Favorites")
    }
}
