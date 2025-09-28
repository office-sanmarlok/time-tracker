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
    name: 'Sleeping',
    color: ACTIVITY_COLORS.sleeping,
    icon: '😴',
    isDefault: true,
    position: 0,
    isVisible: true
  },
  {
    name: 'Studying',
    color: ACTIVITY_COLORS.studying,
    icon: '📚',
    isDefault: true,
    position: 1,
    isVisible: true
  },
  {
    name: 'Cycling',
    color: ACTIVITY_COLORS.cycling,
    icon: '🚴',
    isDefault: true,
    position: 2,
    isVisible: true
  },
  {
    name: 'Eating',
    color: ACTIVITY_COLORS.eating,
    icon: '🍽️',
    isDefault: true,
    position: 3,
    isVisible: true
  },
  {
    name: 'Work',
    color: ACTIVITY_COLORS.work,
    icon: '💼',
    isDefault: true,
    position: 4,
    isVisible: false
  },
  {
    name: 'Exercise',
    color: ACTIVITY_COLORS.exercise,
    icon: '🏃',
    isDefault: true,
    position: 5,
    isVisible: false
  },
  {
    name: 'Rest',
    color: ACTIVITY_COLORS.rest,
    icon: '☕',
    isDefault: true,
    position: 6,
    isVisible: false
  },
  {
    name: 'Hobby',
    color: ACTIVITY_COLORS.hobby,
    icon: '🎮',
    isDefault: true,
    position: 7,
    isVisible: false
  },
  {
    name: 'Other',
    color: ACTIVITY_COLORS.other,
    icon: '📌',
    isDefault: true,
    position: 8,
    isVisible: false
  }
];

/**
 * Initial starter buttons shown on first launch
 * These are automatically visible in the grid
 */
export const STARTER_BUTTONS = ['Sleeping', 'Studying', 'Cycling', 'Eating'];

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