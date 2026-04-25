import SwiftUI

struct PickerStyles: View {
    @State private var method: BrewMethod = .espresso

    var body: some View {
        VStack(spacing: 24) {
            // .menu — compact, opens a dropdown. Best for 4+ options.
            Picker("Default method", selection: $method) {
                ForEach(BrewMethod.allCases) { Text($0.label).tag($0) }
            }
            .pickerStyle(.menu)

            // .segmented — visible row, single tap. Best for 2–4 options.
            Picker("Method", selection: $method) {
                ForEach(BrewMethod.allCases) { Text($0.label).tag($0) }
            }
            .pickerStyle(.segmented)

            // .wheel — iOS-native picker wheel. Use for date/time or ranges.
            Picker("Method", selection: $method) {
                ForEach(BrewMethod.allCases) { Text($0.label).tag($0) }
            }
            .pickerStyle(.wheel)
        }
    }
}
