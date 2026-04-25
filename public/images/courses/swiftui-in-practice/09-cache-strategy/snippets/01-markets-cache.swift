import Foundation

final class MarketsCache: Sendable {
    private let key = "pulse.cached.markets.v1"
    private let timestampKey = "pulse.cached.markets.v1.timestamp"
    private let store: UserDefaults

    init(store: UserDefaults = .standard) {
        self.store = store
    }

    var lastRefresh: Date? {
        store.object(forKey: timestampKey) as? Date
    }

    func load() -> [MarketEntry] {
        guard let data = store.data(forKey: key) else { return [] }
        return (try? JSONDecoder().decode([MarketEntry].self, from: data)) ?? []
    }

    func save(_ entries: [MarketEntry]) {
        guard let data = try? JSONEncoder().encode(entries) else { return }
        store.set(data, forKey: key)
        store.set(Date(), forKey: timestampKey)
    }

    func clear() {
        store.removeObject(forKey: key)
        store.removeObject(forKey: timestampKey)
    }
}
