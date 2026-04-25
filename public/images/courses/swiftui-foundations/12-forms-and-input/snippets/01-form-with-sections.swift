import SwiftUI

struct SettingsForm: View {
    @State private var name = ""
    @State private var notifications = true
    @State private var reminderTime = Date()

    var body: some View {
        Form {
            Section("Profile") {
                TextField("Display name", text: $name)
                    .textInputAutocapitalization(.words)
                    .submitLabel(.done)
            }

            Section("Notifications") {
                Toggle("Enable reminders", isOn: $notifications)
                if notifications {
                    DatePicker("Daily reminder",
                               selection: $reminderTime,
                               displayedComponents: .hourAndMinute)
                }
            }

            Section {
                Button("Sign out", role: .destructive) { }
            }
        }
    }
}
