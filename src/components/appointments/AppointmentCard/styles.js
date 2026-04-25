import { StyleSheet } from 'react-native';
import { THEME } from './constants';

export const styles = StyleSheet.create({
    card: {
        backgroundColor: THEME.white,
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        marginHorizontal: 16, 
        borderWidth: 1,
        borderColor: THEME.border,
    },
    cardPressed: {
        backgroundColor: '#F8FAFC',
        borderColor: '#CBD5E1',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    dateText: {
        fontSize: 14,
        fontWeight: '700',
        color: THEME.slate600,
        letterSpacing: 0.2,
    },
    idText: {
        fontSize: 14,
        fontWeight: '500',
        color: THEME.slate400,
    },
    mainRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    mainContent: {
        marginTop: 12, 
        flex: 1,
        gap: 2,
    },
    h1Default: {
        fontSize: 26,
        fontWeight: '800',
        color: THEME.slate900,
    },
    h2Default: {
        fontSize: 20,
        fontWeight: '500',
        color: THEME.slate600,
    },
    fieldLabel: {
        fontSize: 14,
        color: THEME.slate400,
        fontWeight: '500',
        marginBottom: 2,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        marginLeft: 12,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    footerContainer: {
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        paddingTop: 12,
        gap: 4,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    infoLabel: {
        fontSize: 14,
        color: THEME.slate400,
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 14,
        color: THEME.slate900,
        fontWeight: '600'
    }
});
