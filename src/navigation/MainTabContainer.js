import React from 'react';
import { View, StyleSheet } from 'react-native';
import BottomTabNavigator from './BottomTabNavigator';
import CheckinBar from '../components/home/CheckinBar';

export default function MainTabContainer() {
    return (
        <View style={styles.container}>
            <BottomTabNavigator />
            <CheckinBar />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});