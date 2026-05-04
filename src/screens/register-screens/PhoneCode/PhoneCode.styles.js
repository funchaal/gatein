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
        paddingVertical: 10,
    },
    content: {
        flex: 1,
    },
    inputWrapper: {
        marginTop: 60,
        paddingVertical: 15, 
        width: '100%',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    errorText: {
        color: COLORS.error,
        fontSize: 16,
        marginTop: 30,
        marginLeft: 4,
        minHeight: 20,
    }
});
