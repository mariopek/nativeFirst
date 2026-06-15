import Foundation
import StoreKit

// MARK: - Tested decisions (deliberately no StoreKit in here)
//
// "Does owning this product unlock that feature?" is a policy question, not a
// StoreKit question. Same seam as Day 5's quickAddMethods and Day 10's
// backend(for:characterCount:) — push the decision into a pure function so it
// gets a #expect test instead of a "trust me, I tried it in the simulator."

enum BrewLogEntitlement: Equatable {
    case free
    case pro
}

enum SubscriptionPolicy {
    /// Free tier keeps your last 20 brews. Pro removes the cap.
    static let freeBrewLimit = 20

    static let monthlyProductID = "com.nativefirst.brewlog.pro.monthly"
    static let yearlyProductID = "com.nativefirst.brewlog.pro.yearly"

    static let proProductIDs: Set<String> = [monthlyProductID, yearlyProductID]

    /// Maps whatever StoreKit says is currently owned onto BrewLog's own
    /// entitlement type. The view and the rest of the app never see a
    /// product identifier — just `.free` or `.pro`.
    static func entitlement(for purchasedProductIDs: Set<String>) -> BrewLogEntitlement {
        purchasedProductIDs.isDisjoint(with: proProductIDs) ? .free : .pro
    }

    /// The free-tier gate: can this brew be logged, or is it paywall time?
    static func canLogNewBrew(currentCount: Int, entitlement: BrewLogEntitlement) -> Bool {
        switch entitlement {
        case .pro:
            true
        case .free:
            currentCount < freeBrewLimit
        }
    }
}

// MARK: - Intro offers and win-back offers (still no StoreKit in here)
//
// Same seam, two more questions: "how do we describe this trial to the
// user" and "should the win-back banner show right now". BrewLog defines
// its own period-unit type so this file never needs `Product.SubscriptionPeriod`
// — that mapping happens once, at the SubscriptionStore boundary below.

enum BillingPeriodUnit: Equatable {
    case day, week, month, year

    var name: String {
        switch self {
        case .day: "day"
        case .week: "week"
        case .month: "month"
        case .year: "year"
        }
    }
}

struct IntroOffer: Equatable {
    let periodValue: Int
    let periodUnit: BillingPeriodUnit
    let regularPrice: String
    let regularPeriodUnit: BillingPeriodUnit
}

enum SubscriptionOfferPolicy {
    /// "7 days free, then $19.99/year" — and "1 month", never "1 months".
    static func trialCopy(for offer: IntroOffer) -> String {
        let trial = periodPhrase(value: offer.periodValue, unit: offer.periodUnit)
        return "\(trial) free, then \(offer.regularPrice)/\(offer.regularPeriodUnit.name)"
    }

    static func periodPhrase(value: Int, unit: BillingPeriodUnit) -> String {
        value == 1 ? "1 \(unit.name)" : "\(value) \(unit.name)s"
    }

    /// Win-back offers exist for people who already left. Showing the banner
    /// to a current Pro subscriber would be both pointless and confusing.
    static func shouldShowWinBackBanner(entitlement: BrewLogEntitlement, hasWinBackOffer: Bool) -> Bool {
        entitlement == .free && hasWinBackOffer
    }
}

// MARK: - The StoreKit 2 store

/// Owns the product catalog and the user's current entitlements. Two jobs:
/// load `Product`s for the paywall, and keep `purchasedProductIDs` in sync
/// with what StoreKit thinks the user owns — via both an explicit refresh and
/// a long-running transaction listener for renewals, refunds, and purchases
/// made on another device.
@Observable
final class SubscriptionStore {
    private(set) var products: [Product] = []
    private(set) var purchasedProductIDs: Set<String> = []
    private(set) var isLoading = false
    private(set) var eligibleForIntroOffer = true
    private(set) var winBackOffers: [Product.SubscriptionOffer] = []
    var errorMessage: String?

    private var transactionListener: Task<Void, Never>?

    var entitlement: BrewLogEntitlement {
        SubscriptionPolicy.entitlement(for: purchasedProductIDs)
    }

    init() {
        transactionListener = listenForTransactions()
    }

    deinit {
        transactionListener?.cancel()
    }

    func loadProducts() async {
        isLoading = true
        defer { isLoading = false }
        do {
            let storeProducts = try await Product.products(for: SubscriptionPolicy.proProductIDs)
            products = storeProducts.sorted { $0.price < $1.price }
        } catch {
            errorMessage = "Couldn't load BrewLog Pro plans: \(error.localizedDescription)"
        }
    }

