import SwiftUI
import Charts

struct PriceChart: View {
    let points: [PricePoint]
    let tint: Color

    var body: some View {
        Chart(points) { point in
            // Filled area under the line — gradient from tint → transparent.
            AreaMark(
                x: .value("Time", point.date),
                y: .value("Price", point.price)
            )
            .foregroundStyle(
                LinearGradient(
                    colors: [tint.opacity(0.4), tint.opacity(0.0)],
                    startPoint: .top,
                    endPoint: .bottom
                )
            )

            // The line itself, drawn on top of the area.
            LineMark(
                x: .value("Time", point.date),
                y: .value("Price", point.price)
            )
            .foregroundStyle(tint)
            .lineStyle(StrokeStyle(lineWidth: 2))
            .interpolationMethod(.catmullRom)   // smooth curves through points
        }
        .chartXAxis(.hidden)                    // time axis: visual context only
        .chartYAxis {
            AxisMarks(position: .trailing, values: .automatic(desiredCount: 3)) { value in
                AxisGridLine().foregroundStyle(.secondary.opacity(0.2))
                AxisValueLabel().font(.caption2)
            }
        }
        .frame(height: 160)
    }
}

struct PricePoint: Identifiable {
    let id = UUID()
    let date: Date
    let price: Double
}
