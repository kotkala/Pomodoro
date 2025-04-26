import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import { Button, View } from 'react-native';
import { PomodoroProvider, usePomodoroContext } from '../app/context/PomodoroContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create a test component that uses the context
const TestComponent = () => {
  const {
    timeLeft,
    isRunning,
    currentSession,
    startTimer,
    pauseTimer,
    resetTimer,
    skipSession,
    settings,
    updateSettings
  } = usePomodoroContext();

  return (
    <View>
      <Button
        testID="start-button"
        title="Start"
        onPress={startTimer}
      />
      <Button
        testID="pause-button"
        title="Pause"
        onPress={pauseTimer}
      />
      <Button
        testID="reset-button"
        title="Reset"
        onPress={resetTimer}
      />
      <Button
        testID="skip-button"
        title="Skip"
        onPress={skipSession}
      />
      <Button
        testID="update-settings-button"
        title="Update Settings"
        onPress={() => updateSettings({
          workDuration: 30,
          shortBreakDuration: 7,
          longBreakDuration: 20,
          sessionsBeforeLongBreak: 3,
          autoStartBreak: true,
          autoStartWork: true,
          dailyGoalMinutes: 240
        })}
      />
      <View testID="time-left">{timeLeft}</View>
      <View testID="is-running">{isRunning ? 'true' : 'false'}</View>
      <View testID="current-session">{currentSession}</View>
      <View testID="settings">{JSON.stringify(settings)}</View>
    </View>
  );
};

describe('PomodoroContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Reset AsyncStorage mocks
    AsyncStorage.getItem.mockClear();
    AsyncStorage.setItem.mockClear();
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });

  it('should provide default values', () => {
    const { getByTestId } = render(
      <PomodoroProvider>
        <TestComponent />
      </PomodoroProvider>
    );

    expect(getByTestId('time-left').props.children).toBe(25 * 60); // 25 minutes in seconds
    expect(getByTestId('is-running').props.children).toBe('false');
    expect(getByTestId('current-session').props.children).toBe('work');
  });

  it('should start the timer when startTimer is called', () => {
    const { getByTestId } = render(
      <PomodoroProvider>
        <TestComponent />
      </PomodoroProvider>
    );

    // Start the timer
    fireEvent.press(getByTestId('start-button'));

    // Check if the timer is running
    expect(getByTestId('is-running').props.children).toBe('true');

    // Fast-forward time by 5 seconds
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Check if the time has decreased
    expect(getByTestId('time-left').props.children).toBe(25 * 60 - 5);
  });

  it('should pause the timer when pauseTimer is called', () => {
    const { getByTestId } = render(
      <PomodoroProvider>
        <TestComponent />
      </PomodoroProvider>
    );

    // Start the timer
    fireEvent.press(getByTestId('start-button'));
    
    // Fast-forward time by 5 seconds
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Pause the timer
    fireEvent.press(getByTestId('pause-button'));

    // Check if the timer is paused
    expect(getByTestId('is-running').props.children).toBe('false');

    // Record the current time
    const timeAfterPause = getByTestId('time-left').props.children;

    // Fast-forward time by 5 more seconds
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Check if the time hasn't changed
    expect(getByTestId('time-left').props.children).toBe(timeAfterPause);
  });

  it('should skip to the next session when skipSession is called', () => {
    const { getByTestId } = render(
      <PomodoroProvider>
        <TestComponent />
      </PomodoroProvider>
    );

    // Initially in work session
    expect(getByTestId('current-session').props.children).toBe('work');

    // Skip to the next session (should be short break)
    fireEvent.press(getByTestId('skip-button'));

    // Check if it's now in short break
    expect(getByTestId('current-session').props.children).toBe('shortBreak');
    expect(getByTestId('time-left').props.children).toBe(5 * 60); // 5 minutes in seconds

    // Skip again to go back to work
    fireEvent.press(getByTestId('skip-button'));

    // Check if it's back to work
    expect(getByTestId('current-session').props.children).toBe('work');
    expect(getByTestId('time-left').props.children).toBe(25 * 60); // 25 minutes in seconds
  });

  it('should update settings when updateSettings is called', () => {
    const { getByTestId } = render(
      <PomodoroProvider>
        <TestComponent />
      </PomodoroProvider>
    );

    // Initially has default work duration (25 minutes)
    expect(getByTestId('time-left').props.children).toBe(25 * 60);

    // Update settings
    fireEvent.press(getByTestId('update-settings-button'));

    // Reset the timer to apply new settings
    fireEvent.press(getByTestId('reset-button'));

    // Check if the work duration has updated to 30 minutes
    expect(getByTestId('time-left').props.children).toBe(30 * 60);

    // Skip to short break
    fireEvent.press(getByTestId('skip-button'));

    // Check if short break duration is updated to 7 minutes
    expect(getByTestId('time-left').props.children).toBe(7 * 60);
  });
}); 