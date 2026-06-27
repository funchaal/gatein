import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import HighlightElement from './HighlightElement';
import { THEME } from '../../../components/appointments/AppointmentCard/constants';

export default function HighlightGridElement({ data, props }) {
    const items = props.items || [];
    if (!items.length) return null;
    return (
        <View style={styles.gridWrapper}>
            {props.label && <Text style={styles.sectionTitle}>{props.label}</Text>}
            <View style={styles.grid}>
                {items.map((item, i) => (
                    <HighlightElement key={i} data={data} props={item} />
                ))}
            </View>
        </View>
    );
}

export const styles = StyleSheet.create({
    gridWrapper: { marginVertical: 12 },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: THEME.slate900,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 12,
    },
});
