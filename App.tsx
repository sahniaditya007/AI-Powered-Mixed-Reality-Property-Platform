import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import { AppProvider } from './context/AppContext';
import Dashboard from './screens/Dashboard';
import VRGuest from './screens/VRGuest';
import ARReporter from './screens/ARReporter';
import PropertyDetail from './screens/PropertyDetail';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator
          initialRouteName="Dashboard"
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#080F1E' },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="Dashboard" component={Dashboard} />
          <Stack.Screen name="Property Detail" component={PropertyDetail} />
          <Stack.Screen
            name="VR Guest"
            component={VRGuest}
            options={{ animation: 'fade' }}
          />
          <Stack.Screen
            name="AR Reporter"
            component={ARReporter}
            options={{ animation: 'slide_from_bottom' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}
