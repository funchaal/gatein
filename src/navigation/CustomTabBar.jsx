import React from 'react';
import { View } from 'react-native';
import { BottomTabBar } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import CheckinBar from '../components/ActionBar/CheckinBar';
import TicketBar from '../components/ActionBar/TicketBar';
import { selectHistoryAppointments, selectIsDriverCheckedIn, selectOnGoingAppointments } from '../store/slices/appointmentsSlice';

export default function CustomTabBar(props) {
    const insets = useSafeAreaInsets();
    const isCheckedIn = useSelector(selectIsDriverCheckedIn);
    
    return (
        <View style={{ paddingBottom: insets.bottom }}>
            {isCheckedIn ? <TicketBar /> : <CheckinBar />}
            <BottomTabBar {...props} />
        </View>
    );
}