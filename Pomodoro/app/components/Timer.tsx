import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { usePomodoroContext, SessionType } from '../context/PomodoroContext';
import { useTheme } from '../context/ThemeContext';

const Timer: React.FC = () => {
  const { 
    isRunning, 
    currentSession, 
    timeLeft, 
    totalTime,
    startTimer, 
    pauseTimer, 
    resetTimer, 
    skipSession,
    dailyProgress,
    settings,
    streak
  } = usePomodoroContext();
  
  const theme = useTheme();
  
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Get session name
  const getSessionName = (type: SessionType): string => {
    switch (type) {
      case 'work':
        return 'Focus';
      case 'shortBreak':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
      default:
        return 'Focus';
    }
  };
  
  // Calculate progress for the circle
  const progress = (totalTime - timeLeft) / totalTime;
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);
  
  // Calculate daily goal progress
  const dailyGoalProgress = Math.min(100, Math.round((dailyProgress / settings.dailyGoalMinutes) * 100));
  
  // Get color based on session type
  const getSessionColor = (type: SessionType): string => {
    switch (type) {
      case 'work':
        return theme.primary;
      case 'shortBreak':
        return theme.secondary;
      case 'longBreak':
        return theme.accent;
      default:
        return theme.primary;
    }
  };
  
  const sessionColor = getSessionColor(currentSession);
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Daily Goal Status */}
      <View style={styles.goalContainer}>
        <Text style={[styles.goalText, { color: theme.textSecondary }]}>
          Daily Goal: {dailyProgress}/{settings.dailyGoalMinutes} min
        </Text>
        <View style={[styles.progressBarBackground, { backgroundColor: theme.border }]}>
          <View 
            style={[
              styles.progressBarFill, 
              { 
                backgroundColor: theme.primary,
                width: `${dailyGoalProgress}%` 
              }
            ]} 
          />
        </View>
      </View>
      
      {/* Streak Display */}
      {streak.currentStreak > 0 && (
        <View style={styles.streakBadge}>
          <Ionicons name="flame" size={16} color="#FF9500" />
          <Text style={styles.streakText}>
            {streak.currentStreak} day{streak.currentStreak !== 1 ? 's' : ''}
          </Text>
        </View>
      )}
      
      <Text style={[styles.sessionName, { color: theme.text }]}>
        {getSessionName(currentSession)}
      </Text>
      
      <View style={styles.timerCircle}>
        <Svg width={radius * 2 + 20} height={radius * 2 + 20}>
          {/* Background circle */}
          <Circle
            cx={radius + 10}
            cy={radius + 10}
            r={radius}
            stroke={theme.border}
            strokeWidth={10}
            fill="transparent"
          />
          
          {/* Progress circle */}
          <Circle
            cx={radius + 10}
            cy={radius + 10}
            r={radius}
            stroke={sessionColor}
            strokeWidth={10}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            transform={`rotate(-90, ${radius + 10}, ${radius + 10})`}
          />
        </Svg>
        
        <View style={styles.timeTextContainer}>
          <Text style={[styles.timeText, { color: theme.text }]}>
            {formatTime(timeLeft)}
          </Text>
        </View>
      </View>
      
      <View style={styles.controls}>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.backgroundSecondary }]} 
          onPress={resetTimer}
        >
          <Ionicons name="refresh" size={24} color={theme.text} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.mainButton, { backgroundColor: sessionColor }]} 
          onPress={isRunning ? pauseTimer : startTimer}
        >
          <Ionicons 
            name={isRunning ? 'pause' : 'play'} 
            size={32} 
            color="white" 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.backgroundSecondary }]} 
          onPress={skipSession}
        >
          <Ionicons name="play-skip-forward" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  sessionName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  timerCircle: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  mainButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 15,
  },
  goalContainer: {
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
  },
  goalText: {
    fontSize: 14,
    marginBottom: 8,
  },
  progressBarBackground: {
    width: '80%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginBottom: 10,
  },
  streakText: {
    color: '#FF9500',
    fontWeight: 'bold',
    marginLeft: 5,
  },
});

export default Timer; 