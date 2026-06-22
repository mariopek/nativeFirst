import Foundation

// Collapses concurrent calls for the same key into one in-flight Task. The
// cache has to forget what type it's holding to store requests for different
// endpoints in one dictionary — `Task<Any, Error>` plus a cast back to `T`
// when a caller asks for its result. Real, a little ugly, every generic
// request-coalescer ends up here one way or another.
actor RequestDeduplicator {
    private var inFlight: [String: Task<Any, Error>] = [:]

    func value<T>(for key: String, as type: T.Type, perform: @escaping () async throws -> T) async throws -> T {
        if let existing = inFlight[key] {
            guard let result = try await existing.value as? T else {
                throw APIError.decoding("Deduplicated request resolved to an unexpected type.")
            }
            return result
        }

        let task = Task<Any, Error> { try await perform() }
        inFlight[key] = task
        defer { inFlight[key] = nil }

        guard let result = try await task.value as? T else {
            throw APIError.decoding("Deduplicated request resolved to an unexpected type.")
        }
        return result
    }
}
