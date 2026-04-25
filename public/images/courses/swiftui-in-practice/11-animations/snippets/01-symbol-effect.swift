import SwiftUI

private struct FavoriteButton: View {
    let isFavorited: Bool
    let toggle: () -> Void

    @State private var bounceTrigger = 0

    var body: some View {
        Button {
            withAnimation(.snappy(duration: 0.25)) {
                toggle()
            }
            bounceTrigger += 1
        } label: {
            Image(systemName: isFavorited ? "star.fill" : "star")
                .foregroundStyle(isFavorited ? .yellow : .secondary)
                .symbolEffect(.bounce, value: bounceTrigger)              // bounce on every tap
                .contentTransition(.symbolEffect(.replace))               // smooth fill ↔ outline morph
        }
    }
}
