# Pomodoro App - Developer Technical Guide

## Architecture Overview

This Pomodoro application is built using React Native with Expo, following a context-based state management approach. The app uses React's Context API for global state management instead of Redux or other state management libraries.

## Key Technologies

- **React Native**: Core framework for cross-platform mobile development
- **Expo**: Development platform for React Native (v52.0)
- **TypeScript**: For type safety and improved developer experience
- **Expo Router**: For file-based navigation
- **AsyncStorage**: For local data persistence
- **Expo Notifications**: For timer notifications and reminders
- **React Navigation**: For tab-based navigation structure
- **Jest**: For testing

## Context Architecture

The application uses two main context providers:

### PomodoroContext (app/context/PomodoroContext.tsx)

The central state manager handling:
- Timer logic and state
- Session type management (work, short break, long break)
- Session history tracking
- User settings management
- Daily goals and streak tracking
- Local storage operations

The context provides a comprehensive API for components to interact with the timer functionality, settings, and historical data.

### ThemeContext (app/context/ThemeContext.tsx)

Handles theme-related functionality:
- Dark/light mode management
- System theme detection
- Theme persistence

## Data Flow

1. **User Input** → Component actions trigger context methods
2. **Context Processing** → State is updated based on business logic
3. **UI Updates** → Components re-render based on context state changes
4. **Data Persistence** → AsyncStorage saves state changes as needed

## Core Components

### Timer (app/components/Timer.tsx)

The main timer interface that:
- Displays current time remaining
- Shows session type (work, short break, long break)
- Provides control buttons (start, pause, reset, skip)
- Uses a circular progress indicator
- Handles timer logic through the PomodoroContext

### Todo (app/components/Todo.tsx)

Task management component that:
- Renders the task list
- Handles task creation, editing, deletion
- Manages task completion status
- Implements drag-and-drop reordering
- Persists tasks through AsyncStorage

### History (app/components/History.tsx)

Displays completed sessions with:
- Session type indicators
- Duration information
- Date and time details
- Filtering capabilities

### Statistics (app/components/Statistics.tsx)

Visualizes productivity data:
- Daily/weekly/monthly session counts
- Session type distribution
- Streak information
- Productivity trends

### Settings (app/components/Settings.tsx)

Allows customization of:
- Work session duration
- Break durations
- Sessions before long break
- Notification preferences
- Daily goal settings

## Navigation Structure

The app uses Expo Router with a tab-based navigation:
- **Timer Tab** (index.tsx): Main timer screen
- **Todo Tab** (todo.tsx): Task management
- **History Tab** (history.tsx): Session history
- **Statistics Tab** (statistics.tsx): Productivity statistics
- **Settings Tab** (settings.tsx): App configuration

## Data Persistence

All application data is stored locally using AsyncStorage with the following keys:

- `pomodoro_settings`: Timer and app settings
- `pomodoro_history`: Session history records
- `pomodoro_theme`: Theme preference (dark/light)
- `pomodoro_streak`: Streak tracking data
- `pomodoro_daily_progress`: Current day's productivity data
- `pomodoro_last_date`: Last usage date for streak calculation

## Timer Logic Details

The timer implementation has several key considerations:

1. **Accuracy**: Uses `setInterval` with adjustments to maintain accuracy
2. **Background Handling**: Compensates for background app time using timestamps
3. **Session Transitions**: Handles automatic transitions between work and break sessions
4. **Streak Logic**: Updates streaks based on daily goal completion
5. **Notifications**: Schedules notifications for session completion

## Testing Strategy

The application uses Jest for testing with the following approach:

- **Component Tests**: Testing UI rendering and interactions
- **Context Tests**: Ensuring business logic works correctly
- **Integration Tests**: Testing components with contexts
- **Hook Tests**: Verifying custom hooks function properly

Test files are stored in the `__tests__` directory and should maintain a similar structure to the source code.

## Performance Optimization

Key performance considerations:

1. **Memoization**: Use React's `useMemo` and `useCallback` for expensive operations
2. **Render Optimization**: Avoid unnecessary re-renders with careful state management
3. **Timer Accuracy**: Balance timer accuracy with battery performance
4. **List Rendering**: Optimize list rendering with proper key usage and virtualization
5. **Storage Operations**: Batch AsyncStorage operations when possible

## Common Development Tasks

### Adding a New Feature

1. Identify which context needs to be updated (if any)
2. Update the appropriate context provider with new state and methods
3. Implement UI components that utilize the context
4. Add persistence logic if needed
5. Write tests for the new functionality

### Modifying Timer Behavior

1. Locate the timer logic in `PomodoroContext.tsx`
2. Adjust the timer management functions as needed
3. Update UI components to reflect changes
4. Test thoroughly for accuracy and edge cases

### Updating the UI Theme

1. Modify the theme variables in `ThemeContext.tsx`
2. Ensure components correctly consume theme values
3. Test appearance in both light and dark modes

## Debugging Tips

1. **Context State**: Use React DevTools to inspect context values
2. **AsyncStorage**: Log storage operations to verify data persistence
3. **Timer Issues**: Add timestamps to timer actions to verify accuracy
4. **Notifications**: Test notification behavior on physical devices

## Deployment

The app can be built for distribution using Expo's build services:

```powershell
npx expo build:android  # For Android
npx expo build:ios      # For iOS
```

## Code Style Guidelines

1. Use TypeScript interfaces for all prop and state definitions
2. Follow component naming conventions (PascalCase)
3. Organize imports consistently:
   - React imports first
   - External libraries second
   - Internal components/utilities third
4. Use functional components with hooks instead of class components
5. Comment complex business logic, especially in context providers

## Versioning Strategy

Follow semantic versioning:
- **Major** (1.0.0): Breaking changes
- **Minor** (0.1.0): New features without breaking changes
- **Patch** (0.0.1): Bug fixes and minor improvements

## Package Management

When adding new dependencies:
- Never downgrade any package version in `package.json`
- Only keep or raise versions when updating
- Remove deprecated imports and replace with modern alternatives 