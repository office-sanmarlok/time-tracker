/**
 * @file src/components/FigmaToggleSwitch.tsx
 * @description Figma-style toggle switch component for activities
 * @purpose Reusable toggle switch matching Figma design
 */

import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  Dimensions,
} from 'react-native';

interface FigmaToggleSwitchProps {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
  onToggle: (id: string) => void;
  disabled?: boolean;
  showAddBadge?: boolean;
  style?: ViewStyle;
}

export const FigmaToggleSwitch: React.FC<FigmaToggleSwitchProps> = ({
  id,
  name,
  color,
  isActive,
  onToggle,
  disabled = false,
  showAddBadge = false,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={() => onToggle(id)}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <View style={styles.innerContent}>
        <Text style={[styles.label, disabled && styles.labelDisabled]}>
          {name}
        </Text>
        <View style={styles.switchWrapper}>
          <View style={[
            styles.switchTrack,
            isActive && { backgroundColor: color + '20' },
            disabled && styles.switchTrackDisabled,
          ]}>
            <View style={[
              styles.switchThumb,
              isActive && {
                backgroundColor: color,
                transform: [{ translateX: 24 }]
              },
              disabled && styles.switchThumbDisabled,
            ]} />
          </View>
        </View>
      </View>
      {showAddBadge && (
        <View style={styles.addBadge}>
          <Text style={styles.addBadgeText}>+</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const { width: screenWidth } = Dimensions.get('window');
// Calculate card width for 2 columns with padding
const CARD_WIDTH = (screenWidth - 34 * 2 - 16) / 2; // 34 padding on each side, 16 gap between

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    aspectRatio: 1, // Square card
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    padding: 16,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  innerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 18,
    fontFamily: 'System',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 20,
  },
  labelDisabled: {
    opacity: 0.6,
  },
  switchWrapper: {
    width: 69,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchTrack: {
    width: 51,
    height: 31,
    borderRadius: 15.5,
    backgroundColor: '#E0E0E0',
    padding: 2,
    justifyContent: 'center',
  },
  switchTrackDisabled: {
    opacity: 0.5,
  },
  switchThumb: {
    width: 27,
    height: 27,
    borderRadius: 13.5,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 4,
  },
  switchThumbDisabled: {
    opacity: 0.7,
  },
  addBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#4CAF50',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  addBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});