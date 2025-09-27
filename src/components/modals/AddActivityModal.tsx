/**
 * @file src/components/modals/AddActivityModal.tsx
 * @description Modal for adding custom activities
 * @purpose Allow users to create new activity buttons with custom name, icon, and color
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { BaseModal } from './BaseModal';
import { useTimeTrackerStore } from '@/store/useTimeTrackerStore';
import { UI_COLORS, CUSTOM_ACTIVITY_COLORS } from '@/constants/colors';
import { triggerHaptic, triggerSelectionHaptic, HAPTIC_PATTERNS } from '@/constants/haptics';

interface AddActivityModalProps {
  visible: boolean;
  onClose: () => void;
}

const EMOJI_OPTIONS = [
  '📖', '💻', '🎮', '🎨', '🎵', '🏃', '🧘', '🍳',
  '🛒', '🧹', '📞', '✈️', '🚗', '🏥', '💊', '🎬',
  '📺', '🎯', '⚽', '🏀', '🎾', '🏊', '🚴', '🥾',
  '🎪', '🎭', '🎸', '🎹', '🎤', '📷', '✍️', '🔧'
];

export const AddActivityModal: React.FC<AddActivityModalProps> = ({
  visible,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('⭐');
  const [selectedColor, setSelectedColor] = useState<string>(CUSTOM_ACTIVITY_COLORS[0]);

  const addButton = useTimeTrackerStore(state => state.addButton);
  const settings = useTimeTrackerStore(state => state.settings);

  const handleSave = async () => {
    if (!name.trim()) return;

    triggerHaptic(HAPTIC_PATTERNS.buttonTap, settings.hapticEnabled);
    await addButton({
      name: name.trim(),
      icon: selectedEmoji,
      color: selectedColor,
    });

    // Reset form
    setName('');
    setSelectedEmoji('⭐');
    setSelectedColor(CUSTOM_ACTIVITY_COLORS[0]);
    onClose();
  };

  return (
    <BaseModal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <Text style={styles.title}>Add Activity</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter activity name"
            placeholderTextColor={UI_COLORS.textTertiary}
            maxLength={50}
            autoFocus
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Icon</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.emojiContainer}
          >
            {EMOJI_OPTIONS.map(emoji => (
              <TouchableOpacity
                key={emoji}
                style={[
                  styles.emojiButton,
                  selectedEmoji === emoji && styles.selectedEmoji,
                ]}
                onPress={() => {
                  triggerSelectionHaptic(settings.hapticEnabled);
                  setSelectedEmoji(emoji);
                }}
              >
                <Text style={styles.emojiText}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Color</Text>
          <View style={styles.colorContainer}>
            {CUSTOM_ACTIVITY_COLORS.map(color => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorButton,
                  { backgroundColor: color },
                  selectedColor === color && styles.selectedColor,
                ]}
                onPress={() => {
                  triggerSelectionHaptic(settings.hapticEnabled);
                  setSelectedColor(color as string);
                }}
              />
            ))}
          </View>
        </View>

        <View style={styles.preview}>
          <View style={[styles.previewButton, { backgroundColor: selectedColor }]}>
            <Text style={styles.previewEmoji}>{selectedEmoji}</Text>
            <Text style={styles.previewName} numberOfLines={1}>
              {name || 'Activity Name'}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onClose}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.saveButton,
              !name.trim() && styles.disabledButton,
            ]}
            onPress={handleSave}
            disabled={!name.trim()}
          >
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </BaseModal>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: UI_COLORS.textPrimary,
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: UI_COLORS.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: UI_COLORS.textPrimary,
    borderWidth: 1,
    borderColor: UI_COLORS.borderLight,
  },
  emojiContainer: {
    paddingVertical: 4,
  },
  emojiButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: UI_COLORS.surface,
  },
  selectedEmoji: {
    backgroundColor: UI_COLORS.primary,
  },
  emojiText: {
    fontSize: 22,
  },
  colorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: UI_COLORS.primary,
  },
  preview: {
    alignItems: 'center',
    marginVertical: 20,
  },
  previewButton: {
    width: 80,
    height: 80,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  previewEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  previewName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: UI_COLORS.surface,
  },
  cancelText: {
    color: UI_COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: UI_COLORS.primary,
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
});