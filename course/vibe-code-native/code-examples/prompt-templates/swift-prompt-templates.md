# Swift & SwiftUI Prompt Templates

Ready-to-use prompt templates for common iOS development tasks. Copy, customize the `[brackets]`, and paste into Claude Code.

---

## 1. New Screen / View

```
Create [ScreenName]View that displays:
- [UI element 1 with description]
- [UI element 2 with description]
- [UI element 3 with description]

Create a [ScreenName]ViewModel to manage the state.
Include a #Preview with sample data.
```

**Example:**
```
Create OrderHistoryView that displays:
- A list of past orders grouped by month
- Each row shows order number, date, item count, and total amount
- A summary card at the top showing total orders and total spent this year

Create an OrderHistoryViewModel to manage the state.
Include a #Preview with sample data.
```

---

## 2. SwiftData Model

```
Create a SwiftData model for [ModelName] with these properties:
- [property]: [Type] — [description/constraints]
- [property]: [Type] — [description/constraints]
- [property]: [Type] — [description/constraints]

Relationships:
- [describe relationships to other models]

Include:
- A computed property for [derived value]
- Conformance to [protocol] if needed
- Sample data in a static preview property
```

**Example:**
```
Create a SwiftData model for Workout with these properties:
- name: String — the workout name
- date: Date — when the workout was performed
- duration: TimeInterval — length in seconds
- notes: String? — optional user notes
- caloriesBurned: Int — estimated calories

Relationships:
- A Workout has many Exercise objects (cascade delete)

Include:
- A computed property for formattedDuration (e.g., "45 min")
- Sample data in a static preview property
```

---

## 3. Form / Input Screen

```
Create a form for [purpose] with these fields:
- [field]: [input type] — [validation rules]
- [field]: [input type] — [validation rules]
- [field]: [input type] — [validation rules]

Behavior:
- Validate all fields before allowing submission
- Show inline errors for invalid fields
- [Submit button] should [action] and [navigation]
- Disable the submit button while [condition]

Use a sheet/NavigationStack for presentation.
```

**Example:**
```
Create a form for adding a new expense with these fields:
- name: TextField — required, max 100 characters
- amount: TextField — numeric keyboard, required, must be > 0
- category: Picker — choose from predefined categories
- date: DatePicker — defaults to today
- notes: TextEditor — optional, max 500 characters

Behavior:
- Validate all fields before allowing submission
- Show inline errors for invalid fields
- "Save" button should save to SwiftData and dismiss the sheet
- Disable the save button while any required field is empty

Present as a sheet.
```

---

## 4. List with Search & Filter

```
Add search and filtering to [ViewName]:

Search:
- Filter [model] by [field(s)] — case-insensitive, contains matching
- Show "No results" state when search matches nothing
- Use .searchable modifier

Filter:
- [Filter option 1]
- [Filter option 2]
- [Filter option 3]

Sort:
- Default: [sort order]
- Options: [list sort options]

Do not modify the [Model] — filtering should be query-based.
```

---

## 5. Networking / API Integration

```
Create a [ServiceName] that communicates with [API description]:

Endpoints:
- GET [endpoint] → returns [description]
- POST [endpoint] → sends [description], returns [description]

Requirements:
- Use async/await
- Handle errors: network failure, server error, decoding failure
- Map API responses to local model types immediately
- Include retry logic for transient failures (max 3 retries)
- Add request/response logging with os.Logger

Create a protocol for the service so it can be mocked in tests.
```

---

## 6. Unit Tests

```
Write unit tests for [ClassName]:

Test these scenarios:
- [Scenario 1 — expected behavior]
- [Scenario 2 — edge case]
- [Scenario 3 — error case]
- [Scenario 4 — boundary condition]

Use Swift Testing framework (@Test, #expect).
Mock [dependencies] using protocol-based injection.
Put the test file in Tests/[ClassName]Tests.swift.
```

**Example:**
```
Write unit tests for ExpenseViewModel:

Test these scenarios:
- Adding an expense updates the expenses array
- Deleting an expense removes it from the array
- Total calculation sums all expense amounts correctly
- Total handles empty expense list (should be 0)
- Filtering by category returns only matching expenses
- Search with no results returns empty array

Use Swift Testing framework (@Test, #expect).
Mock SwiftData using an in-memory ModelContainer.
Put the test file in Tests/ExpenseViewModelTests.swift.
```

---

## 7. Refactoring

```
Refactor [file/component]:

Current issues:
- [Issue 1]
- [Issue 2]
- [Issue 3]

Goals:
- [Goal 1]
- [Goal 2]

Constraints:
- Do not change the public API / external behavior
- Keep backward compatibility with [specific requirement]
- [Any other constraint]
```

---

## 8. Bug Fix

```
Bug in [file/feature]:

Current behavior: [what happens now]
Expected behavior: [what should happen]
Steps to reproduce: [how to trigger the bug]

Relevant files:
- [file1.swift] — [role in the bug]
- [file2.swift] — [role in the bug]

Fix the bug without changing [unrelated thing].
```

---

## 9. Animation / Transition

```
Add animation to [component/transition]:

Trigger: [what causes the animation]
Animation:
- [Property] animates from [start] to [end]
- Duration: [time] seconds
- Curve: [spring/easeInOut/linear with parameters]
- [Additional animation properties]

Use SwiftUI's .animation or withAnimation — not UIKit animations.
The animation should feel [natural/snappy/subtle/dramatic].
```

---

## 10. Accessibility Pass

```
Review [ViewName] for accessibility:

Check and fix:
- All images have accessibility descriptions
- All buttons and interactive elements have accessibility labels
- VoiceOver navigation order is logical
- Dynamic Type is supported (no hardcoded font sizes)
- Color contrast meets WCAG AA standards
- Tap targets are at least 44x44 points
- Custom components post appropriate accessibility notifications

Do not change visual appearance — only add/fix accessibility metadata.
```

---

## Tips for Using Templates

1. **Always customize** — templates are starting points, not copy-paste solutions
2. **Add context** — mention related files, existing patterns, and project specifics
3. **Iterate** — use the template for the first prompt, then refine with "Yes, but..."
4. **Combine** — for complex features, chain multiple templates (model → view → tests)
5. **Save your best prompts** — keep a personal library of prompts that worked well
