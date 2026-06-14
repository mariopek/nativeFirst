import StoreKit
import SwiftUI

/// The whole paywall. Dumb on purpose — every number it shows (`freeBrewLimit`,
/// `entitlement`, `products`) comes from `SubscriptionPolicy` or
/// `SubscriptionStore`. If this view has a bug, it's a wiring bug, not a
/// "what should the rule be" bug — those live in the tested policy.
struct PaywallView: View {
    @Environment(SubscriptionStore.self) private var store
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 28) {
                    header
                    featureList
                    plans
                    restoreButton

                    if let message = store.errorMessage {
                        Text(message)
                            .font(.footnote)
                            .foregroundStyle(.red)
                            .multilineTextAlignment(.center)
                    }
                }
                .padding()
            }
            .navigationTitle("BrewLog Pro")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Not now") { dismiss() }
                }
            }
            .task {
                await store.loadProducts()
                await store.updatePurchasedProducts()
            }
            .accessibilityIdentifier("PaywallScreen")
        }
    }

    private var header: some View {
        VStack(spacing: 10) {
            Image(systemName: "cup.and.saucer.fill")
                .font(.system(size: 48))
                .foregroundStyle(.tint)
                .padding(22)
                .background(.tint.opacity(0.15), in: .circle)

            Text("BrewLog Pro")
                .font(.largeTitle.weight(.bold))

            Text("Unlimited brew history. No subscription games, cancel any time.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
    }

    private var featureList: some View {
        VStack(alignment: .leading, spacing: 14) {
            FeatureRow(
                icon: "infinity",
                text: "Unlimited brews — the free tier stops at \(SubscriptionPolicy.freeBrewLimit)"
            )
            FeatureRow(icon: "tag.fill", text: "Tag and filter your brew history")
            FeatureRow(icon: "icloud.and.arrow.up.fill", text: "Back up your log automatically")
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(20)
        .background(.thinMaterial, in: .rect(cornerRadius: 16))
    }

    @ViewBuilder
    private var plans: some View {
        if store.isLoading {
            ProgressView("Loading plans…")
                .padding(.vertical, 12)
        } else if store.products.isEmpty {
            Text("Plans aren't available right now. Pull to refresh or try again later.")
                .font(.footnote)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.vertical, 12)
        } else {
            VStack(spacing: 12) {
                ForEach(store.products) { product in
                    PlanButton(product: product) {
                        Task { await store.purchase(product) }
                    }
                }
            }
        }
    }

    private var restoreButton: some View {
        Button("Restore purchases") {
            Task { await store.restorePurchases() }
        }
        .font(.footnote)
        .accessibilityIdentifier("RestorePurchasesButton")
    }
}

private struct PlanButton: View {
    let product: Product
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(product.displayName)
                        .font(.headline)
                    Text(product.description)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                Text(product.displayPrice)
                    .font(.headline.monospacedDigit())
            }
            .padding()
            .background(.thinMaterial, in: .rect(cornerRadius: 12))
        }
        .buttonStyle(.plain)
        .accessibilityIdentifier("PlanButton-\(product.id)")
    }
}

private struct FeatureRow: View {
    let icon: String
    let text: String

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundStyle(.tint)
                .frame(width: 28)
            Text(text)
                .font(.subheadline)
        }
    }
}

#Preview {
    PaywallView()
        .environment(SubscriptionStore())
}
