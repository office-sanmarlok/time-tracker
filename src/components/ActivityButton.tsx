/**
 * @file src/components/ActivityButton.tsx
 * @description Interactive button component for activity tracking
 * @purpose Display activity with timer, handle press/long press, show active state
 */

import React, { useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { ActivityButton as ActivityButtonType } from '@/types/models';
import { useActivityTimer } from '@/hooks/useTimer';
import { useTimeTrackerStore } from '@/store/useTimeTrackerStore';
import { ANIMATIONS } from '@/constants/animations';
import { UI_COLORS } from '@/constants/colors';
import { triggerHaptic, HAPTIC_PATTERNS } from '@/constants/haptics';

interface ActivityButtonProps {
  button: ActivityButtonType;
  onPress: () => void;
  onLongPress: () => void;
  isEditMode: boolean;
  gridColumns: number;
}

const { width: screenWidth } = Dimensions.get('window');

const ActivityButtonComponent: React.FC<ActivityButtonProps> = ({
  button,
  onPress,
  onLongPress,
  isEditMode,
  gridColumns,
}) => {
  const { isActive, formattedDuration } = useActivityTimer(button.id);
  const settings = useTimeTrackerStore(state => state.settings);

  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0.3)).current;
  const textScrollAnim = useRef(new Animated.Value(0)).current;

  // Calculate button size based on grid columns
  const buttonSize = (screenWidth - 32 - (gridColumns - 1) * 12) / gridColumns;
  const shouldScrollText = button.name.length > 8;

  // Pulsing border animation for active state
  useEffect(() => {
    if (isActive) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: ANIMATIONS.pulsingBorder.duration / 2,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: ANIMATIONS.pulsingBorder.minOpacity,
            duration: ANIMATIONS.pulsingBorder.duration / 2,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();

      return () => pulse.stop();
    } else {
      pulseAnim.setValue(0.3);
    }
    return undefined;
  }, [isActive, pulseAnim]);

  // Text scrolling animation for long names
  useEffect(() => {
    if (shouldScrollText && !isActive) {
      const scroll = Animated.loop(
        Animated.sequence([
          Animated.delay(ANIMATIONS.textScroll.delay),
          Animated.timing(textScrollAnim, {
            toValue: -100,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.delay(500),
          Animated.timing(textScrollAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      scroll.start();

      return () => scroll.stop();
    }
    return undefined;
  }, [shouldScrollText, isActive, textScrollAnim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: ANIMATIONS.buttonPress.scale,
      useNativeDriver: true,
      speed: 20,
      bounciness: 0,
    }).start();

    // Trigger haptic feedback
    triggerHaptic(HAPTIC_PATTERNS.buttonTap, settings.hapticEnabled);
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 0,
    }).start();
  };

  const handleLongPress = () => {
    triggerHaptic(HAPTIC_PATTERNS.longPress, settings.hapticEnabled);
    onLongPress();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: buttonSize,
          height: buttonSize,
          transform: [{ scale: scaleAnim }],
        },
        isEditMode && styles.editMode,
      ]}
    >
      {isActive && (
        <Animated.View
          style={[
            styles.activeBorder,
            {
              opacity: pulseAnim,
            },
          ]}
        />
      )}

      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: button.color },
          isActive && styles.activeButton,
        ]}
        onPress={onPress}
        onLongPress={handleLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        delayLongPress={ANIMATIONS.hapticTriggers.longPressDelay}
        activeOpacity={0.8}
        accessible={true}
        accessibilityLabel={`${button.name} activity button${isActive ? ', currently active' : ''}`}
        accessibilityHint="Tap to start or stop this activity. Long press for options."
        accessibilityRole="button"
        accessibilityState={{ selected: isActive }}
      >
        <View style={styles.content}>
          <Text style={styles.icon}>{button.icon}</Text>

          <View style={styles.labelContainer}>
            <Animated.Text
              style={[
                styles.label,
                shouldScrollText && {
                  transform: [{ translateX: textScrollAnim }],
                },
              ]}
              numberOfLines={1}
            >
              {button.name}
            </Animated.Text>
          </View>

          {isActive && formattedDuration && (
            <View style={styles.timerContainer}>
              <Text style={styles.timer}>{formattedDuration}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {isEditMode && (
        <View style={styles.dragHandle}>
          <Text style={styles.dragHandleText}>⋮⋮</Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 6,
    position: 'relative',
  },
  button: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeButton: {
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  activeBorder: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: UI_COLORS.primary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 28,
    marginBottom: 4,
  },
  labelContainer: {
    width: '100%',
    overflow: 'hidden',
  },
  label: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  timerContainer: {
    position: 'absolute',
    bottom: -8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  timer: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  editMode: {
    opacity: 0.9,
  },
  dragHandle: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 2,
  },
  dragHandleText: {
    fontSize: 10,
    color: '#666',
  },
});

// Memoize the component to prevent unnecessary re-renders
export const ActivityButton = React.memo(ActivityButtonComponent, (prevProps, nextProps) => {
  return (
    prevProps.button.id === nextProps.button.id &&
    prevProps.button.name === nextProps.button.name &&
    prevProps.button.color === nextProps.button.color &&
    prevProps.button.icon === nextProps.button.icon &&
    prevProps.isEditMode === nextProps.isEditMode &&
    prevProps.gridColumns === nextProps.gridColumns
  );
});