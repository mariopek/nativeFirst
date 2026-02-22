# CLAUDE.md Template — Advanced (Invoize-Style)

This is a more advanced CLAUDE.md based on the patterns used in real production apps. It includes project-specific rules, detailed architecture constraints, and domain-specific guidelines.

---

```markdown
# Invoize

Professional invoicing application for macOS. Native SwiftUI,
local-first, privacy-focused. Built for freelancers and small
businesses who need fast, reliable invoice creation without
subscription fees or cloud dependencies.

## Tech Stack
- Language: Swift 5.9+
- UI Framework: SwiftUI (macOS)
- Persistence: SwiftData
- PDF: Custom rendering pipeline
- Minimum Target: macOS 14.0 (Sonoma)
- Distribution: Mac App Store

## Architecture

### MVVM + Service Layer
- Views → ViewModels → Services → SwiftData
- ViewModels are @Observable classes with @MainActor
- Services are injected via SwiftUI .environment
- No direct SwiftData access from Views

### Core Services
- InvoiceService: CRUD operations for invoices
- ClientService: Client management and lookup
- PDFService: Invoice → PDF rendering
- ExportService: CSV/JSON export
- PreferencesService: User settings (backed by @AppStorage)

### File Organization
```
Invoize/
├── App/
│   ├── InvoizeApp.swift
│   └── AppState.swift            # Global app state
├── Models/
│   ├── Invoice.swift              # @Model
│   ├── Client.swift               # @Model
│   ├── InvoiceItem.swift          # @Model
│   └── CompanyProfile.swift       # @Model
├── Views/
│   ├── Invoice/
│   │   ├── InvoiceListView.swift
│   │   ├── InvoiceDetailView.swift
│   │   ├── InvoiceEditorView.swift
│   │   └── InvoiceRowView.swift
│   ├── Client/
│   ├── Settings/
│   └── Shared/
│       ├── CurrencyField.swift
│       └── StatusBadge.swift
├── ViewModels/
├── Services/
├── PDF/
│   ├── PDFRenderer.swift          # Do not modify without explicit instruction
│   ├── Templates/
│   └── Fonts/
├── Extensions/
└── Resources/
    ├── Localizable.xcstrings
    └── Assets.xcassets
```

## Domain Rules

### Invoice Model
- Invoice numbers are auto-generated: INV-YYYY-NNNN format
- Amounts are stored as Decimal (never Double for currency)
- Tax calculations: support multiple tax rates per invoice
- Due dates default to 30 days from issue date
- Statuses: draft, sent, paid, overdue, cancelled

### Currency
- Always use Decimal for monetary values
- Format with NumberFormatter using device locale
- Store currency code (ISO 4217) with each invoice
- Support multi-currency (conversion is manual, not automatic)

### PDF Generation
- PDFRenderer is the single entry point — never bypass it
- Templates conform to InvoiceTemplate protocol
- Support A4 (595x842 pt) and US Letter (612x792 pt)
- All measurements in points (72 points = 1 inch)
- Fonts: embedded, do not rely on system fonts for PDFs
- Test PDFs at both page sizes before marking any PDF task complete

## Privacy & Data

### Critical: Data Locality
- ALL data stays on the user's device
- No analytics, telemetry, or crash reporting that sends data externally
- No network calls of any kind
- No CloudKit, no Firebase, no third-party SDKs
- iCloud sync via SwiftData's CloudKit integration ONLY (user opt-in)

### Security
- Sensitive fields (bank details, tax IDs) stored in Keychain
- App data encrypted at rest via macOS FileVault (standard)
- No clipboard access for sensitive data without user action

## macOS-Specific

### Window Management
- Main window: minimum 800x600, default 1200x800
- Inspector panel: sidebar style, toggleable
- PDF preview: separate window or sheet (user preference)

### Keyboard Shortcuts
- Cmd+N: New invoice
- Cmd+S: Save current invoice
- Cmd+P: Generate PDF / Print
- Cmd+E: Export
- Cmd+,: Preferences
- All primary actions must have keyboard shortcuts

### Menu Bar
- Standard macOS menu bar with File, Edit, Invoice, View, Help
- Context menus on all list items (right-click)

## Coding Standards

### Naming
- Types: PascalCase
- Properties/methods: camelCase
- Invoice-specific: always prefix invoice-related utilities with "Invoice"
  (InvoiceNumberGenerator, InvoicePDFTemplate)

### SwiftUI (macOS)
- Use .inspector modifier for detail panels
- Use Table for data-heavy views (not List)
- Support both light and dark mode
- Respect system accent color
- Use .focusedSceneValue for menu bar integration
- Support Full Keyboard Access navigation

### Testing
- Unit tests for all ViewModel logic and Services
- Use Swift Testing framework (not XCTest)
- Test file naming: [ClassName]Tests.swift
- Mock data in TestHelpers/MockData.swift
- Test currency calculations with edge cases (rounding, zero amounts)
- Test PDF generation at both page sizes

## Do NOT
- Make any network calls
- Use UIKit components (this is a macOS app)
- Use Double for currency (use Decimal)
- Modify PDFRenderer without explicit instruction
- Add third-party dependencies
- Store sensitive data in UserDefaults
- Hardcode strings
- Use print() for logging
- Create iOS-specific code (no UIDevice, no UIKit)
- Skip keyboard shortcut support for any primary action
```

---

## Key Differences from Basic Template

This advanced template adds:
1. **Domain rules** — specific to the invoicing business domain
2. **Privacy constraints** — explicit no-network, no-telemetry rules
3. **Platform-specific rules** — macOS keyboard shortcuts, window management, menu bar
4. **Critical warnings** — things the AI must never do (marked with "Critical")
5. **Testing requirements** — specific test scenarios for the domain
6. **File organization** — detailed, showing actual file names
