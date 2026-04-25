import Charts
import SwiftUI

// Tap-and-drag a chart to select a point. Show its details inline.
struct InteractivePriceChart: View {
    let points: [PricePoint]
    @State private var selectedDate: Date?

    private var selectedPoint: PricePoint? {
        guard let selectedDate else { return nil }
        return points.min(by: {
            abs($0.date.timeIntervalSince(selectedDate)) < abs($1.date.timeIntervalSince(selectedDate))
        })
    }

    var body: some View {
        Chart(points) { p in
            LineMark(
                x: .value("Time", p.date),
                y: .value("Price", p.price)
            )
            .foregroundStyle(.tint)

            if let selectedPoint, p.id == selectedPoint.id {
                RuleMark(x: .value("Selected", p.date))
                    .foregroundStyle(.tint.opacity(0.4))

                PointMark(
                    x: .value("Time", p.date),
                    y: .value("Price", p.price)
                )
                .foregroundStyle(.tint)
                .symbolSize(80)
                .annotation(position: .top, alignment: .center) {
                    Text(p.price, format: .currency(code: "USD"))
                        .font(.caption.monospacedDigit())
                        .padding(6)
                        .background(.thinMaterial, in: .capsule)
                }
            }
        }
        .chartXSelection(value: $selectedDate)
        .frame(height: 200)
    }
}
