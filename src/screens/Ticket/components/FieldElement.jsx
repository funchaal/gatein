import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getFieldValue } from '../helpers';
import { THEME } from '../../../components/appointments/AppointmentCard/constants';
import { capitalizeWords } from '../helpers';

export default function FieldElement({ data, props }) {
    const value = getFieldValue(data, props.field);
    if (!value) return null;
    return (
        <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>{capitalizeWords(props.label)}</Text>
            <Text style={styles.fieldValue}>{value}</Text>
        </View>
    );
}

export const styles = StyleSheet.create({
    fieldRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
        marginVertical: 0,
    },
    fieldLabel: {
        fontSize: 16,
        color: THEME.slate400,
        fontWeight: '500',
        marginBottom: 2,
    },
    fieldValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#334155',
    },
});
