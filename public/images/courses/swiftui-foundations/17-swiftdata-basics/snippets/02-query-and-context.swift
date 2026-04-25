import SwiftUI
import SwiftData

struct HomeTab: View {
    // Sorted, filtered, all wired to the persistent store
    @Query(sort: \Brew.date, order: .reverse) private var brews: [Brew]
    @Environment(\.modelContext) private var ctx

    var body: some View {
        VStack {
            Text("\(brews.count) brews logged")

            Button("Log a brew") {
                let brew = Brew(method: .espresso, rating: 4)
                ctx.insert(brew)
                try? ctx.save()
            }

            Button("Delete first", role: .destructive) {
                guard let first = brews.first else { return }
                ctx.delete(first)
                try? ctx.save()
            }
        }
    }
}
