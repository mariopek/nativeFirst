import SwiftUI
import SwiftData

struct ContentView: View {
    @Environment(SubscriptionStore.self) private var subscriptionStore

    var body: some View {
        TabView {
            Tab("Home", systemImage: "cup.and.saucer.fill") {
                HomeTab()
            }
            Tab("Settings", systemImage: "gearshape.fill") {
                SettingsTab()
            }
        }
        .task {
            await subscriptionStore.updatePurchasedProducts()
        }
        .accessibilityIdentifier("BrewLogTabs")
    }
}

private struct HomeTab: View {
    @Environment(UserPreferences.self) private var prefs
    @Environment(SubscriptionStore.self) private var subscriptionStore
    @Environment(\.colorScheme) private var colorScheme
    @Environment(\.modelContext) private var ctx

    @Query(sort: \Brew.date, order: .reverse) private var allBrews: [Brew]

    @State private var isComposing = false
    @State private var showPaywall = false
    @State private var brewToDelete: Brew?
    @State private var brewingMethod: BrewMethod?
    @State private var quickExpanded = ProcessInfo.processInfo.arguments.contains("EXPANDED_DEMO")

    private var demoStreak: Int {
        ProcessInfo.processInfo.arguments.contains("SEED_DEMO") ? 9 : 0
    }

    private var canLogNewBrew: Bool {
        SubscriptionPolicy.canLogNewBrew(
            currentCount: allBrews.count,
            entitlement: subscriptionStore.entitlement
        )
    }

    private var weekCount: Int {
        let weekAgo = Calendar.current.date(byAdding: .day, value: -7, to: .now) ?? .now
        return allBrews.filter { $0.date >= weekAgo }.count
    }

    private var streak: Int {
        currentStreak(brewDates: allBrews.map(\.date))
    }

    private var weeklyProgress: Double {
        guard prefs.weeklyGoal > 0 else { return 0 }
        return min(1.0, Double(weekCount) / Double(prefs.weeklyGoal))
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 28) {
                    HeroCard(summary: prefs.summary)
                    if streakGlass(streak: demoStreak) != .hidden {
                        StreakBadge(streak: demoStreak)
                    }
                    StatsRow(weekCount: weekCount, total: allBrews.count, streak: streak)
                    WeeklyGoalProgress(weekCount: weekCount, goal: prefs.weeklyGoal, progress: weeklyProgress)
                    RecentBrewsSection(brews: allBrews, brewToDelete: $brewToDelete)
                    TipOfTheDay()
                }
                .padding()
            }
            .background(homeBackground)
            .overlay(alignment: .bottomTrailing) {
                QuickBrewMenu(
                    methods: quickAddMethods(showMilkBased: prefs.showMilkBased),
                    isExpanded: $quickExpanded
                ) { method in
                    guard canLogNewBrew else {
                        quickExpanded = false
                        showPaywall = true
                        return
                    }
                    // Espresso, Moka, and cold brew are done before you'd unlock
                    // the phone to check — those still log instantly. Filter and
                    // Aeropress run for minutes; logging them as "finished" the
                    // moment you tap is the same lie Day 21 found in the streak
                    // stat, so those start a real countdown instead.
                    if recommendedBrewDuration(for: method) != nil {
                        brewingMethod = method
                    } else {
                        let brew = Brew(method: method, rating: prefs.defaultStrength > 5 ? 5 : 4)
                        ctx.insert(brew)
                        try? ctx.save()
                    }
                }
                .padding(.trailing, 20)
                .padding(.bottom, 28)
            }
            .navigationTitle("Brew Log")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        if canLogNewBrew {
                            isComposing = true
                        } else {
                            showPaywall = true
                        }
                    } label: {
                        Label("New brew", systemImage: "plus")
                    }
                    .accessibilityIdentifier("NewBrewToolbarButton")
                }
            }
            .navigationDestination(for: Brew.self) { brew in
                BrewDetailView(brew: brew)
            }
            .sheet(isPresented: $isComposing) {
                NewBrewSheet()
                    .presentationDetents([.medium, .large])
                    .presentationDragIndicator(.visible)
            }
            .sheet(isPresented: $showPaywall) {
                PaywallView()
            }
            .sheet(item: $brewingMethod) { method in
                BrewTimerView(method: method) { rating in
                    let brew = Brew(method: method, rating: rating)
                    ctx.insert(brew)
                    try? ctx.save()
                }
                .interactiveDismissDisabled()
            }
            .confirmationDialog(
                "Delete this brew?",
                isPresented: Binding(
                    get: { brewToDelete != nil },
                    set: { if !$0 { brewToDelete = nil } }
                ),
                presenting: brewToDelete
            ) { brew in
                Button("Delete \(brew.method.label) brew", role: .destructive) {
                    ctx.delete(brew)
                    try? ctx.save()
                    brewToDelete = nil
                }
                Button("Cancel", role: .cancel) {
                    brewToDelete = nil
                }
            } message: { _ in
                Text("This brew will be removed from your history. This cannot be undone.")
            }
            .accessibilityIdentifier("BrewLogHome")
        }
    }

    private var homeBackground: some View {
        LinearGradient(
            colors: [Color.accentColor.opacity(colorScheme == .dark ? 0.18 : 0.10), .clear],
            startPoint: .top,
            endPoint: .center
        )
        .ignoresSafeArea()
    }
}

