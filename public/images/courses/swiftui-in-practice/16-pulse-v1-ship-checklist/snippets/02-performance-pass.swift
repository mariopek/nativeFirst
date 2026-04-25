import SwiftUI

// Performance ship checklist — the four things to verify before TestFlight.

// =====================================================================
// 1. List rendering — verify no view is doing real work in body.
// =====================================================================
struct MarketRow: View {
    let entry: MarketEntry

    // ❌ BAD — fires every time SwiftUI re-evaluates body.
    private var heavyDerived: String {
        entry.changePercent24h.formatted(.percent.precision(.fractionLength(2)))
    }
    // (For the row, the cost is tiny. For 200 rows during a scroll, it adds up.)

    // ✅ BETTER — pre-compute once on the model, or cache as @State.
    var body: some View {
        HStack {
            Text(entry.symbol).font(.headline.monospacedDigit())
            Spacer()
            Text(entry.priceFormatted)               // ← pre-formatted
        }
    }
}

// =====================================================================
// 2. List vs ForEach in ScrollView — pick the right one.
// =====================================================================
// `List` virtualizes — only the visible rows are alive in the hierarchy.
// `ForEach` inside `ScrollView` does NOT — every row is built every time.
//
// For the watchlist, List is correct. For a short fixed list (≤20 rows
// of static content), ScrollView is fine.

// =====================================================================
// 3. Image loading — measure with Instruments → SwiftUI template.
// =====================================================================
AsyncImage(url: iconURL) { image in
    image.resizable().aspectRatio(contentMode: .fit)
} placeholder: {
    Color.surface2                                  // ← always have a placeholder
}
.frame(width: 28, height: 28)

// =====================================================================
// 4. Animations on background tasks — never animate during data load.
// =====================================================================
// withAnimation { state.entries = newEntries }     // ❌ janky if list is long
// state.entries = newEntries                       // ✅ let SwiftUI diff
//
// The implicit `.transition` on a row's appearance is enough. Wrapping
// the whole assignment in withAnimation forces every row to animate
// simultaneously, which spikes CPU and drops frames on older devices.

// =====================================================================
// Instruments runbook (5 minutes, run before every TestFlight):
//   1. Profile in Release config (not Debug).
//   2. Use the SwiftUI template — it shows view body re-evaluations.
//   3. Scroll the watchlist for 10 seconds. Body count per row should be ≤2.
//   4. Open detail, scroll the chart. Body count for the chart should be ≤1.
//   5. Anything in the hundreds is a bug — find the offending @State or
//      computed property and lift it out of body.
// =====================================================================

let iconURL: URL? = nil
struct MarketEntry { let symbol: String; let changePercent24h: Double; let priceFormatted: String }
extension Color { static let surface2 = Color(.secondarySystemBackground) }
