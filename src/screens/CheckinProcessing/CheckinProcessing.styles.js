import { StyleSheet } from 'react-native';
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
        paddingHorizontal: 12
    },
    content: {
        flex: 1,
        paddingTop: 50,
    },
    title: {
        fontSize: 30,
        color: COLORS.textSecondary,
        marginBottom: 8,
        lineHeight: 38,
        fontWeight: '700',
    },
    subtitle: {
        fontSize: 19,
        color: COLORS.muted,
        marginBottom: 0,
        lineHeight: 26,
    },
    messageContainer: {
        justifyContent: 'center',
    }
});
