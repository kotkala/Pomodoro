import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme, Platform, AppState, AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';

// Define session types
export type SessionType = 'work' | 'shortBreak' | 'longBreak';

// Define session history record
export interface SessionRecord {
  type: SessionType;
  duration: number; // in minutes
  startTime: string; // ISO string
  endTime: string; // ISO string
}

// Define streak data
export interface StreakData {
  currentStreak: number;
  lastCompletedDate: string | null; // ISO date string
  highestStreak: number;
}

// Define context type
interface PomodoroContextType {
  // Timer state
  isRunning: boolean;
  currentSession: SessionType;
  timeLeft: number;
  totalTime: number;
  
  // Settings
  settings: {
    workDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    sessionsBeforeLongBreak: number;
    dailyGoalMinutes: number; // New: daily goal in minutes
    notificationsEnabled: boolean; // New: enable/disable notifications
  };
  
  // History
  sessionHistory: SessionRecord[];
  
  // Theme
  isDarkMode: boolean;
  
  // Goals & Streaks
  dailyProgress: number; // minutes completed today
  streak: StreakData;
  
  // Actions
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  skipSession: () => void;
  setCustomDuration: (minutes: number) => void;
  updateSettings: (newSettings: Partial<PomodoroContextType['settings']>) => void;
  toggleDarkMode: () => void;
}

// Create context with default values
const PomodoroContext = createContext<PomodoroContextType>({
  isRunning: false,
  currentSession: 'work',
  timeLeft: 25 * 60, // 25 minutes in seconds
  totalTime: 25 * 60,
  
  settings: {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4,
    dailyGoalMinutes: 180, // Default 3 hours goal
    notificationsEnabled: true,
  },
  
  sessionHistory: [],
  
  isDarkMode: false,
  
  dailyProgress: 0,
  streak: {
    currentStreak: 0,
    lastCompletedDate: null,
    highestStreak: 0,
  },
  
  startTimer: () => {},
  pauseTimer: () => {},
  resetTimer: () => {},
  skipSession: () => {},
  setCustomDuration: () => {},
  updateSettings: () => {},
  toggleDarkMode: () => {},
});

// Storage keys
const SETTINGS_STORAGE_KEY = 'pomodoro_settings';
const HISTORY_STORAGE_KEY = 'pomodoro_history';
const THEME_STORAGE_KEY = 'pomodoro_theme';
const STREAK_STORAGE_KEY = 'pomodoro_streak';
const DAILY_PROGRESS_KEY = 'pomodoro_daily_progress';
const LAST_DATE_KEY = 'pomodoro_last_date';

