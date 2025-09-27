/**
 * @file src/constants/defaultButtons.ts
 * @description Default activity button configurations
 * @purpose Provide pre-configured activity buttons for initial app setup
 */

import { ActivityButton } from '@/types/models';
import { ACTIVITY_COLORS } from './colors';

/**
 * Default activity buttons available to users
 * These are shown as preset options that can be quickly added
 */
export const DEFAULT_ACTIVITY_BUTTONS: Omit<ActivityButton, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Sleep',
    color: ACTIVITY_COLORS.sleep,
    icon: '😴',
    isDefault: true,
    position: 0,
    isVisible: false  // Initially not shown, user adds as needed
  },
  {
    name: 'Work',
    color: ACTIVITY_COLORS.work,
    icon: '💼',
    isDefault: true,
    position: 1,
    isVisible: false
  },
  {
    name: 'Meal',
    color: ACTIVITY_COLORS.meal,
    icon: '🍽️',
    isDefault: true,
    position: 2,
    isVisible: false
  },
  {
    name: 'Exercise',
    color: ACTIVITY_COLORS.exercise,
    icon: '🏃',
    isDefault: true,
    position: 3,
    isVisible: false
  },
  {
    name: 'Commute',
    color: ACTIVITY_COLORS.commute,
    icon: '🚗',
    isDefault: true,
    position: 4,
    isVisible: false
  },
  {
    name: 'Study',
    color: ACTIVITY_COLORS.study,
    icon: '📚',
    isDefault: true,
    position: 5,
    isVisible: false
  },
  {
    name: 'Break',
    color: ACTIVITY_COLORS.break,
    icon: '☕',
    isDefault: true,
    position: 6,
    isVisible: false
  },
  {
    name: 'Entertainment',
    color: ACTIVITY_COLORS.entertainment,
    icon: '🎮',
    isDefault: true,
    position: 7,
    isVisible: false
  }
];

/**
 * Initial starter buttons shown on first launch
 * These are automatically visible in the grid
 */
export const STARTER_BUTTONS = ['Work', 'Break', 'Meal'];

/**
 * Get default button by name
 */
export const getDefaultButton = (name: string) => {
  return DEFAULT_ACTIVITY_BUTTONS.find(button => button.name === name);
};

/**
 * Get starter buttons for initial setup
 */
export const getStarterButtons = () => {
  return DEFAULT_ACTIVITY_BUTTONS.filter(button =>
    STARTER_BUTTONS.includes(button.name)
  ).map((button, index) => ({
    ...button,
    position: index,
    isVisible: true
  }));
};