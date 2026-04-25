import Charts
import SwiftUI

struct DailyVolumeChart: View {
    let points: [VolumePoint]

    var body: some View {
        Chart(points) { p in
            BarMark(
                x: .value("Day", p.date, unit: .day),
                y: .value("Volume", p.volume)
            )
            .foregroundStyle(p.volume >= 0 ? Color.green.opacity(0.6) : Color.red.opacity(0.6))
        }
        // X axis: show day-of-week, hide every other label so it doesn't crowd
        .chartXAxis {
            AxisMarks(values: .stride(by: .day)) { value in
                AxisGridLine()
                AxisTick()
                AxisValueLabel(format: .dateTime.weekday(.abbreviated))
            }
        }
        // Y axis: format as compact currency ("$1.2M")
        .chartYAxis {
            AxisMarks { value in
                AxisGridLine()
                AxisValueLabel {
                    if let dbl = value.as(Double.self) {
                        Text(dbl, format: .currency(code: "USD").notation(.compactName))
                    }
                }
            }
        }
        // Pin a custom domain so the bars don't squish
        .chartYScale(domain: 0...maxVolume * 1.1)
    }

    private var maxVolume: Double {
        points.map(\.volume).max() ?? 0
    }
}

struct VolumePoint: Identifiable {
    let id = UUID()
    let date: Date
    let volume: Double
}
