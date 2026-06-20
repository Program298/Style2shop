import * as React from 'react';
import { Text, View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from './Home';
import Profile from './Profile';

import Search from './Search';
import Cart from './Cart';

const Tab = createBottomTabNavigator();

function LeftLogo() {
  return (
    <Image source={require('@assets/images/logo.png')} style={styles.logo} />
  );
}

function RightLogo({ navigation }) {
  return (
    <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
      <Image source={require('@assets/images/cart.png')} style={styles.logo2} />
    </TouchableOpacity>
  );
}

export default function Tabnavi() {
  return (
    
      <Tab.Navigator
        screenOptions={({ navigation }) => ({
          tabBarActiveTintColor: '#e91e63',
          tabBarStyle: {
            height: 75, // Increase the height of the tab bar
            paddingBottom: 10,
          },
          headerShown: true,
          headerTitle: () => null,
          headerLeft: () => <LeftLogo />,
          headerRight: () => <RightLogo navigation={navigation} />,
          headerStyle: {
            backgroundColor: '#D7A3FF',
          },
        })}
      >
        <Tab.Screen
          name="Home"
          component={Home}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Image source={require('@assets/images/home-button.png')} style={{ width: size, height: size }} />
            ),
          }}
        />
        <Tab.Screen
          name="Search"
          component={Search}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Image source={require('@assets/images/search.png')} style={{ width: size, height: size }} />
            ),
          }}
        />

        <Tab.Screen
          name="Profile"
          component={Profile}
          options={{
            tabBarLabel: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <Image source={require('@assets/images/profile.png')} style={{ width: size, height: size }} />
            ),
          }}
        />
        <Tab.Screen
          name="Cart"
          component={Cart}
          options={{
            tabBarButton: () => null, // Hide this tab from the tab bar
            tabBarVisible: false,
          }}
        />
      </Tab.Navigator>
   
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 80,
    height: 80,
    marginTop: -30,
  },
  logo2: {
    width: 70,
    height: 70,
    marginTop: -30,
  },
});
