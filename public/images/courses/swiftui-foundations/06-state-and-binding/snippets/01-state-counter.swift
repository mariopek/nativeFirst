import SwiftUI

struct CounterView: View {
    @State private var count = 0

    var body: some View {
        VStack(spacing: 12) {
            Text("\(count)")
                .font(.system(size: 64, weight: .bold))

            HStack(spacing: 12) {
                Button("-") { count -= 1 }
                Button("+") { count += 1 }
            }
            .buttonStyle(.borderedProminent)
        }
    }
}
