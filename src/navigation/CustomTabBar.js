import React from 'react';
import { View } from 'react-native';
import { BottomTabBar } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CheckinBar from '../components/home/CheckinBar';

export default function CustomTabBar(props) {
    const insets = useSafeAreaInsets();
    return (
        <View style={{ paddingBottom: insets.bottom }}>
            <CheckinBar />
            <BottomTabBar {...props} />
        </View>
    );
}