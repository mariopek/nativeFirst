import SwiftUI

private struct NewBrewCard: View {
    @Environment(UserPreferences.self) private var prefs

    @State private var method: BrewMethod = .espresso
    @State private var rating: Int = 4
    @State private var notes: String = ""
    @FocusState private var notesFocused: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("New brew").font(.headline)

            HStack {
                Text("Method").font(.subheadline)
                Spacer()
                Picker("Method", selection: $method) {
                    ForEach(BrewMethod.allCases) { Text($0.label).tag($0) }
                }
                .pickerStyle(.menu)
            }

            Stepper("Rating: \(rating) / 5", value: $rating, in: 1...5)

            TextField("Notes (optional)", text: $notes, axis: .vertical)
                .lineLimit(2...4)
                .focused($notesFocused)
                .submitLabel(.done)
                .padding(10)
                .background(.background.secondary, in: .rect(cornerRadius: 8))

            Button {
                let brew = Brew(method: method, rating: rating, notes: notes)
                prefs.recentBrews.insert(brew, at: 0)
                prefs.weeklyCount += 1
                notes = ""
                rating = 4
                notesFocused = false
            } label: {
                Label("Save brew", systemImage: "checkmark.circle.fill")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .controlSize(.large)
        }
        .padding(20)
        .background(.thinMaterial, in: .rect(cornerRadius: 16))
    }
}
