# Lesson 1.3 — Setup & Your First Prompt

## Meta

| Key | Value |
|-----|-------|
| **Duration** | ~20 minutes |
| **Format** | Screen recording (terminal + Xcode) |
| **Resources needed** | Mac with Xcode 16+, Terminal, Claude Code installed |
| **Prerequisite** | Lessons 1.1, 1.2 |

---

## Outline

- Installing Claude Code (quick walkthrough)
- Creating a fresh Xcode project
- Running Claude Code in your project directory
- Your first CLAUDE.md file (minimal version)
- First prompt: generating a SwiftUI view from a description
- Reviewing what AI generated — what is good, what needs tweaking
- The feedback loop: refining the output

---

## Full Script

### Opening

[SCREEN: Terminal open, Xcode in the background]

Alright, enough theory. Let us get our hands dirty. By the end of this lesson, you will have Claude Code running in a real Xcode project and you will have generated your first SwiftUI view using nothing but a natural language description.

### Installing Claude Code

[SCREEN: Terminal — installation commands]

If you have not installed Claude Code yet, here is the quick version. Open your terminal and run:

```bash
npm install -g @anthropic-ai/claude-code
```

That is it. You need Node.js 18 or later. If you do not have Node, install it via Homebrew:

```bash
brew install node
```

Once installed, verify it works:

```bash
claude --version
```

[SCREEN: Show version output]

You should see the version number. Now, Claude Code requires an Anthropic API key. You can either set it as an environment variable or log in through the interactive setup:

```bash
claude
```

The first time you run it, it will walk you through authentication. Follow the prompts — you will need an Anthropic account with API access.

[SCREEN: Show login flow briefly]

One important note: Claude Code uses API credits. Opus 4.6, our primary model, is the most expensive tier. For this course, you will spend roughly $5-15 total on API calls if you follow along with every exercise. I am being upfront about this because some courses hide the cost. AI is not free, and for production-quality output, you want the best model.

### Creating the Xcode Project

[SCREEN: Xcode — New Project wizard]

Let us create a fresh project. Open Xcode, File → New → Project.

- **Template:** iOS → App
- **Product Name:** VibeCourseDemo
- **Organization Identifier:** Your reverse domain (e.g., com.yourname)
- **Interface:** SwiftUI
- **Storage:** SwiftData
- **Language:** Swift

[SCREEN: Show the project creation flow]

Hit Create. Save it wherever you like — I will put mine on the Desktop for now.

Before we do anything else, let us look at what Xcode gave us:

```
VibeCourseDemo/
├── VibeCourseDemoApp.swift    // App entry point
├── ContentView.swift           // Default view
├── Item.swift                  // SwiftData model (default)
├── Assets.xcassets/            // Asset catalog
└── Preview Content/            // Preview assets
```

[SCREEN: Show the file navigator in Xcode]

Standard boilerplate. The `ContentView.swift` has a basic list with SwiftData items. Let us leave it for now.

### Running Claude Code

[SCREEN: Terminal — navigating to project directory]

Open a terminal window and navigate to your project:

```bash
cd ~/Desktop/VibeCourseDemo
```

Now run Claude Code:

```bash
claude
```

[SCREEN: Claude Code initializing, reading the project]

Watch what happens. Claude Code scans your project directory. It sees the `.xcodeproj` file, the Swift source files, the asset catalogs — everything. This is already fundamentally different from asking ChatGPT a Swift question. Claude Code has context.

You should see something like a prompt where you can type. This is your conversational interface to the AI. Everything you type here is a prompt, and Claude Code will respond with explanations, code, and file modifications.

### Your First CLAUDE.md

[SCREEN: Terminal — creating CLAUDE.md]

Before we write our first real prompt, let us create a minimal CLAUDE.md file. This file tells Claude Code the rules of your project. Think of it as a style guide for your AI collaborator.

Type this in Claude Code:

```
Create a CLAUDE.md file in the project root with these rules:
- This is an iOS app using SwiftUI and SwiftData
- Use MVVM architecture
- Target iOS 17+
- Use modern Swift concurrency (async/await)
- Follow Apple Human Interface Guidelines
- Keep views simple and declarative
- Use @Observable macro instead of ObservableObject
```

[SCREEN: Show Claude Code creating the file]

Claude Code will create a `CLAUDE.md` file in your project root. Let us look at what it generated:

```markdown
# VibeCourseDemo

## Architecture
- MVVM (Model-View-ViewModel)
- SwiftUI for all views
- SwiftData for persistence

## Guidelines
- Target: iOS 17+
- Use modern Swift concurrency (async/await)
- Follow Apple Human Interface Guidelines
- Keep views simple and declarative — no business logic in views
- Use @Observable macro instead of ObservableObject protocol
- Prefer value types (structs) where possible
```

[SCREEN: Show the generated CLAUDE.md in the editor]

Perfect. Every prompt we send from now on will respect these rules. We will go deep on CLAUDE.md in Module 2 — for now, this minimal version is enough.

### The First Real Prompt

[SCREEN: Terminal — Claude Code prompt]

Here is the moment of truth. Let us describe a feature in plain English and see what Claude Code generates.

We are going to ask for a simple but realistic feature: a user profile screen. Type this:

```
Create a ProfileView that shows:
- A circular profile image placeholder (using SF Symbols)
- The user's name in a large, bold title
- An email address below the name
- A "Settings" section with toggles for notifications and dark mode
- A "Sign Out" button at the bottom in red
- Use proper spacing and follow Apple's design patterns
- Create a ProfileViewModel to manage the state
```

[SCREEN: Show Claude Code processing and generating files]

Watch it work. Claude Code is not just generating one code snippet — it is creating multiple files that work together.

Let us review what it generated.

### Reviewing the Output

