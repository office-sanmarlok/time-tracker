# Time Tracker iOS App - System Design Document

## 1. System Architecture

### 1.1 High-Level Architecture
```
┌─────────────────────────────────────────────────────┐
│                    iOS Device                        │
├─────────────────────────────────────────────────────┤
│                  Presentation Layer                  │
│  ┌─────────────────────────────────────────────┐    │
│  │            React Native Components          │    │
│  │  (HomeScreen, ActivityButton, PieChart)    │    │
│  └─────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────┤
│                  Business Logic Layer                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │
│  │ActivityManager│  │ TimerService │  │ChartCalc │  │
│  └──────────────┘  └──────────────┘  └──────────┘  │
├─────────────────────────────────────────────────────┤
│                    Data Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │
│  │   Storage    │  │    Models    │  │  Migrate │  │
│  │(AsyncStorage)│  │  (Activity)  │  │  Service │  │
│  └──────────────┘  └──────────────┘  └──────────┘  │
└─────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack
- **Framework**: Expo SDK 49+ / React Native 0.72+
- **Language**: TypeScript 5.0+
- **State Management**: Zustand 4.4+
- **Navigation**: Single screen (no navigation library needed)
- **Data Persistence**: @react-native-async-storage/async-storage 1.19+
- **Charts**: react-native-svg-charts 5.4+ with react-native-svg 13.9+
- **Animations**: react-native-reanimated 3.3+
- **Haptics**: expo-haptics 12.4+
- **Date Handling**: date-fns 2.30+

## 2. Component Architecture

### 2.1 Component Hierarchy
```
App
├── HomeScreen
│   ├── ChartSection
│   │   ├── PieChart
│   │   ├── TimeIndicator
│   │   └── ChartLegend
│   ├── ActivityGrid
│   │   ├── ActivityButton[]
│   │   │   ├── ButtonIcon
│   │   │   ├── ButtonLabel
│   │   │   └── ActiveTimer
│   │   └── DragHandle (edit mode)
│   ├── AvailableActivities
│   │   └── PresetButton[]
│   └── FloatingAddButton
└── Modals
    ├── AddActivityModal
    ├── EditActivityModal
    └── ActivityOptionsModal
```

### 2.2 Component Specifications

#### HomeScreen
- **Purpose**: Main container component
- **State**: Current active activity, today's activities
- **Props**: None (root component)
- **Responsibilities**:
  - Coordinate child components
  - Handle modal triggers
  - Manage edit mode state

#### ActivityButton
- **Purpose**: Interactive button for activity tracking
- **Props**:
  ```typescript
  interface ActivityButtonProps {
    button: ActivityButton;
    isActive: boolean;
    duration?: number;
    onPress: () => void;
    onLongPress: () => void;
    isDraggable: boolean;
  }
  ```
- **Features**:
  - Animated press states
  - Horizontal text scrolling for long names
  - Pulsing border when active
  - Real-time timer display

#### PieChart
- **Purpose**: Visual representation of daily time allocation
- **Props**:
  ```typescript
  interface PieChartProps {
    activities: Activity[];
    currentTime: Date;
    onSegmentPress: (activity: Activity) => void;
  }
  ```
- **Features**:
  - SVG-based rendering
  - Animated transitions
  - Interactive segments
  - Current time indicator rotation

## 3. Data Architecture

### 3.1 Data Models

```typescript
// Core data models
interface Activity {
  id: string;                    // UUID v4
  buttonId: string;              // Reference to ActivityButton
  startTime: Date;               // ISO 8601 timestamp
  endTime?: Date;                // ISO 8601 timestamp
  duration?: number;             // Calculated in milliseconds
  color: string;                 // Hex color from button
  date: string;                  // YYYY-MM-DD format
}

interface ActivityButton {
  id: string;                    // UUID v4
  name: string;                  // Max 50 chars for display
  color: string;                 // Hex color #RRGGBB
  icon: string;                  // Single emoji character
  isDefault: boolean;            // Pre-configured button
  position: number;              // Grid position (0-indexed)
  isVisible: boolean;            // Show/hide in grid
  createdAt: Date;              // ISO 8601 timestamp
  updatedAt: Date;              // ISO 8601 timestamp
}

interface AppState {
  currentActivity?: Activity;    // Currently tracking
  buttons: ActivityButton[];     // All configured buttons
  activities: Activity[];        // Historical data
  settings: AppSettings;         // User preferences
}

interface AppSettings {
  gridColumns: number;           // 2-4 columns
  hapticEnabled: boolean;        // Haptic feedback toggle
  theme: 'light' | 'dark' | 'auto';
}
```

### 3.2 Storage Schema

```typescript
// AsyncStorage Keys
const STORAGE_KEYS = {
  CURRENT_ACTIVITY: '@time_tracker/current_activity',
  BUTTONS: '@time_tracker/buttons',
  ACTIVITIES: '@time_tracker/activities',
  SETTINGS: '@time_tracker/settings',
  SCHEMA_VERSION: '@time_tracker/schema_version'
};

