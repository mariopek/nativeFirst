import SwiftUI

struct ColorPickerExamples: View {
    @State private var brand: Color = .blue
    @State private var background: Color = .white

    var body: some View {
        VStack(spacing: 16) {
            // With label, default style — opens system color panel on tap
            ColorPicker("Brand color", selection: $brand)

            // Without alpha channel — restrict to opaque colors
            ColorPicker("Background", selection: $background, supportsOpacity: false)

            // Compact: hide the label using labelsHidden() and place a custom label outside
            HStack {
                Text("Accent")
                Spacer()
                ColorPicker("", selection: $brand)
                    .labelsHidden()
            }
        }
    }
}
