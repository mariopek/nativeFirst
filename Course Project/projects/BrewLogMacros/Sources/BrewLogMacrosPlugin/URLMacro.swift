import Foundation
import SwiftCompilerPlugin
import SwiftSyntax
import SwiftSyntaxMacros

struct URLMacroError: Error, CustomStringConvertible {
    let description: String
}

public struct URLMacro: ExpressionMacro {
    public static func expansion(
        of node: some FreestandingMacroExpansionSyntax,
        in context: some MacroExpansionContext
    ) throws -> ExprSyntax {
        guard
            let argument = node.arguments.first?.expression,
            let stringLiteral = argument.as(StringLiteralExprSyntax.self),
            stringLiteral.segments.count == 1,
            case .stringSegment(let segment) = stringLiteral.segments.first
        else {
            throw URLMacroError(description: "#URL requires a static string literal, not an interpolated or dynamic value")
        }

        let urlString = segment.content.text

        // URL(string:) is dangerously lenient — it percent-encodes its way around
        // spaces, missing schemes, almost anything short of an empty string. The
        // bar worth enforcing at compile time is the one that actually catches
        // real typos: does this thing even have a scheme?
        guard URLComponents(string: urlString)?.scheme != nil else {
            throw URLMacroError(description: "\"\(urlString)\" has no scheme — URLComponents would also reject it. Did you forget \"http://\"?")
        }

        return "URL(string: \(literal: urlString))!"
    }
}

@main
struct BrewLogMacrosPluginEntry: CompilerPlugin {
    let providingMacros: [Macro.Type] = [URLMacro.self]
}
