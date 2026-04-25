import SwiftUI

// === Diagnostic 1 ===
// "Call to main actor-isolated method 'load()' in a synchronous nonisolated
//  context"
//
// You're calling a @MainActor method from outside the main actor without
// awaiting. The fix is almost always to wrap in a Task:
//
//   .onAppear { Task { await state.load() } }
//
// Or simply use SwiftUI's .task — it's MainActor-isolated by default.
//
//   .task { await state.load() }


// === Diagnostic 2 ===
// "Capture of 'self' with non-Sendable type 'Foo' in a `@Sendable` closure"
//
// You're passing self into a Task that escapes the actor. Three fixes:
//
//   Task { [weak self] in
//       guard let self else { return }
//       await self.something()
//   }
//
// Or mark the type Sendable (if all properties allow it).
// Or use @MainActor class — kicks the closure back onto main automatically.


// === Diagnostic 3 ===
// "Type 'Foo' does not conform to the 'Sendable' protocol"
//
// You're trying to ship a non-Sendable across actors. Either:
// - Add Sendable conformance (auto for structs/enums of Sendable members)
// - Mark the class @MainActor (isolation provides Sendability)
// - Refactor to pass only the values you need (often the cleanest fix)


// === Diagnostic 4 ===
// "Sending 'X' risks causing data races; sender is `@MainActor` and receiver
//  is non-isolated"
//
// You sent a mutable reference across actors. Don't do that. Use Sendable
// values, or extract the data you need before crossing the boundary:
//
//   let snapshot = state.entries           // Sendable copy
//   await someActor.process(snapshot)      // safe to send

// === Survival heuristic ===
// 90% of the time the fix is one of:
//   1. Add `@MainActor` to the type or method
//   2. Wrap the call in `Task { ... }`
//   3. Add `Sendable` to a struct/enum
//   4. Use `await` where you missed it
