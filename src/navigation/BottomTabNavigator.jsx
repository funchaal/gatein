import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

import HomeScreen from '../screens/Home';
import ActivityScreen from '../screens/Activity';
import ProfileScreen from '../screens/backlog/ProfileScreen';

const Tab = createBottomTabNavigator();

import CustomTabBar from './CustomTabBar';

export default function BottomTabNavigator() {
    return (
        <Tab.Navigator
            tabBar={props => <CustomTabBar {...props} />}
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Atividade') {
                        iconName = focused ? 'list' : 'list-outline';
                    } else if (route.name === 'Perfil') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Icon name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#F97316',
                tabBarInactiveTintColor: 'gray',
                headerShown: false,
                tabBarStyle: {
                    paddingTop: 4,
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Atividade" component={ActivityScreen} />
            <Tab.Screen name="Perfil" component={ProfileScreen} />
        </Tab.Navigator>
    );
}
