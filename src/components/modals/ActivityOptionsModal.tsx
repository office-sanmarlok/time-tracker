/**
 * @file src/components/modals/ActivityOptionsModal.tsx
 * @description Modal showing options for an activity (edit, delete, reorder)
 * @purpose Provide context menu for activity button management
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BaseModal } from './BaseModal';
import { ActivityButton } from '@/types/models';
import { UI_COLORS } from '@/constants/colors';
import { useTimeTrackerStore } from '@/store/useTimeTrackerStore';
import { triggerHaptic, HAPTIC_PATTERNS } from '@/constants/haptics';

interface ActivityOptionsModalProps {
  visible: boolean;
  button: ActivityButton | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const ActivityOptionsModal: React.FC<ActivityOptionsModalProps> = ({
  visible,
  button,
  onClose,
  onEdit,
  onDelete,
}) => {
  const toggleEditMode = useTimeTrackerStore(state => state.toggleEditMode);
  const settings = useTimeTrackerStore(state => state.settings);

  const handleEditLayout = () => {
    triggerHaptic(HAPTIC_PATTERNS.buttonTap, settings.hapticEnabled);
    toggleEditMode();
    onClose();
  };

  const handleEdit = () => {
    triggerHaptic(HAPTIC_PATTERNS.buttonTap, settings.hapticEnabled);
    onEdit();
  };

  const handleDelete = () => {
    triggerHaptic(HAPTIC_PATTERNS.deleteConfirm, settings.hapticEnabled);
    onDelete();
  };

  if (!button) return null;

  return (
    <BaseModal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={[styles.icon, { backgroundColor: button.color }]}>
            <Text style={styles.iconText}>{button.icon}</Text>
          </View>
          <Text style={styles.title}>{button.name}</Text>
        </View>

        <View style={styles.options}>
          <TouchableOpacity style={styles.option} onPress={handleEdit}>
            <Text style={styles.optionIcon}>✏️</Text>
            <Text style={styles.optionText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={handleEditLayout}>
            <Text style={styles.optionIcon}>📱</Text>
            <Text style={styles.optionText}>Edit Layout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.option, styles.deleteOption]}
            onPress={handleDelete}
          >
            <Text style={styles.optionIcon}>🗑️</Text>
            <Text style={[styles.optionText, styles.deleteText]}>Delete</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </BaseModal>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconText: {
    fontSize: 28,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: UI_COLORS.textPrimary,
  },
  options: {
    marginBottom: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: UI_COLORS.surface,
    borderRadius: 12,
    marginBottom: 8,
  },
  deleteOption: {
    backgroundColor: `${UI_COLORS.danger}10`,
  },
  optionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    color: UI_COLORS.textPrimary,
    fontWeight: '500',
  },
  deleteText: {
    color: UI_COLORS.danger,
  },
  cancelButton: {
    paddingVertical: 14,
    backgroundColor: UI_COLORS.surface,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    color: UI_COLORS.textPrimary,
    fontWeight: '600',
  },
});