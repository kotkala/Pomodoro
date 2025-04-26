import React from 'react';
import { render } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { ThemeProvider, useTheme, lightTheme, darkTheme } from '../app/context/ThemeContext';
import { PomodoroProvider } from '../app/context/PomodoroContext';

// Mock the PomodoroContext
jest.mock('../app/context/PomodoroContext', () => {
  const originalModule = jest.requireActual('../app/context/PomodoroContext');
  
  return {
    ...originalModule,
    usePomodoroContext: jest.fn(() => ({
      isDarkMode: false, // Default to light mode in tests
      toggleDarkMode: jest.fn(),
    })),
  };
});

// Component that uses the theme
const TestComponent = () => {
  const theme = useTheme();
  
  return (
    <View>
      <Text testID="background" style={{ color: theme.background }}>Background</Text>
      <Text testID="text" style={{ color: theme.text }}>Text</Text>
      <Text testID="primary" style={{ color: theme.primary }}>Primary</Text>
      <Text testID="secondary" style={{ color: theme.secondary }}>Secondary</Text>
      <Text testID="accent" style={{ color: theme.accent }}>Accent</Text>
      <Text testID="border" style={{ color: theme.border }}>Border</Text>
    </View>
  );
};

describe('ThemeContext', () => {
  it('provides light theme values by default', () => {
    const { getByTestId } = render(
      <PomodoroProvider>
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      </PomodoroProvider>
    );
    
    expect(getByTestId('background').props.style.color).toBe(lightTheme.background);
    expect(getByTestId('text').props.style.color).toBe(lightTheme.text);
    expect(getByTestId('primary').props.style.color).toBe(lightTheme.primary);
    expect(getByTestId('secondary').props.style.color).toBe(lightTheme.secondary);
    expect(getByTestId('accent').props.style.color).toBe(lightTheme.accent);
    expect(getByTestId('border').props.style.color).toBe(lightTheme.border);
  });
  
  it('provides dark theme values when dark mode is enabled', () => {
    // Override the mock to return dark mode
    const usePomodoroContextMock = require('../app/context/PomodoroContext').usePomodoroContext;
    usePomodoroContextMock.mockReturnValue({
      isDarkMode: true,
      toggleDarkMode: jest.fn(),
    });
    
    const { getByTestId } = render(
      <PomodoroProvider>
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      </PomodoroProvider>
    );
    
    expect(getByTestId('background').props.style.color).toBe(darkTheme.background);
    expect(getByTestId('text').props.style.color).toBe(darkTheme.text);
    expect(getByTestId('primary').props.style.color).toBe(darkTheme.primary);
    expect(getByTestId('secondary').props.style.color).toBe(darkTheme.secondary);
    expect(getByTestId('accent').props.style.color).toBe(darkTheme.accent);
    expect(getByTestId('border').props.style.color).toBe(darkTheme.border);
  });
  
  it('light theme has correct values', () => {
    expect(lightTheme.background).toBe('#F5F5F5');
    expect(lightTheme.backgroundSecondary).toBe('#FFFFFF');
    expect(lightTheme.text).toBe('#333333');
    expect(lightTheme.textSecondary).toBe('#666666');
    expect(lightTheme.primary).toBe('#FF5252');
    expect(lightTheme.secondary).toBe('#3F51B5');
    expect(lightTheme.accent).toBe('#4CAF50');
    expect(lightTheme.border).toBe('#E0E0E0');
    expect(lightTheme.error).toBe('#F44336');
    expect(lightTheme.success).toBe('#4CAF50');
  });
  
  it('dark theme has correct values', () => {
    expect(darkTheme.background).toBe('#121212');
    expect(darkTheme.backgroundSecondary).toBe('#1E1E1E');
    expect(darkTheme.text).toBe('#FFFFFF');
    expect(darkTheme.textSecondary).toBe('#AAAAAA');
    expect(darkTheme.primary).toBe('#FF5252');
    expect(darkTheme.secondary).toBe('#7986CB');
    expect(darkTheme.accent).toBe('#81C784');
    expect(darkTheme.border).toBe('#333333');
    expect(darkTheme.error).toBe('#E57373');
    expect(darkTheme.success).toBe('#81C784');
  });
}); 