import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { usePomodoroContext, SessionRecord, SessionType } from '../context/PomodoroContext';
import { useTheme } from '../context/ThemeContext';

const History: React.FC = () => {
  const { sessionHistory } = usePomodoroContext();
  const theme = useTheme();
  
  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Get icon and color for session type
  const getSessionInfo = (type: SessionType): { label: string; color: string } => {
    switch (type) {
      case 'work':
        return { label: 'Focus', color: theme.primary };
      case 'shortBreak':
        return { label: 'Short Break', color: theme.secondary };
      case 'longBreak':
        return { label: 'Long Break', color: theme.accent };
      default:
        return { label: 'Focus', color: theme.primary };
    }
  };
  
  // Calculate duration between two dates
  const calculateDuration = (startTime: string, endTime: string): number => {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    return Math.round((end - start) / 60000); // Convert ms to minutes
  };
  
  // Render each history item
  const renderItem = ({ item }: { item: SessionRecord }) => {
    const sessionInfo = getSessionInfo(item.type);
    
    return (
      <View style={[styles.historyItem, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
        <View style={[styles.sessionTypeIndicator, { backgroundColor: sessionInfo.color }]} />
        
        <View style={styles.sessionDetails}>
          <Text style={[styles.sessionType, { color: theme.text }]}>
            {sessionInfo.label}
          </Text>
          
          <Text style={[styles.sessionTime, { color: theme.textSecondary }]}>
            {formatDate(item.startTime)}
          </Text>
        </View>
        
        <View style={styles.durationContainer}>
          <Text style={[styles.duration, { color: theme.text }]}>
            {item.duration} min
          </Text>
        </View>
      </View>
    );
  };
  
  // Empty list component
  const EmptyListComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
        No sessions completed yet. Start your first Pomodoro!
      </Text>
    </View>
  );
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>History</Text>
      
      <FlatList
        data={sessionHistory}
        renderItem={renderItem}
        keyExtractor={(item, index) => `session-${index}-${item.startTime}`}
        ListEmptyComponent={EmptyListComponent}
        style={styles.list}
        contentContainerStyle={sessionHistory.length === 0 ? styles.emptyList : undefined}
      />
    </View>
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
  list: {
    flex: 1,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  historyItem: {
    flexDirection: 'row',
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
  },
  sessionTypeIndicator: {
    width: 4,
    borderRadius: 2,
    marginRight: 12,
  },
  sessionDetails: {
    flex: 1,
  },
  sessionType: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  sessionTime: {
    fontSize: 14,
  },
  durationContainer: {
    justifyContent: 'center',
    paddingLeft: 8,
  },
  duration: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default History; 