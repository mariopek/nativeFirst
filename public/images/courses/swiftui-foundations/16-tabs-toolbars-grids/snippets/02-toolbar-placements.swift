import SwiftUI

struct DemoScreen: View {
    var body: some View {
        NavigationStack {
            ContentScroller()
                .navigationTitle("Brew Log")
                .toolbar {
                    // Top-leading — back-style or hamburger menu
                    ToolbarItem(placement: .topBarLeading) {
                        Button("Edit") { }
                    }

                    // Top-trailing — primary action button (or Menu)
                    ToolbarItem(placement: .topBarTrailing) {
                        Button {
                            // present new brew sheet
                        } label: {
                            Label("New", systemImage: "plus")
                        }
                    }

                    // Principal — centered title-area widget. Replace title with a custom view.
                    ToolbarItem(placement: .principal) {
                        Image(systemName: "cup.and.saucer.fill")
                            .foregroundStyle(.tint)
                    }

                    // Keyboard — appears in the input accessory bar above the keyboard
                    ToolbarItem(placement: .keyboard) {
                        Button("Done") { /* dismiss keyboard */ }
                    }

                    // Bottom bar — secondary actions when there's a clear primary CTA elsewhere
                    ToolbarItem(placement: .bottomBar) {
                        Button("Filter", systemImage: "line.3.horizontal.decrease.circle") { }
                    }
                }
        }
    }
}
