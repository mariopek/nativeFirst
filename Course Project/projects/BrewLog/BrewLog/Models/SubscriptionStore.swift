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

    func purchase(_ product: Product) async {
        do {
            let result = try await product.purchase()
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
