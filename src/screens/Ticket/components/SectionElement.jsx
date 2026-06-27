import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../../../components/appointments/AppointmentCard/constants';
import FieldElement from './FieldElement';

export default function SectionElement({ data, props }) {
    return (
        <View style={styles.sectionWrapper}>
            <Text style={styles.sectionTitle}>{props.title}</Text>
            {(props.fields || []).map((fieldProp, idx) => (
                <FieldElement key={idx} data={data} props={fieldProp} />
            ))}
        </View>
    );
}

export const styles = StyleSheet.create({
    sectionWrapper: { marginTop: 18, marginBottom: 8 },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: THEME.slate900,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
});
