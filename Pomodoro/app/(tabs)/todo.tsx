import React from 'react';
import { Stack } from 'expo-router';
import Todo from '../components/Todo';
import { useTheme } from '../context/ThemeContext';

export default function TodoScreen() {
  const theme = useTheme();
  
  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Tasks',
          headerStyle: {
            backgroundColor: theme.backgroundSecondary,
          },
          headerTintColor: theme.text,
        }} 
      />
      <Todo />
    </>
  );
} 