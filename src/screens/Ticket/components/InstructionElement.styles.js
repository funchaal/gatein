import { StyleSheet } from 'react-native';
import { THEME } from '../../../components/appointments/AppointmentCard/constants';

export const styles = StyleSheet.create({
    instructionWrapper: { marginVertical: 12 },
    instructionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: THEME.slate400,
        marginBottom: 16,
        textAlign: 'center'
    },
    instructionStep: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    instructionBullet: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#475569',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    instructionBulletText: { fontSize: 12, fontWeight: '800', color: '#FFFFFF' },
    instructionStepText: {
        flex: 1,
        fontSize: 14,
        color: '#334155',
        lineHeight: 20,
        fontWeight: '500',
    },
});
