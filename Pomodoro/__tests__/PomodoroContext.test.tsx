import React from 'react';
import { render, act, renderHook, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { PomodoroProvider, usePomodoroContext } from '../app/context/PomodoroContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Test Component that uses the PomodoroContext
const TestComponent = () => {
  const { 
    isRunning, 
    currentSession, 
    timeLeft, 
    startTimer, 
    pauseTimer, 
    resetTimer,
    dailyProgress,
    settings
  } = usePomodoroContext();
  
  return (
    <>
      <Text testID="isRunning">{isRunning.toString()}</Text>
      <Text testID="currentSession">{currentSession}</Text>
      <Text testID="timeLeft">{timeLeft}</Text>
      <Text testID="dailyProgress">{dailyProgress}</Text>
      <Text testID="workDuration">{settings.workDuration}</Text>
      <Text testID="dailyGoalMinutes">{settings.dailyGoalMinutes}</Text>
      <Text testID="start" onPress={startTimer}>Start</Text>
      <Text testID="pause" onPress={pauseTimer}>Pause</Text>
      <Text testID="reset" onPress={resetTimer}>Reset</Text>
    </>
  );
};

// Wrapper component for testing hooks
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PomodoroProvider>{children}</PomodoroProvider>
);

describe('PomodoroContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('provides default values', () => {
    const { getByTestId } = render(<TestComponent />, { wrapper: PomodoroProvider });
    
    expect(getByTestId('isRunning').props.children).toBe('false');
    expect(getByTestId('currentSession').props.children).toBe('work');
    // Default work duration is 25 minutes (1500 seconds)
    expect(getByTestId('workDuration').props.children).toBe(25);
    expect(getByTestId('dailyGoalMinutes').props.children).toBe(180);
  });

  it('starts and pauses the timer', () => {
    const { getByTestId } = render(<TestComponent />, { wrapper: PomodoroProvider });
    
    // Start the timer
    act(() => {
      getByTestId('start').props.onPress();
    });
    
    expect(getByTestId('isRunning').props.children).toBe('true');
    
    // Advance timer by 5 seconds
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    
    // Pause the timer
    act(() => {
      getByTestId('pause').props.onPress();
    });
    
    expect(getByTestId('isRunning').props.children).toBe('false');
  });

  it('resets the timer', () => {
    const { getByTestId } = render(<TestComponent />, { wrapper: PomodoroProvider });
    
    // Start the timer
    act(() => {
      getByTestId('start').props.onPress();
    });
    
    // Advance timer by 10 seconds
    act(() => {
      jest.advanceTimersByTime(10000);
    });
    
    // Reset the timer
    act(() => {
      getByTestId('reset').props.onPress();
    });
    
    expect(getByTestId('isRunning').props.children).toBe('false');
    // Should be back to 25 minutes (1500 seconds)
    expect(parseInt(getByTestId('timeLeft').props.children)).toBe(25 * 60);
  });

  it('attempts to load saved data on mount', async () => {
    // Mock returns for AsyncStorage.getItem
    const mockSettings = {
      workDuration: 30,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      sessionsBeforeLongBreak: 4,
      dailyGoalMinutes: 200,
      notificationsEnabled: true,
    };
    
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'pomodoro_settings') {
        return Promise.resolve(JSON.stringify(mockSettings));
      }
      return Promise.resolve(null);
    });
    
    // Use renderHook to test the hook's behavior
    const { result, rerender } = renderHook(() => usePomodoroContext(), { wrapper });
    
    // Wait for AsyncStorage operation to complete
    await waitFor(() => {
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('pomodoro_settings');
    });
    
    // Re-render to get updated state
    rerender();
    
    // Check if settings were properly loaded
    expect(result.current.settings.workDuration).toBe(30);
    expect(result.current.settings.dailyGoalMinutes).toBe(200);
  });
}); 