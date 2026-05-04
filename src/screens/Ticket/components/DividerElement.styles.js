import { StyleSheet } from 'react-native';
import { THEME } from '../../../components/appointments/AppointmentCard/constants';

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
