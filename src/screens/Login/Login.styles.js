import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background || '#F5F5F5',
        padding: 24, 
        paddingBottom: 0
    },
    content: {
        flex: 1,
    },
    formArea: {
        flex: 1, 
        justifyContent: 'space-between',
        width: '100%',
    },
    mainSection: {
        height: '50%', 
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    logoContainer: {
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        width: '100%',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    subtitle: {
        fontSize: 20, 
        fontWeight: 'bold', 
        color: COLORS.textSecondary, 
        marginBottom: 20 
    },
    inputContainer: {
        width: '100%',
    },
    cpfBadgeContainer: {
        marginBottom: 30,
    },
    cpfBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.card || '#f7f7f7ff', 
        borderRadius: 15,
        padding: 16,
    },
    badgeLabel: {
        fontSize: 16,
        color: COLORS.muted || '#888',
    },
    badgeValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    changeUserIcon: {
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    changeUserText: {
        color: COLORS.primary, 
        fontSize: 14, 
        fontWeight: 'bold', 
    },
    footerLinks: {
        paddingBottom: 20,
    },
    infoMessage: {
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: 20,
        fontSize: 16,
        fontWeight: 'bold'
    },
});