import { StyleSheet } from "react-native";
import { COLORS } from '../../constants/colors';

export const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
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
    },
    iconBadge: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: `${COLORS.success}18`,
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
        fontSize: 17,
        color: COLORS.muted,
        marginBottom: 28,
        lineHeight: 24,
        textAlign: 'center',
        maxWidth: '85%',
    },
    buttonWrapper: {
        paddingBottom: 32,
    },
});
