import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useDispatch } from 'react-redux';
import { selectAppointment } from '../../../store/slices/appointmentsSlice';
import { get, formatDate, getStatusColor } from './utils';
import { styles } from './styles';
import { NewLayout } from './components/NewLayout';
import { OldLayout } from './components/OldLayout';

export default function AppointmentCard({ item, config }) {
    const dispatch = useDispatch();

    const handlePress = () => {
        dispatch(selectAppointment({ appointment: item, config }));
    };

    const status = get(item, ['status', 'Status']) || 'Desconhecido';
    const statusBaseColor = getStatusColor(status);
    const displayTime = formatDate(get(item, ['schedule_start_time', 'Start_Time', 'start_time', 'scheduled_time']));
    const displayId = get(item, ['booking_number', 'Appt', 'id', 'booking']);

    // Verifica se usa nova estrutura (card_layout) ou antiga (main)
    const useNewLayout = config?.card_layout !== undefined;

    return (
        <Pressable 
            style={({ pressed }) => [ styles.card, pressed && styles.cardPressed ]} 
            onPress={handlePress}
        >
            <View style={styles.headerRow}>
                <Text style={styles.dateText}>{displayTime}</Text>
                <Text style={styles.idText}>#{displayId}</Text>
            </View>

            {/* Renderiza layout novo ou antigo baseado na estrutura do config */}
            {useNewLayout ? (
                <NewLayout item={item} config={config} status={status} statusBaseColor={statusBaseColor} />
            ) : (
                <OldLayout item={item} config={config} status={status} statusBaseColor={statusBaseColor} />
            )}
        </Pressable>
    );
}
