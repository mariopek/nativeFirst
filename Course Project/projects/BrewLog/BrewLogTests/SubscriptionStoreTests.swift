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

    @Test("a fresh store assumes the intro offer is still available and has no win-back offers")
    @MainActor
    func freshStoreDefaultsBeforeOffersLoad() {
        let store = SubscriptionStore()
        #expect(store.eligibleForIntroOffer)
        #expect(store.winBackOffers.isEmpty)
    }
}

@Suite("SubscriptionOfferPolicy: trial copy and win-back gating")
struct SubscriptionOfferPolicyTests {

    @Test("a 7-day free trial reads naturally")
    func sevenDayTrial() {
        let offer = IntroOffer(periodValue: 7, periodUnit: .day, regularPrice: "$19.99", regularPeriodUnit: .year)
        #expect(SubscriptionOfferPolicy.trialCopy(for: offer) == "7 days free, then $19.99/year")
    }

    @Test("a one-unit period is singular, not '1 months'")
    func singularPeriodIsNotPlural() {
        let offer = IntroOffer(periodValue: 1, periodUnit: .month, regularPrice: "$2.99", regularPeriodUnit: .month)
        #expect(SubscriptionOfferPolicy.trialCopy(for: offer) == "1 month free, then $2.99/month")
    }

    @Test("a multi-week trial pluralizes correctly")
    func multiWeekTrial() {
        let offer = IntroOffer(periodValue: 2, periodUnit: .week, regularPrice: "$19.99", regularPeriodUnit: .year)
        #expect(SubscriptionOfferPolicy.trialCopy(for: offer) == "2 weeks free, then $19.99/year")
    }

    @Test("win-back banner shows only to free-tier users when an offer exists")
    func winBackBannerGating() {
        #expect(SubscriptionOfferPolicy.shouldShowWinBackBanner(entitlement: .free, hasWinBackOffer: true))
        #expect(!SubscriptionOfferPolicy.shouldShowWinBackBanner(entitlement: .free, hasWinBackOffer: false))
        #expect(!SubscriptionOfferPolicy.shouldShowWinBackBanner(entitlement: .pro, hasWinBackOffer: true))
        #expect(!SubscriptionOfferPolicy.shouldShowWinBackBanner(entitlement: .pro, hasWinBackOffer: false))
    }
}
