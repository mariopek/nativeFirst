import SwiftUI

struct BrewList: View {
    @State private var brews: [Brew] = []

    var body: some View {
        List {
            Section("This week") {
                ForEach(brews) { brew in
                    Text(brew.method.label)
                        .swipeActions(edge: .trailing) {
                            Button("Delete", role: .destructive) {
                                brews.removeAll { $0.id == brew.id }
                            }
                        }
                        .swipeActions(edge: .leading) {
                            Button("Favorite", systemImage: "star") { }
                                .tint(.yellow)
                        }
                }
                .onDelete { offsets in
                    brews.remove(atOffsets: offsets)
                }
            }

            Section("Older") {
                Text("Empty for now")
                    .foregroundStyle(.secondary)
            }
        }
        .listStyle(.insetGrouped)
    }
}
