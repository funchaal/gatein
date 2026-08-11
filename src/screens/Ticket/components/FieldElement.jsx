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
        alignItems: 'flex-start',
        paddingVertical: 5,
        marginVertical: 0,
        gap: 8,
    },
    fieldLabel: {
        fontSize: 14,
        color: THEME.slate400,
        fontWeight: '500',
        marginBottom: 2,
        flex: 1,
        maxWidth: '50%',
    },
    fieldValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
        flex: 1,
        maxWidth: '50%',
        textAlign: 'right',
    },
});
