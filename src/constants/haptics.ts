/**
 * @file src/constants/haptics.ts
 * @description Haptic feedback patterns for iOS
 * @purpose Define all haptic feedback configurations for consistent tactile experience
 */

import * as Haptics from 'expo-haptics';

/**
 * Haptic feedback patterns for different interactions
 */
export const HAPTIC_PATTERNS = {
  // Button interactions
  buttonTap: Haptics.ImpactFeedbackStyle.Light,
  longPress: Haptics.ImpactFeedbackStyle.Medium,
  buttonDelete: Haptics.ImpactFeedbackStyle.Heavy,

  // Modal interactions
  modalOpen: Haptics.ImpactFeedbackStyle.Light,
  modalClose: Haptics.ImpactFeedbackStyle.Light,

  // Activity state changes
  activityStart: Haptics.ImpactFeedbackStyle.Light,
  activityStop: Haptics.ImpactFeedbackStyle.Light,
  activitySwitch: Haptics.ImpactFeedbackStyle.Light,

  // Add/Edit actions
  addSuccess: Haptics.NotificationFeedbackType.Success,
  deleteConfirm: Haptics.NotificationFeedbackType.Warning,
  error: Haptics.NotificationFeedbackType.Error,

  // Drag and drop
  dragStart: Haptics.ImpactFeedbackStyle.Light,
  dragDrop: Haptics.ImpactFeedbackStyle.Medium,

  // Selection feedback is a separate function, not a style
  // We'll handle it with the triggerSelectionHaptic function
} as const;

/**
 * Helper function to trigger haptic feedback
 * Checks if haptics are enabled in settings before triggering
 */
export const triggerHaptic = async (
  pattern: Haptics.ImpactFeedbackStyle | Haptics.NotificationFeedbackType,
  enabled: boolean = true
): Promise<void> => {
  if (!enabled) return;

  try {
    if (typeof pattern === 'string') {
      // It's a NotificationFeedbackType
      await Haptics.notificationAsync(pattern as Haptics.NotificationFeedbackType);
    } else {
      // It's an ImpactFeedbackStyle
      await Haptics.impactAsync(pattern as Haptics.ImpactFeedbackStyle);
    }
  } catch (error) {
    // Silently fail if haptics are not available
    console.warn('Haptic feedback failed:', error);
  }
};

/**
 * Trigger selection haptic feedback
 */
export const triggerSelectionHaptic = async (enabled: boolean = true): Promise<void> => {
  if (!enabled) return;

  try {
    await Haptics.selectionAsync();
  } catch (error) {
    console.warn('Selection haptic failed:', error);
  }
};