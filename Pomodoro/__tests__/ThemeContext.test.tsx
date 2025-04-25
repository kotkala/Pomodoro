import React from 'react';
import { render, renderHook } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ThemeProvider, useTheme } from '../app/context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Test Component that uses the ThemeContext
const TestComponent = () => {
  const theme = useTheme();
  
  return (
    <>
      <Text testID="background">{theme.background}</Text>
      <Text testID="text">{theme.text}</Text>
      <Text testID="primary">{theme.primary}</Text>
    </>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('provides default theme values', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    // Check if theme values are provided
    expect(getByTestId('background').props.children).toBeTruthy();
    expect(getByTestId('text').props.children).toBeTruthy();
    expect(getByTestId('primary').props.children).toBeTruthy();
  });
  
  it('provides hook to access theme', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );
    
    const { result } = renderHook(() => useTheme(), { wrapper });
    
    // Check if the theme object has the expected properties
    expect(result.current).toHaveProperty('background');
    expect(result.current).toHaveProperty('text');
    expect(result.current).toHaveProperty('primary');
    expect(result.current).toHaveProperty('secondary');
    expect(result.current).toHaveProperty('accent');
    expect(result.current).toHaveProperty('backgroundSecondary');
    expect(result.current).toHaveProperty('textSecondary');
    expect(result.current).toHaveProperty('border');
  });
  
  it('attempts to load saved theme preference', async () => {
    // Mock AsyncStorage to return a theme preference
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'pomodoro_theme') {
        return Promise.resolve(JSON.stringify(true)); // Dark mode
      }
      return Promise.resolve(null);
    });
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    // Check if AsyncStorage.getItem was called with the correct key
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('pomodoro_theme');
  });
}); 