private struct SettingsTab: View {
    @Environment(UserPreferences.self) private var prefs
    @Environment(\.modelContext) private var ctx
    @Query private var allBrews: [Brew]

    @State private var showResetAlert = false
    @State private var showPaywall = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    ProCard(showPaywall: $showPaywall)
                    PreferencesCard(showResetAlert: $showResetAlert)
                    AboutCard()
                }
                .padding()
            }
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Menu {
                        Button("Reset all", systemImage: "arrow.counterclockwise", role: .destructive) {
                            showResetAlert = true
                        }
                    } label: {
                        Image(systemName: "ellipsis.circle")
                    }
                    .accessibilityIdentifier("SettingsMenu")
                }
            }
            .sheet(isPresented: $showPaywall) {
                PaywallView()
            }
            .alert("Reset everything?", isPresented: $showResetAlert) {
                Button("Reset", role: .destructive) {
                    prefs.reset()
                    for brew in allBrews { ctx.delete(brew) }
                    try? ctx.save()
                }
                Button("Cancel", role: .cancel) { }
            } message: {
                Text("Clears all preferences and \(allBrews.count) brew\(allBrews.count == 1 ? "" : "s") from history.")
            }
            .accessibilityIdentifier("BrewLogSettings")
        }
    }
}

private struct ProCard: View {
    @Environment(SubscriptionStore.self) private var subscriptionStore
    @Environment(\.modelContext) private var ctx
    @Query private var allBrews: [Brew]

    @Binding var showPaywall: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Label("BrewLog Pro", systemImage: "star.fill")
                    .font(.headline)
                Spacer()
                Text(subscriptionStore.entitlement == .pro ? "Active" : "Free")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(subscriptionStore.entitlement == .pro ? .green : .secondary)
            }

            switch subscriptionStore.entitlement {
            case .pro:
                Text("Unlimited brew history is unlocked. Thanks for supporting BrewLog.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            case .free:
                Text("Free tier keeps your last \(SubscriptionPolicy.freeBrewLimit) brews (\(allBrews.count) logged). Go Pro for unlimited history.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)

                Button("View plans") {
                    showPaywall = true
                }
                .buttonStyle(.borderedProminent)
                .controlSize(.small)
                .accessibilityIdentifier("ViewPlansButton")
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(20)
        .background(.thinMaterial, in: .rect(cornerRadius: 16))
    }
}

private struct AboutCard: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("Methods")
                .font(.headline)

            LazyVGrid(
                columns: [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())],
                spacing: 12
            ) {
                ForEach(BrewMethod.allCases) { method in
                    VStack(spacing: 6) {
                        Image(systemName: method.iconName)
                            .font(.title3)
                            .foregroundStyle(.tint)
                            .frame(height: 28)
                        Text(method.label)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(.thinMaterial, in: .rect(cornerRadius: 12))
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(20)
        .background(.thinMaterial, in: .rect(cornerRadius: 16))
    }
}

private struct HeroCard: View {
    let summary: String

    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "cup.and.saucer.fill")
                .font(.system(size: 56))
                .foregroundStyle(.tint)
                .padding(24)
                .background(.tint.opacity(0.15), in: .circle)

            VStack(spacing: 4) {
                Text("Brew Log")
                    .font(.largeTitle)
                    .fontWeight(.bold)

                Text(summary)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
        }
    }
}

private struct StatsRow: View {
    let weekCount: Int
    let total: Int
    let streak: Int

    var body: some View {
        HStack(spacing: 12) {
            StatCard(label: "This week", value: "\(weekCount)", icon: "calendar")
            StatCard(label: "All time", value: "\(total)", icon: "chart.bar.fill")
            StatCard(label: "Streak", value: "\(streak)", icon: "flame.fill")
        }
    }
}