// Storage format for activities (grouped by date)
interface StoredActivities {
  [date: string]: Activity[];  // YYYY-MM-DD as key
}
```

### 3.3 Data Flow

```
User Action → Component Event → Store Action → Storage Update
                    ↓
            State Update → Component Re-render
```

## 4. State Management

### 4.1 Zustand Store Structure

```typescript
interface TimeTrackerStore {
  // State
  currentActivity: Activity | null;
  buttons: ActivityButton[];
  todayActivities: Activity[];
  isEditMode: boolean;

  // Actions
  startActivity: (buttonId: string) => void;
  stopCurrentActivity: () => void;
  addButton: (button: Partial<ActivityButton>) => void;
  updateButton: (id: string, updates: Partial<ActivityButton>) => void;
  deleteButton: (id: string) => void;
  reorderButtons: (fromIndex: number, toIndex: number) => void;
  toggleEditMode: () => void;

  // Async Actions
  loadData: () => Promise<void>;
  saveData: () => Promise<void>;
}
```

### 4.2 State Updates

```typescript
// Example state update flow for starting an activity
startActivity: (buttonId) => {
  // 1. Stop current activity if exists
  if (state.currentActivity) {
    state.currentActivity.endTime = new Date();
    state.currentActivity.duration = calculateDuration();
    state.todayActivities.push(state.currentActivity);
  }

  // 2. Start new activity
  const button = state.buttons.find(b => b.id === buttonId);
  state.currentActivity = {
    id: generateUUID(),
    buttonId,
    startTime: new Date(),
    color: button.color,
    date: formatDate(new Date())
  };

  // 3. Persist to storage
  AsyncStorage.setItem(STORAGE_KEYS.CURRENT_ACTIVITY,
    JSON.stringify(state.currentActivity));

  // 4. Trigger haptic feedback
  if (state.settings.hapticEnabled) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
}
```

## 5. Service Layer

### 5.1 Timer Service

```typescript
class TimerService {
  private interval: NodeJS.Timeout | null = null;
  private startTime: Date;

  start(callback: (duration: number) => void): void {
    this.startTime = new Date();
    this.interval = setInterval(() => {
      const duration = Date.now() - this.startTime.getTime();
      callback(duration);
    }, 1000);
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  resume(startTime: Date, callback: (duration: number) => void): void {
    this.startTime = startTime;
    this.start(callback);
  }
}
```

### 5.2 Chart Calculation Service

```typescript
class ChartCalculationService {
  calculateSegments(activities: Activity[]): ChartSegment[] {
    const totalMinutes = 24 * 60;
    const segments: ChartSegment[] = [];

    // Group activities by button
    const grouped = this.groupByButton(activities);

    // Calculate percentages
    for (const [buttonId, acts] of grouped.entries()) {
      const totalDuration = acts.reduce((sum, act) =>
        sum + (act.duration || 0), 0);

      segments.push({
        buttonId,
        value: (totalDuration / (totalMinutes * 60000)) * 100,
        duration: totalDuration,
        color: acts[0].color
      });
    }

    // Add unaccounted time
    const trackedTime = segments.reduce((sum, seg) =>
      sum + seg.duration, 0);
    const unaccountedTime = (totalMinutes * 60000) - trackedTime;

    if (unaccountedTime > 0) {
      segments.push({
        buttonId: 'unaccounted',
        value: (unaccountedTime / (totalMinutes * 60000)) * 100,
        duration: unaccountedTime,
        color: '#E0E0E0'
      });
    }

    return segments;
  }

  getCurrentTimeAngle(): number {
    const now = new Date();
    const minutesSinceMidnight = now.getHours() * 60 + now.getMinutes();
    return (minutesSinceMidnight / (24 * 60)) * 360;
  }
}
```

### 5.3 Migration Service

```typescript
class MigrationService {
  private currentVersion = 1;

  async migrate(): Promise<void> {
    const storedVersion = await AsyncStorage.getItem(
      STORAGE_KEYS.SCHEMA_VERSION
    );
    const version = storedVersion ? parseInt(storedVersion) : 0;

    if (version < this.currentVersion) {
      await this.runMigrations(version, this.currentVersion);
      await AsyncStorage.setItem(
        STORAGE_KEYS.SCHEMA_VERSION,
        this.currentVersion.toString()
      );
    }
  }

