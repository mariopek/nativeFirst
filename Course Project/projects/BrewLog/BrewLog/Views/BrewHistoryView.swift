import SwiftUI
import PDFKit

struct BrewHistoryView: View {
    let brews: [Brew]

    @State private var search = BrewHistorySearchModel()
    @State private var exportedPDFData: Data?
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            List {
                if !search.recentSearchTerms.isEmpty && search.searchText.isEmpty {
                    Section("Recent searches") {
                        ForEach(search.recentSearchTerms, id: \.self) { term in
                            Button(term) { search.searchText = term }
                        }
                    }
                }

                Section {
                    Picker("Method", selection: $search.methodFilter) {
                        Text("All methods").tag(BrewMethod?.none)
                        ForEach(BrewMethod.allCases) { method in
                            Text(method.label).tag(Optional(method))
                        }
                    }
                    .accessibilityIdentifier("HistoryMethodFilterPicker")

                    Stepper(
                        "Minimum rating: \(search.minimumRating)",
                        value: $search.minimumRating,
                        in: 0...5
                    )
                    .accessibilityIdentifier("HistoryMinimumRatingStepper")
                }

                Section("\(search.filteredBrews.count) brew\(search.filteredBrews.count == 1 ? "" : "s")") {
                    if search.filteredBrews.isEmpty {
                        ContentUnavailableView.search
                    } else {
                        ForEach(search.filteredBrews) { brew in
                            NavigationLink(value: brew) {
                                BrewRow(brew: brew)
                            }
                        }
                    }
                }
            }
            .searchable(text: $search.searchText, prompt: "Search notes or method")
            .accessibilityIdentifier("BrewHistorySearchField")
            .navigationTitle("All brews")
            .navigationBarTitleDisplayMode(.inline)
            .navigationDestination(for: Brew.self) { brew in
                BrewDetailView(brew: brew)
            }
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Done") { dismiss() }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        exportedPDFData = BrewHistoryPDFExporter.makePDF(for: search.filteredBrews)
                    } label: {
                        Label("Export PDF", systemImage: "doc.richtext")
                    }
                    .accessibilityIdentifier("ExportPDFButton")
                }
            }
            .onAppear { search.updateSource(brews) }
            .onChange(of: brews) { _, newBrews in search.updateSource(newBrews) }
            .accessibilityIdentifier("BrewHistorySheet")
            .sheet(isPresented: Binding(
                get: { exportedPDFData != nil },
                set: { isPresented in if !isPresented { exportedPDFData = nil } }
            )) {
                if let exportedPDFData {
                    BrewHistoryPDFExportSheet(pdfData: exportedPDFData)
                }
            }
        }
    }
}

private struct BrewHistoryPDFExportSheet: View {
    let document: PDFDocument
    let fileURL: URL
    @Environment(\.dismiss) private var dismiss

    init(pdfData: Data) {
        document = PDFDocument(data: pdfData) ?? PDFDocument()
        let url = URL.temporaryDirectory.appending(path: "BrewLog-History.pdf")
        try? pdfData.write(to: url)
        fileURL = url
    }

    var body: some View {
        NavigationStack {
            PDFKitPreviewView(document: document)
                .navigationTitle("Export preview")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) {
                        Button("Done") { dismiss() }
                    }
                    ToolbarItem(placement: .confirmationAction) {
                        ShareLink(item: fileURL) {
                            Label("Share", systemImage: "square.and.arrow.up")
                        }
                    }
                }
        }
        .accessibilityIdentifier("BrewHistoryPDFExportSheet")
    }
}

#Preview {
    BrewHistoryView(brews: [
        Brew(method: .filter, rating: 5, notes: "Bright, fruity, the good batch"),
        Brew(method: .espresso, rating: 4, notes: "Solid crema"),
        Brew(method: .cold, rating: 3, notes: "Too watered down")
    ])
}