private struct StatCard: View {
    let label: String
    let value: String
    let icon: String

    var body: some View {
        VStack(spacing: 6) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundStyle(.tint)
            Text(value)
                .font(.title2)
                .fontWeight(.semibold)
            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 16)
        .background(.thinMaterial, in: .rect(cornerRadius: 12))
        .shadow(color: .black.opacity(0.06), radius: 8, x: 0, y: 4)
    }
}

private struct WeeklyGoalProgress: View {
    let weekCount: Int
    let goal: Int
    let progress: Double

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text("Weekly goal")
                    .font(.subheadline.weight(.semibold))
                Spacer()
                Text("\(weekCount) / \(goal)")
                    .font(.subheadline.monospaced())
                    .foregroundStyle(.secondary)
            }
            ProgressView(value: progress)
                .tint(.accentColor)
                .accessibilityIdentifier("WeeklyProgress")
        }
        .padding(.horizontal, 4)
    }
}

private struct NewBrewSheet: View {
    @Environment(UserPreferences.self) private var prefs
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var ctx

    @State private var method: BrewMethod = .espresso
    @State private var rating: Int = 4
    @State private var notes: String = ""
    @FocusState private var notesFocused: Bool

    var body: some View {
        NavigationStack {
            Form {
                Section("Method") {
                    Picker("Method", selection: $method) {
                        ForEach(BrewMethod.allCases) { Text($0.label).tag($0) }
                    }
                    .accessibilityIdentifier("SheetMethodPicker")
                }
                Section("Rating") {
                    Stepper("\(rating) / 5 stars", value: $rating, in: 1...5)
                        .accessibilityIdentifier("SheetRatingStepper")
                }
                Section("Notes") {
                    TextField("Optional notes", text: $notes, axis: .vertical)
                        .lineLimit(3...6)
                        .focused($notesFocused)
                        .accessibilityIdentifier("SheetNotesField")
                }
            }
            .navigationTitle("New brew")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        let brew = Brew(method: method, rating: rating, notes: notes)
                        ctx.insert(brew)
                        try? ctx.save()
                        dismiss()
                    }
                    .accessibilityIdentifier("SheetSaveButton")
                }
            }
            .onAppear { method = prefs.defaultMethod }
        }
    }
}

private struct RecentBrewsSection: View {
    let brews: [Brew]
    @Binding var brewToDelete: Brew?

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Recent brews")
                    .font(.headline)
                Spacer()
                if !brews.isEmpty {
                    Text("\(brews.count)")
                        .font(.subheadline.monospaced())
                        .foregroundStyle(.secondary)
                }
            }

            if brews.isEmpty {
                ContentUnavailableView(
                    "No brews yet",
                    systemImage: "cup.and.saucer",
                    description: Text("Tap **+** in the top right to record your first one.")
                )
                .frame(maxWidth: .infinity)
                .padding(.vertical, 24)
                .background(.thinMaterial, in: .rect(cornerRadius: 16))
            } else {
                VStack(spacing: 10) {
                    ForEach(brews.prefix(8)) { brew in
                        NavigationLink(value: brew) {
                            BrewRow(brew: brew)
                        }
                        .buttonStyle(.plain)
                        .contextMenu {
                            Button("Delete", systemImage: "trash", role: .destructive) {
                                brewToDelete = brew
                            }
                        }
                    }
                }
            }
        }
        .accessibilityIdentifier("RecentBrewsSection")
    }
}

private struct BrewRow: View {
    let brew: Brew

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: brew.method.iconName)
                .font(.title3)
                .foregroundStyle(.tint)
                .frame(width: 36, height: 36)
                .background(.tint.opacity(0.12), in: .circle)
                .accessibilityHidden(true)

            VStack(alignment: .leading, spacing: 2) {
                Text(brew.method.label)
                    .font(.subheadline.weight(.semibold))
                Text(brew.date, format: .relative(presentation: .named))
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            HStack(spacing: 2) {
                ForEach(0..<5) { i in
                    Image(systemName: i < brew.rating ? "star.fill" : "star")
                        .font(.caption2)
                        .foregroundStyle(i < brew.rating ? .yellow : .secondary)
                }
            }
            .accessibilityHidden(true)

            Image(systemName: "chevron.right")
                .font(.caption.weight(.semibold))
                .foregroundStyle(.tertiary)
                .accessibilityHidden(true)
        }
        .padding(.vertical, 8)
        .padding(.horizontal, 12)
        .background(.thinMaterial, in: .rect(cornerRadius: 12))
        .contentShape(.rect)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(brew.method.label) brew, rated \(brew.rating) out of 5 stars")
        .accessibilityHint("Opens brew details")
    }
}

