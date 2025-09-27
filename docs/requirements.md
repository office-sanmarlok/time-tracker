# Time Tracker App - iOS Software Requirements Document

## 1. Introduction

### 1.1 Purpose
This document specifies the software requirements for the Time Tracker iOS application, a native iOS tool built with Expo/React Native that enables iPhone users to track daily activities and visualize time distribution through interactive charts.

### 1.2 Scope
The application provides:
- One-tap activity tracking with customizable buttons
- Real-time pie chart visualization of daily time allocation
- Persistent data storage across sessions
- Haptic feedback for enhanced user interaction
- Single-screen interface with modal-based workflows

### 1.3 Definitions
- **Activity**: A user-defined or preset task/action being tracked
- **Activity Button**: Interactive UI element representing a trackable activity
- **Active State**: Currently running timer for a specific activity
- **Unaccounted Time**: Period when no activity is being tracked

## 2. Overall Description

### 2.1 Product Perspective
A standalone iOS application that runs on iPhone devices through Expo Go, providing immediate time tracking capabilities without external dependencies.

### 2.2 Product Functions
- Track time spent on various daily activities
- Visualize daily time distribution via pie chart
- Manage custom and preset activity buttons
- Persist tracking data across app sessions
- Continue tracking across day boundaries

### 2.3 User Characteristics
Target users are individuals who want to:
- Monitor daily time allocation
- Improve time management
- Gain insights into activity patterns
- Track productivity and lifestyle balance

### 2.4 Constraints
- Requires Expo Go app for iOS for development/testing
- iOS 13+ compatibility
- iPhone-only support (no iPad optimization in MVP)
- Single active activity limitation
- Local storage only (no cloud sync in MVP)

## 3. Specific Requirements

### 3.1 Functional Requirements

#### 3.1.1 Activity Tracking
- **FR-1.1**: System shall allow only one activity to be tracked at a time
- **FR-1.2**: Tapping an activity button shall immediately start tracking that activity
- **FR-1.3**: Starting a new activity shall automatically stop the current activity with proper endTime
- **FR-1.4**: Active timers shall persist across app restarts and crashes
- **FR-1.5**: Activities shall continue tracking past midnight without interruption
- **FR-1.6**: System shall display real-time duration on active activity button

#### 3.1.2 Button Management
- **FR-2.1**: System shall provide 8 preset activity buttons (Sleep, Work, Meal, Exercise, Commute, Study, Break, Entertainment)
- **FR-2.2**: Users shall be able to create unlimited custom activity buttons
- **FR-2.3**: Each button shall have customizable name, emoji icon, and color
- **FR-2.4**: Long button names shall scroll horizontally within button bounds
- **FR-2.5**: Users shall be able to reorder buttons via drag-and-drop
- **FR-2.6**: Deleted buttons shall be hidden but preserve historical data
- **FR-2.7**: Preset buttons shall display with green "+" icon for quick addition

#### 3.1.3 Data Visualization
- **FR-3.1**: System shall display daily activities as a pie chart
- **FR-3.2**: Chart shall show blank state when no activities are tracked
- **FR-3.3**: Current time indicator (red line) shall rotate continuously
- **FR-3.4**: Tapping chart segments shall display duration details
- **FR-3.5**: System shall calculate and display unaccounted time
- **FR-3.6**: Chart shall update in real-time as activities are tracked

#### 3.1.4 User Interface
- **FR-4.1**: App shall use single-screen design with modal overlays
- **FR-4.2**: Grid layout shall adapt columns based on device width
- **FR-4.3**: Grid shall support unlimited rows with vertical scrolling
- **FR-4.4**: Active buttons shall show pulsing border animation
- **FR-4.5**: Modals shall slide up from bottom with animations

#### 3.1.5 iOS Haptic Feedback
- **FR-5.1**: Light impact haptic feedback on button tap
- **FR-5.2**: Medium impact haptic feedback on long press
- **FR-5.3**: Light impact haptic when adding preset activities
- **FR-5.4**: Selection haptic feedback on modal interactions

#### 3.1.6 Data Persistence
- **FR-6.1**: All activity data shall persist in AsyncStorage
- **FR-6.2**: Button configurations shall be saved locally
- **FR-6.3**: Active tracking state shall survive app termination
- **FR-6.4**: Historical data shall be retained indefinitely

### 3.2 Non-Functional Requirements

