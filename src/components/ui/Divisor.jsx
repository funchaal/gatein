import React from "react";
import { View, StyleSheet } from "react-native";
import { COLORS } from "../../constants/colors";

export default function Divisor() {
    return <View style={styles.divisor} />;
}

const styles = StyleSheet.create({
    divisor: {
        height: 1,
        width: '100%',
        backgroundColor: COLORS.gray,
        borderTopWidth: 1,
        borderColor: '#e0e0e0',
        borderStyle: 'dashed',
        marginVertical: 15,
    }
});
