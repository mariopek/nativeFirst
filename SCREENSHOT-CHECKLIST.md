# Screenshot & Visual Asset Checklist

> Za svaku lekciju: šta snimiti, koji dummy podaci trebaju, i da li treba SVG dijagram umesto screenshot-a.

---

## KURS 1: Vibe Code Native (Besplatni)

---

### Modul 1: Introduction to Vibe Coding

#### 1.1 — What is Vibe Coding?
**Tip:** Konceptualna lekcija — nema app UI
**SVG dijagram:** `vibe-coding-spectrum.svg` ✅ POSTOJI
- Spektar od Copy-Paste AI → Assisted Coding → Guided Coding → Full Vibe Coding
**Dodatni screenshot:**
- [ ] Terminal screenshot: Claude Code otvoren u projektu, vidljiv prompt i odgovor
  - Dummy komanda: `claude "Explain the MVVM pattern for SwiftUI"`

#### 1.2 — AI Tools for iOS Development
**Tip:** Konceptualna lekcija — poređenje alata
**SVG dijagram:** `recommended-stack.svg` ✅ POSTOJI
- 2x2 grid: Claude Code (Primary), GitHub Copilot (Secondary), Cursor (Optional), OpenClaw (Automation)
**Dodatni screenshot:**
- [ ] Side-by-side poređenje: isti prompt u Claude Code vs Cursor (split screen terminal)
  - Dummy prompt: `"Build a UserProfileView with MVVM in SwiftUI"`

#### 1.3 — Setup & Your First Prompt
**Tip:** Praktična lekcija — app UI postoji
**SVG dijagram:** `setup-workflow.svg` ✅ POSTOJI
**Screenshot-ovi (Xcode + Simulator):**
- [ ] **Xcode novi projekat:** File → New → Project dijalog, "MyFirstApp" ime, SwiftUI Interface, Swift language
- [ ] **Terminal:** Claude Code instalacija — `npm install -g @anthropic-ai/claude-code`
- [ ] **CLAUDE.md fajl:** Xcode editor sa otvorenim CLAUDE.md, sadržaj:
  ```
  # MyFirstApp
  - Architecture: MVVM
  - UI: SwiftUI, iOS 17+
  - No force unwraps
  - Use async/await
  ```
- [ ] **Simulator — ProfileView:** Gotov ekran sa:
  - Profile slikom (SF Symbol `person.circle.fill`)
  - Ime: "Mario Pekmezovic"
  - Email: "mario@nativefirst.com"
  - Toggle: "Enable Notifications" (ON)
  - Toggle: "Dark Mode" (ON)
  - Dugme: "Sign Out" (crveno)

---

### Modul 2: Prompting for Swift & SwiftUI

#### 2.1 — Anatomy of a Good Prompt
**Tip:** Metodološka lekcija
**SVG dijagram:** `prompt-framework.svg` ✅ POSTOJI
- 4 dela: Context → Task → Constraints → Format
**Screenshot-ovi:**
- [ ] **Terminal — Bad prompt:** `claude "make a search bar"`
  - Prikazati generički, neupotrebljiv odgovor
- [ ] **Terminal — Good prompt:**
  ```
  claude "Build a SearchBar component for SwiftUI.
  Context: Recipe app with CoreData.
  Task: Debounced search with 300ms delay.
  Constraints: iOS 17+, no third-party libs.
  Format: Separate SearchBar view + ViewModel."
  ```
  - Prikazati kvalitetan, strukturiran odgovor

#### 2.2 — CLAUDE.md — Your AI Playbook
**Tip:** Konfiguraciona lekcija — nema app UI
**SVG dijagram:** ❌ TREBA KREIRATI → `claude-md-structure.svg`
- Dijagram sekcija CLAUDE.md fajla: Project Overview → Architecture Rules → Coding Standards → Data Layer → UI/UX → Do NOT
**Screenshot-ovi:**
- [ ] **Xcode editor:** CLAUDE.md za Invoize app sa sekcijama vidljivim
  ```markdown
  # Invoize — macOS Invoice App
  ## Architecture
  - MVVM with @Observable ViewModels
  - SwiftData for persistence
  ## Coding Standards
  - No force unwraps (!)
  - os.Logger, zero print()
  ## Do NOT
  - Do NOT use UIKit
  - Do NOT create singletons
  ```
- [ ] **Terminal:** Demonstracija kako CLAUDE.md utiče na output — isti prompt sa i bez CLAUDE.md

#### 2.3 — Iterative Prompting
**Tip:** Metodološka lekcija sa app UI progresijom
**SVG dijagram:** `refinement-ladder.svg` ✅ POSTOJI
- 5 koraka: Skeleton → Structure → Behavior → Integration → Polish
**Screenshot-ovi (Simulator — 5 iteracija expense tracker-a):**
- [ ] **Iteracija 1 — Skeleton:** Prazan List sa hardkodiranim stringovima
  - Dummy: "Groceries $45.00", "Gas $32.50", "Coffee $4.75"
- [ ] **Iteracija 2 — Structure:** List sa sekcijama po datumu
  - Dummy sekcije: "Today", "Yesterday", "This Week"
- [ ] **Iteracija 3 — Behavior:** Swipe-to-delete, dodaj dugme (+)
- [ ] **Iteracija 4 — Integration:** Kategorije sa ikonicama (🍕 Food, ⛽ Gas, ☕ Coffee)
- [ ] **Iteracija 5 — Polish:** Search bar, sort menu, ukupan iznos na vrhu "$82.25 this week"

#### 2.4 — Prompting Anti-Patterns
**Tip:** Metodološka lekcija — nema app UI
**SVG dijagram:** ❌ TREBA KREIRATI → `anti-patterns-grid.svg`
- Grid 5x2: 10 anti-pattern-a sa ikonom ❌ i fix-om ✅
**Screenshot-ovi:**
- [ ] **Terminal — Mega-prompt anti-pattern:** Jedan ogroman prompt od 50+ linija koji pokušava sve odjednom
- [ ] **Terminal — Fix:** Isti zadatak razbijen u 3 manja prompta

