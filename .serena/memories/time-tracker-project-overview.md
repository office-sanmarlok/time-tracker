# Time Tracker Project Overview

## Project Summary
iOS time tracking app built with React Native/Expo featuring a 24-hour circular clock visualization. The app uses a Figma-inspired toggle-based interface for activity tracking.

## Tech Stack
- **Framework**: React Native 0.81.4 with Expo SDK 54
- **Language**: TypeScript 5.9.2
- **State Management**: Zustand 5.0.8
- **Data Persistence**: AsyncStorage
- **UI Libraries**: 
  - React Native SVG (clock chart)
  - React Native Reanimated (animations)
  - Expo Haptics (iOS feedback)
- **Dev Tools**: ESLint, Prettier

## Architecture

### Directory Structure
```
src/
├── components/         # UI components (mix of active and legacy)
│   ├── modals/        # Unused modal components
│   ├── ClockChart.tsx # ACTIVE: 24-hour clock visualization
│   ├── FigmaToggleSwitch.tsx # ACTIVE: Toggle switches
│   ├── TimeDisplay.tsx # ACTIVE: Time display
│   ├── ColorPicker.tsx # ACTIVE: Color selection
│   └── [legacy components] # Unused grid/button components
├── screens/           
│   └── FigmaScreen.tsx # ACTIVE: Main app screen
├── store/          
│   └── useTimeTrackerStore.ts # Zustand store
├── services/          # Business logic services
├── hooks/             # Custom React hooks
├── types/             # TypeScript definitions
├── constants/         # App constants
└── utils/             # Helper functions
```

### Active Application Flow
```
App.tsx → FigmaScreen.tsx → [ClockChart, TimeDisplay, FigmaToggleSwitch, ColorPicker]
```

## Current Features (Active UI)

### 1. 24-Hour Clock Visualization (ClockChart)
- Circular SVG clock face with activity segments
- Real-time position indicator (red line)
- Touch-interactive segments
- Development mode (1 minute = 24 hours for testing)
- Gradient fills for active activities

### 2. Toggle-Based Activity Control
- FigmaToggleSwitch components for each activity
- One-tap switching between activities
- Inline modal for adding custom activities
- Pre-configured activities: Sleeping, Studying, Cycling, Eating

### 3. Data Management
- Zustand store for state management
- AsyncStorage for persistence
- Daily activity grouping
- Automatic saving on state changes

## Component Status

### ✅ ACTIVE Components (Used in current app)
- `ClockChart.tsx` - 24-hour clock visualization
- `FigmaToggleSwitch.tsx` - Activity toggle switches
- `TimeDisplay.tsx` - Current time display
- `ColorPicker.tsx` - Color selection for new activities
- `FigmaScreen.tsx` - Main application screen

### ❌ LEGACY/UNUSED Components
- `HomeScreen.tsx` - Complete alternate UI (references non-existent PieChart)
- `ActivityButton.tsx` - Grid button with animations
- `ActivityGrid.tsx` - Grid layout system
- `ActivityToggle.tsx` - Simple toggle component
- `ActivityToggleList.tsx` - List of toggles
- `AvailableActivities.tsx` - Preset activities section
- `FloatingAddButton.tsx` - FAB button
- `ErrorBoundary.tsx` - Error handling (not imported)
- **All components in `modals/` folder**:
  - `BaseModal.tsx`
  - `AddActivityModal.tsx`
  - `EditActivityModal.tsx`
  - `ActivityOptionsModal.tsx`

## State Management

### Zustand Store Structure
- **Core State**: currentActivity, buttons, activities, settings
- **UI State**: isEditMode, isLoading, error
- **Timer State**: timerState for active tracking
- **Actions**: 
  - Activity management (start/stop/switch)
  - Button CRUD operations
  - Settings updates
  - Data persistence

### Data Models
```typescript
Activity {
  id, buttonId, startTime, endTime?, 
  duration?, color, date
}

ActivityButton {
  id, name, color, icon, isDefault,
  position, isVisible, createdAt, updatedAt
}

AppSettings {
  gridColumns, hapticEnabled, theme
}
```

## Services

- **ChartCalculationService**: Clock segment calculations, time-to-angle conversions
- **StorageService**: AsyncStorage wrapper with retry logic
- **TimerService**: Timer management for active tracking
- **MigrationService**: Data migration between versions

## Known Issues & Limitations

1. **Dual UI Implementation**: ~60% of components are unused legacy code
2. **No Test Coverage**: No testing framework configured
3. **Missing PieChart**: HomeScreen references non-existent component
4. **Unused Error Boundary**: ErrorBoundary component not integrated

## Development Configuration

### Scripts
- `npm start` - Start Expo dev server
- `npm run lint` - ESLint checking
- `npm run format` - Prettier formatting
- `npm run type-check` - TypeScript validation

### Key Files
- `CLAUDE.md` - AI assistant instructions (emphasizes small, safe changes)
- `mcp.json` - MCP server configuration
- `tsconfig.json` - TypeScript config with @/ path alias

## Recent Development Focus
- Clock chart implementation and bug fixes
- 24-hour visualization improvements
- Dev mode for testing (1-minute cycles)
- Clock alignment and offset corrections
- Figma-style UI implementation

## Technical Debt & Improvement Opportunities

### Immediate
1. Remove unused legacy components (~15 files)
2. Implement ErrorBoundary in App.tsx
3. Add test framework and basic tests

### Future Enhancements
1. Data export/import functionality
2. Statistics and analytics views
3. Cloud sync capability
4. iOS widget support
5. Activity templates and routines
6. Time goals and notifications