/**
 * @file src/screens/FigmaScreen.tsx
 * @description Exact replica of Figma design
 * @purpose Clean implementation matching Figma mockup exactly
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Modal,
  TextInput,
  Keyboard,
} from 'react-native';
import { ClockChart } from '@/components/ClockChart';
import { TimeDisplay } from '@/components/TimeDisplay';
import { FigmaToggleSwitch } from '@/components/FigmaToggleSwitch';
import { ColorPicker } from '@/components/ColorPicker';
import { useTimeTrackerStore } from '@/store/useTimeTrackerStore';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const FigmaScreen: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newActivityName, setNewActivityName] = useState('');
  const [newActivityColor, setNewActivityColor] = useState('#FF5722');

  const currentActivity = useTimeTrackerStore(state => state.currentActivity);
  const switchActivity = useTimeTrackerStore(state => state.switchActivity);
  const stopCurrentActivity = useTimeTrackerStore(state => state.stopCurrentActivity);

  // Get buttons from store and ensure Figma activities exist
  const buttons = useTimeTrackerStore(state => state.buttons);
  const addButton = useTimeTrackerStore(state => state.addButton);

  // Initial activities with Figma colors
  const initialActivities = [
    { id: 'sleeping', name: 'Sleeping', color: '#9E9E9E', position: 0 },
    { id: 'studying', name: 'Studying', color: '#FF5722', position: 1 },
    { id: 'cycling', name: 'Cycling', color: '#00BCD4', position: 2 },
    { id: 'eating', name: 'Eating', color: '#CDDC39', position: 3 },
  ];

  // Initialize buttons if needed
  React.useEffect(() => {
    initialActivities.forEach(activity => {
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

  // Get all visible buttons
  const visibleActivities = buttons.filter(b => b.isVisible);

  const handleToggle = (activityId: string) => {
    if (currentActivity?.buttonId === activityId) {
      stopCurrentActivity();
    } else {
      switchActivity(activityId);
    }
  };



  const handleCreateCustomActivity = async () => {
    if (!newActivityName.trim()) return;

    const id = newActivityName.toLowerCase().replace(/\s+/g, '-');

    // Add to store
    await addButton({
      id,
      name: newActivityName,
      color: newActivityColor,
      position: allActivities.length + buttons.length,
      isVisible: true,
      icon: '⭐',
    });


    // Reset modal
    setNewActivityName('');
    setNewActivityColor('#FF5722');
    setIsAddModalOpen(false);
  };




  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!isAddModalOpen}
      >
        {/* 24-Hour Clock Chart */}
        <ClockChart />

        {/* Time Display */}
        <TimeDisplay />

        {/* Active Toggle Grid */}
        <View style={styles.toggleSection}>
          <View style={styles.toggleGrid}>
            {visibleActivities.map((activity, index) => (
              <FigmaToggleSwitch
                key={activity.id}
                id={activity.id}
                name={activity.name}
                color={activity.color}
                isActive={currentActivity?.buttonId === activity.id}
                onToggle={handleToggle}
                style={index % 2 !== 0 ? styles.rightColumn : undefined}
              />
            ))}
          </View>

          {/* Add New Activity Button */}
          <TouchableOpacity
            style={styles.newActivityButton}
            onPress={() => setIsAddModalOpen(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.newActivityButtonText}>+ Add New Activity</Text>
          </TouchableOpacity>
        </View>

        {/* Extra padding for floating button */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Add Custom Activity Modal */}
      <Modal
        visible={isAddModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          Keyboard.dismiss();
          setIsAddModalOpen(false);
        }}
        statusBarTranslucent={true}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss();
            setIsAddModalOpen(false);
          }}
        >
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
              <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Create New Activity</Text>

              <Text style={styles.inputLabel}>Activity Name</Text>
              <TextInput
                style={styles.input}
                value={newActivityName}
                onChangeText={setNewActivityName}
                placeholder="Enter activity name"
                placeholderTextColor="#999"
                maxLength={20}
              />

              <Text style={styles.inputLabel}>Choose Color</Text>
              <ColorPicker
                initialColor={newActivityColor}
                onColorSelect={setNewActivityColor}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setNewActivityName('');
                    setNewActivityColor('#FF5722');
                    setIsAddModalOpen(false);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.createButton,
                    !newActivityName.trim() && styles.createButtonDisabled]}
                  onPress={handleCreateCustomActivity}
                  disabled={!newActivityName.trim()}
                >
                  <Text style={[styles.createButtonText,
                    !newActivityName.trim() && styles.createButtonTextDisabled]}>
                    Create
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  toggleSection: {
    paddingHorizontal: 34,
    paddingTop: 20,
    paddingBottom: 10,
  },
  toggleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  rightColumn: {
    marginLeft: 0, // Remove any custom margin
  },
  newActivityButton: {
    backgroundColor: '#4CAF50',
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  newActivityButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: screenWidth * 0.9,
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  createButton: {
    backgroundColor: '#4CAF50',
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  createButtonTextDisabled: {
    opacity: 0.8,
  },
});