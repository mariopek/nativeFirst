import SwiftUI

struct DatePickerExamples: View {
    @State private var date = Date()

    var body: some View {
        VStack(spacing: 24) {
            // Just the time — for reminders, alarms, schedules
            DatePicker("Daily reminder",
                       selection: $date,
                       displayedComponents: .hourAndMinute)

            // Just the date — for birthdays, deadlines
            DatePicker("Brew date",
                       selection: $date,
                       displayedComponents: .date)

            // Both — for calendar entries
            DatePicker("When", selection: $date)
                .datePickerStyle(.compact)

            // Bounded range — never future, never older than 30 days
            DatePicker("Recent only",
                       selection: $date,
                       in: Date().addingTimeInterval(-30 * 86_400)...Date())

            // Graphical — full visible calendar, ideal for picking from many dates
            DatePicker("Pick a day", selection: $date,
                       displayedComponents: .date)
                .datePickerStyle(.graphical)
        }
    }
}
