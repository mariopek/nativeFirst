import SwiftUI

// Fixed size — exact width and height
struct FixedFrame: View {
    var body: some View {
        Text("Fixed")
            .frame(width: 120, height: 44)
    }
}

// Flexible width — fill the parent's offered width
struct FlexibleWidth: View {
    var body: some View {
        Text("Stretches")
            .frame(maxWidth: .infinity)
    }
}

// Bounded — never smaller than 80, never wider than 240
struct BoundedWidth: View {
    var body: some View {
        Text("Within bounds")
            .frame(minWidth: 80, maxWidth: 240)
    }
}

// fixedSize — opt out of truncation, take ideal size
struct FixedSizeNoTruncation: View {
    var body: some View {
        Text("This text refuses to truncate, even in tight space.")
            .fixedSize(horizontal: false, vertical: true)
    }
}
