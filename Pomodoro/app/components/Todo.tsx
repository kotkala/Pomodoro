import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// Define the Task interface
interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

const TASKS_STORAGE_KEY = 'pomodoro_tasks';

const Todo: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const theme = useTheme();

  // Load saved tasks when component mounts
  useEffect(() => {
    loadTasks();
  }, []);

  // Save tasks to AsyncStorage whenever they change
  useEffect(() => {
    saveTasks();
  }, [tasks]);

  const loadTasks = async () => {
    try {
      const tasksJson = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
      if (tasksJson) {
        setTasks(JSON.parse(tasksJson));
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  };

  const saveTasks = async () => {
    try {
      await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Failed to save tasks:', error);
    }
  };

  const addTask = () => {
    if (newTaskTitle.trim() === '') return;

    if (editingTask) {
      // Update existing task
      setTasks(tasks.map(task => 
        task.id === editingTask.id 
          ? { ...task, title: newTaskTitle }
          : task
      ));
      setEditingTask(null);
    } else {
      // Add new task
      const newTask: Task = {
        id: Date.now().toString(),
        title: newTaskTitle,
        completed: false,
        createdAt: new Date().toISOString()
      };
      setTasks([newTask, ...tasks]);
    }
    
    setNewTaskTitle('');
  };

  const toggleTaskCompletion = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id 
        ? { ...task, completed: !task.completed }
        : task
    ));
  };

  const startEditTask = (task: Task) => {
    setEditingTask(task);
    setNewTaskTitle(task.title);
  };

  const deleteTask = (id: string) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          onPress: () => {
            setTasks(tasks.filter(task => task.id !== id));
            if (editingTask && editingTask.id === id) {
              setEditingTask(null);
              setNewTaskTitle('');
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: Task }) => (
    <View style={[styles.taskItem, { backgroundColor: theme.backgroundSecondary }]}>
      <TouchableOpacity 
        style={styles.checkboxContainer}
        onPress={() => toggleTaskCompletion(item.id)}
      >
        <View style={[
          styles.checkbox, 
          { borderColor: theme.primary },
          item.completed && { backgroundColor: theme.primary }
        ]}>
          {item.completed && (
            <Ionicons name="checkmark" size={16} color="#fff" />
          )}
        </View>
      </TouchableOpacity>
      
      <Text 
        style={[
          styles.taskTitle, 
          { color: theme.text },
          item.completed && styles.completedTask
        ]}
      >
        {item.title}
      </Text>
      
      <View style={styles.taskActions}>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => startEditTask(item)}
        >
          <Ionicons name="pencil-outline" size={20} color={theme.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => deleteTask(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color={theme.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary }]}>
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder="Add a task..."
          placeholderTextColor={theme.textSecondary}
          value={newTaskTitle}
          onChangeText={setNewTaskTitle}
          onSubmitEditing={addTask}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Ionicons 
            name={editingTask ? "checkmark" : "add"} 
            size={24} 
            color="#fff" 
          />
        </TouchableOpacity>
      </View>
      
      {editingTask && (
        <View style={[styles.editingIndicator, { backgroundColor: theme.backgroundSecondary }]}>
          <Text style={[styles.editingText, { color: theme.textSecondary }]}>
            Editing task
          </Text>
          <TouchableOpacity 
            onPress={() => {
              setEditingTask(null);
              setNewTaskTitle('');
            }}
          >
            <Text style={[styles.cancelButton, { color: theme.primary }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      <FlatList
        data={tasks}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No tasks yet. Add a task to get started!
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    flex: 1,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskTitle: {
    flex: 1,
    fontSize: 16,
  },
  completedTask: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  taskActions: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 8,
    marginLeft: 4,
  },
  editingIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    marginBottom: 16,
    borderRadius: 8,
  },
  editingText: {
    fontStyle: 'italic',
  },
  cancelButton: {
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default Todo; 