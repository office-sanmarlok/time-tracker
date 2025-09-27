/**
 * @file src/components/AvailableActivities.tsx
 * @description Display available preset activities that can be quickly added
 * @purpose Show greyed-out preset buttons with green "+" icon for quick addition
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { useTimeTrackerStore } from '@/store/useTimeTrackerStore';
import { UI_COLORS } from '@/constants/colors';
import { triggerHaptic, HAPTIC_PATTERNS } from '@/constants/haptics';
import { getStarterButtons } from '@/constants/defaultButtons';

export const AvailableActivities: React.FC = () => {
  const buttons = useTimeTrackerStore(state => state.buttons);
  const addPresetButton = useTimeTrackerStore(state => state.addPresetButton);
  const settings = useTimeTrackerStore(state => state.settings);

  const availablePresets = useMemo(() => {
    const visibleNames = new Set(
      buttons
        .filter(b => b.isVisible && b.isDefault)
        .map(b => b.name)
    );

    return getStarterButtons().filter(b => !visibleNames.has(b.name));
  }, [buttons]);

  const handleAddPreset = async (presetName: string) => {
    triggerHaptic(HAPTIC_PATTERNS.buttonTap, settings.hapticEnabled);
    await addPresetButton(presetName);
  };

  if (availablePresets.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>All preset activities are in use</Text>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {availablePresets.map((preset) => (
        <View key={preset.name} style={styles.presetWrapper}>
          <TouchableOpacity
            style={[
              styles.presetButton,
              { backgroundColor: preset.color, opacity: 0.5 }
            ]}
            onPress={() => handleAddPreset(preset.name)}
            activeOpacity={0.8}
            accessible={true}
            accessibilityLabel={`Add ${preset.name} activity`}
            accessibilityHint="Tap to add this preset activity to your grid"
            accessibilityRole="button"
          >
            <Text style={styles.icon}>{preset.icon}</Text>
            <Text style={styles.name} numberOfLines={1}>
              {preset.name}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleAddPreset(preset.name)}
            hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
          >
            <Text style={styles.addIcon}>+</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingRight: 16,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: UI_COLORS.textTertiary,
    fontSize: 13,
    fontStyle: 'italic',
  },
  presetWrapper: {
    marginRight: 12,
    position: 'relative',
  },
  presetButton: {
    width: 80,
    height: 80,
    borderRadius: 16,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  icon: {
    fontSize: 24,
    marginBottom: 4,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: UI_COLORS.success,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  addIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});