import SwiftUI

struct BrewDetailView: View {
    let brew: Brew

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                Image(systemName: brew.method.iconName)
                    .font(.system(size: 72))
                    .foregroundStyle(.tint)
                    .padding(36)
                    .background(.tint.opacity(0.15), in: .circle)

                VStack(spacing: 6) {
                    Text(brew.method.label).font(.largeTitle.weight(.bold))
                    Text(brew.date, format: .dateTime.month(.wide).day().hour().minute())
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }

                HStack(spacing: 6) {
                    ForEach(0..<5) { i in
                        Image(systemName: i < brew.rating ? "star.fill" : "star")
                            .font(.title2)
                            .foregroundStyle(i < brew.rating ? .yellow : .secondary)
                    }
                }

                if !brew.notes.isEmpty {
                    Text(brew.notes)
                        .font(.body)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(20)
                        .background(.thinMaterial, in: .rect(cornerRadius: 16))
                }
            }
            .padding()
        }
        .navigationTitle("Brew details")
        .navigationBarTitleDisplayMode(.inline)
    }
}
