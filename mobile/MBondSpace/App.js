import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebase';
import AuthScreen from './screens/AuthScreen';
import ProfileScreen from './screens/ProfileScreen';
import GroupsScreen from './screens/GroupsScreen';
import ChatScreen from './screens/ChatScreen';
import EventsScreen from './screens/EventsScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import LoadingScreen from './screens/LoadingScreen';
import TabNavigator from './navigators/TabNavigator';

const Stack = createNativeStackNavigator();

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      // Check if user is admin
      if (user) {
        // In a real app, you would check the user's role in Firestore
        setIsAdmin(user.email === 'admin@example.com');
      } else {
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {currentUser ? (
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Groups" component={GroupsScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="Events" component={EventsScreen} />
            {isAdmin && (
              <Stack.Screen name="Admin" component={AdminDashboardScreen} />
            )}
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;