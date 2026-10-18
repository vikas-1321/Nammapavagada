import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { RootStackParamList, MainTabParamList } from './types';

// Screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { ManagePlacesScreen } from '../screens/places/ManagePlacesScreen';
import { PlaceDetailScreen } from '../screens/places/PlaceDetailScreen';
import { CategorySelectScreen } from '../screens/categories/CategorySelectScreen';
import { SubcategorySelectScreen } from '../screens/categories/SubcategorySelectScreen';
import { PlaceFormScreen } from '../screens/forms/PlaceFormScreen';
import { BusRouteManageScreen } from '../screens/buses/BusRouteManageScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const TabBarIcon = ({ label, focused }: { label: string; focused: boolean }) => {
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.6 }}>
      {label}
    </Text>
  );
};

const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ focused }) => <TabBarIcon label="📊" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="PlacesTab"
        component={ManagePlacesScreen}
        options={{
          tabBarLabel: 'Places',
          tabBarIcon: ({ focused }) => <TabBarIcon label="🏢" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="AddTab"
        component={CategorySelectScreen}
        options={{
          tabBarLabel: 'Add Place',
          tabBarIcon: ({ focused }) => <TabBarIcon label="➕" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="BusesTab"
        component={BusRouteManageScreen}
        options={{
          tabBarLabel: 'Transit',
          tabBarIcon: ({ focused }) => <TabBarIcon label="🚌" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ focused }) => <TabBarIcon label="⚙️" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
};

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.splashCard}>
          <Text style={styles.splashIcon}>🏛️</Text>
          <Text style={styles.splashTitle}>NAMMA PAVAGADA</Text>
          <Text style={styles.splashSubtitle}>Admin Ground-Truth Console</Text>
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={{ marginTop: 24 }}
          />
          <Text style={styles.splashStatus}>Verifying Admin Session...</Text>
        </View>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen
              name="CategorySelect"
              component={CategorySelectScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="SubcategorySelect"
              component={SubcategorySelectScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="PlaceForm"
              component={PlaceFormScreen}
              options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="PlaceDetail"
              component={PlaceDetailScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="BusRouteManage"
              component={BusRouteManageScreen}
              options={{ animation: 'slide_from_right' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  splashCard: {
    backgroundColor: colors.surface,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  splashIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  splashTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1,
  },
  splashSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 4,
  },
  splashStatus: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 16,
  },
});