private struct TokenRefreshDTO: Decodable {
    let token: String
}

private struct TipOfTheDay: View {
    @Environment(UserPreferences.self) private var prefs
    @State private var tipModel = TipOfTheDayModel(service: RemoteBrewTipsService(client: Self.makeClient()))

    private static func makeClient() -> NetworkClient {
        let baseURL = URL(string: "http://127.0.0.1:8080")!
        let transport = URLSessionNetworkClient(baseURL: baseURL)

        // Starts deliberately stale. The first real request always 401s,
        // which is exactly the path this client needs to prove it can recover
        // from without the view ever finding out.
        let authTokenStore = AuthTokenStore(initialToken: "expired-token") {
            let dto = try await transport.send(
                Endpoint(path: "auth/refresh", method: "POST"),
                as: TokenRefreshDTO.self
            )
            return dto.token
        }

        return ResilientNetworkClient(
            wrapped: transport,
            authTokenStore: authTokenStore,
            deduplicator: RequestDeduplicator()
        )
    }

    private var tipText: String {
        switch tipModel.state {
        case .loaded(let tip): tip
        default: TipOfTheDayModel.fallbackTip
        }
    }

    var body: some View {
        @Bindable var prefs = prefs

        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Label("Tip of the day", systemImage: "lightbulb.fill")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(.white)

                Spacer()

                Button {
                    prefs.favoriteTip.toggle()
                } label: {
                    Image(systemName: prefs.favoriteTip ? "heart.fill" : "heart")
                        .foregroundStyle(prefs.favoriteTip ? .pink : .white.opacity(0.7))
                }
                .accessibilityIdentifier("FavoriteTipButton")
            }

            Text(tipText)
                .font(.body)
                .foregroundStyle(.white)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(20)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(
                    LinearGradient(
                        colors: [Color.brown, Color.brown.mix(with: .black, by: 0.4)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
        )
        .shadow(color: .black.opacity(0.15), radius: 12, x: 0, y: 6)
        .task {
            await tipModel.load()
        }
    }
}

private struct PreferencesCard: View {
    @Environment(UserPreferences.self) private var prefs
    @Binding var showResetAlert: Bool

    var body: some View {
        @Bindable var prefs = prefs

        VStack(alignment: .leading, spacing: 18) {
            HStack {
                Text("Preferences")
                    .font(.headline)
                Spacer()
                Button("Reset", role: .destructive) {
                    showResetAlert = true
                }
                .buttonStyle(.bordered)
                .controlSize(.small)
                .accessibilityIdentifier("ResetPrefsButton")
            }

            Picker("Default method", selection: $prefs.defaultMethod) {
                ForEach(BrewMethod.allCases) { method in
                    Text(method.label).tag(method)
                }
            }
            .pickerStyle(.menu)
            .accessibilityIdentifier("DefaultMethodPicker")

            Toggle("Show milk-based methods", isOn: $prefs.showMilkBased)
                .font(.subheadline)
                .accessibilityIdentifier("ShowMilkToggle")

            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Text("Default strength")
                        .font(.subheadline)
                    Spacer()
                    Text(prefs.strengthLabel)
                        .font(.subheadline.monospaced())
                        .foregroundStyle(.secondary)
                }
                Slider(value: $prefs.defaultStrength, in: 1...10, step: 1)
                    .accessibilityIdentifier("StrengthSlider")
            }

            Stepper("Daily cups: \(prefs.dailyCups)", value: $prefs.dailyCups, in: 1...8)
                .font(.subheadline)
                .accessibilityIdentifier("DailyCupsStepper")

            Stepper("Weekly goal: \(prefs.weeklyGoal) brews",
                    value: $prefs.weeklyGoal, in: 7...35, step: 1)
                .font(.subheadline)
                .accessibilityIdentifier("WeeklyGoalStepper")

            DatePicker(
                "Daily reminder",
                selection: $prefs.dailyReminder,
                displayedComponents: .hourAndMinute
            )
            .font(.subheadline)
            .accessibilityIdentifier("DailyReminderPicker")
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(20)
        .background(.thinMaterial, in: .rect(cornerRadius: 16))
    }
}

#Preview {
    ContentView()
        .environment(UserPreferences())
        .environment(SubscriptionStore())
        .modelContainer(for: Brew.self, inMemory: true)
}
