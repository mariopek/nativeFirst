// swift-tools-version: 6.0
import CompilerPluginSupport
import PackageDescription

let package = Package(
    name: "BrewLogMacros",
    platforms: [.macOS(.v13), .iOS(.v17)],
    products: [
        .library(name: "BrewLogMacros", targets: ["BrewLogMacros"])
    ],
    dependencies: [
        .package(url: "https://github.com/swiftlang/swift-syntax.git", from: "600.0.0")
    ],
    targets: [
        .macro(
            name: "BrewLogMacrosPlugin",
            dependencies: [
                .product(name: "SwiftSyntax", package: "swift-syntax"),
                .product(name: "SwiftSyntaxMacros", package: "swift-syntax"),
                .product(name: "SwiftCompilerPlugin", package: "swift-syntax")
            ]
        ),
        .target(name: "BrewLogMacros", dependencies: ["BrewLogMacrosPlugin"]),
        .executableTarget(name: "BrewLogMacrosDemo", dependencies: ["BrewLogMacros"]),
        .testTarget(
            name: "BrewLogMacrosTests",
            dependencies: [
                "BrewLogMacrosPlugin",
                .product(name: "SwiftSyntaxMacrosTestSupport", package: "swift-syntax")
            ]
        )
    ]
)
