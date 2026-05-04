import { StyleSheet } from 'react-native';
import { THEME } from '../../../components/appointments/AppointmentCard/constants';

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
