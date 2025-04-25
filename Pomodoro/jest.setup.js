// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve()),
  cancelAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve()),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  setNotificationChannelAsync: jest.fn(() => Promise.resolve()),
  AndroidImportance: {
    MAX: 5,
  },
}));

// Mock AppState
jest.mock('react-native', () => {
  const reactNative = jest.requireActual('react-native');
  return {
    ...reactNative,
    AppState: {
      ...reactNative.AppState,
      addEventListener: jest.fn((event, callback) => ({
        remove: jest.fn(),
      })),
    },
    Platform: {
      ...reactNative.Platform,
      OS: 'ios',
      select: jest.fn(obj => obj.ios),
    },
    useColorScheme: jest.fn(() => 'light'),
  };
});

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
  })),
  useNavigation: jest.fn(() => ({
    navigate: jest.fn(),
  })),
})); 