import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Switch, ScrollView, Alert } from 'react-native';
import { usePomodoroContext } from '../context/PomodoroContext';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const Settings: React.FC = () => {
  const { settings, updateSettings, setCustomDuration, isDarkMode, toggleDarkMode, streak, dailyProgress } = usePomodoroContext();
  const theme = useTheme();
  
  // Local state for form values
  const [workDuration, setWorkDuration] = useState(settings.workDuration.toString());
  const [shortBreakDuration, setShortBreakDuration] = useState(settings.shortBreakDuration.toString());
  const [longBreakDuration, setLongBreakDuration] = useState(settings.longBreakDuration.toString());
  const [sessionsBeforeLongBreak, setSessionsBeforeLongBreak] = useState(
    settings.sessionsBeforeLongBreak.toString()
  );
  const [customDuration, setCustomDurationValue] = useState('');
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(settings.dailyGoalMinutes.toString());
  
  // Handle saving settings
  const handleSaveSettings = () => {
    const updatedSettings = {
      workDuration: parseInt(workDuration) || 25,
      shortBreakDuration: parseInt(shortBreakDuration) || 5,
      longBreakDuration: parseInt(longBreakDuration) || 15,
      sessionsBeforeLongBreak: parseInt(sessionsBeforeLongBreak) || 4,
      dailyGoalMinutes: parseInt(dailyGoalMinutes) || 180,
      notificationsEnabled: settings.notificationsEnabled,
    };
    
    updateSettings(updatedSettings);
    Alert.alert("Settings Saved", "Your settings have been updated successfully.");
  };
  
  // Handle setting custom duration
  const handleCustomDuration = () => {
    const duration = parseInt(customDuration);
    if (duration > 0) {
      setCustomDuration(duration);
      setCustomDurationValue('');
    }
  };
  
  // Toggle notifications
  const toggleNotifications = () => {
    updateSettings({
      notificationsEnabled: !settings.notificationsEnabled,
    });
  };
  
  // Calculate progress percentage
  const calculateProgress = () => {
    const percentage = Math.min(100, Math.round((dailyProgress / settings.dailyGoalMinutes) * 100));
    return percentage;
  };
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
      
      {/* Daily Goal & Streak Section */}
      <View style={[styles.settingSection, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Daily Goal & Streak</Text>
        
        {/* Daily Goal Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressInfo}>
            <Text style={[styles.progressText, { color: theme.text }]}>
              Today's Progress: {dailyProgress} / {settings.dailyGoalMinutes} minutes
            </Text>
            <Text style={[styles.progressPercentage, { color: theme.primary }]}>
              {calculateProgress()}%
            </Text>
          </View>
          
          <View style={[styles.progressBarBackground, { backgroundColor: theme.border }]}>
            <View 
              style={[
                styles.progressBarFill, 
                { 
                  backgroundColor: theme.primary,
                  width: `${calculateProgress()}%` 
                }
              ]} 
            />
          </View>
        </View>
        
        {/* Streak Information */}
        <View style={styles.streakContainer}>
          <View style={styles.streakItem}>
            <Text style={[styles.streakNumber, { color: theme.primary }]}>{streak.currentStreak}</Text>
            <Text style={[styles.streakLabel, { color: theme.textSecondary }]}>Current Streak</Text>
          </View>
          
          <View style={styles.streakItem}>
            <Text style={[styles.streakNumber, { color: theme.primary }]}>{streak.highestStreak}</Text>
            <Text style={[styles.streakLabel, { color: theme.textSecondary }]}>Best Streak</Text>
          </View>
        </View>
        
        {/* Daily Goal Setting */}
        <View style={styles.inputRow}>
          <Text style={[styles.settingLabel, { color: theme.text }]}>Daily Goal (minutes)</Text>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
            keyboardType="number-pad"
            value={dailyGoalMinutes}
            onChangeText={setDailyGoalMinutes}
            maxLength={4}
          />
        </View>
      </View>
      
      {/* Theme Toggle */}
      <View style={[styles.settingSection, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Appearance</Text>
        
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: theme.text }]}>Dark Mode</Text>
          <Switch
            value={isDarkMode}
            onValueChange={toggleDarkMode}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
        
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: theme.text }]}>Notifications</Text>
          <Switch
            value={settings.notificationsEnabled}
            onValueChange={toggleNotifications}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>
      
      {/* Timer Settings */}
      <View style={[styles.settingSection, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Timer Settings</Text>
        
        <View style={styles.inputRow}>
          <Text style={[styles.settingLabel, { color: theme.text }]}>Work Duration (minutes)</Text>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
            keyboardType="number-pad"
            value={workDuration}
            onChangeText={setWorkDuration}
            maxLength={3}
          />
        </View>
        
        <View style={styles.inputRow}>
          <Text style={[styles.settingLabel, { color: theme.text }]}>Short Break (minutes)</Text>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
            keyboardType="number-pad"
            value={shortBreakDuration}
            onChangeText={setShortBreakDuration}
            maxLength={2}
          />
        </View>
        
        <View style={styles.inputRow}>
          <Text style={[styles.settingLabel, { color: theme.text }]}>Long Break (minutes)</Text>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
            keyboardType="number-pad"
            value={longBreakDuration}
            onChangeText={setLongBreakDuration}
            maxLength={2}
          />
        </View>
        
        <View style={styles.inputRow}>
          <Text style={[styles.settingLabel, { color: theme.text }]}>Sessions Before Long Break</Text>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
            keyboardType="number-pad"
            value={sessionsBeforeLongBreak}
            onChangeText={setSessionsBeforeLongBreak}
            maxLength={1}
          />
        </View>
        
        <TouchableOpacity 
          style={[styles.saveButton, { backgroundColor: theme.primary }]}
          onPress={handleSaveSettings}
        >
          <Text style={styles.saveButtonText}>Save Settings</Text>
        </TouchableOpacity>
      </View>
      
      {/* Custom Duration */}
      <View style={[styles.settingSection, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Custom Duration</Text>
        <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
          Set a one-time custom duration for your next work session
        </Text>
        
        <View style={styles.customDurationContainer}>
          <TextInput
            style={[
              styles.customDurationInput, 
              { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }
            ]}
            keyboardType="number-pad"
            value={customDuration}
            onChangeText={setCustomDurationValue}
            placeholder="Duration in minutes"
            placeholderTextColor={theme.textSecondary}
            maxLength={4}
          />
          
          <TouchableOpacity 
            style={[styles.customDurationButton, { backgroundColor: theme.secondary }]}
            onPress={handleCustomDuration}
          >
            <Ionicons name="checkmark" size={24} color="white" />
          </TouchableOpacity>
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
  settingSection: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 16,
    flex: 1,
  },
  inputRow: {
    marginBottom: 16,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginTop: 8,
    fontSize: 16,
  },
  saveButton: {
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  customDurationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customDurationInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    marginRight: 8,
  },
  customDurationButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBarBackground: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
  streakContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 10,
  },
  streakItem: {
    alignItems: 'center',
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  streakLabel: {
    fontSize: 14,
  },
});

export default Settings; 