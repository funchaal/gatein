import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { THEME } from "../appointments/AppointmentCard/constants";

export default function SearchBar({ value, onChangeText, placeholder = "Buscar..." }) {
    const [focused, setFocused] = useState(false);
    return (
        <View style={[searchStyles.container, focused && searchStyles.focused]}>
            <Icon name="magnify" size={17} color={THEME.slate400} />
            <TextInput
                style={searchStyles.input}
                placeholder={placeholder}
                placeholderTextColor={THEME.slate400}
                value={value}
                onChangeText={onChangeText}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                returnKeyType="search"
            />
            {value.length > 0 && (
                <TouchableOpacity onPress={() => onChangeText("")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Icon name="close-circle" size={15} color={THEME.slate400} />
                </TouchableOpacity>
            )}
        </View>
    );
}

const searchStyles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 100,
        paddingHorizontal: 14,
        paddingVertical: 12,
        gap: 8,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    focused: { borderColor: "#CBD5E1" },
    input: { flex: 1, fontSize: 14, color: THEME.slate900, padding: 0 },
});
