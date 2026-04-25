import SwiftUI

struct DeleteFlow: View {
    @State private var brewToDelete: Brew?

    var body: some View {
        List(/* ... */) { brew in
            // each row sets brewToDelete on a destructive context-menu tap
        }
        .confirmationDialog(
            "Delete this brew?",
            isPresented: Binding(
                get: { brewToDelete != nil },
                set: { if !$0 { brewToDelete = nil } }
            ),
            presenting: brewToDelete
        ) { brew in
            Button("Delete \(brew.method.label) brew", role: .destructive) {
                // delete it
                brewToDelete = nil
            }
            Button("Cancel", role: .cancel) {
                brewToDelete = nil
            }
        } message: { _ in
            Text("This brew will be removed from your history. This cannot be undone.")
        }
    }
}
