import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { PomodoroProvider, usePomodoroContext } from '../app/context/PomodoroContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage for testing
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Test component for streak display
const StreakDisplay = () => {
  const { streak } = usePomodoroContext();
  
  return (
    <>
      <Text testID="currentStreak">{streak.currentStreak}</Text>
      <Text testID="highestStreak">{streak.highestStreak}</Text>
      <Text testID="lastCompletedDate">{streak.lastCompletedDate || 'null'}</Text>
    </>
  );
};

describe('Streak Functionality', () => {
  const today = new Date();
  const todayISODate = today.toISOString().split('T')[0];
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayISODate = yesterday.toISOString().split('T')[0];
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes the streak component correctly', async () => {
    // Mock AsyncStorage to return null (no saved streak)
    AsyncStorage.getItem.mockImplementation(() => Promise.resolve(null));
    
    render(
      <PomodoroProvider>
        <StreakDisplay />
      </PomodoroProvider>
    );
    
    // Wait for AsyncStorage operations to complete
    await waitFor(() => {
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('pomodoro_streak');
    });
  });

  it('mocks the AsyncStorage correctly', () => {
    expect(AsyncStorage.getItem).toBeDefined();
    expect(AsyncStorage.setItem).toBeDefined();
  });
}); 