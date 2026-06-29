import UIKit

struct BrewHistoryPDFExporter {
    static let brewsPerPage = 10

    static func makePDF(for brews: [Brew], title: String = "BrewLog — Brew History") -> Data {
        let pageBounds = CGRect(x: 0, y: 0, width: 612, height: 792) // US Letter, points
        let renderer = UIGraphicsPDFRenderer(bounds: pageBounds)
        let pages = brews.chunked(into: brewsPerPage)

        return renderer.pdfData { context in
            for pageBrews in pages.isEmpty ? [[]] : pages {
                context.beginPage()
                draw(pageBrews, title: title, in: pageBounds)
            }
        }
    }

    private static func draw(_ brews: [Brew], title: String, in bounds: CGRect) {
        let margin: CGFloat = 36

        title.draw(
            at: CGPoint(x: margin, y: margin),
            withAttributes: [.font: UIFont.boldSystemFont(ofSize: 20)]
        )

        var y = margin + 44
        for brew in brews {
            let headline = "\(brew.method.label) — \(brew.rating)/5 — \(brew.date.formatted(date: .abbreviated, time: .shortened))"
            headline.draw(
                at: CGPoint(x: margin, y: y),
                withAttributes: [.font: UIFont.systemFont(ofSize: 14, weight: .semibold)]
            )
            y += 20

            if !brew.notes.isEmpty {
                brew.notes.draw(
                    in: CGRect(x: margin + 14, y: y, width: bounds.width - margin * 2 - 14, height: 36),
                    withAttributes: [.font: UIFont.italicSystemFont(ofSize: 12), .foregroundColor: UIColor.darkGray]
                )
                y += 40
            } else {
                y += 8
            }

            y += 8
        }
    }
}

private extension Array {
    func chunked(into size: Int) -> [[Element]] {
        guard !isEmpty else { return [] }
        return stride(from: 0, to: count, by: size).map {
            Array(self[$0..<Swift.min($0 + size, count)])
        }
    }
}
