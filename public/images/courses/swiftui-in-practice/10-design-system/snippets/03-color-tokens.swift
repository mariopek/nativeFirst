import SwiftUI

// Design tokens as Color extensions. The asset-catalog color names live in one
// place; the rest of the app uses `.pulseAccent` instead of `Color("PulseAccent")`.
//
// Tomorrow's rebrand changes 5 lines, every screen follows.

extension Color {
    static let pulseAccent       = Color("PulseAccent",       bundle: .main)
    static let pulseDanger       = Color("PulseDanger",       bundle: .main)
    static let pulseSuccess      = Color("PulseSuccess",      bundle: .main)
    static let pulseWarning      = Color("PulseWarning",      bundle: .main)
    static let pulseSurface      = Color("PulseSurface",      bundle: .main)
    static let pulseSurfaceDeep  = Color("PulseSurfaceDeep",  bundle: .main)
}

// Use:
//   Text("Profit").foregroundStyle(.pulseSuccess)
//   Rectangle().fill(.pulseSurface)
//
// Each Color asset has light + dark variants in Assets.xcassets — dark mode
// adapts automatically. The semantic name (`pulseSuccess`) decouples views
// from "green" so a brand refresh doesn't require global find-replace.
