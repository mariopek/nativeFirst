import Foundation
import SwiftData

// MARK: - V1 — the schema BrewLog shipped with

enum BrewSchemaV1: VersionedSchema {
    static var versionIdentifier = Schema.Version(1, 0, 0)

    static var models: [any PersistentModel.Type] { [Brew.self] }

    @Model
    final class Brew {
        var method: BrewMethod
        var rating: Int
        var notes: String
        var date: Date

        init(method: BrewMethod, rating: Int, notes: String = "", date: Date = .now) {
            self.method = method
            self.rating = rating
            self.notes = notes
            self.date = date
        }
    }
}

// MARK: - V2 — adds `tags`, purely additive

enum BrewSchemaV2: VersionedSchema {
    static var versionIdentifier = Schema.Version(2, 0, 0)

    static var models: [any PersistentModel.Type] { [Brew.self] }

    @Model
    final class Brew {
        var method: BrewMethod
        var rating: Int
        var notes: String
        var date: Date
        var tags: [String] = []

        init(method: BrewMethod, rating: Int, notes: String = "", date: Date = .now, tags: [String] = []) {
            self.method = method
            self.rating = rating
            self.notes = notes
            self.date = date
            self.tags = tags
        }
    }
}

// MARK: - The migration plan

enum BrewMigrationPlan: SchemaMigrationPlan {
    static var schemas: [any VersionedSchema.Type] {
        [BrewSchemaV1.self, BrewSchemaV2.self]
    }

    static var stages: [MigrationStage] {
        [migrateV1toV2]
    }

    static let migrateV1toV2 = MigrationStage.lightweight(
        fromVersion: BrewSchemaV1.self,
        toVersion: BrewSchemaV2.self
    )
}
