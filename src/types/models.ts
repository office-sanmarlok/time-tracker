/**
 * @file src/types/models.ts
 * @description Core data models for the Time Tracker app
 * @purpose Define TypeScript interfaces for all data structures used in the application
 */

/**
 * Represents a single tracked activity session
 */
export interface Activity {
  id: string;                    // UUID v4
  buttonId: string;              // Reference to ActivityButton
  startTime: Date;               // ISO 8601 timestamp
  endTime?: Date;                // ISO 8601 timestamp (optional for active)
  duration?: number;             // Calculated in milliseconds
  color: string;                 // Hex color from button
  date: string;                  // YYYY-MM-DD format for grouping
}

/**
 * Represents a customizable activity button
 */
export interface ActivityButton {
  id: string;                    // UUID v4
  name: string;                  // Display name (max 50 chars for UI)
  color: string;                 // Hex color #RRGGBB
  icon: string;                  // Single emoji character
  isDefault: boolean;            // Pre-configured button
  position: number;              // Grid position (0-indexed)
  isVisible: boolean;            // Show/hide in grid
  createdAt: Date;              // ISO 8601 timestamp
  updatedAt: Date;              // ISO 8601 timestamp
}

/**
 * Represents a summary of activities for a single day
 */
export interface DaySummary {
  date: string;                  // YYYY-MM-DD format
  activities: Activity[];        // All activities for this day
  totalTrackedTime: number;     // Sum of all durations in milliseconds
  unaccountedTime: number;      // Time not tracked in milliseconds
}

/**
 * Application settings and preferences
 */
export interface AppSettings {
  gridColumns: number;           // 2-4 columns for button grid
  hapticEnabled: boolean;        // Toggle for haptic feedback
  theme: 'light' | 'dark' | 'auto'; // UI theme preference
}

/**
 * Root application state
 */
export interface AppState {
  currentActivity?: Activity;    // Currently tracking activity
  buttons: ActivityButton[];     // All configured buttons
  activities: Activity[];        // Historical activity data
  settings: AppSettings;         // User preferences
}

/**
 * Chart segment data for pie chart visualization
 */
export interface ChartSegment {
  buttonId: string;              // Reference to activity button
  value: number;                 // Percentage of total time
  duration: number;              // Total milliseconds
  color: string;                 // Hex color for segment
  label?: string;                // Optional display label
}

/**
 * Storage format for activities grouped by date
 */
export interface StoredActivities {
  [date: string]: Activity[];    // YYYY-MM-DD as key
}

/**
 * Modal state management
 */
export interface ModalState {
  isAddActivityOpen: boolean;
  isEditActivityOpen: boolean;
  isActivityOptionsOpen: boolean;
  selectedButton?: ActivityButton;
  selectedActivity?: Activity;
}

/**
 * Form data for creating/editing activities
 */
export interface ActivityFormData {
  name: string;
  color: string;
  icon: string;
}

/**
 * Animation state for UI components
 */
export interface AnimationState {
  activeButtonId?: string;
  isPulsing: boolean;
  draggedButtonId?: string;
  isEditMode: boolean;
}

/**
 * Timer state for active tracking
 */
export interface TimerState {
  startTime: Date;
  currentDuration: number;      // Milliseconds
  intervalId?: NodeJS.Timeout;
}

/**
 * Error state for error handling
 */
export interface AppError {
  type: 'STORAGE_ERROR' | 'SYNC_ERROR' | 'VALIDATION_ERROR' | 'MIGRATION_ERROR';
  message: string;
  timestamp: Date;
  context?: any;
}

/**
 * Type guards for runtime type checking
 */
export const isActivity = (obj: any): obj is Activity => {
  return obj &&
    typeof obj.id === 'string' &&
    typeof obj.buttonId === 'string' &&
    obj.startTime instanceof Date &&
    typeof obj.color === 'string' &&
    typeof obj.date === 'string';
};

export const isActivityButton = (obj: any): obj is ActivityButton => {
  return obj &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.color === 'string' &&
    typeof obj.icon === 'string' &&
    typeof obj.isDefault === 'boolean' &&
    typeof obj.position === 'number' &&
    typeof obj.isVisible === 'boolean';
};