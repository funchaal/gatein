import { StyleSheet } from "react-native";
import { COLORS } from "../../../constants/colors";

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
    },
    subtitle: {
        fontSize: 15,
        color: COLORS.muted,
        marginBottom: 28,
        lineHeight: 22,
    },
    boldName: {
        fontWeight: 'bold',
        color: COLORS.textSecondary,
    },
    buttonWrapper: {
        paddingBottom: 32,
        gap: 12,
    },
    primaryButton: {
        height: 54,
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryButton: {
        height: 54,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryButtonText: {
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: '600',
    },
});