  private async runMigrations(from: number, to: number): Promise<void> {
    // Migration logic for schema updates
    if (from < 1) {
      await this.migrateToV1();
    }
  }
}
```

## 6. UI/UX Design Patterns

### 6.1 Animation Specifications

```typescript
// Animation configurations
const ANIMATIONS = {
  buttonPress: {
    scale: 0.95,
    duration: 100,
    easing: Easing.out(Easing.quad)
  },
  pulsingBorder: {
    minOpacity: 0.3,
    maxOpacity: 1.0,
    duration: 1500,
    easing: Easing.inOut(Easing.ease)
  },
  modalSlideUp: {
    from: { translateY: 500 },
    to: { translateY: 0 },
    duration: 300,
    easing: Easing.out(Easing.cubic)
  },
  textScroll: {
    speed: 30, // pixels per second
    delay: 2000, // wait before scrolling
    gap: 40 // gap before repeat
  }
};
```

### 6.2 Haptic Feedback Patterns

```typescript
const HAPTIC_PATTERNS = {
  buttonTap: Haptics.ImpactFeedbackStyle.Light,
  longPress: Haptics.ImpactFeedbackStyle.Medium,
  modalOpen: Haptics.ImpactFeedbackStyle.Light,
  deleteConfirm: Haptics.NotificationFeedbackType.Warning,
  addSuccess: Haptics.NotificationFeedbackType.Success
};
```

### 6.3 Color System

```typescript
const COLORS = {
  // Default activity colors
  activities: {
    sleep: '#2C3E50',
    work: '#8E44AD',
    meal: '#E67E22',
    exercise: '#27AE60',
    commute: '#7F8C8D',
    study: '#16A085',
    break: '#8B4513',
    entertainment: '#E91E63'
  },

  // UI colors
  ui: {
    background: '#FFFFFF',
    backgroundDark: '#000000',
    surface: '#F5F5F5',
    surfaceDark: '#1C1C1E',
    primary: '#007AFF',
    danger: '#FF3B30',
    success: '#34C759',
    unaccounted: '#E0E0E0',
    timeIndicator: '#FF0000'
  }
};
```

## 7. Performance Optimizations

### 7.1 Rendering Optimizations
- **React.memo** for ActivityButton components
- **useMemo** for chart calculations
- **FlatList** for activity grid with getItemLayout
- **InteractionManager** for heavy operations

### 7.2 Data Optimizations
- Lazy loading historical data
- Pagination for activity history (30 days at a time)
- Debounced storage writes (500ms)
- Activity data compression for storage

### 7.3 Memory Management
- Clean up old activities (> 1 year)
- Limit chart data points to visible segments
- Recycle button components in grid
- Clear animation listeners on unmount

## 8. Error Handling

### 8.1 Error Types

```typescript
enum ErrorType {
  STORAGE_ERROR = 'STORAGE_ERROR',
  SYNC_ERROR = 'SYNC_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  MIGRATION_ERROR = 'MIGRATION_ERROR'
}

interface AppError {
  type: ErrorType;
  message: string;
  timestamp: Date;
  context?: any;
}
```

### 8.2 Error Recovery
- Automatic retry for storage operations (3 attempts)
- Fallback to memory storage if AsyncStorage fails
- Graceful degradation for chart rendering errors
- Activity recovery from incomplete state

## 9. Security Considerations

### 9.1 Data Protection
- No sensitive data transmission (local only)
- AsyncStorage encryption (iOS native)
- No third-party analytics or tracking
- No network requests in MVP

### 9.2 Privacy
- All data stored locally on device
- No user authentication required
- No data sharing features
- Clear data option in settings

## 10. Testing Strategy

### 10.1 Unit Testing
- Jest for business logic
- React Native Testing Library for components
- Mock AsyncStorage for storage tests
- Mock Haptics API for feedback tests

### 10.2 Integration Testing
- Test activity state transitions
- Test data persistence across restarts
- Test chart calculations accuracy
- Test button reordering logic

### 10.3 E2E Testing
- Detox for iOS simulator testing
- User flow scenarios
- Performance benchmarks
- Memory leak detection

## 11. Deployment Architecture

### 11.1 Build Configuration

```javascript
// app.json
{
  "expo": {
    "name": "Time Tracker",
    "slug": "time-tracker",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.timetracker.app",
      "buildNumber": "1.0.0"
    },
    "updates": {
      "fallbackToCacheTimeout": 0
    },
    "assetBundlePatterns": ["**/*"]
  }
}
```

### 11.2 Development Workflow
1. Local development with Expo Go
2. Testing on physical iOS devices
3. EAS Build for production builds
4. TestFlight for beta testing
5. App Store release

## 12. Future Scalability

### 12.1 Planned Enhancements
- Widget support for iOS 14+
- Siri Shortcuts integration
- Apple Watch companion app
- iCloud sync capability
- Export data functionality

### 12.2 Architecture Extensions
- Repository pattern for data layer
- Dependency injection for services
- Feature flags for gradual rollouts
- Analytics abstraction layer
- Modular component library