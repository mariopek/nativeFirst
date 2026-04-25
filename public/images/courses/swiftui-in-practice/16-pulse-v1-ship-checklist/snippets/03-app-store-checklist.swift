import Foundation

// The pre-submission checklist. Apple Review rejects most v1 apps for
// the same handful of issues. None of these are technical — they're
// the boring metadata that gates the launch.

// =====================================================================
// Build settings
// =====================================================================
// ☐ Bundle Identifier matches App Store Connect record
// ☐ Build configuration is Release (not Debug)
// ☐ Bitcode disabled (deprecated since Xcode 14, but check)
// ☐ Strip debug symbols enabled
// ☐ Marketing version (e.g. 1.0) and build number (e.g. 1) are set
// ☐ iOS Deployment Target matches what you tested on
//
// In Pulse: Target → Signing & Capabilities → Release → verify all of the above.


// =====================================================================
// Info.plist required keys
// =====================================================================
// For Pulse specifically (network app, no sensitive permissions):
//
//   NSAppTransportSecurity                — only if you hit non-HTTPS endpoints (you shouldn't)
//   ITSAppUsesNonExemptEncryption = false — required since 2024 for non-cryptographic apps
//   CFBundleShortVersionString            — marketing version
//   CFBundleVersion                       — build number
//
// If you ask for permissions (camera, location, photos):
//   NSCameraUsageDescription             — required, must explain *specifically* why
//   NSLocationWhenInUseUsageDescription  — same
//   NSPhotoLibraryUsageDescription       — same
//
// Apple rejects apps with vague permission strings ("we need camera access").
// Be specific: "Pulse uses your camera to scan wallet QR codes."


// =====================================================================
// App Store Connect metadata
// =====================================================================
// ☐ Subtitle (30 chars) — searchable, second most important field after name
// ☐ Promotional text (170 chars) — what's new this release
// ☐ Description (4000 chars) — write the first paragraph for someone who knows nothing
// ☐ Keywords (100 chars, comma-separated, no spaces) — research with App Store Connect Analytics
// ☐ Support URL — must resolve, must look real
// ☐ Privacy Policy URL — required, even if you collect nothing
// ☐ Privacy nutrition labels — declare every framework that might collect data
// ☐ Screenshots — 6.7", 6.5", 5.5", iPad if supported. iOS 26 shifts towards "screenshots optional" but still recommended.


// =====================================================================
// What gets you rejected (top 5)
// =====================================================================
//   1. Crash on first launch (test with airplane mode + first-run state)
//   2. Broken main feature on review device (test on a real device, not just sim)
//   3. Missing sign-in alternative (if you have email login, you also need
//      "Sign in with Apple" — Guideline 4.8)
//   4. Inaccurate metadata (your description claims a feature that's not there)
//   5. Placeholder content (lorem ipsum, fake account names, debug toggles)
//
// Pulse avoids 3 because there's no auth. Avoids 1, 2, 5 because we tested.
// Avoids 4 because we wrote the description to match the actual app.


// =====================================================================
// Final pre-submission ritual
// =====================================================================
// 1. Archive in Release (Xcode → Product → Archive)
// 2. Validate the archive in Organizer (catches signing/entitlement issues)
// 3. Upload to App Store Connect
// 4. Run on a TestFlight device WITH NO INSTALL HISTORY (clean state)
// 5. Run on the smallest device you support (iPhone SE 3rd gen → layout breaks)
// 6. Run with the system language set to a different language (verify formatters)
// 7. Submit for review with a short note: "no auth, no IAP, no permissions."
//
// Average Apple Review turnaround in 2026: ~24 hours.
