import Testing
@testable import BrewLog

@Suite("PersistenceAdvisor: when to stay on SwiftData, when to reach for Core Data")
struct PersistenceAdvisorTests {

    @Test("small dataset, no CloudKit, no breaking migrations -> SwiftData")
    func smallDatasetStaysOnSwiftData() {
        let choice = PersistenceAdvisor.recommendedStore(
            recordCount: 200,
            needsCloudKitSync: false,
            expectsBreakingMigrations: false
        )
        #expect(choice == .swiftData)
    }

    @Test("exactly 10,000 records is still the SwiftData side of the line")
    func tenThousandRecordsIsStillSwiftData() {
        let choice = PersistenceAdvisor.recommendedStore(
            recordCount: 10_000,
            needsCloudKitSync: false,
            expectsBreakingMigrations: false
        )
        #expect(choice == .swiftData)
    }

    @Test("crossing 10,000 records without CloudKit -> Core Data")
    func largeDatasetWithoutCloudKitMovesToCoreData() {
        let choice = PersistenceAdvisor.recommendedStore(
            recordCount: 10_001,
            needsCloudKitSync: false,
            expectsBreakingMigrations: false
        )
        #expect(choice == .coreData)
    }

    @Test("large dataset with CloudKit sync -> hybrid")
    func largeDatasetWithCloudKitIsHybrid() {
        let choice = PersistenceAdvisor.recommendedStore(
            recordCount: 50_000,
            needsCloudKitSync: true,
            expectsBreakingMigrations: false
        )
        #expect(choice == .hybrid)
    }

    @Test("breaking migrations ahead + CloudKit sync -> Core Data, regardless of size")
    func breakingMigrationsWithCloudKitForcesCoreData() {
        let choice = PersistenceAdvisor.recommendedStore(
            recordCount: 500,
            needsCloudKitSync: true,
            expectsBreakingMigrations: true
        )
        #expect(choice == .coreData)
    }
}
