import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Timer from '../app/components/Timer';
import { PomodoroProvider } from '../app/context/PomodoroContext';
import { ThemeContext } from '../app/context/ThemeContext';

// Mock the svg components
jest.mock('react-native-svg', () => {
  const MockSvg = () => 'Svg';
  MockSvg.Circle = () => 'Circle';
  MockSvg.G = () => 'G';
  MockSvg.Path = () => 'Path';
  MockSvg.Text = () => 'Text';
  return MockSvg;
});

// Mock the PomodoroContext
jest.mock('../app/context/PomodoroContext', () => {
  const actualContext = jest.requireActual('../app/context/PomodoroContext');
  return {
    ...actualContext,
    usePomodoroContext: jest.fn(() => ({
      isRunning: false,
      currentSession: 'work',
      timeLeft: 1500, // 25 minutes in seconds
      totalTime: 1500,
      startTimer: jest.fn(),
      pauseTimer: jest.fn(),
      resetTimer: jest.fn(),
      skipSession: jest.fn(),
      settings: {
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        sessionsBeforeLongBreak: 4,
        dailyGoalMinutes: 180,
        notificationsEnabled: true,
        autoStartBreak: false,
        autoStartWork: false,
      },
      sessionHistory: [],
      isDarkMode: false,
      dailyProgress: 60, // 1 hour of progress
      streak: {
        currentStreak: 5,
        lastCompletedDate: new Date().toISOString().split('T')[0],
        highestStreak: 8,
      },
      setCustomDuration: jest.fn(),
      updateSettings: jest.fn(),
      toggleDarkMode: jest.fn(),
    })),
  };
});

describe('Timer Component', () => {
  // Mock the ThemeContext provider with complete theme values
  const mockThemeContext = {
    isDarkMode: false,
    toggleDarkMode: jest.fn(),
    theme: {
      background: '#FFFFFF',
      backgroundSecondary: '#F5F5F5',
      text: '#333333',
      textSecondary: '#666666',
      primary: '#FF5722',
      secondary: '#4CAF50',
      accent: '#2196F3',
      border: '#E0E0E0',
      error: '#F44336',
      success: '#4CAF50',
      warning: '#FFC107',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without errors', () => {
    const { getByText } = render(
      <ThemeContext.Provider value={mockThemeContext}>
        <Timer />
      </ThemeContext.Provider>
    );
    
    // Verify that the session name is displayed
    expect(getByText('Focus')).toBeTruthy();
    // Verify that daily goal is displayed
    expect(getByText('Daily Goal: 60/180 min')).toBeTruthy();
  });

  it('displays streak information correctly', () => {
    const { getByText } = render(
      <ThemeContext.Provider value={mockThemeContext}>
        <Timer />
      </ThemeContext.Provider>
    );
    
    // Check if streak badge is showing correctly
    expect(getByText('5 days')).toBeTruthy();
  });

  it('correctly formats time remaining', () => {
    // Set a custom time left value
    jest.mocked(require('../app/context/PomodoroContext').usePomodoroContext).mockReturnValueOnce({
      isRunning: false,
      currentSession: 'work',
      timeLeft: 654, // 10:54
      totalTime: 1500,
      startTimer: jest.fn(),
      pauseTimer: jest.fn(),
      resetTimer: jest.fn(),
      skipSession: jest.fn(),
      settings: {
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        sessionsBeforeLongBreak: 4,
        dailyGoalMinutes: 180,
        notificationsEnabled: true,
        autoStartBreak: false,
        autoStartWork: false,
      },
      sessionHistory: [],
      isDarkMode: false,
      dailyProgress: 60,
      streak: {
        currentStreak: 5,
        lastCompletedDate: new Date().toISOString().split('T')[0],
        highestStreak: 8,
      },
      setCustomDuration: jest.fn(),
      updateSettings: jest.fn(),
      toggleDarkMode: jest.fn(),
    });
    
    const { getByText } = render(
      <ThemeContext.Provider value={mockThemeContext}>
        <Timer />
      </ThemeContext.Provider>
    );
    
    // Check if time is formatted correctly
    expect(getByText('10:54')).toBeTruthy();
  });

  it('calls the correct functions on button press', () => {
    const startTimerMock = jest.fn();
    const resetTimerMock = jest.fn();
    const skipSessionMock = jest.fn();
    
    jest.mocked(require('../app/context/PomodoroContext').usePomodoroContext).mockReturnValueOnce({
      isRunning: false,
      currentSession: 'work',
      timeLeft: 1500,
      totalTime: 1500,
      startTimer: startTimerMock,
      pauseTimer: jest.fn(),
      resetTimer: resetTimerMock,
      skipSession: skipSessionMock,
      settings: {
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        sessionsBeforeLongBreak: 4,
        dailyGoalMinutes: 180,
        notificationsEnabled: true,
        autoStartBreak: false,
        autoStartWork: false,
      },
      sessionHistory: [],
      isDarkMode: false,
      dailyProgress: 60,
      streak: {
        currentStreak: 5,
        lastCompletedDate: new Date().toISOString().split('T')[0],
        highestStreak: 8,
      },
      setCustomDuration: jest.fn(),
      updateSettings: jest.fn(),
      toggleDarkMode: jest.fn(),
    });
    
    const { getByTestId } = render(
      <ThemeContext.Provider value={mockThemeContext}>
        <Timer />
      </ThemeContext.Provider>
    );
    
    // Simulate button presses and verify function calls
    fireEvent.press(getByTestId('start-button'));
    expect(startTimerMock).toHaveBeenCalledTimes(1);
    
    fireEvent.press(getByTestId('reset-button'));
    expect(resetTimerMock).toHaveBeenCalledTimes(1);
    
    fireEvent.press(getByTestId('skip-button'));
    expect(skipSessionMock).toHaveBeenCalledTimes(1);
  });
}); 