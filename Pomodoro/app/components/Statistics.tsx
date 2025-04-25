import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { usePomodoroContext, SessionRecord } from '../context/PomodoroContext';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface DayData {
  day: string;
  date: string;
  workMinutes: number;
  sessionsCount: number;
}

const Statistics: React.FC = () => {
  const { sessionHistory, streak, settings, dailyProgress } = usePomodoroContext();
  const theme = useTheme();
  
  // Process data for weekly view
  const weeklyData = useMemo(() => {
    // Get dates for the past 7 days
    const dates: Date[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(date);
    }
    
    // Create day data objects
    const dayData: DayData[] = dates.map(date => {
      const day = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dateStr = date.toLocaleDateString('en-US', { day: 'numeric' });
      return {
        day,
        date: dateStr,
        workMinutes: 0,
        sessionsCount: 0,
      };
    });
    
    // Process session history
    sessionHistory.forEach(session => {
      if (session.type === 'work') {
        const sessionDate = new Date(session.startTime);
        
        // Check if session is within the past 7 days
        for (let i = 0; i < 7; i++) {
          const dayDate = dates[i];
          if (
            sessionDate.getDate() === dayDate.getDate() &&
            sessionDate.getMonth() === dayDate.getMonth() &&
            sessionDate.getFullYear() === dayDate.getFullYear()
          ) {
            dayData[i].workMinutes += session.duration;
            dayData[i].sessionsCount += 1;
            break;
          }
        }
      }
    });
    
    return dayData;
  }, [sessionHistory]);
  
  // Calculate weekly stats
  const weeklyStats = useMemo(() => {
    const totalMinutes = weeklyData.reduce((sum, day) => sum + day.workMinutes, 0);
    const totalSessions = weeklyData.reduce((sum, day) => sum + day.sessionsCount, 0);
    const avgDailyMinutes = totalMinutes / 7;
    
    // Find day with most focus time
    let maxDay = { day: '', minutes: 0 };
    weeklyData.forEach(day => {
      if (day.workMinutes > maxDay.minutes) {
        maxDay = { day: day.day, minutes: day.workMinutes };
      }
    });
    
    return {
      totalMinutes,
      totalSessions,
      avgDailyMinutes,
      mostProductiveDay: maxDay.day,
      mostProductiveMinutes: maxDay.minutes,
    };
  }, [weeklyData]);
  
  // Find the maximum minutes value for scaling the bars
  const maxMinutes = useMemo(() => {
    return Math.max(
      ...weeklyData.map(day => day.workMinutes),
      60 // Set minimum height to represent 1 hour
    );
  }, [weeklyData]);
  
  // Calculate daily goal progress percentage
  const goalProgress = Math.min(100, Math.round((dailyProgress / settings.dailyGoalMinutes) * 100));
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Statistics</Text>
      
      {/* Streak Section */}
      <View style={[styles.streakContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
        <View style={styles.streakHeader}>
          <Ionicons name="flame" size={24} color="#FF9500" />
          <Text style={[styles.streakTitle, { color: theme.text }]}>Your Streak</Text>
        </View>
        
        <View style={styles.streakStats}>
          <View style={styles.streakStat}>
            <Text style={[styles.streakValue, { color: "#FF9500" }]}>{streak.currentStreak}</Text>
            <Text style={[styles.streakLabel, { color: theme.textSecondary }]}>Current Streak</Text>
          </View>
          
          <View style={styles.streakDivider} />
          
          <View style={styles.streakStat}>
            <Text style={[styles.streakValue, { color: "#FF9500" }]}>{streak.highestStreak}</Text>
            <Text style={[styles.streakLabel, { color: theme.textSecondary }]}>Best Streak</Text>
          </View>
        </View>
        
        {/* Daily Goal Progress */}
        <View style={styles.goalProgressContainer}>
          <View style={styles.goalTextRow}>
            <Text style={[styles.goalText, { color: theme.text }]}>
              Today's Goal: {dailyProgress} / {settings.dailyGoalMinutes} min
            </Text>
            <Text style={[styles.goalPercentage, { color: theme.primary }]}>
              {goalProgress}%
            </Text>
          </View>
          
          <View style={[styles.goalProgressBar, { backgroundColor: theme.border }]}>
            <View 
              style={[
                styles.goalProgressFill,
                { backgroundColor: goalProgress >= 100 ? "#4CAF50" : theme.primary, width: `${goalProgress}%` }
              ]}
            />
          </View>
        </View>
      </View>
      
      {/* Weekly Overview */}
      <View style={[styles.statsContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.primary }]}>{weeklyStats.totalMinutes}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Minutes</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.primary }]}>{weeklyStats.totalSessions}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Sessions</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.primary }]}>{Math.round(weeklyStats.avgDailyMinutes)}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Avg Min/Day</Text>
        </View>
      </View>
      
      {/* Most Productive Day */}
      {weeklyStats.mostProductiveMinutes > 0 && (
        <View style={[styles.productiveDayContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Most Productive Day</Text>
          <Text style={[styles.productiveDay, { color: theme.primary }]}>
            {weeklyStats.mostProductiveDay} ({weeklyStats.mostProductiveMinutes} min)
          </Text>
        </View>
      )}
      
      {/* Weekly Chart */}
      <View style={[styles.chartContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Daily Focus Time</Text>
        
        <View style={styles.chart}>
          {weeklyData.map((day, index) => (
            <View key={index} style={styles.barContainer}>
              <View style={styles.barLabelContainer}>
                <Text style={[styles.barValue, { color: theme.text }]}>
                  {day.workMinutes > 0 ? day.workMinutes : ''}
                </Text>
              </View>
              
              <View style={styles.barWrapper}>
                <View 
                  style={[
                    styles.bar, 
                    { 
                      backgroundColor: theme.primary,
                      height: (day.workMinutes / maxMinutes) * 150,
                    }
                  ]} 
                />
              </View>
              
              <Text style={[styles.barLabel, { color: theme.textSecondary }]}>{day.day}</Text>
              <Text style={[styles.barDate, { color: theme.textSecondary }]}>{day.date}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  streakContainer: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  streakTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  streakStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  streakStat: {
    alignItems: 'center',
    flex: 1,
  },
  streakValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  streakLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  streakDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#E0E0E0',
  },
  goalProgressContainer: {
    marginTop: 8, 
  },
  goalTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  goalText: {
    fontSize: 14,
  },
  goalPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  goalProgressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  goalProgressFill: {
    height: '100%',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  productiveDayContainer: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  productiveDay: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  chartContainer: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 200,
    marginTop: 8,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barLabelContainer: {
    height: 20,
  },
  barValue: {
    fontSize: 12,
    textAlign: 'center',
  },
  barWrapper: {
    height: 150,
    justifyContent: 'flex-end',
  },
  bar: {
    width: 20,
    borderRadius: 10,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 14,
    marginTop: 8,
  },
  barDate: {
    fontSize: 12,
  },
});

export default Statistics; 