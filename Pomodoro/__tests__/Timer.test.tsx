import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Timer from '../app/components/Timer';
import { PomodoroProvider } from '../app/context/PomodoroContext';
import { ThemeProvider } from '../app/context/ThemeContext';

// Mock the SVG component
jest.mock('react-native-svg', () => {
  const { View } = require('react-native');
  return {
    Svg: View,
    Circle: View,
  };
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      <PomodoroProvider>
        {component}
      </PomodoroProvider>
    </ThemeProvider>
  );
};

describe('Timer Component', () => {
  it('renders correctly', () => {
    const { getByText } = renderWithProviders(<Timer />);
    // Check if the Focus text is displayed (default session)
    expect(getByText('Focus')).toBeTruthy();
  });

  it('shows play button when timer is not running', () => {
    const { getByRole } = renderWithProviders(<Timer />);
    const playButton = getByRole('button', { name: /play/ });
    expect(playButton).toBeTruthy();
  });

  it('shows correct session time', () => {
    const { getByText } = renderWithProviders(<Timer />);
    // Default work session should be 25 minutes
    expect(getByText('25:00')).toBeTruthy();
  });

  it('has controls for reset and skip', () => {
    const { getByRole } = renderWithProviders(<Timer />);
    expect(getByRole('button', { name: /refresh/ })).toBeTruthy();
    expect(getByRole('button', { name: /play-skip-forward/ })).toBeTruthy();
  });
}); 