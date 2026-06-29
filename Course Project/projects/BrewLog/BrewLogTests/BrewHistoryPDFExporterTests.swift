import Testing
import PDFKit
@testable import BrewLog

@Suite("BrewHistoryPDFExporter")
struct BrewHistoryPDFExporterTests {

    @Test("zero brews still produce one page, not zero")
    func emptyHistoryStillProducesOnePage() throws {
        let data = BrewHistoryPDFExporter.makePDF(for: [])
        let document = try #require(PDFDocument(data: data))

        #expect(document.pageCount == 1)
    }

    @Test("more than one page's worth of brews paginates at ten per page")
    func paginatesTenBrewsPerPage() throws {
        let brews = (0..<25).map { Brew(method: .filter, rating: 4, notes: "Brew #\($0)") }
        let data = BrewHistoryPDFExporter.makePDF(for: brews)
        let document = try #require(PDFDocument(data: data))

        #expect(document.pageCount == 3)
    }

    @Test("brew details land as real selectable text, not a flattened image")
    func firstPageContainsRealExtractableText() throws {
        let brews = [Brew(method: .aeropress, rating: 5, notes: "Citrusy, clean, the good batch")]
        let data = BrewHistoryPDFExporter.makePDF(for: brews)
        let document = try #require(PDFDocument(data: data))
        let pageText = document.page(at: 0)?.string ?? ""

        #expect(pageText.contains("Aeropress"))
        #expect(pageText.contains("Citrusy, clean, the good batch"))
    }
}
