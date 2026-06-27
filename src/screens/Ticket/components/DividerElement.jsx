import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../../../components/appointments/AppointmentCard/constants';

export default function DividerElement({ props }) {
    return (
        <View style={styles.dividerWrapper}>
            {props.label ? (
                <View style={styles.dividerLabeled}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerLabel}>{props.label}</Text>
                    <View style={styles.dividerLine} />
                </View>
            ) : (
                <View style={[styles.dividerLine, { flex: 1 }]} />
            )}
        </View>
    );
}

export const styles = StyleSheet.create({
    dividerWrapper: { marginVertical: 18 },
    dividerLabeled: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    dividerLine: { height: 1, backgroundColor: '#E2E8F0', flex: 1 },
    dividerLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: THEME.slate400,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
});
