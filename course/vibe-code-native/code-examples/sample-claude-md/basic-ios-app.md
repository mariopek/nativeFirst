# CLAUDE.md Template — Basic iOS App

Copy this template and customize it for your project. Replace all `[brackets]` with your specific values.

---

```markdown
# [Your App Name]

[One-sentence description of what the app does.]

## Tech Stack
- Language: Swift 5.9+
- UI Framework: SwiftUI
- Persistence: SwiftData
- Minimum Target: iOS 17.0
- IDE: Xcode 16+

## Architecture

### MVVM Pattern
- Every screen has a View and a ViewModel
- ViewModels are `@Observable` classes (NOT ObservableObject)
- Views own their ViewModels via `@State private var viewModel = SomeViewModel()`
- Views are purely declarative — no business logic, no direct data access
- ViewModels handle all business logic and data transformation
- Services handle external operations (networking, persistence, system APIs)

### File Organization
```
[AppName]/
├── App/                    # App entry point, app-level configuration
├── Models/                 # SwiftData models and data types
├── Views/                  # SwiftUI views, grouped by feature
│   ├── Home/
│   ├── Settings/
│   └── Shared/             # Reusable view components
├── ViewModels/             # ViewModel classes
├── Services/               # Network, persistence, system services
├── Extensions/             # Swift extensions
└── Resources/              # Assets, localization files
```

## Coding Standards

### Naming Conventions
- Types: PascalCase (UserProfileView, InvoiceViewModel)
- Properties/methods: camelCase (userName, fetchData())
- Constants: camelCase (maxRetryCount)
- Boolean properties: prefix with is/has/should (isLoading, hasError)
- Protocols: adjective or -able suffix (Configurable, Persistable)

### SwiftUI
- Prefer smaller, composable views over large ones
- Extract repeated styles into ViewModifier structs
- Always include #Preview for every view
- Use .task {} for async work (not .onAppear with Task {})
- Use NavigationStack (not NavigationView)
- Use navigationDestination(for:) for type-safe navigation

### Swift Concurrency
- Use async/await for all asynchronous operations
- Use @MainActor for ViewModel classes
- Never block the main thread
- Use Task groups for parallel operations

### Error Handling
- Use typed throws where appropriate
- User-facing errors must be human-readable
- Log technical errors with os.Logger (not print())
- Display errors using .alert modifier

## UI/UX Guidelines
- Follow Apple Human Interface Guidelines
- Use system colors (Color.primary, .secondary, .accentColor)
- Use SF Symbols for icons
- Support Dynamic Type — never hardcode font sizes
- Support Dark Mode — use semantic colors only
- Minimum tap target: 44x44 points
- All interactive elements must have accessibility labels

## Do NOT
- Use UIKit wrapped in UIViewRepresentable (unless no SwiftUI equivalent exists)
- Use third-party UI libraries
- Hardcode strings — use String Catalogs for localization
- Store sensitive data in UserDefaults — use Keychain
- Use singletons for state management — use SwiftUI environment
- Force unwrap optionals
- Use AnyView — prefer @ViewBuilder or concrete types
- Use print() for logging — use os.Logger
- Commit API keys, tokens, or secrets to source code
- Target below iOS 17
```

---

## How to Use This Template

1. Copy the markdown content above (inside the code fence)
2. Create a file called `CLAUDE.md` in your Xcode project's root directory
3. Replace all `[brackets]` with your project-specific values
4. Add project-specific rules (see `invoize-style.md` for a more advanced example)
5. Run Claude Code — it will automatically read this file