[SCREEN: Xcode showing the generated files]

Claude Code should have created two files. Let us look at them.

**ProfileViewModel.swift:**

```swift
import SwiftUI

@Observable
class ProfileViewModel {
    var userName: String = "Mario Petkovski"
    var email: String = "mario@nativefirstapp.com"
    var notificationsEnabled: Bool = true
    var darkModeEnabled: Bool = false

    func signOut() {
        // TODO: Implement sign out logic
    }
}
```

[SCREEN: Highlight key aspects of the ViewModel]

Look at what it got right:
- Used `@Observable` macro, not the old `ObservableObject` — exactly what we specified in CLAUDE.md
- Clean separation: no UI code in the ViewModel
- Sensible defaults
- A placeholder for the sign-out logic with a clear TODO

**ProfileView.swift:**

```swift
import SwiftUI

struct ProfileView: View {
    @State private var viewModel = ProfileViewModel()

    var body: some View {
        NavigationStack {
            List {
                // Profile Header
                Section {
                    VStack(spacing: 12) {
                        Image(systemName: "person.circle.fill")
                            .resizable()
                            .scaledToFit()
                            .frame(width: 80, height: 80)
                            .foregroundStyle(.secondary)

                        Text(viewModel.userName)
                            .font(.title2)
                            .fontWeight(.bold)

                        Text(viewModel.email)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 8)
                }

                // Settings
                Section("Settings") {
                    Toggle("Notifications", isOn: $viewModel.notificationsEnabled)
                    Toggle("Dark Mode", isOn: $viewModel.darkModeEnabled)
                }

                // Sign Out
                Section {
                    Button("Sign Out", role: .destructive) {
                        viewModel.signOut()
                    }
                    .frame(maxWidth: .infinity)
                }
            }
            .navigationTitle("Profile")
        }
    }
}

#Preview {
    ProfileView()
}
```

[SCREEN: Run the preview in Xcode — show the actual rendered view]

Look at this. Let us count the things it got right:

1. **MVVM pattern** — View and ViewModel are separate, as our CLAUDE.md specified
2. **@State with @Observable** — correct modern pattern for owning an Observable object
3. **NavigationStack** — not the deprecated NavigationView
4. **List with Sections** — proper iOS design pattern, not custom scroll views
5. **SF Symbols** — used `person.circle.fill`, exactly what we asked for
6. **Destructive button role** — the sign-out button is automatically red, using SwiftUI's semantic styling
7. **Preview macro** — included `#Preview` so we can see it immediately in Xcode
8. **Proper spacing and typography** — `title2.bold` for the name, `subheadline.secondary` for the email

This is what I mean by idiomatic SwiftUI. It is not just code that compiles — it is code that a senior iOS developer would write. It follows Apple's patterns, uses the right modifiers, and looks native.

### The Feedback Loop

[SCREEN: Terminal — Claude Code]

Now, is the output perfect? Almost certainly not for your specific needs. Maybe you want the image to be larger. Maybe you want the settings toggles to have icons. This is where the feedback loop comes in.

Type this follow-up prompt:

```
Update ProfileView:
- Make the profile image 100x100 instead of 80x80
- Add SF Symbol icons to the toggle rows (bell.fill for notifications, moon.fill for dark mode)
- Add a version number at the bottom of the list in a footer
```

[SCREEN: Show Claude Code modifying the existing file]

Notice something critical: we did not re-describe the entire view. We gave Claude Code specific, incremental feedback. It already knows the full context — it reads the existing file, understands the structure, and makes targeted changes.

This is the vibe coding workflow:
1. **Describe** what you want
2. **Review** what AI generates
3. **Refine** with specific feedback
4. **Repeat** until it matches your vision

It is conversational. It is iterative. And it is dramatically faster than writing everything from scratch.

### What Just Happened (Talking Head)

[SCREEN: Brief return to talking head]

Let us step back and appreciate what just happened. In about five minutes, we:

1. Created a CLAUDE.md configuration file
2. Generated a complete MVVM profile screen — two files, proper architecture
3. Refined it with follow-up prompts
4. Got a screen that follows Apple's design guidelines and uses modern APIs

Would this take a senior developer long to write by hand? Maybe 20-30 minutes. But that is just one screen. When you are building an entire app with dozens of screens, the time savings compound exponentially.

And more importantly — the cognitive load is different. Instead of thinking about syntax, modifier ordering, and state management boilerplate, you are thinking about *what the feature should do*. That is a fundamentally different, and more productive, mental mode.

### Closing

[SCREEN: Terminal]

That is your setup complete and your first taste of vibe coding with Claude Code. In Module 2, we are going to go deep on the skill that separates effective AI-assisted developers from frustrated ones: prompting.

Because the quality of your output is directly proportional to the quality of your input. And there are specific techniques that make a massive difference. See you in the next lesson.

---

## Key Takeaways

1. **Claude Code installation** is one command: `npm install -g @anthropic-ai/claude-code`
2. **CLAUDE.md** is your project's rule book for AI — even a minimal version dramatically improves output quality
3. The **describe → review → refine** loop is the core vibe coding workflow
4. Claude Code generates **multi-file, architecturally correct** code, not just snippets
5. **Idiomatic output** — modern APIs, proper patterns, Apple design guidelines — is the key differentiator
6. AI coding uses API credits — budget roughly **$5-15 for this entire course**

---

## Homework

**Hands-on exercise (20 minutes):**
1. Install Claude Code and authenticate
2. Create a new Xcode project (or use an existing one)
3. Write a CLAUDE.md with at least 5 rules for your project
4. Generate one screen of your choice using a descriptive prompt
5. Refine it with at least two follow-up prompts
6. Compare the AI output with how you would have written it by hand — what is the same? What is different?
