import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useDispatch } from 'react-redux';
import { selectAppointment } from '../../../store/slices/appointmentsSlice';
import { get, getValue, formatDate, getStatusColor } from './utils';
import { styles } from './styles';
import { THEME } from './constants';

function Row({ data, props: { label, field } }) {
    const value = field ? getValue(data, field) : null;
    if (!value) return null;

    const rowStyles = {
        container: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 2,
        }, 
        label: {
            fontSize: 14,
            color: THEME.slate400,
            fontWeight: '500',
        }, 
        value: {
            fontSize: 14,
            color: THEME.slate900,
            fontWeight: '600'
        }
    }

    return (
        <View style={rowStyles.container}>
            {label && <Text style={rowStyles.label}>{label}</Text>}
            <Text style={rowStyles.value}>{value}</Text>
        </View>
    )
}

function Header({ data, props: { label, field } = {} }) {
    const value = field ? getValue(data, field) : null;
    if (!value) return null;

    return (
        <View>
            {label && <Text style={styles.fieldLabel}>{label}</Text>}
            <Text style={styles.h1Default}>{value}</Text>
        </View>
    );
}

function SubHeader({ data, props: { label, field } = {} }) {
    const value = field ? getValue(data, field) : null;
    if (!value) return null;

    return (
        <View style={{ marginTop: 4 }}>
            {label && <Text style={styles.fieldLabel}>{label}</Text>}
            <Text style={styles.h2Default}>{value}</Text>
        </View>
    );
}

export default function AppointmentCard({ item, config, hideRows }) {
    const dispatch = useDispatch();

    const handlePress = () => {
        dispatch(selectAppointment({ appointment: item, config }));
    };

    const status = get(item, ['status', 'Status']) || 'Desconhecido';
    const statusBaseColor = getStatusColor(status);
    const displayTime = formatDate(get(item, ['schedule_start_time', 'Start_Time', 'start_time', 'scheduled_time']));
    const displayId = get(item, ['booking_number', 'Appt', 'id', 'booking']);

    const { header, sub_header, body_rows } = config?.card_layout || {};

    return (
        <Pressable 
            style={({ pressed }) => [ styles.card, pressed && styles.cardPressed ]} 
            onPress={handlePress}
            key={item.ref}
        >
            <View style={styles.headerRow}>
                <Text style={styles.dateText}>{displayTime}</Text>
                <Text style={styles.idText}>#{displayId}</Text>
            </View>

            {config?.card_layout && (
                <>
                    <View style={styles.mainRow}>
                        <View style={styles.mainContent}>
                            <Header data={item} props={header} />
                            <SubHeader data={item} props={sub_header} />
                        </View>
                        
                        <View style={[styles.badge, { backgroundColor: statusBaseColor + '20' }]}>
                            <Text style={[styles.badgeText, { color: statusBaseColor }]}>{status}</Text>
                        </View>
                    </View>

                    {/* Body rows */}
                    {!hideRows && body_rows && body_rows.length > 0 && (
                        <View style={styles.footerContainer}>
                            {body_rows.map((row, index) => {
                                return (
                                    <Row data={item} props={row} key={index} />
                                );
                            })}
                        </View>
                    )}
                </>
            )}
        </Pressable>
    );
}
