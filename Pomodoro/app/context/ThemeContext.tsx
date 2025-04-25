import { createContext, useContext } from 'react';
import { usePomodoroContext } from './PomodoroContext';

// Define theme colors
export interface ThemeColors {
  background: string;
  backgroundSecondary: string;
  text: string;
  textSecondary: string;
  primary: string;
  secondary: string;
  accent: string;
  border: string;
  error: string;
  success: string;
}

// Define light and dark themes
export const lightTheme: ThemeColors = {
  background: '#F5F5F5',
  backgroundSecondary: '#FFFFFF',
  text: '#333333',
  textSecondary: '#666666',
  primary: '#FF5252',
  secondary: '#3F51B5',
  accent: '#4CAF50',
  border: '#E0E0E0',
  error: '#F44336',
  success: '#4CAF50',
};

export const darkTheme: ThemeColors = {
  background: '#121212',
  backgroundSecondary: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#AAAAAA',
  primary: '#FF5252',
  secondary: '#7986CB',
  accent: '#81C784',
  border: '#333333',
  error: '#E57373',
  success: '#81C784',
};

// Create theme context
export const ThemeContext = createContext<ThemeColors>(lightTheme);

// Theme provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDarkMode } = usePomodoroContext();
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

// Custom hook to use the theme
export const useTheme = () => useContext(ThemeContext);

// Default export
export default ThemeContext; 