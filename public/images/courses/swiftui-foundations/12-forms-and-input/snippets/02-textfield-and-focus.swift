import SwiftUI

struct LoginExample: View {
    @State private var email = ""
    @State private var password = ""
    @FocusState private var focused: Field?

    enum Field { case email, password }

    var body: some View {
        VStack(spacing: 16) {
            TextField("Email", text: $email)
                .textContentType(.emailAddress)
                .textInputAutocapitalization(.never)
                .keyboardType(.emailAddress)
                .focused($focused, equals: .email)
                .submitLabel(.next)

            SecureField("Password", text: $password)
                .textContentType(.password)
                .focused($focused, equals: .password)
                .submitLabel(.go)

            Button("Sign in") { focused = nil }
                .buttonStyle(.borderedProminent)
        }
        .textFieldStyle(.roundedBorder)
        .padding()
        .onSubmit {
            switch focused {
            case .email:    focused = .password
            case .password: focused = nil
            case .none:     break
            }
        }
        .onAppear { focused = .email }
    }
}
