import Foundation

struct BrewTipDTO: Decodable {
    let tip: String
}

protocol BrewTipsService {
    func fetchTipOfTheDay() async throws -> String
}

struct RemoteBrewTipsService: BrewTipsService {
    let client: NetworkClient

    func fetchTipOfTheDay() async throws -> String {
        let dto = try await client.send(Endpoint(path: "tips/today", requiresAuth: true), as: BrewTipDTO.self)
        return dto.tip
    }
}
