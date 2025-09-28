/**
 * @file src/components/TimeDisplay.tsx
 * @description Display time spent on current activity
 * @purpose Show real-time duration tracking
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTimeTrackerStore } from '@/store/useTimeTrackerStore';

export const TimeDisplay: React.FC = () => {
  const currentActivity = useTimeTrackerStore(state => state.currentActivity);
  const buttons = useTimeTrackerStore(state => state.buttons);
  const [duration, setDuration] = useState('00:00:00');

  useEffect(() => {
    // Always update duration, even for blank activity
    const updateDuration = () => {
      if (!currentActivity) {
        setDuration('00:00:00');
        return;
      }

      const now = new Date();
      const start = new Date(currentActivity.startTime);
      const diff = Math.floor((now.getTime() - start.getTime()) / 1000);

      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;

      setDuration(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    updateDuration();
    const interval = setInterval(updateDuration, 1000);

    return () => clearInterval(interval);
  }, [currentActivity]);

  // Always show timer, but indicate if it's blank time
  if (!currentActivity) {
    return (
      <View style={styles.container}>
        <Text style={styles.inactiveText}>Initializing...</Text>
      </View>
    );
  }

  const button = buttons.find(b => b.id === currentActivity.buttonId);
  const activityName = currentActivity.buttonId === 'blank' 
    ? 'Inactive' 
    : (button?.name || 'Unknown');

  return (
    <View style={styles.container}>
      <Text style={[
        styles.activityName,
        currentActivity.buttonId === 'blank' && styles.blankActivityName
      ]}>
        {activityName}
      </Text>
      <Text style={styles.duration}>{duration}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  activityName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  blankActivityName: {
    color: '#999',
    fontStyle: 'italic',
  },
  duration: {
    fontSize: 32,
    fontWeight: '300',
    color: '#000',
    fontVariant: ['tabular-nums'],
  },
  inactiveText: {
    fontSize: 16,
    color: '#999',
  },
});