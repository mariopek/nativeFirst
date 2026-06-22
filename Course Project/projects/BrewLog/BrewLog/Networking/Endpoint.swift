import Foundation

struct Endpoint {
    var path: String
    var method: String = "GET"
    var queryItems: [URLQueryItem] = []
    var headers: [String: String] = [:]
    var requiresAuth: Bool = false
}
