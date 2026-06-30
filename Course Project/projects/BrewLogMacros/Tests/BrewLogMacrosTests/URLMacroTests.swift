import SwiftSyntaxMacros
import SwiftSyntaxMacrosTestSupport
import XCTest

@testable import BrewLogMacrosPlugin

nonisolated(unsafe) private let testMacros: [String: Macro.Type] = ["URL": URLMacro.self]

final class URLMacroTests: XCTestCase {
    func testValidURLExpandsToForceUnwrappedURLInit() {
        assertMacroExpansion(
            #"#URL("http://127.0.0.1:8080")"#,
            expandedSource: #"URL(string: "http://127.0.0.1:8080")!"#,
            macros: testMacros
        )
    }

    func testMissingSchemeFailsAtCompileTimeInsteadOfCrashingAtRuntime() {
        assertMacroExpansion(
            #"#URL("127.0.0.1:8080")"#,
            expandedSource: #"#URL("127.0.0.1:8080")"#,
            diagnostics: [
                DiagnosticSpec(message: #""127.0.0.1:8080" has no scheme — URLComponents would also reject it. Did you forget "http://"?"#, line: 1, column: 1)
            ],
            macros: testMacros
        )
    }

    func testLeadingWhitespaceFailsAtCompileTime() {
        assertMacroExpansion(
            #"#URL(" http://127.0.0.1:8080")"#,
            expandedSource: #"#URL(" http://127.0.0.1:8080")"#,
            diagnostics: [
                DiagnosticSpec(message: #"" http://127.0.0.1:8080" has no scheme — URLComponents would also reject it. Did you forget "http://"?"#, line: 1, column: 1)
            ],
            macros: testMacros
        )
    }

    func testNonStringLiteralArgumentIsRejectedBeforeItEverReachesURLParsing() {
        assertMacroExpansion(
            "#URL(someVariable)",
            expandedSource: "#URL(someVariable)",
            diagnostics: [
                DiagnosticSpec(message: "#URL requires a static string literal, not an interpolated or dynamic value", line: 1, column: 1)
            ],
            macros: testMacros
        )
    }
}
