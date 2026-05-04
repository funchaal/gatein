import { StyleSheet } from 'react-native';
import { THEME } from '../../../components/appointments/AppointmentCard/constants';

export const styles = StyleSheet.create({
    tagContainer: { marginVertical: 12 },
    tagContainerLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: THEME.slate400,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 8,
    },
    tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        maxWidth: '100%',
    },
    tagText: { 
        fontSize: 12, 
        fontWeight: '700',
        flexShrink: 1,
    },
});
