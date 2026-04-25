import SwiftUI

// Accessibility is the single fastest way to filter "amateur" from
// "shipped" iOS apps. Five minutes of audit catches 90% of the bugs.
// VoiceOver reads what your app exposes; if you didn't label it, it
// will say "button" or read the raw enum case name.

// =====================================================================
// 1. Label every interactive control.
// =====================================================================
Button {
    toggleFavorite()
} label: {
    Image(systemName: "star.fill")
}
.accessibilityLabel("Remove BTC from favorites")     // ← required
.accessibilityHint("Double tap to unfavorite")       // ← optional but kind

// =====================================================================
// 2. Group rows so VoiceOver reads them as one item, not five.
// =====================================================================
HStack {
    Text("BTC")
    Text("Bitcoin")
    Spacer()
    Text("$67,523.20")
    Text("+2.41%").foregroundStyle(.green)
}
.accessibilityElement(children: .combine)
.accessibilityLabel("Bitcoin, $67,523.20, up 2.41 percent today")

// =====================================================================
// 3. Hide decorative imagery.
// =====================================================================
Image("hero-glow")
    .accessibilityHidden(true)

// =====================================================================
// 4. Respect Dynamic Type. Test at the largest accessibility size.
// =====================================================================
Text(price, format: .currency(code: "USD"))
    .font(.headline)
    .lineLimit(1)
    .minimumScaleFactor(0.8)                        // graceful shrink

// =====================================================================
// 5. Contrast. Run the simulator's "Increase Contrast" toggle and
//    look for any text that becomes unreadable. Fix at the design
//    system level — usually it means a missing high-contrast variant.
// =====================================================================

// Audit shortcut: Xcode → Open Accessibility Inspector → Run audit.
// It will flag missing labels, low contrast, and unclickable elements
// in under 30 seconds. Run it before every TestFlight submission.

func toggleFavorite() {}
let price: Decimal = 67_523.20
