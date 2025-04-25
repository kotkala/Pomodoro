import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Settings from '../app/components/Settings';
import { PomodoroProvider } from '../app/context/PomodoroContext';
import { ThemeProvider } from '../app/context/ThemeContext';
import { Alert } from 'react-native';

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      <PomodoroProvider>
        {component}
      </PomodoroProvider>
    </ThemeProvider>
  );
};

describe('Settings Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders correctly with default settings', () => {
    const { getByText, getAllByText } = renderWithProviders(<Settings />);
    
    // Check if main sections are rendered
    expect(getByText('Settings')).toBeTruthy();
    expect(getByText('Daily Goal & Streak')).toBeTruthy();
    expect(getByText('Appearance')).toBeTruthy();
    expect(getByText('Timer Settings')).toBeTruthy();
    expect(getByText('Custom Duration')).toBeTruthy();
    
    // Check if specific settings are displayed
    expect(getByText('Work Duration (minutes)')).toBeTruthy();
    expect(getByText('Short Break (minutes)')).toBeTruthy();
    expect(getByText('Long Break (minutes)')).toBeTruthy();
    expect(getByText('Daily Goal (minutes)')).toBeTruthy();
  });
  
  it('allows toggling dark mode', () => {
    const { getByText } = renderWithProviders(<Settings />);
    
    // Find the Dark Mode switch
    const darkModeLabel = getByText('Dark Mode');
    const darkModeSwitch = darkModeLabel.parent?.parent?.findByProps({ 
      onValueChange: expect.any(Function) 
    });
    
    // Toggle the switch
    fireEvent(darkModeSwitch, 'onValueChange', true);
    
    // Ideally, we would test that the theme context value has changed,
    // but this would require checking the internal state of the context
  });
  
  it('allows saving settings', () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(<Settings />);
    
    // Find the Save Settings button
    const saveButton = getByText('Save Settings');
    
    // Click the save button (should trigger Alert)
    fireEvent.press(saveButton);
    
    // Check if Alert was called
    expect(Alert.alert).toHaveBeenCalledWith(
      'Settings Saved',
      'Your settings have been updated successfully.'
    );
  });
  
  it('allows setting a custom duration', () => {
    const { getByPlaceholderText, getByTestId } = renderWithProviders(<Settings />);
    
    // Find the custom duration input
    const customDurationInput = getByPlaceholderText('Duration in minutes');
    
    // Enter a value
    fireEvent.changeText(customDurationInput, '45');
    
    // Find and press the checkmark button
    const checkButton = customDurationInput.parent?.findByProps({ 
      onPress: expect.any(Function) 
    });
    
    fireEvent.press(checkButton);
    
    // The input should be cleared after applying
    expect(customDurationInput.props.value).toBe('');
  });
}); 