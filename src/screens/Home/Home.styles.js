import { StyleSheet, Platform, StatusBar } from 'react-native';
import { COLORS } from '../../constants/colors';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    headerContainer: {
        paddingHorizontal: 15,
        paddingTop: 10
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    logo: {
        width: 150,
        height: 33.75,
    },
    headerButton: {
        padding: 5, // Aumenta área de toque
    },
    statusText: {
        color: 'blue',
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        paddingHorizontal: 20,
        letterSpacing: 0.5,
        color: COLORS.text, // Slate-600 (Tema Gate In)
        marginTop: 20,
        marginBottom: 10,
    }
});