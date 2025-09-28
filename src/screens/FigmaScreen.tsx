/**
 * @file src/screens/FigmaScreen.tsx
 * @description Exact replica of Figma design
 * @purpose Clean implementation matching Figma mockup exactly
 */

import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { FunctionalFigmaChart } from '@/components/FunctionalFigmaChart';
import { TimeDisplay } from '@/components/TimeDisplay';
import { useTimeTrackerStore } from '@/store/useTimeTrackerStore';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const FigmaScreen: React.FC = () => {
  const currentActivity = useTimeTrackerStore(state => state.currentActivity);
  const switchActivity = useTimeTrackerStore(state => state.switchActivity);
  const stopCurrentActivity = useTimeTrackerStore(state => state.stopCurrentActivity);

  // Get buttons from store and ensure Figma activities exist
  const buttons = useTimeTrackerStore(state => state.buttons);
  const addButton = useTimeTrackerStore(state => state.addButton);

  // Figma design activities
  const figmaActivities = [
    { id: 'sleeping', name: 'Sleeping', color: '#9E9E9E', position: 0 },
    { id: 'studying', name: 'Studying', color: '#FF5722', position: 1 },
    { id: 'cycling', name: 'Cycling', color: '#00BCD4', position: 2 },
    { id: 'eating', name: 'Eating', color: '#CDDC39', position: 3 },
  ];

  // Initialize buttons if needed
  React.useEffect(() => {
    figmaActivities.forEach(activity => {
      if (!buttons.find(b => b.id === activity.id)) {
        addButton({
          id: activity.id,
          name: activity.name,
          color: activity.color,
          position: activity.position,
          isVisible: true,
          icon: '⭐',
        });
      }
    });
  }, []);

  // Use Figma activities for display
  const activities = figmaActivities;

  const handleToggle = (activityId: string) => {
    if (currentActivity?.buttonId === activityId) {
      stopCurrentActivity();
    } else {
      switchActivity(activityId);
    }
  };


  const ToggleSwitch = ({ activity, isActive }: { activity: any; isActive: boolean }) => (
    <TouchableOpacity
      style={styles.toggleContainer}
      onPress={() => handleToggle(activity.id)}
      activeOpacity={0.8}
    >
      <Text style={styles.toggleLabel}>{activity.name}</Text>
      <View style={styles.switchWrapper}>
        <View style={[
          styles.switchTrack,
          isActive && { backgroundColor: activity.color + '20' }
        ]}>
          <View style={[
            styles.switchThumb,
            isActive && {
              backgroundColor: activity.color,
              transform: [{ translateX: 24 }]
            }
          ]} />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Functional Pie Chart with Figma Style */}
      <FunctionalFigmaChart />

      {/* Time Display */}
      <TimeDisplay />

      {/* Toggle Grid */}
      <View style={styles.toggleSection}>
        {/* Row 1 */}
        <View style={styles.toggleRow}>
          <View style={styles.toggleItemWrapper}>
            <ToggleSwitch
              activity={activities[0]}
              isActive={currentActivity?.buttonId === 'sleeping'}
            />
          </View>
          <View style={[styles.toggleItemWrapper, { marginLeft: 54 }]}>
            <ToggleSwitch
              activity={activities[1]}
              isActive={currentActivity?.buttonId === 'studying'}
            />
          </View>
          <View style={[styles.toggleItemWrapper, { marginLeft: 54 }]}>
            <ToggleSwitch
              activity={activities[2]}
              isActive={currentActivity?.buttonId === 'cycling'}
            />
          </View>
        </View>

        {/* Row 2 */}
        <View style={[styles.toggleRow, { marginTop: 22 }]}>
          <View style={styles.toggleItemWrapper}>
            <ToggleSwitch
              activity={activities[3]}
              isActive={currentActivity?.buttonId === 'eating'}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  toggleSection: {
    paddingHorizontal: 34,
    paddingTop: 5,
  },
  toggleRow: {
    flexDirection: 'row',
  },
  toggleItemWrapper: {
    // Individual toggle positioning
  },
  toggleContainer: {
    width: 75,
    height: 60,
  },
  toggleLabel: {
    fontSize: 24,
    fontFamily: 'System',
    color: '#000000',
    marginBottom: 5,
  },
  switchWrapper: {
    width: 69,
    height: 30,
  },
  switchTrack: {
    width: 51,
    height: 31,
    borderRadius: 15.5,
    backgroundColor: '#E0E0E0',
    padding: 2,
    justifyContent: 'center',
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
});