export const PomodoroProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Timer state
  const [isRunning, setIsRunning] = useState(false);
  const [currentSession, setCurrentSession] = useState<SessionType>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // Default: 25 minutes in seconds
  const [totalTime, setTotalTime] = useState(25 * 60);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<string | null>(null);
  
  // Settings
  const [settings, setSettings] = useState({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4,
    dailyGoalMinutes: 180, // Default 3 hours
    notificationsEnabled: true,
  });
  
  // History
  const [sessionHistory, setSessionHistory] = useState<SessionRecord[]>([]);
  
  // Theme
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');
  
  // Goals & Streaks
  const [dailyProgress, setDailyProgress] = useState(0);
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0,
    lastCompletedDate: null,
    highestStreak: 0,
  });
  
  // App state for tracking when app comes to foreground
  const handleAppStateChange = useCallback((nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      // Check if day has changed and reset daily progress if needed
      checkAndResetDailyProgress();
    }
  }, []);
  
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
    };
  }, [handleAppStateChange]);
  
  // Setup notifications
  useEffect(() => {
    registerForPushNotificationsAsync();
    
    // Set notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    
    // Schedule random reminder if enabled
    if (settings.notificationsEnabled) {
      scheduleRandomReminder();
    }
    
    return () => {
      // Clean up notifications when component unmounts
      Notifications.cancelAllScheduledNotificationsAsync();
    };
  }, [settings.notificationsEnabled]);
  
  const registerForPushNotificationsAsync = useCallback(async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
    
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Permission not granted for notifications');
      return;
    }
  }, []);
  
  const scheduleRandomReminder = useCallback(async () => {
    // Cancel any existing notifications first
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    if (!settings.notificationsEnabled) return;
    
    // Schedule a random reminder during work hours (9 AM - 5 PM)
    const now = new Date();
    const scheduledTime = new Date();
    
    // Generate random hour between 9 and 17 (9 AM - 5 PM)
    const randomHour = Math.floor(Math.random() * 9) + 9;
    scheduledTime.setHours(randomHour);
    
    // Generate random minute
    const randomMinute = Math.floor(Math.random() * 60);
    scheduledTime.setMinutes(randomMinute);
    
    // If time is in the past, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }
    
    const secondsUntilNotification = Math.floor(
      (scheduledTime.getTime() - now.getTime()) / 1000
    );
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Don't forget your Pomodoro goal!",
        body: `You've completed ${dailyProgress} minutes of your ${settings.dailyGoalMinutes} minute goal today. Keep going!`,
      },
      trigger: {
        seconds: secondsUntilNotification,
      },
    });
  }, [settings.notificationsEnabled, dailyProgress, settings.dailyGoalMinutes]);
  
  // Check if day has changed and reset daily progress if needed
  const checkAndResetDailyProgress = useCallback(async () => {
    try {
      const lastDateStr = await AsyncStorage.getItem(LAST_DATE_KEY);
      const currentDate = new Date().toISOString().split('T')[0]; // Get current date as YYYY-MM-DD
      
      if (lastDateStr !== currentDate) {
        // Day has changed, reset daily progress
        setDailyProgress(0);
        await AsyncStorage.setItem(DAILY_PROGRESS_KEY, '0');
        await AsyncStorage.setItem(LAST_DATE_KEY, currentDate);
        
        // Update streak if needed
        if (lastDateStr) {
          const lastDate = new Date(lastDateStr);
          const today = new Date(currentDate);
          const timeDiff = today.getTime() - lastDate.getTime();
          const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
          
          // If more than 1 day has passed, break the streak
          if (dayDiff > 1) {
            await updateStreak(false);
          }
        }
      }
    } catch (error) {
      console.error("Error checking daily progress:", error);
    }
  }, []);
  
  // Update streak data
  const updateStreak = useCallback(async (goalCompleted: boolean) => {
    try {
      const newStreak = { ...streak };
      const currentDate = new Date().toISOString().split('T')[0];
      
      if (goalCompleted) {
        // If goal was completed today and not already counted
        if (newStreak.lastCompletedDate !== currentDate) {
          newStreak.currentStreak += 1;
          
          // Update highest streak if needed
          if (newStreak.currentStreak > newStreak.highestStreak) {
            newStreak.highestStreak = newStreak.currentStreak;
          }
          
          newStreak.lastCompletedDate = currentDate;
        }
      } else {
        // Reset streak if goal wasn't completed
        newStreak.currentStreak = 0;
      }
      
      setStreak(newStreak);
      await AsyncStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(newStreak));
    } catch (error) {
      console.error("Error updating streak:", error);
    }
  }, [streak]);
  
  // Check if daily goal has been reached
  const checkDailyGoal = useCallback(async (addedMinutes: number) => {
    try {
      const newDailyProgress = dailyProgress + addedMinutes;
      setDailyProgress(newDailyProgress);
      
      await AsyncStorage.setItem(DAILY_PROGRESS_KEY, newDailyProgress.toString());
      
      // Update current date
      const currentDate = new Date().toISOString().split('T')[0];
      await AsyncStorage.setItem(LAST_DATE_KEY, currentDate);
      
      // Check if daily goal has been reached for the first time today
      if (dailyProgress < settings.dailyGoalMinutes && 
          newDailyProgress >= settings.dailyGoalMinutes) {
        // Goal reached for the first time today
        await updateStreak(true);
        
        // Show congratulatory notification
        if (settings.notificationsEnabled) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Daily Goal Reached! 🎉",
              body: `Great job! You've completed your ${settings.dailyGoalMinutes} minute focus goal for today!`,
            },
            trigger: null, // Send immediately
          });
        }
      }
    } catch (error) {
      console.error("Error checking daily goal:", error);
    }
  }, [dailyProgress, settings.dailyGoalMinutes, settings.notificationsEnabled, updateStreak]);
  
  // Load saved data from AsyncStorage
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        // Load settings
        const savedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
        
        // Load history
        const savedHistory = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
        if (savedHistory) {
          setSessionHistory(JSON.parse(savedHistory));
        }
        
        // Load theme
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme) {
          setIsDarkMode(JSON.parse(savedTheme));
        }
        
        // Load streak
        const savedStreak = await AsyncStorage.getItem(STREAK_STORAGE_KEY);
        if (savedStreak) {
          setStreak(JSON.parse(savedStreak));
        }
        
        // Load daily progress
        const savedDailyProgress = await AsyncStorage.getItem(DAILY_PROGRESS_KEY);
        if (savedDailyProgress) {
          setDailyProgress(parseInt(savedDailyProgress, 10));
        }
        
        // Initialize current date if needed
        const lastDate = await AsyncStorage.getItem(LAST_DATE_KEY);
        if (!lastDate) {
          const currentDate = new Date().toISOString().split('T')[0];
          await AsyncStorage.setItem(LAST_DATE_KEY, currentDate);
        } else {
          // Check if day has changed and reset if needed
          await checkAndResetDailyProgress();
        }
      } catch (error) {
        console.error("Error loading saved data:", error);
      }
    };
    
    loadSavedData();
  }, []);
  
  // Save settings to AsyncStorage whenever they change
  useEffect(() => {
    const saveSettings = async () => {
      try {
        await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      } catch (error) {
        console.error("Error saving settings:", error);
      }
    };
    
    saveSettings();
  }, [settings]);
  
  // Save session history to AsyncStorage whenever it changes
  useEffect(() => {
    const saveHistory = async () => {
      try {
        await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(sessionHistory));
      } catch (error) {
        console.error("Error saving history:", error);
      }
    };
    
    saveHistory();
  }, [sessionHistory]);
  
  // Save theme preference to AsyncStorage whenever it changes
  useEffect(() => {
    const saveTheme = async () => {
      try {
        await AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(isDarkMode));
      } catch (error) {
        console.error("Error saving theme:", error);
      }
    };
    
    saveTheme();
  }, [isDarkMode]);
  
  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(interval!);
            handleSessionComplete();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      handleSessionComplete();
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft]);
  
  // Handle session completion
  const handleSessionComplete = useCallback(() => {
    // Record completed session if it was a work session
    if (currentSession === 'work' && sessionStartTime) {
      const endTime = new Date().toISOString();
      const sessionRecord: SessionRecord = {
        type: 'work',
        duration: settings.workDuration,
        startTime: sessionStartTime,
        endTime,
      };
      
      setSessionHistory(prev => [...prev, sessionRecord]);
      
      // Update daily progress
      checkDailyGoal(settings.workDuration);
    }
    
    // Sound notification or vibration could be added here
    
    // Update completed sessions counter if work session
    if (currentSession === 'work') {
      setCompletedSessions(prev => prev + 1);
    }
    
    // Determine next session type
    let nextSession: SessionType;
    let nextDuration: number;
    
    if (currentSession === 'work') {
      // After work, determine if it should be a short or long break
      if (completedSessions % settings.sessionsBeforeLongBreak === settings.sessionsBeforeLongBreak - 1) {
        nextSession = 'longBreak';
        nextDuration = settings.longBreakDuration * 60;
      } else {
        nextSession = 'shortBreak';
        nextDuration = settings.shortBreakDuration * 60;
      }
      
      // Auto-start break if enabled
      setIsRunning(settings.autoStartBreak || false);
    } else {
      // After a break, go back to work
      nextSession = 'work';
      nextDuration = settings.workDuration * 60;
      
      // Auto-start work if enabled
      setIsRunning(settings.autoStartWork || false);
    }
    
    // Update session state
    setCurrentSession(nextSession);
    setTimeLeft(nextDuration);
    setTotalTime(nextDuration);
    
    // Set session start time if starting a work session
    if (nextSession === 'work') {
      setSessionStartTime(new Date().toISOString());
    } else {
      setSessionStartTime(null);
    }
    
    // Show notification based on next session
    if (settings.notificationsEnabled) {
      const title = nextSession === 'work' 
        ? "Time to focus!" 
        : nextSession === 'shortBreak'
          ? "Take a short break!"
          : "Take a long break!";
          
      const body = nextSession === 'work'
        ? `Start your ${settings.workDuration}-minute focus session.`
        : nextSession === 'shortBreak'
          ? `Enjoy your ${settings.shortBreakDuration}-minute break.`
          : `Enjoy your ${settings.longBreakDuration}-minute break. You've earned it!`;
      
      Notifications.scheduleNotificationAsync({
        content: { title, body },
        trigger: null, // Send immediately
      });
    }
  }, [currentSession, sessionStartTime, settings, completedSessions, checkDailyGoal]);
  
  // Timer controls
  const startTimer = useCallback(() => {
    if (!isRunning) {
      setIsRunning(true);
      
      // Record start time for work sessions
      if (currentSession === 'work' && !sessionStartTime) {
        setSessionStartTime(new Date().toISOString());
      }
    }
  }, [isRunning, currentSession, sessionStartTime]);
  
  const pauseTimer = useCallback(() => {
    if (isRunning) {
      setIsRunning(false);
    }
  }, [isRunning]);
  
  const resetTimer = useCallback(() => {
    setIsRunning(false);
    
    // Reset timer based on current session type
    switch (currentSession) {
      case 'work':
        setTimeLeft(settings.workDuration * 60);
        setTotalTime(settings.workDuration * 60);
        break;
      case 'shortBreak':
        setTimeLeft(settings.shortBreakDuration * 60);
        setTotalTime(settings.shortBreakDuration * 60);
        break;
      case 'longBreak':
        setTimeLeft(settings.longBreakDuration * 60);
        setTotalTime(settings.longBreakDuration * 60);
        break;
    }
    
    if (currentSession === 'work') {
      setSessionStartTime(null);
    }
  }, [currentSession, settings]);
  
  const skipSession = useCallback(() => {
    setIsRunning(false);
    
    // Skip to next session
    if (currentSession === 'work') {
      // If we're skipping a work session, record it as completed
      if (completedSessions % settings.sessionsBeforeLongBreak === settings.sessionsBeforeLongBreak - 1) {
        setCurrentSession('longBreak');
        setTimeLeft(settings.longBreakDuration * 60);
        setTotalTime(settings.longBreakDuration * 60);
      } else {
        setCurrentSession('shortBreak');
        setTimeLeft(settings.shortBreakDuration * 60);
        setTotalTime(settings.shortBreakDuration * 60);
      }
      
      // Increment completed sessions counter
      setCompletedSessions(prev => prev + 1);
      setSessionStartTime(null);
    } else {
      // Skipping a break, go back to work
      setCurrentSession('work');
      setTimeLeft(settings.workDuration * 60);
      setTotalTime(settings.workDuration * 60);
      setSessionStartTime(new Date().toISOString());
    }
  }, [currentSession, completedSessions, settings]);
  
  const setCustomDuration = useCallback((minutes: number) => {
    if (minutes > 0) {
      setTimeLeft(minutes * 60);
      setTotalTime(minutes * 60);
      
      // If timer is running, reset session start time
      if (isRunning && currentSession === 'work') {
        setSessionStartTime(new Date().toISOString());
      }
    }
  }, [isRunning, currentSession]);
  
  const updateSettings = useCallback((newSettings: Partial<PomodoroContextType['settings']>) => {
    setSettings(prevSettings => {
      const updatedSettings = { ...prevSettings, ...newSettings };
      
      // If timer is not running, update current timer based on session type
      if (!isRunning) {
        switch (currentSession) {
          case 'work':
            setTimeLeft(updatedSettings.workDuration * 60);
            setTotalTime(updatedSettings.workDuration * 60);
            break;
          case 'shortBreak':
            setTimeLeft(updatedSettings.shortBreakDuration * 60);
            setTotalTime(updatedSettings.shortBreakDuration * 60);
            break;
          case 'longBreak':
            setTimeLeft(updatedSettings.longBreakDuration * 60);
            setTotalTime(updatedSettings.longBreakDuration * 60);
            break;
        }
      }
      
      return updatedSettings;
    });
  }, [isRunning, currentSession]);
  
  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);
  
  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    isRunning,
    currentSession,
    timeLeft,
    totalTime,
    settings,
    sessionHistory,
    isDarkMode,
    dailyProgress,
    streak,
    startTimer,
    pauseTimer,
    resetTimer,
    skipSession,
    setCustomDuration,
    updateSettings,
    toggleDarkMode,
  }), [
    isRunning,
    currentSession,
    timeLeft,
    totalTime,
    settings,
    sessionHistory,
    isDarkMode,
    dailyProgress,
    streak,
    startTimer,
    pauseTimer,
    resetTimer,
    skipSession,
    setCustomDuration,
    updateSettings,
    toggleDarkMode,
  ]);
  
  return (
    <PomodoroContext.Provider value={contextValue}>
      {children}
    </PomodoroContext.Provider>
  );
};

export const usePomodoroContext = () => useContext(PomodoroContext);

// Default export
export default PomodoroContext; 