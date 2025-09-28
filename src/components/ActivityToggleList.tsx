/**
 * @file src/components/ActivityToggleList.tsx
 * @description List of activity toggle switches
 * @purpose Display activities in a vertical list with toggle switches
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { ActivityToggle } from './ActivityToggle';
import { useTimeTrackerStore } from '@/store/useTimeTrackerStore';
import { UI_COLORS } from '@/constants/colors';

export const ActivityToggleList: React.FC = () => {
  const buttons = useTimeTrackerStore(state => state.buttons);
  const currentActivity = useTimeTrackerStore(state => state.currentActivity);
  const switchActivity = useTimeTrackerStore(state => state.switchActivity);
  const stopTracking = useTimeTrackerStore(state => state.stopTracking);

  const visibleButtons = useMemo(() => {
    return buttons
      .filter(b => b.isVisible)
      .sort((a, b) => a.position - b.position);
  }, [buttons]);

  const handleToggle = (buttonId: string) => {
    if (currentActivity?.buttonId === buttonId) {
      stopTracking();
    } else {
      switchActivity(buttonId);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activities</Text>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {visibleButtons.map(button => (
          <ActivityToggle
            key={button.id}
            button={button}
            isActive={currentActivity?.buttonId === button.id}
            onToggle={handleToggle}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: UI_COLORS.textSecondary,
    marginLeft: 16,
    marginBottom: 8,
    marginTop: 16,
  },
});