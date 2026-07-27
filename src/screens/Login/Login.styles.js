import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const styles = StyleSheet.create({
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    container: {
        flex: 1,
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        paddingVertical: 10,
    },
    iconBadge: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: `${COLORS.primary}18`,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        color: COLORS.textSecondary,
        marginBottom: 6,
        lineHeight: 34,
        fontWeight: '700',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        color: COLORS.muted,
        marginBottom: 20,
        lineHeight: 22,
        textAlign: 'center',
    },
    buttonWrapper: {
        paddingTop: 16,
        paddingBottom: 24,
        gap: 12,
        width: '100%',
    },
    cpfBadgeContainer: {
        marginBottom: 20,
        width: '100%',
    },
    cpfBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: '#eaeaea',
    },
    badgeLabel: {
        fontSize: 13,
        color: COLORS.muted || '#888',
        marginBottom: 2,
    },
    badgeValue: {
        fontSize: 17,
        fontWeight: 'bold',
        color: COLORS.textSecondary,
    },
    changeUserIcon: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: `${COLORS.primary}18`,
        borderRadius: 8,
    },
    changeUserText: {
        color: COLORS.primary,
        fontSize: 13,
        fontWeight: 'bold',
    },
    infoMessage: {
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: 16,
        fontSize: 15,
        fontWeight: 'bold'
    },
});
