import SwiftUI

// padding first, then background — background fills the padded area
struct OrderA: View {
    var body: some View {
        Text("BrewLog")
            .padding(20)
            .background(.brown.opacity(0.2))
    }
}

// background first, then padding — background hugs the text only
struct OrderB: View {
    var body: some View {
        Text("BrewLog")
            .background(.brown.opacity(0.2))
            .padding(20)
    }
}
