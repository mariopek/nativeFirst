import Testing
import Foundation
@testable import BrewLog

// Routes every request through a closure instead of a socket, so these tests
// run in milliseconds and never depend on a real server being up.
final class StubURLProtocol: URLProtocol {
    static var handler: ((URLRequest) -> (HTTPURLResponse, Data)) = { request in
        (HTTPURLResponse(url: request.url!, statusCode: 200, httpVersion: nil, headerFields: nil)!, Data())
    }

    override class func canInit(with request: URLRequest) -> Bool { true }
    override class func canonicalRequest(for request: URLRequest) -> URLRequest { request }

    override func startLoading() {
        let (response, data) = Self.handler(request)
        client?.urlProtocol(self, didReceive: response, cacheStoragePolicy: .notAllowed)
        client?.urlProtocol(self, didLoad: data)
        client?.urlProtocolDidFinishLoading(self)
    }

    override func stopLoading() {}
}

private func makeClient() -> URLSessionNetworkClient {
    let config = URLSessionConfiguration.ephemeral
    config.protocolClasses = [StubURLProtocol.self]
    return URLSessionNetworkClient(baseURL: URL(string: "https://example.com")!, session: URLSession(configuration: config))
}

private struct Widget: Decodable, Equatable {
    let name: String
}

// .serialized: every test in this suite reassigns the same static
// StubURLProtocol.handler. Swift Testing runs suites in parallel by default,
// so without this trait two tests racing on that shared static can hand each
// other's response to the wrong request.
@Suite("URLSessionNetworkClient", .serialized)
struct NetworkClientTests {

    @Test("2xx response with valid JSON decodes to the expected type")
    func decodesSuccessResponse() async throws {
        StubURLProtocol.handler = { request in
            let response = HTTPURLResponse(url: request.url!, statusCode: 200, httpVersion: nil, headerFields: nil)!
            return (response, #"{"name":"kettle"}"#.data(using: .utf8)!)
        }

        let widget = try await makeClient().send(Endpoint(path: "widgets/1"), as: Widget.self)
        #expect(widget == Widget(name: "kettle"))
    }

    @Test("non-2xx status code throws badStatus, not a decoding error")
    func nonSuccessStatusThrowsBadStatus() async throws {
        StubURLProtocol.handler = { request in
            let response = HTTPURLResponse(url: request.url!, statusCode: 500, httpVersion: nil, headerFields: nil)!
            return (response, Data())
        }

        await #expect(throws: APIError.badStatus(500)) {
            _ = try await makeClient().send(Endpoint(path: "widgets/1"), as: Widget.self)
        }
    }

    @Test("malformed JSON on a 200 throws decoding, not a crash")
    func malformedBodyThrowsDecodingError() async throws {
        StubURLProtocol.handler = { request in
            let response = HTTPURLResponse(url: request.url!, statusCode: 200, httpVersion: nil, headerFields: nil)!
            return (response, #"{"oops":true}"#.data(using: .utf8)!)
        }

        await #expect(throws: APIError.self) {
            _ = try await makeClient().send(Endpoint(path: "widgets/1"), as: Widget.self)
        }
    }

    @Test("query items end up on the request URL")
    func queryItemsAreAppended() async throws {
        var capturedURL: URL?
        StubURLProtocol.handler = { request in
            capturedURL = request.url
            let response = HTTPURLResponse(url: request.url!, statusCode: 200, httpVersion: nil, headerFields: nil)!
            return (response, #"{"name":"kettle"}"#.data(using: .utf8)!)
        }

        let endpoint = Endpoint(path: "widgets", queryItems: [URLQueryItem(name: "color", value: "red")])
        _ = try await makeClient().send(endpoint, as: Widget.self)

        #expect(capturedURL?.query == "color=red")
    }
}
