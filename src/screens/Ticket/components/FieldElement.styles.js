import { StyleSheet } from 'react-native';
import { THEME } from '../../../components/appointments/AppointmentCard/constants';

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
