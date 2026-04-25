import SwiftUI

// Spacer pushes everything in front of it to one end of the stack
struct PushRight: View {
    var body: some View {
        HStack {
            Text("Brew Log")
            Spacer()
        }
    }
}

// Spacers on both sides center the content
struct CenterIt: View {
    var body: some View {
        HStack {
            Spacer()
            Text("Brew Log")
            Spacer()
        }
    }
}

// Two spacers between three views distribute the gaps evenly
struct EvenlyDistributed: View {
    var body: some View {
        HStack {
            Text("Left")
            Spacer()
            Text("Center")
            Spacer()
            Text("Right")
        }
    }
}
