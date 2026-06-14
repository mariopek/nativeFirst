import Testing
@testable import BrewLog

@Suite("SubscriptionPolicy: free tier limit and what Pro unlocks")
struct SubscriptionPolicyTests {

    @Test("no purchases -> free")
    func noPurchasesIsFree() {
        #expect(SubscriptionPolicy.entitlement(for: []) == .free)
    }

    @Test("owning the monthly plan -> pro")
    func monthlyPurchaseIsPro() {
        let owned: Set<String> = [SubscriptionPolicy.monthlyProductID]
        #expect(SubscriptionPolicy.entitlement(for: owned) == .pro)
    }

    @Test("owning the yearly plan -> pro")
    func yearlyPurchaseIsPro() {
        let owned: Set<String> = [SubscriptionPolicy.yearlyProductID]
        #expect(SubscriptionPolicy.entitlement(for: owned) == .pro)
    }

    @Test("an unrelated product id does not unlock pro")
    func unrelatedProductStaysFree() {
        let owned: Set<String> = ["com.nativefirst.brewlog.tip.medium"]
        #expect(SubscriptionPolicy.entitlement(for: owned) == .free)
    }

    @Test("free tier allows brews under the limit")
    func freeTierAllowsBrewsUnderLimit() {
        #expect(SubscriptionPolicy.canLogNewBrew(currentCount: 19, entitlement: .free))
    }

    @Test("free tier blocks at exactly the limit")
    func freeTierBlocksAtLimit() {
        let blocked = SubscriptionPolicy.canLogNewBrew(
            currentCount: SubscriptionPolicy.freeBrewLimit,
            entitlement: .free
        )
        #expect(!blocked)
    }

    @Test("pro has no limit, even past the free cap")
    func proHasNoLimit() {
        #expect(SubscriptionPolicy.canLogNewBrew(currentCount: 500, entitlement: .pro))
    }
}

@Suite("SubscriptionStore: starting state before StoreKit answers")
struct SubscriptionStoreTests {

    @Test("a fresh store has no purchases and is on the free tier")
    @MainActor
    func freshStoreStartsFree() {
        let store = SubscriptionStore()
        #expect(store.purchasedProductIDs.isEmpty)
        #expect(store.entitlement == .free)
    }
}
