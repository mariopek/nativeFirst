import SwiftUI

struct ChangePill: View {
    let percent: Double

    private var isUp: Bool { percent >= 0 }

    var body: some View {
        Text(percent, format: .percent.precision(.fractionLength(2)))
            .font(.caption.weight(.semibold).monospacedDigit())
            .foregroundStyle(isUp ? .green : .red)
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background((isUp ? Color.green : Color.red).opacity(0.12), in: .capsule)
    }
}

#Preview {
    VStack(spacing: 12) {
        ChangePill(percent: 0.0241)
        ChangePill(percent: -0.0312)
    }
    .padding()
}
