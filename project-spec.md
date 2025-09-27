# Daily Activity Time Tracker - iOS App Specification (Expo/React Native)

## Project Overview
An iOS mobile application built with Expo/React Native that allows users to track the duration of their daily activities and visualize the time distribution through an interactive pie chart. Developed with Expo Go for instant preview and hot reload capabilities on iOS devices.

## Core Features

### 1. Activity Tracking
- **Activity Buttons**: Customizable buttons for each activity, displayed in a responsive grid layout
- **One-Tap Start**: Tap any activity button to instantly start tracking that activity
- **Single Active Activity**: Only one activity can be tracked at a time
- **Button Customization**: Each button has custom color, icon, and name
- **Built-in Activities**: Pre-configured buttons (Sleep, Work, Meal, Exercise, Commute, Break, Study, Entertainment)
- **Custom Activities**: Users can add unlimited custom activity buttons
- **Active State**: Currently tracking activity button shows animated border/glow effect
- **Quick Switch**: Tapping a different button automatically stops current (sets endTime) and starts new activity
- **Real-time Duration**: Active button displays elapsed time
- **Persistence**: Active timer persists across app restarts/crashes
- **Cross-Day Tracking**: Activities continue into next day without automatic stopping at midnight

### 2. Data Visualization
- **Daily Pie Chart**: Visual breakdown showing percentage of time spent on each activity
- **Current Time Indicator**: Red radius line showing where "now" is on the 24-hour chart (rotates continuously)
- **Empty State**: Blank chart when no activities tracked yet
- **Color Coding**: Distinct colors for different activity categories
- **Tap for Details**: Interactive segments showing exact duration when tapped
- **Legend**: Activity names with corresponding time durations
- **Unaccounted Time**: Tracks time when no activity was selected

### 3. Data Management
- **Daily View**: Default view showing current day's activities
- **History**: Browse previous days' tracked activities (deleted buttons retain historical data)
- **Edit Entries**: Modify or delete incorrectly logged activities
- **Manual Entry**: Add activities retroactively with custom time ranges
- **Button Reordering**: Drag and drop to rearrange button positions in grid
- **Soft Delete**: Deleted activity buttons hide from grid but preserve historical data

## Technical Requirements

### Platform
- iOS 13+ support
- iPhone-optimized interface
- Development and testing via Expo Go app for iOS

### Technology Stack
- **Framework**: Expo SDK 49+ / React Native
- **Language**: JavaScript/TypeScript (TypeScript recommended)
- **Navigation**: Expo Router or React Navigation
- **State Management**: Redux Toolkit or Zustand
- **Data Persistence**: AsyncStorage or Expo SQLite
- **Charts**: react-native-svg-charts or Victory Native
- **UI Components**: React Native Elements or NativeBase
- **Architecture**: Component-based with hooks

### Key Dependencies
```json
{
  "expo": "~49.0.0",
  "react-native-svg-charts": "^5.4.0",
  "react-native-svg": "^13.9.0",
  "@react-native-async-storage/async-storage": "^1.19.0",
  "expo-keep-awake": "^12.3.0",
  "date-fns": "^2.30.0",
  "expo-notifications": "^0.20.0",
  "expo-haptics": "^12.4.0"
}
```

### Key Components
1. **Timer Service**: Background timer using expo-keep-awake
2. **Data Store**: Persistent storage with AsyncStorage/SQLite
3. **Chart Component**: Pie chart using SVG-based libraries
4. **Date Utils**: Date manipulation with date-fns
5. **Modal Manager**: Bottom sheet modals for add/edit flows

## User Interface

### Main Screen (Single Screen App)

**Home Screen Layout (Top to Bottom):**

1. **Today's Chart Section**
   - Compact pie chart showing today's activities
   - Red radius line indicating current time (rotates based on time of day)
   - Total tracked time display
   - Minimal height (~200px)
   - Tappable segments show duration tooltips

2. **Activity Button Grid**
   - Responsive grid layout (columns adapt to device width)
   - Unlimited rows, scrollable vertically
   - Each button shows:
     * Activity icon (emoji)
     * Activity name (scrolls horizontally if too long, like music player)
     * Custom background color
     * Duration overlay (if currently active)
   - Active button effects:
     * Pulsing border animation
     * Timer display overlay
     * Slightly elevated shadow

3. **Bottom Section**
   - Floating "Add Activity" button (+) for creating custom activities
   - Below that: "Available Activities" section
     * Greyed out preset buttons not yet added
     * Small green "+" icon on upper right corner of each
     * Tap green "+" to instantly add to active grid
     * Includes unused default activities (Sleep, Work, Meal, etc.)

