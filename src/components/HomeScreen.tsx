/**
 * @file src/components/HomeScreen.tsx
 * @description Main screen container for the Time Tracker app
 * @purpose Orchestrates layout of chart, activity grid, and available activities
 */

import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieChart } from './PieChart';
import { ActivityGrid } from './ActivityGrid';
import { AvailableActivities } from './AvailableActivities';
import { FloatingAddButton } from './FloatingAddButton';
import { AddActivityModal } from './modals/AddActivityModal';
import { EditActivityModal } from './modals/EditActivityModal';
import { ActivityOptionsModal } from './modals/ActivityOptionsModal';
import { useTimeTrackerStore } from '@/store/useTimeTrackerStore';
import { UI_COLORS } from '@/constants/colors';
import { ActivityButton } from '@/types/models';

const { height: screenHeight } = Dimensions.get('window');
const CHART_HEIGHT = Math.min(screenHeight * 0.25, 200);

export const HomeScreen: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [selectedButton, setSelectedButton] = useState<ActivityButton | null>(null);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const activities = useTimeTrackerStore(state => state.activities);
  const isEditMode = useTimeTrackerStore(state => state.isEditMode);

  const todayActivities = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return activities.filter(a => a.date === today);
  }, [activities]);

  const handleButtonLongPress = (button: ActivityButton) => {
    setSelectedButton(button);
    setIsOptionsModalOpen(true);
  };

  const handleEditPress = () => {
    setIsOptionsModalOpen(false);
    if (selectedButton) {
      setIsEditModalOpen(true);
    }
  };

  const handleDeletePress = async () => {
    if (selectedButton) {
      await useTimeTrackerStore.getState().deleteButton(selectedButton.id);
    }
    setIsOptionsModalOpen(false);
    setSelectedButton(null);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Chart Section */}
        <View style={styles.chartSection}>
          <PieChart
            activities={todayActivities}
            height={CHART_HEIGHT}
            isCurrentDay={true}
          />
        </View>

        {/* Activity Buttons Grid */}
        <View style={styles.gridSection}>
          <ActivityGrid
            onButtonLongPress={handleButtonLongPress}
            isEditMode={isEditMode}
          />
        </View>

        {/* Available Activities Section */}
        <View style={styles.availableSection}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            Available Activities
          </Text>
          <AvailableActivities />
        </View>

        {/* Extra padding for floating button */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Floating Add Button */}
      <FloatingAddButton onPress={() => setIsAddModalOpen(true)} />

      {/* Modals */}
      <AddActivityModal
        visible={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <EditActivityModal
        visible={isEditModalOpen}
        button={selectedButton}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedButton(null);
        }}
      />

      <ActivityOptionsModal
        visible={isOptionsModalOpen}
        button={selectedButton}
        onClose={() => {
          setIsOptionsModalOpen(false);
          setSelectedButton(null);
        }}
        onEdit={handleEditPress}
        onDelete={handleDeletePress}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UI_COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  chartSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: UI_COLORS.surface,
    marginBottom: 8,
    minHeight: CHART_HEIGHT + 24,
  },
  gridSection: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  availableSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: UI_COLORS.borderLight,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: UI_COLORS.textSecondary,
    marginBottom: 12,
  },
  sectionTitleDark: {
    color: UI_COLORS.textSecondaryDark,
  },
  bottomPadding: {
    height: 80,
  },
});