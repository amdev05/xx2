# Requirements Document

## Introduction

This feature enhances the cinema schedule creation process by allowing administrators to create multiple schedule entries with different showtimes in a single form submission. Instead of manually creating separate schedule records for each showtime (e.g., 7:00, 9:00, 11:00), the admin can select multiple time slots at once, and the system will automatically generate individual schedule records with identical data except for the showtime.

## Glossary

- **Schedule**: A record (jadwal) that defines when a specific film is shown in a specific studio at a specific branch
- **Showtime**: The time when a film screening begins (jam tayang)
- **Admin**: A user with administrative privileges who manages cinema schedules
- **Time_Slot**: A specific time when a film can be shown (e.g., 7:00, 9:00, 11:00)
- **Schedule_Form**: The admin interface for creating cinema schedules
- **Schedule_Record**: A single database entry in the jadwal table
- **Batch_Creation**: The process of creating multiple schedule records from a single form submission

## Requirements

### Requirement 1: Multiple Time Slot Selection

**User Story:** As an admin, I want to select multiple time slots in a single schedule form, so that I can reduce repetitive data entry when creating schedules for the same film.

#### Acceptance Criteria

1. WHEN the Schedule_Form is displayed, THE System SHALL provide a multi-select interface for choosing time slots
2. WHEN an admin selects multiple time slots, THE System SHALL visually indicate all selected times
3. WHEN an admin submits the form with multiple time slots selected, THE System SHALL accept all selected time slots for processing
4. THE Schedule_Form SHALL allow selection of at least 10 different time slots per submission

### Requirement 2: Batch Schedule Creation

**User Story:** As an admin, I want the system to automatically create multiple schedule records when I submit a form with multiple time slots, so that I don't have to manually create each schedule separately.

#### Acceptance Criteria

1. WHEN an admin submits a schedule form with N time slots selected, THE System SHALL create exactly N Schedule_Records in the database
2. WHEN creating multiple Schedule_Records, THE System SHALL use identical data for film, studio, branch, and other attributes across all records
3. WHEN creating multiple Schedule_Records, THE System SHALL assign a different showtime to each record based on the selected time slots
4. WHEN any Schedule_Record creation fails, THE System SHALL rollback all Schedule_Records from that batch to maintain data consistency

### Requirement 3: Schedule Data Validation

**User Story:** As an admin, I want the system to validate my schedule data before creating records, so that I can avoid creating invalid or conflicting schedules.

#### Acceptance Criteria

1. WHEN an admin submits a schedule form, THE System SHALL validate that at least one time slot is selected
2. WHEN an admin submits a schedule form, THE System SHALL validate that all required fields (film, studio, branch) are provided
3. IF a time slot conflicts with an existing schedule for the same studio and date, THEN THE System SHALL reject that specific time slot and report the conflict
4. WHEN validation fails for any time slot, THE System SHALL display clear error messages indicating which time slots have conflicts

### Requirement 4: Admin Feedback and Confirmation

**User Story:** As an admin, I want to receive clear feedback about the schedule creation process, so that I know whether my schedules were created successfully.

#### Acceptance Criteria

1. WHEN all Schedule_Records are created successfully, THE System SHALL display a success message indicating the number of schedules created
2. WHEN Schedule_Record creation fails, THE System SHALL display an error message with details about the failure
3. WHEN the batch creation completes, THE System SHALL refresh or update the schedule list to show the newly created schedules
4. THE System SHALL display the success or error message within 2 seconds of form submission completion

### Requirement 5: Time Slot Configuration

**User Story:** As a system administrator, I want to configure available time slots, so that admins can only select from valid cinema showtimes.

#### Acceptance Criteria

1. THE System SHALL provide a predefined list of valid time slots for selection
2. WHEN displaying time slots, THE System SHALL show them in chronological order
3. THE System SHALL support time slots in 24-hour format (HH:MM)
4. WHERE time slot configuration is needed, THE System SHALL allow modification of available time slots without code changes

### Requirement 6: Database Transaction Integrity

**User Story:** As a system administrator, I want schedule creation to be atomic, so that partial failures don't leave the database in an inconsistent state.

#### Acceptance Criteria

1. WHEN creating multiple Schedule_Records, THE System SHALL execute all database insertions within a single transaction
2. IF any Schedule_Record insertion fails within a batch, THEN THE System SHALL rollback all insertions from that transaction
3. WHEN a rollback occurs, THE System SHALL ensure no Schedule_Records from the failed batch remain in the database
4. THE System SHALL log transaction failures with sufficient detail for debugging

### Requirement 7: Backend API Enhancement

**User Story:** As a developer, I want the backend API to accept multiple time slots in a single request, so that the frontend can submit batch schedule creation requests.

#### Acceptance Criteria

1. THE Schedule_Creation_API SHALL accept an array of time slots in the request payload
2. WHEN the API receives a request with multiple time slots, THE System SHALL process all time slots and return a consolidated response
3. THE API_Response SHALL indicate success or failure for the entire batch operation
4. WHEN partial failures occur during validation, THE API_Response SHALL include details about which time slots failed and why

### Requirement 8: Frontend Form Enhancement

**User Story:** As an admin, I want an intuitive interface for selecting multiple time slots, so that I can quickly create schedules without confusion.

#### Acceptance Criteria

1. THE Schedule_Form SHALL display time slots as selectable elements (checkboxes or multi-select dropdown)
2. WHEN an admin clicks a time slot, THE System SHALL toggle its selection state
3. THE Schedule_Form SHALL display a count of selected time slots
4. WHEN the form is submitted, THE System SHALL disable the submit button until the operation completes to prevent duplicate submissions