#### 3.2.1 Performance
- **NFR-1.1**: Button tap response time < 100ms
- **NFR-1.2**: Chart updates shall render within 16ms (60 FPS)
- **NFR-1.3**: App launch to interactive state < 3 seconds
- **NFR-1.4**: Modal animations shall be smooth (60 FPS)

#### 3.2.2 Usability
- **NFR-2.1**: Core functionality accessible within 2 taps
- **NFR-2.2**: Visual feedback for all user interactions
- **NFR-2.3**: High contrast colors for accessibility
- **NFR-2.4**: Minimum button size 80x80px for iOS touch targets
- **NFR-2.5**: Follows iOS Human Interface Guidelines

#### 3.2.3 Reliability
- **NFR-3.1**: No data loss on app crash
- **NFR-3.2**: Timer accuracy within 1 second per hour
- **NFR-3.3**: Graceful handling of storage limitations

#### 3.2.4 Compatibility
- **NFR-4.1**: iOS 13+ support
- **NFR-4.2**: iPhone SE to iPhone Pro Max screen sizes
- **NFR-4.3**: Expo SDK 49+ compatibility
- **NFR-4.4**: iOS dark mode and light mode support

## 4. External Interface Requirements

### 4.1 User Interface
- Single main screen with chart and button grid
- Modal overlays for add/edit operations
- Touch-based interactions
- Visual animations for state changes

### 4.2 Hardware Interface
- iOS touch screen for primary input
- Taptic Engine for haptic feedback
- iPhone storage for data persistence

### 4.3 Software Interface
- Expo Go iOS app for development/testing
- AsyncStorage API for data persistence
- React Native SVG for chart rendering
- Expo Haptics API for iOS Taptic Engine integration

## 5. System Features

### 5.1 Quick Activity Switching
**Priority**: High
- One-tap switching between activities
- Automatic stop/start mechanism
- Visual confirmation of active state
- Real-time timer display

### 5.2 Visual Time Analytics
**Priority**: High
- 24-hour pie chart representation
- Color-coded activity segments
- Current time indicator
- Interactive segment details

### 5.3 Custom Activity Creation
**Priority**: Medium
- Modal-based creation flow
- Emoji picker for icons
- Color selection palette
- Name input with no character limit

### 5.4 Button Layout Management
**Priority**: Low
- Drag-and-drop reordering
- Responsive grid adaptation
- Edit/delete operations
- Preset button quick-add

## 6. Data Requirements

### 6.1 Data Models

#### Activity
- id: unique identifier
- name: activity name
- buttonId: reference to ActivityButton
- startTime: timestamp
- endTime: optional timestamp
- duration: calculated milliseconds
- color: hex color value

#### ActivityButton
- id: unique identifier
- name: display name
- color: hex color
- icon: emoji or icon identifier
- isDefault: boolean flag
- position: grid position
- isVisible: display state

#### DaySummary
- date: calendar date
- activities: array of Activity
- totalTrackedTime: sum of durations
- unaccountedTime: gaps in tracking

### 6.2 Data Persistence
- Local storage using AsyncStorage
- JSON serialization for complex objects
- Automatic save on state changes
- Migration strategy for schema updates

## 7. Constraints and Assumptions

### 7.1 Constraints
- Single activity tracking limitation
- Local storage only (no iCloud sync)
- Requires Expo Go iOS for development
- iPhone-only platform (no iPad support)

### 7.2 Assumptions
- Users have Expo Go iOS app installed
- iPhones have sufficient storage
- Users understand basic time tracking concepts
- iPhone has Taptic Engine (all iOS 13+ devices)

## 8. Acceptance Criteria

### 8.1 Core Functionality
- [ ] Can start/stop activity tracking with single tap
- [ ] Only one activity tracks at a time
- [ ] Pie chart updates in real-time
- [ ] Data persists across app restarts
- [ ] Activities continue past midnight

### 8.2 Button Management
- [ ] Can add custom activities
- [ ] Can edit existing activities
- [ ] Can delete activities (soft delete)
- [ ] Can reorder button layout
- [ ] Preset buttons available with quick-add

### 8.3 User Experience
- [ ] Haptic feedback on interactions
- [ ] Smooth animations (60 FPS)
- [ ] Responsive grid layout
- [ ] Long names scroll horizontally
- [ ] Current time indicator rotates continuously

### 8.4 Data Integrity
- [ ] No data loss on crash
- [ ] Historical data preserved
- [ ] Accurate time calculations
- [ ] Proper unaccounted time tracking