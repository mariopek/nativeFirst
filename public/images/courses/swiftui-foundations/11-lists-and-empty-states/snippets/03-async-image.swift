import SwiftUI

struct CoffeePhotos: View {
    let url = URL(string: "https://picsum.photos/seed/brewlog/600/400")

    var body: some View {
        VStack(spacing: 16) {
            // Default — fades in when loaded, system placeholder while loading
            AsyncImage(url: url)
                .frame(height: 160)

            // Phased — handle loading, success, and failure states explicitly
            AsyncImage(url: url) { phase in
                switch phase {
                case .empty:
                    ProgressView()
                        .frame(maxWidth: .infinity)
                        .frame(height: 160)
                case .success(let image):
                    image
                        .resizable()
                        .scaledToFill()
                        .frame(height: 160)
                        .clipped()
                case .failure:
                    ContentUnavailableView(
                        "Failed to load",
                        systemImage: "photo.badge.exclamationmark"
                    )
                @unknown default:
                    EmptyView()
                }
            }
            .clipShape(.rect(cornerRadius: 12))
        }
    }
}