### Modals

1. **Add Activity Modal**
   - Name input field
   - Emoji picker (scrollable grid)
   - Color selector (preset colors)
   - Save/Cancel buttons
   - Opens from bottom (slide-up animation)

2. **Activity Options Modal** (Long press on button)
   - Triggered with haptic feedback (medium impact)
   - Function list:
     * Edit - Opens edit modal
     * Edit Layout - Enter reorder mode for drag & drop
     * Delete - Removes activity from grid (preserves historical data)
   - Small contextual popup with backdrop

3. **Edit Activity Modal**
   - Name input field (pre-filled)
   - Emoji picker (current emoji selected)
   - Color selector (current color highlighted)
   - Save/Cancel buttons
   - Opens with haptic feedback

## Data Model

```typescript
interface Activity {
    id: string;
    name: string;
    buttonId: string; // reference to ActivityButton
    startTime: Date;
    endTime?: Date;
    duration?: number; // in milliseconds
    notes?: string;
    color: string; // hex color from button
}

interface ActivityButton {
    id: string;
    name: string;
    color: string; // hex color
    icon?: string; // emoji or icon name
    isDefault: boolean;
    position: number; // position in grid
    isVisible: boolean; // user can hide default buttons
}

interface DaySummary {
    date: Date;
    activities: Activity[];
    totalTrackedTime: number; // milliseconds
    unaccountedTime: number; // milliseconds (time when no activity selected)
}
```

## MVP Features (Phase 1)
1. Single screen app with chart + buttons
2. 8 default activity buttons with preset colors/emojis
3. Tap-to-start/switch functionality
4. Today's pie chart at top (auto-updates)
5. Active button shows timer and animation
6. Add custom activities via modal (tap "+")
7. AsyncStorage persistence
8. Long press to edit/delete activities


## User Flow

1. **First Launch**
   - App opens with 3-4 starter buttons in grid (Work, Break, Meal)
   - Today's empty pie chart at top
   - Below: Available activities section with remaining presets
   - Brief tooltip: "Tap any activity to start tracking!"

2. **Daily Usage**
   - Open app → See today's chart and active buttons
   - Tap activity button to start tracking
   - Button shows active state with timer
   - Tap different button to switch activities
   - Chart updates in real-time
   - Scroll down to see available preset activities
   - Tap green "+" on preset to add to grid
   - Tap main "+" to create custom activity

3. **Managing Activities**
   - For presets: Tap green "+" to add instantly (light haptic)
   - For custom: Tap "+" → Modal slides up
   - Enter name, pick emoji, select color
   - New button appears in grid
   - Long press any button (medium haptic) → Options menu
   - Select "Edit" → Edit modal with current settings
   - Select "Edit Layout" → Grid enters reorder mode with drag handles
   - Select "Delete" → Remove from grid (data preserved)

## Design Considerations

### Button Design
- **Native iOS Appearance**:
  * Rounded corners (radius: 12-16px)
  * Subtle shadows for depth
  * iOS haptic feedback on press
  * Scale animation on touch (0.95 scale)
- **Button States**:
  * Default: Solid color background, white text/icon
  * Pressed: Slightly darker shade, scale down with haptic (light)
  * Long Press: Haptic (medium) + options modal
  * Active: Pulsing glow, timer overlay, border animation
  * Disabled: 50% opacity
- **Grid Layout**:
  * Responsive spacing
  * Minimum button size: 80x80px
  * Maximum: Fills available width/4 columns

### Default Activity Buttons
1. **Sleep** 😴 - Deep blue (#2C3E50)
2. **Work** 💼 - Purple (#8E44AD)
3. **Meal** 🍽️ - Orange (#E67E22)
4. **Exercise** 🏃 - Green (#27AE60)
5. **Commute** 🚗 - Gray (#7F8C8D)
6. **Study** 📚 - Teal (#16A085)
7. **Break** ☕ - Brown (#8B4513)
8. **Entertainment** 🎮 - Pink (#E91E63)

### UX Principles
- **Simplicity First**: Single tap to start/stop tracking
- **Visual Feedback**: Immediate response to user actions
- **Glanceable**: Current activity visible at a glance
- **Consistency**: All buttons follow same interaction pattern
- **Accessibility**: High contrast colors, clear labels

## Success Metrics
- Daily active usage rate
- Average number of activities tracked per day
- User retention after 7/30 days
- Time to start tracking (should be < 3 seconds)
- Chart interaction rate

