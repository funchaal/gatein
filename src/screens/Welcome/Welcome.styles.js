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
        opacity: 0.1,   
        transform: [{ rotate: '-20deg' }, { scale: 2 }], 
        zIndex: 0,      
    },
    contentContainer: {
        flex: 1,
        zIndex: 1, 
        paddingTop: '35%', 
        paddingHorizontal: 20,
        alignItems: 'flex-start', 
    },
    title: {
        fontSize: 43,
        color: COLORS.textSecondary,
        marginBottom: 30,
        lineHeight: 50,
    },
    boldText: {
        fontWeight: 'bold',
        // color: COLORS.primary, 
    },
    registerButton: {
        marginTop: 10,
        height: 54, 
        backgroundColor: COLORS.primary, 
        borderRadius: 30, 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingHorizontal: 25, 
        minWidth: 150, 
        gap: 10, 
    }, 
    registerButtonText: {
        color: 'white', 
        fontSize: 16, 
        fontWeight: 'bold',
    }, 
    loginButton: {
        marginTop: 12,
        height: 50, 
        paddingHorizontal: 30,
        borderRadius: 30, 
        alignItems: 'center', 
        justifyContent: 'center',
        borderWidth: 1, 
        borderColor: COLORS.primary, 
    },
    loginButtonText: {
        color: COLORS.primary, 
        fontSize: 16, 
        fontWeight: 'bold'
    }
});