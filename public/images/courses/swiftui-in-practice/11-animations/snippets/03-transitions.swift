import SwiftUI

// Three transition flavors for views that come and go (insertion / removal).
struct TransitionGallery: View {
    @State private var showBanner = false

    var body: some View {
        VStack {
            if showBanner {
                BannerCard()
                    .transition(.move(edge: .top).combined(with: .opacity))   // slide + fade
            }

            Button("Toggle banner") {
                withAnimation(.spring(duration: 0.4)) {
                    showBanner.toggle()
                }
            }
        }
    }
}

// .asymmetric — different in/out animations
struct ToastView: View {
    @State private var visible = false

    var body: some View {
        ZStack {
            if visible {
                Text("Saved")
                    .padding()
                    .background(.thinMaterial, in: .capsule)
                    .transition(
                        .asymmetric(
                            insertion: .scale.combined(with: .opacity),  // pop in
                            removal: .opacity                            // fade out
                        )
                    )
            }
        }
    }
}

private struct BannerCard: View {
    var body: some View {
        Text("Refreshed")
            .frame(maxWidth: .infinity)
            .padding()
            .background(.green.opacity(0.2), in: .rect(cornerRadius: 12))
    }
}
