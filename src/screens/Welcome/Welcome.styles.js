import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        position: 'relative', 
        overflow: 'hidden',   
    },
    backgroundIcon: {
        position: 'absolute',
        bottom: 100,    
        right: -70,     
        opacity: 0.0,   
        transform: [{ rotate: '-20deg' }, { scale: 2 }], 
        zIndex: 0,      
    },
    contentContainer: {
        flex: 1,
        zIndex: 1, 
        justifyContent: 'space-between',
        paddingHorizontal: 32,
        paddingTop: '35%',
        paddingBottom: 50,
    },
    title: {
        fontSize: 38,
        color: COLORS.textSecondary,
        marginBottom: 40,
        lineHeight: 48,
        textAlign: 'left',
    },
    boldText: {
        fontWeight: 'bold',
    },
    buttonsWrapper: {
        width: '100%',
        alignItems: 'center',
        gap: 12,
    },
    registerButton: {
        height: 54, 
        width: '100%',
        backgroundColor: COLORS.primary, 
        borderRadius: 30, 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        paddingHorizontal: 25, 
        gap: 8, 
    }, 
    registerButtonText: {
        color: 'white', 
        fontSize: 16, 
        fontWeight: 'bold',
    }, 
    loginButton: {
        height: 54, 
        width: '100%',
        paddingHorizontal: 30,
        borderRadius: 30, 
        alignItems: 'center', 
        justifyContent: 'center',
        borderWidth: 1.5, 
        borderColor: COLORS.primary, 
    },
    loginButtonText: {
        color: COLORS.primary, 
        fontSize: 16, 
        fontWeight: 'bold',
    },
});
