import Foundation

// An actor, not a struct or class, on purpose: under this project's
// SWIFT_DEFAULT_ACTOR_ISOLATION = MainActor every other type in this file
// would run on the main thread unless marked otherwise. An actor carves out
// its own isolation domain regardless of that default, which is exactly what
// token refresh needs — multiple call sites can hit it from anywhere at once
// and still only ever see one refresh in flight.
actor AuthTokenStore {
    private(set) var currentToken: String
    private var refreshTask: Task<String, Error>?
    private let refresher: () async throws -> String

    init(initialToken: String, refresher: @escaping () async throws -> String) {
        self.currentToken = initialToken
        self.refresher = refresher
    }

    func refreshedToken() async throws -> String {
        if let refreshTask {
            return try await refreshTask.value
        }

        let task = Task { try await refresher() }
        refreshTask = task
        defer { refreshTask = nil }

        let token = try await task.value
        currentToken = token
        return token
    }
}
