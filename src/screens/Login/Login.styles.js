import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const styles = StyleSheet.create({
    keyboardView: {
        flex: 1,
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
    },
    iconBadge: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: `${COLORS.primary}18`,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 30,
        color: COLORS.textSecondary,
        marginBottom: 8,
        lineHeight: 38,
        fontWeight: '700',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        color: COLORS.muted,
        marginBottom: 28,
        lineHeight: 22,
        textAlign: 'center',
    },
    buttonWrapper: {
        paddingBottom: 32,
        gap: 12,
    },
    cpfBadgeContainer: {
        marginBottom: 30,
        width: '100%',
    },
    cpfBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#eaeaea',
    },
    badgeLabel: {
        fontSize: 14,
        color: COLORS.muted || '#888',
        marginBottom: 2,
    },
    badgeValue: {
        fontSize: 18,
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
        marginBottom: 20,
        fontSize: 16,
        fontWeight: 'bold'
    },
});
