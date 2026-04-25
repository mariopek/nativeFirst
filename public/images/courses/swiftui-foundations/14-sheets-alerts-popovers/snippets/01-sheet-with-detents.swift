import SwiftUI

struct ParentView: View {
    @State private var isComposing = false

    var body: some View {
        Button("New brew") { isComposing = true }
            .buttonStyle(.borderedProminent)
            .sheet(isPresented: $isComposing) {
                NewBrewSheet()
                    .presentationDetents([.medium, .large])
                    .presentationDragIndicator(.visible)
            }
    }
}

private struct NewBrewSheet: View {
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            Form {
                // ... fields ...
            }
            .navigationTitle("New brew")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { /* save */; dismiss() }
                }
            }
        }
    }
}
