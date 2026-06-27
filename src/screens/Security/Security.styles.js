import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const styles = StyleSheet.create({
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
        paddingBottom: '15%',
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
        marginBottom: 40,
        lineHeight: 22,
        textAlign: 'center',
        maxWidth: '90%',
    },
    inputContainer: {
        width: '100%',
        gap: 15,
    },
    buttonWrapper: {
        paddingBottom: 32,
        width: '100%',
        gap: 12,
    },
    errorText: {
        color: COLORS.error || '#ef4444',
        marginTop: 12,
        height: 20,
    }
});
