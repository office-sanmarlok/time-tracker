/**
 * @file src/components/FloatingAddButton.tsx
 * @description Floating action button for adding new activities
 * @purpose Provide quick access to add custom activities
 */

import React, { useRef } from 'react';
import { TouchableOpacity, StyleSheet, Text, Animated } from 'react-native';
import { UI_COLORS } from '@/constants/colors';
import { triggerHaptic, HAPTIC_PATTERNS } from '@/constants/haptics';
import { useTimeTrackerStore } from '@/store/useTimeTrackerStore';

interface FloatingAddButtonProps {
  onPress: () => void;
}

export const FloatingAddButton: React.FC<FloatingAddButtonProps> = ({ onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const settings = useTimeTrackerStore(state => state.settings);

  const handlePressIn = () => {
    triggerHaptic(HAPTIC_PATTERNS.buttonTap, settings.hapticEnabled);
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
      speed: 20,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 5,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.button}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
        accessible={true}
        accessibilityLabel="Add new activity"
        accessibilityHint="Opens a modal to create a custom activity button"
        accessibilityRole="button"
      >
        <Text style={styles.icon}>+</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: UI_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  icon: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '300',
  },
});