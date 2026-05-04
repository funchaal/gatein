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
        paddingHorizontal: 20,
        paddingVertical: 10
    },
    content: {
        flex: 1,
    },
    title: {
        lineHeight: 36,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    modalText: {
        fontSize: 16,
        color: '#333',
        marginBottom: 8,
    },
    modalPhone: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 8,
    },
    modalSubText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 24,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 20,
    },
    modalButton: {
        padding: 8,
    },
    modalButtonTextCancel: {
        color: COLORS.primary,
        fontWeight: '600',
        fontSize: 16,
    },
    modalButtonTextConfirm: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: 16,
    },
});