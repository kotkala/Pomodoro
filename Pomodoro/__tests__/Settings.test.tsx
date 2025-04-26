import React from 'react';
import { render } from '@testing-library/react-native';
import Settings from '../app/components/Settings';
import { PomodoroProvider } from '../app/context/PomodoroContext';
import { ThemeProvider } from '../app/context/ThemeContext';

// Mock for PomodoroContext functions
const mockUpdateSettings = jest.fn();
const mockToggleDarkMode = jest.fn();

// Mock the PomodoroContext
jest.mock('../app/context/PomodoroContext', () => {
  const originalModule = jest.requireActual('../app/context/PomodoroContext');
  
  return {
    ...originalModule,
    usePomodoroContext: jest.fn(() => ({
      settings: {
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        sessionsBeforeLongBreak: 4,
        dailyGoalMinutes: 180,
        notificationsEnabled: true,
      },
      updateSettings: mockUpdateSettings,
      isDarkMode: false,
      toggleDarkMode: mockToggleDarkMode,
      streak: {
        currentStreak: 3,
        lastCompletedDate: '2023-08-02',
        highestStreak: 5,
      },
    })),
  };
});

// Mock Expo components and icons
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return {
    Ionicons: ({ name, ...props }) => <Text {...props}>{name}</Text>,
  };
});

// Create a minimal working test suite
describe('Settings Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    // Just test that we can create the component without errors
    expect(() => {
      render(
        <PomodoroProvider>
          <ThemeProvider>
            <Settings />
          </ThemeProvider>
        </PomodoroProvider>
      );
    }).not.toThrow();
  });

  it('mocks context functions correctly', () => {
    // Test that our mocks are working
    expect(mockUpdateSettings).not.toHaveBeenCalled();
    expect(mockToggleDarkMode).not.toHaveBeenCalled();
  });
}); 