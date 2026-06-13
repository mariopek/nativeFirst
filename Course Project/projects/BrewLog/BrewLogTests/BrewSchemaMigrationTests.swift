import Testing
import SwiftData
import Foundation
@testable import BrewLog

@Suite("Brew schema migration: adding `tags` is a lightweight migration")
struct BrewSchemaMigrationTests {

    @Test("existing brews survive the V1 -> V2 migration, tags defaults to empty")
    @MainActor
    func lightweightMigrationPreservesExistingData() throws {
        let storeURL = FileManager.default.temporaryDirectory
            .appending(path: "BrewMigrationTest-\(UUID().uuidString).sqlite")
        defer { try? FileManager.default.removeItem(at: storeURL) }

        // 1. Write a brew using the V1 schema — no `tags` in sight.
        let v1Config = ModelConfiguration(schema: Schema(versionedSchema: BrewSchemaV1.self), url: storeURL)
        let v1Container = try ModelContainer(for: BrewSchemaV1.Brew.self, configurations: v1Config)
        let v1Context = v1Container.mainContext
        v1Context.insert(BrewSchemaV1.Brew(method: .aeropress, rating: 4, notes: "Bright, citrusy, 1:16 ratio"))
        try v1Context.save()

        // 2. Reopen the SAME file under the V2 schema, with the migration plan.
        let v2Config = ModelConfiguration(schema: Schema(versionedSchema: BrewSchemaV2.self), url: storeURL)
        let v2Container = try ModelContainer(
            for: BrewSchemaV2.Brew.self,
            migrationPlan: BrewMigrationPlan.self,
            configurations: v2Config
        )
        let v2Context = v2Container.mainContext
        let migrated = try v2Context.fetch(FetchDescriptor<BrewSchemaV2.Brew>())

        #expect(migrated.count == 1)
        #expect(migrated.first?.notes == "Bright, citrusy, 1:16 ratio")
        #expect(migrated.first?.rating == 4)
        #expect(migrated.first?.method == .aeropress)
        #expect(migrated.first?.tags == [])
    }
}
