import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/Home';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import ActivityStack from './ActivityStack';
import CustomTabBar from './CustomTabBar';

const Tab = createBottomTabNavigator();

const renderTabBar = props => <CustomTabBar {...props} />;

export default function BottomTabNavigator() {
    return (
        <Tab.Navigator
            tabBar={renderTabBar}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Atividade" component={ActivityStack} />
            <Tab.Screen name="Perfil" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

