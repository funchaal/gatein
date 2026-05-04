import React, { useRef, useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Animated, StyleSheet } from "react-native";
import { THEME } from "../../../components/appointments/AppointmentCard/constants";

export default function TabSlider({ activeTab, onTabChange, tabs }) {
    const sliderX = useRef(new Animated.Value(0)).current;
    const [tabWidth, setTabWidth] = useState(0);

    useEffect(() => {
        if (tabWidth > 0) {
            Animated.timing(sliderX, { toValue: activeTab * tabWidth, duration: 250, useNativeDriver: true }).start();
        }
    }, [activeTab, tabWidth]);

    return (
        <View style={sliderStyles.container} onLayout={(e) => setTabWidth(e.nativeEvent.layout.width / tabs.length)}>
            {tabWidth > 0 && (
                <Animated.View style={[sliderStyles.slider, { width: tabWidth, transform: [{ translateX: sliderX }] }]} />
            )}
            {tabs.map((tab, index) => (
                <TouchableOpacity key={tab} style={[sliderStyles.tab, tabWidth > 0 && { width: tabWidth }]} onPress={() => onTabChange(index)} activeOpacity={0.85}>
                    <Text style={[sliderStyles.tabText, activeTab === index && sliderStyles.tabTextActive]}>{tab}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const sliderStyles = StyleSheet.create({
    container: {
        flexDirection: "row", backgroundColor: "#F1F5F9",
        borderRadius: 100, padding: 4, marginTop: 12, position: "relative",
    },
    slider: {
        position: "absolute", top: 4, left: 4, bottom: 4,
        backgroundColor: "#fff", borderRadius: 100, borderWidth: 1, borderColor: "#E2E8F0",
    },
    tab: { flex: 1, paddingVertical: 10, alignItems: "center", justifyContent: "center", zIndex: 1 },
    tabText: { fontSize: 13, fontWeight: "600", color: THEME.slate400 },
    tabTextActive: { color: THEME.slate900 },
});
