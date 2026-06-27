import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { COLORS } from "../../constants/colors";

export default function ScreenHeader({ title, showBackButton, rightElement, noBorder = false }) {
    const navigation = useNavigation();
    const canGoBack = showBackButton !== undefined ? showBackButton : navigation.canGoBack();

    return (
        <View style={[styles.fixedHeader, noBorder && styles.noBorder]}>
            <View style={styles.headerLeftContainer}>
                {canGoBack && (
                    <TouchableOpacity 
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Icon name="chevron-left" size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                )}
            </View>
            <Text style={styles.headerTitleFixed} numberOfLines={1}>
                {title}
            </Text>
            <View style={styles.headerRightContainer}>
                {rightElement || null}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    fixedHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: "#fff",
        zIndex: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
    },
    noBorder: {
        borderBottomWidth: 0,
    },
    headerLeftContainer: {
        width: 36,
        alignItems: "flex-start",
        justifyContent: "center",
    },
    headerRightContainer: {
        width: 36,
        alignItems: "flex-end",
        justifyContent: "center",
    },
    headerTitleFixed: {
        fontSize: 20,
        fontWeight: "700",
        color: "#0F172A",
        textAlign: "center",
        flex: 1,
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "rgba(249, 115, 22, 0.08)",
        alignItems: "center",
        justifyContent: "center",
    },
});
