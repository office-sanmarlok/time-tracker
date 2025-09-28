import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { FigmaScreen } from '@/screens/FigmaScreen';
import { useTimeTrackerStore } from '@/store/useTimeTrackerStore';
import { useAppState } from '@/hooks/useAppState';
import { usePersistence } from '@/hooks/usePersistence';

export default function App() {
  const isLoading = useTimeTrackerStore(state => state.isLoading);
  const loadData = useTimeTrackerStore(state => state.loadData);

  // Initialize app state handling
  useAppState();

  // Initialize auto-persistence
  usePersistence();

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#FF5722" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FigmaScreen />
      <StatusBar style="dark" />
    </View>
  );
}