    func purchase(_ product: Product, winBackOffer: Product.SubscriptionOffer? = nil) async {
        do {
            var options: Set<Product.PurchaseOption> = []
            if let winBackOffer {
                options.insert(.winBackOffer(winBackOffer))
            }
            let result = try await product.purchase(options: options)
            switch result {
            case .success(let verification):
                let transaction = try checkVerified(verification)
                await updatePurchasedProducts()
                await transaction.finish()
            case .userCancelled, .pending:
                break
            @unknown default:
                break
            }
        } catch {
            errorMessage = "Purchase failed: \(error.localizedDescription)"
        }
    }

    /// Maps StoreKit's `Product.SubscriptionOffer` onto BrewLog's own
    /// `IntroOffer` — `SubscriptionOfferPolicy` formats whatever comes back,
    /// without ever importing StoreKit itself. Only `.freeTrial` offers are
    /// surfaced; BrewLog doesn't currently configure pay-up-front intros.
    func introOffer(for product: Product) -> IntroOffer? {
        guard let subscription = product.subscription,
              let offer = subscription.introductoryOffer,
              offer.paymentMode == .freeTrial else {
            return nil
        }
        return IntroOffer(
            periodValue: offer.period.value,
            periodUnit: BillingPeriodUnit(offer.period.unit),
            regularPrice: product.displayPrice,
            regularPeriodUnit: BillingPeriodUnit(subscription.subscriptionPeriod.unit)
        )
    }

    /// Refreshes the two things that are per-*user*, not per-product:
    /// whether this customer still gets the free trial (StoreKit hides
    /// `introductoryOffer` once someone's already had one, but
    /// `isEligibleForIntroOffer` is the explicit check), and which win-back
    /// offers exist for a lapsed subscriber on this product.
    func refreshOffers(for product: Product) async {
        guard let subscription = product.subscription else { return }
        eligibleForIntroOffer = await subscription.isEligibleForIntroOffer
        winBackOffers = subscription.winBackOffers
    }

    /// Formats a win-back offer for the banner. Lives here, next to the
    /// `BillingPeriodUnit` mapping, so `PaywallView` never has to reach into
    /// `Product.SubscriptionPeriod` directly.
    func winBackCopy(for offer: Product.SubscriptionOffer) -> String {
        let phrase = SubscriptionOfferPolicy.periodPhrase(value: offer.period.value, unit: BillingPeriodUnit(offer.period.unit))
        return "\(offer.displayPrice) for your first \(phrase) back"
    }

    func restorePurchases() async {
        do {
            try await AppStore.sync()
            await updatePurchasedProducts()
        } catch {
            errorMessage = "Restore failed: \(error.localizedDescription)"
        }
    }

    /// Walks every transaction StoreKit currently considers active and
    /// rebuilds `purchasedProductIDs` from scratch. This is the source of
    /// truth — not a flag we set once after a successful purchase.
    func updatePurchasedProducts() async {
        var purchased: Set<String> = []
        for await result in Transaction.currentEntitlements {
            if let transaction = try? checkVerified(result), transaction.revocationDate == nil {
                purchased.insert(transaction.productID)
            }
        }
        purchasedProductIDs = purchased
    }

    /// The transaction listener. Renewals, refunds, family-sharing grants,
    /// and purchases made on another device all show up here — not through
    /// the `purchase(_:)` call, which only covers purchases made *right now*
    /// on *this* device.
    private func listenForTransactions() -> Task<Void, Never> {
        Task { [weak self] in
            for await result in Transaction.updates {
                guard let transaction = try? checkVerified(result) else { continue }
                await self?.updatePurchasedProducts()
                await transaction.finish()
            }
        }
    }
}

private func checkVerified<T>(_ result: VerificationResult<T>) throws -> T {
    switch result {
    case .unverified:
        throw SubscriptionStoreError.failedVerification
    case .verified(let safe):
        return safe
    }
}

enum SubscriptionStoreError: Error {
    case failedVerification
}

extension BillingPeriodUnit {
    /// The one place `Product.SubscriptionPeriod.Unit` is allowed to exist.
    init(_ unit: Product.SubscriptionPeriod.Unit) {
        switch unit {
        case .day: self = .day
        case .week: self = .week
        case .month: self = .month
        case .year: self = .year
        @unknown default: self = .month
        }
    }
}
