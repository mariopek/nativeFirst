import Foundation

/// Validates a static URL string at compile time and expands to a force-unwrapped
/// `URL(string:)!` — the force-unwrap is safe because the macro already proved it.
@freestanding(expression)
public macro URL(_ string: String) -> Foundation.URL = #externalMacro(module: "BrewLogMacrosPlugin", type: "URLMacro")
