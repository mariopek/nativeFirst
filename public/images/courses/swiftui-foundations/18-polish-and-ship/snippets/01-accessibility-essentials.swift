import SwiftUI

struct BrewRow: View {
    let brew: Brew

    var body: some View {
        HStack {
            // Decorative — VoiceOver should skip
            Image(systemName: brew.method.iconName)
                .accessibilityHidden(true)

            VStack(alignment: .leading) {
                Text(brew.method.label)
                Text(brew.date, format: .relative(presentation: .named))
            }

            Spacer()

            // Star row — combined into a single readable phrase via parent
            HStack {
                ForEach(0..<5) { i in
                    Image(systemName: i < brew.rating ? "star.fill" : "star")
                }
            }
            .accessibilityHidden(true)
        }
        // Replace the per-element reading with one tidy phrase
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(brew.method.label) brew, rated \(brew.rating) out of 5")
        .accessibilityHint("Opens brew details")
        .accessibilityAddTraits(.isButton)
    }
}
