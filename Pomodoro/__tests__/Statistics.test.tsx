import React from 'react';
import { render } from '@testing-library/react-native';
import Statistics from '../app/components/Statistics';
import { PomodoroProvider } from '../app/context/PomodoroContext';
import { ThemeProvider } from '../app/context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      <PomodoroProvider>
        {component}
      </PomodoroProvider>
    </ThemeProvider>
  );
};

// Mock session history data
const mockSessionHistory = [
  {
    type: 'work',
    duration: 25,
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 25 * 60 * 1000).toISOString(),
  },
  {
    type: 'work',
    duration: 15,
    startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    endTime: new Date(Date.now() - 24 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString(),
  },
];

describe('Statistics Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock AsyncStorage to return session history
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'pomodoro_history') {
        return Promise.resolve(JSON.stringify(mockSessionHistory));
      }
      if (key === 'pomodoro_streak') {
        return Promise.resolve(JSON.stringify({
          currentStreak: 2,
          lastCompletedDate: new Date().toISOString().split('T')[0],
          highestStreak: 5,
        }));
      }
      return Promise.resolve(null);
    });
  });
  
  it('renders correctly with streak data', async () => {
    const { findByText } = renderWithProviders(<Statistics />);
    
    // Check if streak information is displayed
    expect(await findByText('Your Streak')).toBeTruthy();
    expect(await findByText('Current Streak')).toBeTruthy();
    expect(await findByText('Best Streak')).toBeTruthy();
  });
  
  it('renders weekly statistics', async () => {
    const { findByText } = renderWithProviders(<Statistics />);
    
    // Check if weekly statistics are displayed
    expect(await findByText('Statistics')).toBeTruthy();
    expect(await findByText('Daily Focus Time')).toBeTruthy();
    
    // Check for statistics sections
    expect(await findByText('Minutes')).toBeTruthy();
    expect(await findByText('Sessions')).toBeTruthy();
    expect(await findByText('Avg Min/Day')).toBeTruthy();
  });
  
  it('displays goal progress information', async () => {
    const { findByText } = renderWithProviders(<Statistics />);
    
    // Check if goal progress is displayed
    const goalTextElement = await findByText(/Today's Goal:/);
    expect(goalTextElement).toBeTruthy();
  });
}); 