---

### Modul 3: Your First App — Todo App with AI

#### 3.1 — Planning Your App with AI
**Tip:** Planski dokument — nema app UI
**SVG dijagram:** ❌ TREBA KREIRATI → `todo-app-architecture.svg`
- MVVM dijagram: View ↔ ViewModel ↔ SwiftData ModelContainer → TodoItem, Category modeli
**Screenshot-ovi:**
- [ ] **Terminal — Plan prompt:** Claude Code u plan mode-u, vidljiv output sa strukturom projekta
  ```
  claude --plan "Plan a Todo app for iOS 17+ with SwiftUI and SwiftData.
  Features: categories, priorities, due dates, search."
  ```
- [ ] **Xcode — Folder structure:** Project navigator sa folderima:
  ```
  TodoApp/
  ├── App/
  ├── Models/
  ├── ViewModels/
  ├── Views/
  └── CLAUDE.md
  ```

#### 3.2 — Building the Data Layer
**Tip:** Arhitektura — nema vizuelni UI
**SVG dijagram:** ❌ TREBA KREIRATI → `todo-data-model.svg`
- ER dijagram: TodoItem (title, notes, dueDate, priority, isCompleted) ←→ Category (name, color, icon)
**Screenshot-ovi:**
- [ ] **Xcode editor:** TodoItem.swift model fajl sa @Model dekoracijom
  ```swift
  @Model
  class TodoItem {
      var title: String
      var notes: String
      var dueDate: Date?
      var priority: Priority
      var isCompleted: Bool
      @Relationship var category: Category?
  }
  ```
- [ ] **Xcode editor:** Priority enum
  ```swift
  enum Priority: Int, Codable, CaseIterable {
      case low = 0, medium = 1, high = 2
  }
  ```

#### 3.3 — Building the Views
**Tip:** UI lekcija — mnogo screenshot-ova!
**Screenshot-ovi (Simulator — 6 ekrana):**
- [ ] **ContentView — TabView:** Dva taba — "Tasks" (checklist ikona) i "Categories" (folder ikona)
- [ ] **TodoListView:** Sekcije "Today (2)", "Upcoming (3)", "Completed (5)"
  - Dummy podaci:
    - Today: "Buy groceries" (High, 🔴), "Call dentist" (Medium, 🟡)
    - Upcoming: "Finish report" (High, due Feb 28), "Book flight" (Low), "Clean garage" (Medium)
    - Completed: 5 stavki sa strikethrough tekstom
- [ ] **TodoRowView:** Pojedinačan red — checkbox, naslov, kategorija badge, priority boja, due date
- [ ] **AddTodoView:** Sheet forma sa:
  - Title: "Buy birthday gift"
  - Notes: "Something for Mom's birthday"
  - Priority picker: Medium selected
  - Category: "Personal" selected
  - Due Date: March 15, 2026
- [ ] **TodoDetailView:** Edit ekran sa popunjenim podacima
- [ ] **CategoryPickerView:** Horizontalni chip-ovi — "Work" (plavo), "Personal" (zeleno), "Shopping" (narandžasto), "Health" (crveno)

#### 3.4 — Polish & Ship
**Tip:** UI polish — vizuelni detalji
**Screenshot-ovi (Simulator):**
- [ ] **Completion animacija:** Spring animacija kad se checkbox tapne (mid-animation screenshot)
- [ ] **Empty state:** ContentUnavailableView — "No Tasks Yet" sa ikonom i "Add your first task" dugmetom
- [ ] **All done state:** ContentUnavailableView — "All Done! 🎉" sa party popper ikonom
- [ ] **Swipe actions:** Levi swipe na todo — zeleno "Complete" i crveno "Delete" dugme
- [ ] **Search aktivan:** Search bar sa tekstom "gro" i filtriran rezultat "Buy groceries"
- [ ] **Sort menu:** Dropdown sa opcijama: "Due Date", "Priority", "Title", "Created"
- [ ] **Dark mode:** Isti TodoListView ekran u dark mode-u

---

### Modul 4: Real-World Patterns

#### 4.1 — Networking & API Integration
**Tip:** Arhitektura + app UI
**SVG dijagram:** ❌ TREBA KREIRATI → `networking-architecture.svg`
- Flow: View → ViewModel → NetworkService → URLSession → API → JSON → Codable → ViewModel → View
**Screenshot-ovi (Simulator — Weather app):**
- [ ] **Loading state:** Search bar sa "London" i ProgressView spinner
- [ ] **Success state:** Weather prikaz:
  - Grad: "London, GB"
  - Temperatura: "12°C"
  - Ikona: oblačno ☁️
  - Opis: "Overcast clouds"
  - Vlažnost: "78%", Vetar: "15 km/h"
- [ ] **Error state:** "Failed to load weather" sa "Try Again" dugmetom

#### 4.2 — Error Handling & Loading States
**Tip:** UX patterns — više stanja ekrana
**SVG dijagram:** ❌ TREBA KREIRATI → `loading-states-flow.svg`
- State machine: Idle → Loading → Loaded(data) / Error(message) → Retry → Loading
**Screenshot-ovi (Simulator — Post list app):**
- [ ] **Idle state:** Prazan ekran sa "Pull to refresh" indikacijom
- [ ] **Loading state:** Skeleton shimmer view — 5 sive animirane trake
- [ ] **Loaded state:** Lista postova:
  - "Getting Started with SwiftUI" — by John, 5 min read
  - "Advanced Async/Await" — by Sarah, 8 min read
  - "Building Charts in iOS" — by Mike, 6 min read
- [ ] **Empty state:** "No posts yet" sa ilustracijom
- [ ] **Error state:** Full-screen error — "Connection failed" + "Retry" dugme
- [ ] **Pull-to-refresh:** Aktiviran refresh indicator na vrhu liste

