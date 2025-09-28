/**
 * @file src/constants/colors.ts
 * @description Color palette for the Time Tracker app
 * @purpose Define all colors used throughout the application for consistent theming
 */

// Default activity colors based on Figma design
export const ACTIVITY_COLORS = {
  sleeping: '#9E9E9E',   // Gray
  studying: '#FF5722',   // Orange
  cycling: '#00BCD4',    // Cyan
  eating: '#CDDC39',     // Lime
  work: '#8E44AD',       // Purple (keeping for existing data)
  exercise: '#27AE60',   // Green (keeping for existing data)
  rest: '#2196F3',       // Blue
  hobby: '#FFC107',      // Amber
  other: '#795548'       // Brown
} as const;

// UI colors for components and states
export const UI_COLORS = {
  // Backgrounds
  background: '#FFFFFF',
  backgroundDark: '#000000',
  surface: '#F5F5F5',
  surfaceDark: '#1C1C1E',

  // Primary colors
  primary: '#007AFF',
  primaryDark: '#0A84FF',

  // Semantic colors
  danger: '#FF3B30',
  success: '#34C759',
  warning: '#FF9500',

  // Chart specific
  unaccounted: '#E0E0E0',
  timeIndicator: '#FF0000',

  // Text colors
  textPrimary: '#000000',
  textSecondary: '#3C3C43',
  textTertiary: '#C7C7CC',
  textPrimaryDark: '#FFFFFF',
  textSecondaryDark: '#EBEBF5',

  // Border colors
  border: '#C6C6C8',
  borderLight: '#E5E5EA',

  // Shadow colors
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowDark: 'rgba(0, 0, 0, 0.3)'
} as const;

// Color palette for custom activity creation
export const CUSTOM_ACTIVITY_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Mint
  '#FFEAA7', // Yellow
  '#DDA0DD', // Plum
  '#98D8C8', // Seafoam
  '#FFB6C1', // Pink
  '#87CEEB', // Sky Blue
  '#F4A460', // Sandy Brown
  '#9370DB', // Medium Purple
  '#20B2AA', // Light Sea Green
] as const;

// Animation colors for active states
export const ANIMATION_COLORS = {
  pulsingBorderStart: 'rgba(0, 122, 255, 0.3)',
  pulsingBorderEnd: 'rgba(0, 122, 255, 1.0)',
  buttonPressOverlay: 'rgba(0, 0, 0, 0.05)'
} as const;

// Type exports for TypeScript
export type ActivityColorKey = keyof typeof ACTIVITY_COLORS;
export type UIColorKey = keyof typeof UI_COLORS;
export type CustomActivityColor = typeof CUSTOM_ACTIVITY_COLORS[number];