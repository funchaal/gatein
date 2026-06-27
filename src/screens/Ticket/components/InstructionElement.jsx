import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { THEME } from '../../../components/appointments/AppointmentCard/constants';
import { COLORS } from '../../../constants/colors';
import { capitalizeFirst } from '../helpers';

export default function InstructionElement({ props }) {
    const steps = props.steps || [];
    if (!steps.length) return null;
    return (
        <View style={styles.instructionWrapper}>
            {props.title && <Text style={styles.instructionTitle}>{props.title}</Text>}
            {steps.map((step, i) => (
                <View key={i} style={styles.instructionStep}>
                    <View style={styles.instructionBulletIcon}>
                        <Check size={18} color={COLORS.primary} />
                    </View>
                    <Text style={styles.instructionStepText}>{capitalizeFirst(step)}</Text>
                </View>
            ))}
        </View>
    );
}

export const styles = StyleSheet.create({
    instructionWrapper: { marginVertical: 12 },
    instructionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: THEME.slate900,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginTop: 12,
        marginBottom: 20,
    },
    instructionStep: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    instructionBulletIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.primary + '20',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    instructionStepText: {
        flex: 1,
        fontSize: 14,
        color: '#334155',
        lineHeight: 20,
        fontWeight: '500',
    },
});