#### 4.3 — Navigation Patterns
**Tip:** Navigaciona arhitektura
**SVG dijagram:** ❌ TREBA KREIRATI → `navigation-flow.svg`
- Dijagram: RootTabView sa 3 taba, svaki sa nezavisnim NavigationStack-om, Sheets za modale
**Screenshot-ovi (Simulator):**
- [ ] **Tab 1 — Home:** NavigationStack sa "Home" naslovom i lista stavki
- [ ] **Tab 2 — Search:** Search interfejs
- [ ] **Tab 3 — Profile:** Profil sa settings listom
- [ ] **Push navigation:** Detail view pushnut sa Tab 1 — naslov "Item Detail"
- [ ] **Sheet modal:** AddItemView kao .sheet prezentacija sa drag indikatorom

#### 4.4 — Working with System Frameworks
**Tip:** System API integracije — mnogo UI
**Screenshot-ovi (Simulator):**
- [ ] **PhotosPicker:** Dugme "Select Photo" → grid selekcija → izabrana slika prikazana
  - Dummy: Selektovana slika pejzaža
- [ ] **MapKit:** Mapa sa 3 markera:
  - 📍 "Apple Park" — Cupertino, CA
  - 📍 "Golden Gate Bridge" — San Francisco, CA
  - 📍 "Googleplex" — Mountain View, CA
- [ ] **Location permission:** Alert: "Allow 'MyApp' to use your location?" — While Using / Don't Allow
- [ ] **Notification form:** Forme za zakazivanje:
  - Title: "Team standup"
  - Body: "Daily standup in 15 minutes"
  - Time picker: 9:45 AM
- [ ] **ShareLink:** Share sheet otvoren sa "Share this item" sadržajem

---

### Modul 5: Testing & Quality

#### 5.1 — Unit Testing with AI
**Tip:** Testing — nema app UI
**SVG dijagram:** ❌ TREBA KREIRATI → `testing-pyramid.svg`
- Piramida: Unit Tests (baza, brzi) → Integration Tests (sredina) → UI Tests (vrh, spori)
**Screenshot-ovi:**
- [ ] **Xcode Test Navigator:** Lista testova sa zelenim checkmark-ovima
  - WorkoutViewModelTests (12 tests ✅)
  - MockDataTests (5 tests ✅)
- [ ] **Xcode editor:** Test fajl sa `@Test` anotacijama i `#expect` assertion-ima
  ```swift
  @Test func addWorkout_increasesCount() {
      let sut = makeSUT()
      sut.addWorkout(name: "Push-ups", reps: 20)
      #expect(sut.workouts.count == 1)
  }
  ```
- [ ] **Test results:** Xcode test report — sve zeleno, execution time vidljiv

#### 5.2 — Debugging with AI
**Tip:** Debugging workflow — nema app UI
**SVG dijagram:** ❌ TREBA KREIRATI → `debugging-workflow.svg`
- Flow: Bug Report → Categorize (Compiler/Runtime/Logic) → AI Diagnosis → Fix → Verify
**Screenshot-ovi:**
- [ ] **Xcode — Compiler error:** Crvena oznaka na liniji sa `Cannot convert value of type 'String' to expected argument type 'Int'`
- [ ] **Terminal — AI fix:** Claude Code sa paste-ovanom greškom i AI rešenjem
- [ ] **Xcode — Breakpoint:** Aktivan breakpoint sa variables inspector-om koji prikazuje stanje objekta
- [ ] **Instruments:** Time Profiler otvorena sa CPU grafikom i call tree-jem

#### 5.3 — Code Review Workflow
**Tip:** Code quality — nema app UI
**SVG dijagram:** ❌ TREBA KREIRATI → `code-review-checklist.svg`
- Checklist vizual: State Management ✓ → Optionals ✓ → Memory ✓ → APIs ✓ → Accessibility ✓
**Screenshot-ovi:**
- [ ] **Terminal — AI review prompt:**
  ```
  claude "Review this SettingsView for issues:
  [paste code]
  Check: state management, memory leaks,
  accessibility, naming conventions"
  ```
- [ ] **Terminal — AI response:** Označene problematične linije sa objašnjenjima

---

### Modul 6: Ship It

#### 6.1 — Performance Optimization
**Tip:** Performance patterns — nema app UI
**SVG dijagram:** ❌ TREBA KREIRATI → `performance-checklist.svg`
- Vizuelni checklist: LazyVStack ✓ → Isolated State ✓ → Image Optimization ✓ → Background Tasks ✓
**Screenshot-ovi:**
- [ ] **Instruments — Time Profiler:** CPU spike vidljiv pri scrollovanju liste
- [ ] **Xcode editor — Before:** `VStack` sa 1000 stavki (loše)
- [ ] **Xcode editor — After:** `LazyVStack` sa istim stavkama (dobro)

#### 6.2 — Accessibility & Localization
**Tip:** Accessibility UI promene
**Screenshot-ovi (Simulator):**
- [ ] **VoiceOver aktivan:** Accessibility inspector sa fokusiranim elementom i čitanim labelom
  - Element: ExpenseRow — "Groceries, forty-five dollars, high priority, due tomorrow"
- [ ] **Dynamic Type — Default:** Normalna veličina teksta
- [ ] **Dynamic Type — AX5 (largest):** Isti ekran sa najvećim tekstom, layout prilagođen sa ViewThatFits
- [ ] **String Catalog:** Xcode String Catalog editor sa prevodima:
  - "Add Task" → DE: "Aufgabe hinzufügen", FR: "Ajouter une tâche", ES: "Añadir tarea"

#### 6.3 — App Store Preparation
**Tip:** App Store proces — nema app UI
**SVG dijagram:** ❌ TREBA KREIRATI → `app-store-flow.svg`
- Flow: Code Complete → TestFlight → Beta Testing → App Store Connect → Review → Launch
**Screenshot-ovi:**
- [ ] **App Store Connect:** App info stranica sa dummy podacima:
  - Name: "TodoMaster"
  - Subtitle: "Smart Task Management"
  - Category: Productivity
- [ ] **Screenshot previews:** Simulator screenshot 6.7" sa frejmom oko njega
- [ ] **Terminal — AI description prompt:**
  ```
  claude "Write an App Store description for TodoMaster,
  a SwiftUI task management app with categories,
  priorities, search, and dark mode"
  ```

