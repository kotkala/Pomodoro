import React from 'react';
import { render } from '@testing-library/react-native';
import Statistics from '../app/components/Statistics';
import { PomodoroProvider } from '../app/context/PomodoroContext';
import { ThemeProvider } from '../app/context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock the Charts components
jest.mock('react-native-chart-kit', () => ({
  LineChart: 'LineChart',
  BarChart: 'BarChart',
  PieChart: 'PieChart',
  ProgressChart: 'ProgressChart',
  ContributionGraph: 'ContributionGraph',
  StackedBarChart: 'StackedBarChart',
}));

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const { View } = require('react-native');
  return {
    Svg: View,
    Circle: View,
    Ellipse: View,
    G: View,
    Text: View,
    TSpan: View,
    TextPath: View,
    Path: View,
    Polygon: View,
    Polyline: View,
    Line: View,
    Rect: View,
    Use: View,
    Image: View,
    Symbol: View,
    Defs: View,
    LinearGradient: View,
    RadialGradient: View,
    Stop: View,
    ClipPath: View,
    Pattern: View,
    Mask: View,
  };
});

describe('Statistics Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem = jest.fn().mockImplementation((key) => {
      if (key === '@pomodoro_stats') {
        return Promise.resolve(JSON.stringify({
          '2023-08-01': { completedPomodoros: 5, totalWorkTime: 7500 },
          '2023-08-02': { completedPomodoros: 3, totalWorkTime: 4500 },
        }));
      }
      if (key === '@pomodoro_settings') {
        return Promise.resolve(JSON.stringify({
          workDuration: 25,
          shortBreakDuration: 5,
          longBreakDuration: 15,
          longBreakInterval: 4,
          autoStartBreak: true,
          autoStartWork: false,
          dailyGoal: 180
        }));
      }
      return Promise.resolve(null);
    });
  });

  it('renders correctly', async () => {
    const { findByText } = render(
      <ThemeProvider>
        <PomodoroProvider>
          <Statistics />
        </PomodoroProvider>
      </ThemeProvider>
    );

    // Check for main components of the Statistics screen
    expect(await findByText('Statistics')).toBeTruthy();

    // Verify that summary data is displayed
    expect(await findByText('Minutes')).toBeTruthy();
    expect(await findByText('Sessions')).toBeTruthy();
    expect(await findByText('Avg Min/Day')).toBeTruthy();
  });
}); 