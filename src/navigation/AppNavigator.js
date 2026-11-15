
import React from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { HomeScreen } from '../screens/HomeScreen';
import { PostDetailScreen } from '../screens/PostDetailScreen';
import { CreatePostScreen } from '../screens/CreatePostScreen';
import { EditPostScreen } from '../screens/EditPostScreen';
import { TeachersListScreen } from '../screens/TeachersListScreen';
import { CreateTeacherScreen } from '../screens/CreateTeacherScreen';
import { EditTeacherScreen } from '../screens/EditTeacherScreen';
import { StudentsListScreen } from '../screens/StudentsListScreen';
import { CreateStudentScreen } from '../screens/CreateStudentScreen';
import { EditStudentScreen } from '../screens/EditStudentScreen';
import { AdminPostsScreen } from '../screens/AdminPostsScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  const { user } = useAuth();

  const isLoggedIn = !!user;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: Platform.OS === 'ios' ? 88 : 74,
          paddingBottom: Platform.OS === 'ios' ? 26 : 14,
          paddingTop: 6
        },
        tabBarItemStyle: {
          paddingVertical: 2
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          paddingBottom: 2
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'HomeTab') {
            iconName = focused ? 'newspaper' : 'newspaper-outline';
          } else if (route.name === 'AdminTab') {
            iconName = focused ? 'shield-checkmark' : 'shield-checkmark-outline';
          } else if (route.name === 'TeachersTab') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'StudentsTab') {
            iconName = focused ? 'school' : 'school-outline';
          } else if (route.name === 'SettingsTab') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return (
            <Ionicons
              name={iconName}
              size={size || 22}
              color={color}
            />
          );
        }
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ tabBarLabel: 'Início' }}
      />

      <Tab.Screen
        name="AdminTab"
        component={AdminPostsScreen}
        options={{ tabBarLabel: 'Admin' }}
      />

      <Tab.Screen
        name="TeachersTab"
        component={TeachersListScreen}
        options={{ tabBarLabel: 'Docentes' }}
      />

      <Tab.Screen
        name="StudentsTab"
        component={StudentsListScreen}
        options={{ tabBarLabel: 'Alunos' }}
      />

      {isLoggedIn && (
        <Tab.Screen
          name="SettingsTab"
          component={SettingsScreen}
          options={{ tabBarLabel: 'Ajustes' }}
        />
      )}
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right'
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
      />

      <Stack.Screen
        name="PostDetail"
        component={PostDetailScreen}
      />

      <Stack.Screen
        name="CreatePost"
        component={CreatePostScreen}
      />

      <Stack.Screen
        name="EditPost"
        component={EditPostScreen}
      />

      <Stack.Screen
        name="CreateTeacher"
        component={CreateTeacherScreen}
      />

      <Stack.Screen
        name="EditTeacher"
        component={EditTeacherScreen}
      />

      <Stack.Screen
        name="CreateStudent"
        component={CreateStudentScreen}
      />

      <Stack.Screen
        name="EditStudent"
        component={EditStudentScreen}
      />

      <Stack.Screen
        name="Login"
        component={LoginScreen}
      />
    </Stack.Navigator>
  );
};