---

## KURS 2: Ship Native (Premium) — BetAway App

---

### Modul 1: Project Foundation

#### SN 1.1 — Architecture for Real Projects
**Tip:** Arhitektura — nema app UI
**SVG dijagram:** ❌ TREBA KREIRATI → `sn-mvvm-architecture.svg`
- MVVM + Service Layer: View ↔ ViewModel ↔ Service Layer ↔ SwiftData ModelContainer
- Folder structure: App/ → Core/ → Models/ → Navigation/ → ViewModels/ → Views/
**Screenshot-ovi:**
- [ ] **Xcode — New Project:** "BetAway" kreiran, iOS App, SwiftUI, Swift language
- [ ] **Xcode — Build Settings:** Swift 6 strict concurrency mode ENABLED
- [ ] **Xcode — Project Navigator:** Folder struktura:
  ```
  BetFree/
  ├── App/BetFreeApp.swift
  ├── Core/Theme/
  ├── Models/
  ├── Navigation/AppRouter.swift
  ├── ViewModels/
  └── Views/
  ```
- [ ] **Terminal:** Claude Code plan mode sa BetAway architecture planom

#### SN 1.2 — SwiftData Model Layer
**Tip:** Data modeling — nema app UI
**SVG dijagram:** ❌ TREBA KREIRATI → `sn-data-model-er.svg`
- ER dijagram:
  - UserProfile (1) ──→ (many) DailyCheckin
  - UserProfile (1) ──→ (many) UrgeLog
  - UserProfile (1) ──→ (many) JournalEntry
  - Enums: MoodRating, GamblingType, GamblingFrequency, CopingStrategy, PredefinedTrigger
**Screenshot-ovi:**
- [ ] **Xcode editor — UserProfile.swift:**
  ```swift
  @Model
  class UserProfile {
      var displayName: String
      var quitDate: Date
      var gamblingTypesRaw: [String]
      @Relationship(deleteRule: .cascade)
      var checkins: [DailyCheckin]
      @Relationship(deleteRule: .cascade)
      var urgeLogs: [UrgeLog]
  }
  ```
- [ ] **Xcode editor — Enums.swift:** MoodRating enum sa emoji mapiranjem
  ```swift
  enum MoodRating: Int, Codable, CaseIterable {
      case veryBad = 1   // 😢
      case bad = 2       // 😟
      case neutral = 3   // 😐
      case good = 4      // 😊
      case veryGood = 5  // 😄
  }
  ```

#### SN 1.3 — CLAUDE.md for BetAway
**Tip:** Konfiguracija — nema app UI
**SVG dijagram:** ❌ TREBA KREIRATI → `sn-claude-md-sections.svg`
- Sekcije: Project Identity → Architecture Rules → Naming Conventions → Theme System → Do NOT
**Screenshot-ovi:**
- [ ] **Xcode editor — CLAUDE.md:** Kompletan fajl sa svim sekcijama:
  ```markdown
  # BetAway (BetFree) — Gambling Recovery App
  ## Architecture
  - MVVM with @Observable ViewModels
  - SwiftData for persistence
  - Views use @Query for reads, modelContext for writes
  ## Theme
  - Always use ColorPalette, Typography, Spacing
  - BFCard for containers, BFButton for actions
  ## Do NOT
  - Do NOT use UIKit
  - Do NOT use print() — use os.Logger
  - Do NOT use force unwraps
  ```
- [ ] **Terminal — Verification:** Claude Code prompt da proveri da li CLAUDE.md radi:
  ```
  claude "Create a new ViewModel for tracking daily water intake.
  Follow all rules in CLAUDE.md."
  ```

---

### Modul 2: Core UI with SwiftUI

