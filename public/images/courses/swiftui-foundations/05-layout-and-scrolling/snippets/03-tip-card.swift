import SwiftUI

private struct TipOfTheDay: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Label("Tip of the day", systemImage: "lightbulb.fill")
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(.tint)

            Text("Grind size matters more than dose. If your espresso pulls fast and tastes sour, go finer. If it pulls slow and tastes bitter, go coarser. Tune one variable at a time.")
                .font(.body)
                .foregroundStyle(.primary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(20)
        .background(.thinMaterial, in: .rect(cornerRadius: 16))
    }
}
