# Pomodoro App - Developer Guide

## Project Overview

This is a comprehensive Pomodoro Timer application built with React Native and Expo. The app helps users manage their time effectively using the Pomodoro Technique - working in focused intervals separated by short breaks, with longer breaks after completing several work sessions.

## Core Features

- **Pomodoro Timer**: Customizable work sessions, short breaks, and long breaks
- **Task Management**: Create, edit, and complete tasks during work sessions
- **Session History**: Track completed Pomodoro sessions and breaks
- **Statistics**: View productivity metrics and trends over time
- **Streak Tracking**: Monitor daily usage streaks for motivation
- **Notifications**: Receive alerts when sessions end
- **Dark/Light Mode**: Switch between themes based on preference

## Project Structure

```
├── app/                    # Main application code
│   ├── (tabs)/             # Tab-based navigation screens
│   │   ├── _layout.tsx     # Tab navigation configuration
│   │   ├── index.tsx       # Timer screen (main screen)
│   │   ├── todo.tsx        # Task management screen
│   │   ├── history.tsx     # Session history screen
│   │   ├── statistics.tsx  # Statistics and analytics screen
│   │   └── settings.tsx    # App settings screen
│   ├── components/         # Reusable UI components
│   │   ├── Timer.tsx       # Timer component with controls
│   │   ├── Todo.tsx        # Task management component
│   │   ├── History.tsx     # Session history component
│   │   ├── Settings.tsx    # Settings management component
│   │   └── Statistics.tsx  # Statistics visualization component
│   ├── context/            # Application state management
│   │   ├── PomodoroContext.tsx # Main state provider for the app
│   │   └── ThemeContext.tsx    # Theme state management
│   └── _layout.tsx         # Root layout with context providers
├── assets/                 # Static assets like images and fonts
├── __tests__/              # Test files
└── scripts/                # Utility scripts for the project
```

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- Expo CLI
- For mobile testing: Expo Go app on iOS/Android or emulators

### Installation

1. Clone the repository
2. Install dependencies:

```powershell
npm install
```

3. Start the development server:

```powershell
npm start
```

4. Follow the instructions in the terminal to open the app on your device or emulator

## State Management

The app uses React Context API for state management:

- **PomodoroContext**: Manages the timer state, session history, settings, and user progress
- **ThemeContext**: Handles the app's visual theme (dark/light mode)

## Key Workflows

### Timer Operation

The timer follows the standard Pomodoro technique:

1. Work session (default: 25 minutes)
2. Short break (default: 5 minutes)
3. Repeat steps 1-2 for a set number of cycles
4. After completing the specified number of work sessions, take a long break (default: 15 minutes)

All durations are customizable in settings.

### Data Persistence

User data is stored locally using AsyncStorage:
- Timer settings
- Session history
- Task list
- Theme preferences
- Streak data

## Contributing

### Code Style

- Follow existing patterns in the codebase
- Use TypeScript for type safety
- Create reusable components where possible
- Document complex functions with comments

### Testing

Run tests with:

```powershell
npm test
```

For development with continuous testing:

```powershell
npm run test:watch
```

## Troubleshooting

### Common Issues

- **Expo build errors**: Run `npm install` to ensure all dependencies are properly installed
- **Timer inaccuracies**: The app compensates for background execution limitations on mobile devices
- **Lost data**: Check that AsyncStorage permissions are enabled for the app

### Project Reset

If you need to reset the project state completely:

```powershell
npm run reset-project
```

## Performance Considerations

- Be careful with excessive re-renders in components that use the timer state
- Minimize operations in the main timer loop to ensure accuracy
- Consider the impact of adding new features on battery usage

## Future Development

Planned features and improvements:
- Cloud sync for user data
- Additional statistics and visualizations
- Enhanced task management features
- Custom timer sounds

## Dependencies

The project relies on the following key dependencies:
- Expo framework for React Native
- AsyncStorage for data persistence
- Expo Notifications for timer alerts
- React Navigation for tab-based navigation
- React Native Reanimated for animations