#### SN 2.1 — Design System & Theme
**Tip:** Design system — vizuelni elementi
**Screenshot-ovi (Simulator):**
- [ ] **Color palette preview:** SwiftUI preview sa svim bojama:
  - Brand: primaryGradientStart (#9333EA) → primaryGradientEnd (#6366F1)
  - Background: appBackground, surfacePrimary, surfaceSecondary
  - Functional: success (zeleno), warning (narandžasto), danger (crveno), info (plavo)
- [ ] **Typography scale:** Preview sa Nunito fontom:
  - `.largeTitle` "Recovery Dashboard"
  - `.headline` "Your Streak"
  - `.body` "Keep going, you're doing great"
  - `.caption` "Last updated 2 min ago"
- [ ] **BFCard component:** Kartica sa zaobljenim uglovima, senkom, gradient border-om
- [ ] **BFProgressRing:** Animirani kružni progress — 73% popunjeno, ljubičasti gradient
- [ ] **BFButton varijante:** 3 dugmeta — Primary (puno, ljubičasto), Secondary (outline), Danger (crveno)
- [ ] **Dark mode:** Isti design system preview u dark mode-u

#### SN 2.2 — Home Screen — Recovery Dashboard
**Tip:** Glavni ekran — mnogo screenshot-ova!
**Screenshot-ovi (Simulator — BetAway dashboard):**
- [ ] **Full dashboard scroll — top:** Greeting + StreakCard
  - Greeting: "Good morning, Mario 👋"
  - StreakCard: "47 Days Bet-Free" sa progress ring-om 47/90 (52%), gradient pozadina
- [ ] **Full dashboard scroll — mid:** QuoteCard + SavingsCard + StatsCard
  - Quote: "One day at a time. You are stronger than your urges."
  - Savings: "€1,645 Saved" sa trending up ikonom
  - Stats: "47 days" streak, "€35/week" saved, "89%" urges resisted
- [ ] **Full dashboard scroll — bottom:** PledgeCard + WeeklySummary + MilestoneCard + UrgeButton
  - Pledge: "Take your morning pledge" (ako nije uzet) ili ✅ "Pledge completed"
  - Weekly: "This Week: 5/7 check-ins, 3 urges resisted"
  - Milestone: "Next: 60 days — 13 days to go"
  - Emergency: Pulsing crveno dugme "I'm Having an Urge"
- [ ] **Staggered animation:** Mid-animation screenshot gde kartice ulaze redom

#### SN 2.3 — Check-In & Urge Flow
**Tip:** Multi-step form — mnogo ekrana
**Screenshot-ovi (Simulator):**
- [ ] **Morning Pledge — Mood selection:** 5 emoji dugmadi horizontalno
  - 😢 😟 😐 😊 😄 — "😊 Good" selektovano sa highlight efektom (matchedGeometryEffect)
- [ ] **Morning Pledge — Reason picker:** FlowLayout chip-ovi:
  - "Fresh start" ✓, "Family motivation", "Financial goals", "Health", "Self-respect"
- [ ] **Morning Pledge — Submit:** "I pledge to stay bet-free today" tekst + "Submit Pledge" dugme
- [ ] **Evening Check-in — Gambling free toggle:** Toggle "Were you gambling-free today?" (ON, zeleno)
- [ ] **Evening Check-in — Triggers:** FlowLayout chip-ovi:
  - "Live Sports", "Betting Promo", "Stressed" ✓, "Bored" ✓, "Payday"
- [ ] **Urge Flow — Acknowledgement:** "It's okay to feel this urge. Let's work through it together."
- [ ] **Urge Flow — Breathing timer:** 15:00 minuta countdown sa animiranim breathing circle-om
  - Pulsing krug koji se širi/skuplja
- [ ] **Urge Flow — Distraction toolkit:** 4 kartice:
  - 🫁 Breathing Exercise, 🌍 Grounding (5-4-3-2-1), 🏃 Movement, ☎️ Emergency Contact
- [ ] **Urge Flow — Completion:** "You did it! 💪 Urge resisted." celebration ekran

#### SN 2.4 — Navigation Architecture
**Tip:** Navigacija — arhitektura + UI
**SVG dijagram:** ❌ TREBA KREIRATI → `sn-navigation-architecture.svg`
- Flow: RootView → (Onboarding | BiometricLock | MainTabView)
- MainTabView: Dashboard / Journal / Progress / Settings — svaki sa NavigationStack
**Screenshot-ovi (Simulator):**
- [ ] **MainTabView:** Custom tab bar na dnu sa 4 ikone:
  - 🏠 Dashboard (selektovan, ljubičast highlight sa matchedGeometryEffect)
  - 📓 Journal
  - 📊 Progress
  - ⚙️ Settings
- [ ] **Tab switch animacija:** Mid-transition screenshot sa sliding highlight indikatorom
- [ ] **Onboarding first screen:** Welcome ekran sa BetAway logom

---

### Modul 3: Data Layer & Persistence

#### SN 3.1 — Data Access Architecture
**Tip:** Arhitektura — nema app UI
**SVG dijagram:** ❌ TREBA KREIRATI → `sn-data-access-flow.svg`
- Tri kolone: Views (@Query reads) | ViewModels (ModelContext writes) | Managers (System services)
- Strelice: View ←@Query← SwiftData Store ←modelContext← ViewModel
**Screenshot-ovi:**
- [ ] **Xcode editor:** View sa @Query property wrapper-om:
  ```swift
  @Query(sort: \DailyCheckin.date, order: .reverse)
  private var checkins: [DailyCheckin]
  ```
- [ ] **Xcode editor:** ViewModel sa modelContext write:
  ```swift
  func submitPledge(mood: MoodRating, reason: String,
                    context: ModelContext) {
      let checkin = DailyCheckin(...)
      context.insert(checkin)
  }
  ```

#### SN 3.2 — Search, Filter & Sort
**Tip:** Data + UI — Journal i Progress ekrani
**Screenshot-ovi (Simulator):**
- [ ] **JournalView — Lista:** Sortirane journal entries:
  - "Feeling hopeful today" — 😊 Good, Feb 24, tag: "Gratitude"
  - "Tough day at work" — 😟 Bad, Feb 23, tag: "Reflection"
  - "Family dinner was great" — 😄 Very Good, Feb 22, tag: "Social"
  - "Urge hit hard this morning" — 😢 Very Bad, Feb 21, tag: "Urge"
- [ ] **JournalView — Search:** Search bar sa "family" i filtrirani rezultati
- [ ] **Journal Entry Form:** Nova entry:
  - Mood: 😊 selected
  - Prompt: "What are you grateful for today?"
  - Content: "My family was supportive when I told them about my recovery journey..."
- [ ] **ProgressAnalyticsView — Mood chart:** LineMark + AreaMark chart
  - X: datumi (7 dana)
  - Y: mood (1-5 sa emoji labelama)
  - Trend linija: blago raste od 2.5 → 3.8
  - Time range picker: [7D] 30D 90D
- [ ] **ProgressAnalyticsView — Urge chart:** BarMark chart
  - Zelene trake za "clean" dane, crvene za dane sa urge-ovima
  - Dummy: 5 zelenih, 2 crvena u poslednjih 7 dana
- [ ] **ProgressAnalyticsView — Top triggers:** Ranked lista:
  1. 🏅 Live Sports (8 urges)
  2. 💰 Payday (5 urges)
  3. 😰 Stressed (4 urges)

#### SN 3.3 — Data Migration Strategy
**Tip:** Arhitektura — nema app UI
**SVG dijagram:** ❌ TREBA KREIRATI → `sn-migration-strategy.svg`
- Flow: V1 Schema → Lightweight Migration → V2 Schema (novi property sa default) → Custom Migration → V3
**Screenshot-ovi:**
- [ ] **Xcode editor — VersionedSchema:**
  ```swift
  enum BetAwaySchemaV1: VersionedSchema {
      static var versionIdentifier = Schema.Version(1, 0, 0)
      static var models: [any PersistentModel.Type] {
          [UserProfile.self, DailyCheckin.self,
           UrgeLog.self, JournalEntry.self]
      }
  }
  ```
- [ ] **Xcode editor — MigrationPlan:**
  ```swift
  enum BetAwayMigrationPlan: SchemaMigrationPlan {
      static var schemas: [any VersionedSchema.Type] {
          [BetAwaySchemaV1.self, BetAwaySchemaV2.self]
      }
      static var stages: [MigrationStage] {
          [migrateV1toV2]
      }
  }
  ```

---

### Modul 4: AI Integration

#### SN 4.1 — OpenAI API Integration
**Tip:** Networking architecture — reference implementation
**SVG dijagram:** ❌ TREBA KREIRATI → `sn-api-architecture.svg`
- Dual path: Cloud API (OpenAI → Keychain → URLSession) vs. BetAway's Actual Approach (MoodRating picker → SwiftData)
**Screenshot-ovi:**
- [ ] **Xcode editor — OpenAIService.swift:** async/await networking code
- [ ] **Xcode editor — Keychain storage:** SecItemAdd/SecItemCopyMatching pattern
- [ ] **Simulator — MoodRating picker:** BetAway-ov stvarni UI — 5 emoji dugmadi za mood
  - Prikaz: "How are you feeling?" sa 😢 😟 😐 😊 😄

#### SN 4.2 — On-Device ML Alternative
**Tip:** ML architecture — reference + real approach
**SVG dijagram:** ❌ TREBA KREIRATI → `sn-ml-comparison.svg`
- 3 kolone: Cloud AI (OpenAI) vs On-Device ML (NLTagger) vs Manual (MoodRating) — pros/cons za svaki
**Screenshot-ovi:**
- [ ] **Xcode editor — SentimentAnalyzer:** NLTagger setup code
  ```swift
  let tagger = NLTagger(tagSchemes: [.sentimentScore])
  tagger.string = text
  let score = tagger.tag(at: text.startIndex,
                         unit: .paragraph,
                         scheme: .sentimentScore)
  ```
- [ ] **Xcode Playground:** NLTagger test sa raznim tekstovima:
  - "I feel great today!" → Score: 0.85 (Positive)
  - "Terrible day, lost control" → Score: -0.72 (Negative)
  - "Had lunch, went for a walk" → Score: 0.12 (Neutral)

#### SN 4.3 — AI Insights Engine
**Tip:** Intelligence layer — data pipeline + UI
**SVG dijagram:** ❌ TREBA KREIRATI → `sn-insights-pipeline.svg`
- Pipeline: DailyCheckin + UrgeLog + JournalEntry → InsightsEngine → Pattern Detection → RecoveryInsight → InsightsView
**Screenshot-ovi (Simulator):**
- [ ] **InsightsView — Trend card:** "Your mood has improved 15% this week" sa up arrow ikonom
- [ ] **InsightsView — Pattern card:** "You tend to log more urges on Fridays, especially when triggered by live sports"
- [ ] **InsightsView — Journal prompt:** "Write about a moment this week when you felt proud of your progress"
- [ ] **InsightsView — Weekly summary:** Kartica sa:
  - Mood avg: 3.8/5.0 (↑ 0.3)
  - Urges resisted: 4/5 (80%)
  - Journal entries: 5
  - Streak: 47 days

---

### Modul 5: System Frameworks

#### SN 5.1 — Charts Framework
**Tip:** Data vizualizacija — UI heavy
**Screenshot-ovi (Simulator):**
- [ ] **Time range picker:** Segmented control: [7D] 30D 90D
- [ ] **Mood trend chart:** LineMark + AreaMark sa catmullRom interpolacijom
  - 7 tačaka, emoji Y-osa (😢→😄), ljubičasta linija sa gradient area ispod
  - Dummy: [3, 2, 4, 3, 4, 5, 4] za poslednjih 7 dana
- [ ] **Urge frequency chart:** BarMark
  - Zelene trake (clean days), crvene (urge days)
  - Dummy: Mon✅, Tue✅, Wed❌, Thu✅, Fri❌, Sat✅, Sun✅
- [ ] **Stat cards:** 4 mini kartice u gridu:
  - "47 days" (Current Streak)
  - "€1,645" (Total Saved)
  - "89%" (Urges Resisted)
  - "3.8" (Avg Mood)
- [ ] **BFProgressRing:** 73% popunjen kružni progress sa animacijom

#### SN 5.2 — WidgetKit — Home Screen Widget
**Tip:** Widget UI — iOS home screen
**Screenshot-ovi:**
- [ ] **Small widget:** Na home screen-u
  - "47 Days" bold tekst
  - "Bet-Free" subtitle
  - ✅ Pledged today indikator
  - Ljubičasti gradient pozadina
- [ ] **Medium widget:** Na home screen-u
  - Levo: "47 Days Bet-Free"
  - Sredina: "€1,645 Saved"
  - Desno: 7 tačkica za dane u nedelji (zelena = check-in, siva = no check-in)
- [ ] **Widget gallery:** Xcode widget preview sa obe veličine
- [ ] **Xcode — App Group config:** Target settings sa `group.com.pekmario.betfreeapp`

#### SN 5.3 — Notifications & App Intents
**Tip:** System integration — Settings UI
**Screenshot-ovi (Simulator):**
- [ ] **Settings — Notifications sekcija:**
  - Toggle: "Morning Pledge Reminder" (ON)
  - Time picker: 8:00 AM
  - Toggle: "Evening Check-in Reminder" (ON)
  - Time picker: 9:00 PM
- [ ] **Notification permission alert:** "BetAway Would Like to Send You Notifications" — Allow / Don't Allow
- [ ] **Lock screen notification:** Preview notifikacije:
  - "BetAway — Start your day with a pledge to stay bet-free ☀️"
  - Vreme: 8:00 AM
- [ ] **Evening notification:** "How was your day? Take a moment to reflect 🌙"

---

### Modul 6: Quality & Testing

#### SN 6.1 — Unit Testing with AI
**Tip:** Testing — nema app UI
**SVG dijagram:** ❌ TREBA KREIRATI → `sn-test-strategy.svg`
- Šta testirati: UserProfile computed props + DashboardViewModel + UrgeViewModel + PledgeViewModel
**Screenshot-ovi:**
- [ ] **Xcode Test Navigator:** Test suite sa zelenim rezultatima:
  - UserProfileTests (8 ✅)
  - DashboardViewModelTests (6 ✅)
  - UrgeViewModelTests (10 ✅)
  - PledgeViewModelTests (5 ✅)
- [ ] **Xcode editor — UserProfile test:**
  ```swift
  @Test func currentStreak_calculatesCorrectly() {
      let profile = UserProfile.sample(quitDate: .now.addingTimeInterval(-47 * 86400))
      #expect(profile.currentStreak == 47)
  }
  ```
- [ ] **Xcode editor — UrgeViewModel test:**
  ```swift
  @Test func timerProgress_at50Percent() async {
      let sut = makeSUT()
      sut.remainingSeconds = 450 // 7.5 min of 15
      #expect(sut.timerProgress == 0.5)
  }
  ```

#### SN 6.2 — UI Testing with XCUITest
**Tip:** UI testing — automated screenshots
**Screenshot-ovi:**
- [ ] **Xcode — UI test running:** Simulator sa automatizovanim tapovima vidljiv
- [ ] **Xcode editor — Page object:**
  ```swift
  struct DashboardPage {
      let app: XCUIApplication
      var streakLabel: XCUIElement {
          app.staticTexts["streakCount"]
      }
      var pledgeButton: XCUIElement {
          app.buttons["takePledge"]
      }
  }
  ```
- [ ] **Xcode — Test report:** Svi UI testovi zeleni sa screenshot attachment-ima

#### SN 6.3 — Debugging Workflow with AI
**Tip:** Debugging — nema app UI
**SVG dijagram:** ❌ TREBA KREIRATI → `sn-debugging-scenarios.svg`
- 4 scenarija: ModelContainer Recovery → Task Lifecycle → HapticManager State → SharedDataManager Flow
**Screenshot-ovi:**
- [ ] **Xcode — LLDB console:** `po viewModel.timerProgress` sa output-om `0.73`
- [ ] **Xcode — Breakpoint:** Watchpoint na `UrgeViewModel.remainingSeconds` property
- [ ] **Instruments — Activity Monitor:** BetAway memory usage graf

---

### Modul 7: Production Polish

#### SN 7.1 — Error Handling & Edge Cases
**Tip:** Error recovery — code + UI
**SVG dijagram:** ❌ TREBA KREIRATI → `sn-error-recovery-flow.svg`
- Flow: App Launch → ModelContainer Init → Success / Failure → Delete & Recreate → Retry
**Screenshot-ovi (Simulator):**
- [ ] **ErrorView component:** Full-screen error prikaz:
  - Ikona: ⚠️ exclamation triangle
  - Title: "Something went wrong"
  - Message: "We couldn't load your data. Please try again."
  - Dugme: "Try Again"
- [ ] **EmptyStateView component:** "No check-ins yet" sa ilustracijom i "Start Your First Pledge" CTA
- [ ] **Settings — Reset confirmation:** Alert:
  - "Reset All Data?"
  - "This will permanently delete all your recovery data. This action cannot be undone."
  - "Delete Everything" (crveno) / "Cancel"

#### SN 7.2 — Accessibility & Localization
**Tip:** Multi-language — Settings UI
**Screenshot-ovi (Simulator):**
- [ ] **Language picker:** LanguagePickerView u Settings-u:
  - 🇬🇧 English ✓
  - 🇩🇪 Deutsch
  - 🇫🇷 Français
  - 🇪🇸 Español
  - 🇮🇹 Italiano
  - 🇵🇹 Português
  - 🇧🇷 Português (Brasil)
  - 🇷🇺 Русский
  - 🇯🇵 日本語
  - 🇰🇷 한국어
  - 🇸🇦 العربية
  - 🇭🇷 Hrvatski
- [ ] **Dashboard u nemačkom:** Isti dashboard sa prevedenim stringovima:
  - "Guten Morgen, Mario 👋"
  - "47 Tage wettfrei"
  - "€1.645 gespart"
- [ ] **Dashboard u japanskom:** Japanski prevod:
  - "おはようございます、Mario 👋"
  - "47日間ギャンブルフリー"
- [ ] **Medical disclaimer — EN:** "BetAway is not a substitute for professional medical advice..."
- [ ] **Medical disclaimer — DE:** "BetAway ist kein Ersatz für professionelle medizinische Beratung..."
- [ ] **Xcode — String Catalog:** Editor sa `Localizable.xcstrings` otvorenim, vidljive kolone za jezike

#### SN 7.3 — Performance Optimization
**Tip:** Performance — code patterns
**SVG dijagram:** ❌ TREBA KREIRATI → `sn-staggered-animation.svg`
- Timeline: Card 1 (0ms) → Card 2 (50ms) → Card 3 (100ms) → Card 4 (150ms) stagger efekat
**Screenshot-ovi:**
- [ ] **Dashboard — Staggered load:** Screenshot mid-animation gde prve 3 kartice su vidljive, ostale fade-uju
- [ ] **Xcode editor — AnimationPresets:**
  ```swift
  enum AnimationPresets {
      static let springSmooth = Animation.spring(duration: 0.4, bounce: 0.15)
      static let staggerInterval: Double = 0.05
  }
  ```
- [ ] **Instruments:** SwiftUI body evaluation count za DashboardView

---

### Modul 8: Ship It

#### SN 8.1 — App Store Preparation
**Tip:** App Store — metadata
**Screenshot-ovi:**
- [ ] **App Store Connect:** BetAway listing sa:
  - Name: "BetAway — Gambling Recovery"
  - Subtitle: "Track your bet-free journey"
  - Category: Health & Fitness
  - Price: Free
- [ ] **App icon:** BetAway ikona u svim veličinama (1024x1024, 180x180, 120x120)
- [ ] **Screenshot set:** 3 marketing screenshot-a sa iPhone 15 Pro Max frejmom:
  1. Dashboard sa streak-om
  2. Progress charts
  3. Check-in flow
- [ ] **Privacy Policy page:** Web stranica sa BetAway privacy policy
- [ ] **Terminal — AI keywords:**
  ```
  claude "Generate 100 characters of App Store keywords for
  BetAway, a free gambling recovery app. Focus on:
  gambling, addiction, recovery, betting, mental health"
  ```

#### SN 8.2 — CI/CD & Release
**Tip:** DevOps — nema app UI
**SVG dijagram:** ❌ TREBA KREIRATI → `sn-cicd-pipeline.svg`
- Pipeline: git push → GitHub Actions → Build → Test → Archive → Upload → TestFlight → App Store
**Screenshot-ovi:**
- [ ] **GitHub Actions:** Workflow run sa zelenim koracima:
  - ✅ Checkout
  - ✅ Setup Xcode 16
  - ✅ Build
  - ✅ Run Tests (29 passed)
  - ✅ Archive
  - ✅ Upload to TestFlight
- [ ] **Xcode editor — .github/workflows/ci.yml:** YAML fajl sa build/test steps
- [ ] **TestFlight:** Build #1 (1.0.0) dostupan beta testerima

---

### Modul 9: Bonus — Advanced Topics

#### SN 9.1 — CloudKit Sync
**Tip:** Sync arhitektura — nema app UI
**SVG dijagram:** ❌ TREBA KREIRATI → `sn-cloudkit-sync.svg`
- Flow: iPhone SwiftData ↔ CloudKit Container ↔ iPad SwiftData
- Conflict resolution: Last-Write-Wins ili Custom Merge
**Screenshot-ovi:**
- [ ] **Xcode — iCloud capability:** Signing & Capabilities sa iCloud checkbox-om i container-om
- [ ] **Xcode — ModelConfiguration:**
  ```swift
  let config = ModelConfiguration(
      cloudKitDatabase: .automatic
  )
  ```
- [ ] **Two simulators:** Side-by-side iPhone i iPad sa istim podacima sinhronizovanim

#### SN 9.2 — Share Extension & Beyond
**Tip:** Extension — system integration
**Screenshot-ovi (Simulator):**
- [ ] **Share sheet:** Safari share sheet sa "BetAway" opcijom vidljivom
- [ ] **Share Extension UI:** Quick check-in forma unutar share sheet-a:
  - Mood picker: 😊 selected
  - Note: "Reading this article reminded me of my progress"
  - "Log Check-in" dugme
- [ ] **Xcode — Extension target:** Project navigator sa BetAwayShareExtension targetom
- [ ] **Xcode — App Group:** Isti `group.com.pekmario.betfreeapp` na oba targeta

---

## Sumarni pregled: SVG dijagrami koji trebaju

| # | Fajl | Lekcija | Status |
|---|------|---------|--------|
| 1 | `vibe-coding-spectrum.svg` | 1.1 What is Vibe Coding | ✅ Postoji |
| 2 | `recommended-stack.svg` | 1.2 AI Tools | ✅ Postoji |
| 3 | `prompt-framework.svg` | 2.1 Good Prompt | ✅ Postoji |
| 4 | `refinement-ladder.svg` | 2.3 Iterative Prompting | ✅ Postoji |
| 5 | `setup-workflow.svg` | 1.3 Setup | ✅ Postoji |
| 6 | `claude-md-structure.svg` | 2.2 CLAUDE.md Playbook | ❌ Treba |
| 7 | `anti-patterns-grid.svg` | 2.4 Anti-Patterns | ❌ Treba |
| 8 | `todo-app-architecture.svg` | 3.1 Planning with AI | ❌ Treba |
| 9 | `todo-data-model.svg` | 3.2 Data Layer | ❌ Treba |
| 10 | `networking-architecture.svg` | 4.1 Networking | ❌ Treba |
| 11 | `loading-states-flow.svg` | 4.2 Loading States | ❌ Treba |
| 12 | `navigation-flow.svg` | 4.3 Navigation | ❌ Treba |
| 13 | `testing-pyramid.svg` | 5.1 Unit Testing | ❌ Treba |
| 14 | `debugging-workflow.svg` | 5.2 Debugging | ❌ Treba |
| 15 | `code-review-checklist.svg` | 5.3 Code Review | ❌ Treba |
| 16 | `performance-checklist.svg` | 6.1 Performance | ❌ Treba |
| 17 | `app-store-flow.svg` | 6.3 App Store | ❌ Treba |
| 18 | `sn-mvvm-architecture.svg` | SN 1.1 Architecture | ❌ Treba |
| 19 | `sn-data-model-er.svg` | SN 1.2 SwiftData | ❌ Treba |
| 20 | `sn-claude-md-sections.svg` | SN 1.3 CLAUDE.md | ❌ Treba |
| 21 | `sn-navigation-architecture.svg` | SN 2.4 Navigation | ❌ Treba |
| 22 | `sn-data-access-flow.svg` | SN 3.1 Data Access | ❌ Treba |
| 23 | `sn-migration-strategy.svg` | SN 3.3 Migration | ❌ Treba |
| 24 | `sn-api-architecture.svg` | SN 4.1 OpenAI API | ❌ Treba |
| 25 | `sn-ml-comparison.svg` | SN 4.2 On-Device ML | ❌ Treba |
| 26 | `sn-insights-pipeline.svg` | SN 4.3 Insights Engine | ❌ Treba |
| 27 | `sn-test-strategy.svg` | SN 6.1 Unit Testing | ❌ Treba |
| 28 | `sn-debugging-scenarios.svg` | SN 6.3 Debugging | ❌ Treba |
| 29 | `sn-error-recovery-flow.svg` | SN 7.1 Error Handling | ❌ Treba |
| 30 | `sn-staggered-animation.svg` | SN 7.3 Performance | ❌ Treba |
| 31 | `sn-cicd-pipeline.svg` | SN 8.2 CI/CD | ❌ Treba |
| 32 | `sn-cloudkit-sync.svg` | SN 9.1 CloudKit | ❌ Treba |

**Ukupno: 5 postoji + 27 treba kreirati = 32 SVG dijagrama**
