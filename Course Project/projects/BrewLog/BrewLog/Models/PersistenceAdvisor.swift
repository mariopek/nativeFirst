import Foundation

enum PersistenceChoice: Equatable {
    case swiftData
    case coreData
    case hybrid
}

/// Encodes the SwiftData-vs-Core-Data split as a rule, not a vibe.
struct PersistenceAdvisor {
    static func recommendedStore(
        recordCount: Int,
        needsCloudKitSync: Bool,
        expectsBreakingMigrations: Bool
    ) -> PersistenceChoice {
        if expectsBreakingMigrations && needsCloudKitSync {
            return .coreData
        }
        if recordCount > 10_000 {
            return needsCloudKitSync ? .hybrid : .coreData
        }
        return .swiftData
    }
}
