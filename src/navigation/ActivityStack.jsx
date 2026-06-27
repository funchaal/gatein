import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import ActivityScreen from '../screens/Activity';
import ActivityHistoryScreen from '../screens/Activity/ActivityHistory';

const Stack = createStackNavigator();

export default function ActivityStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="ActivityHome" component={ActivityScreen} />
            <Stack.Screen name="ActivityHistory" component={ActivityHistoryScreen} />
        </Stack.Navigator>
    );
}
