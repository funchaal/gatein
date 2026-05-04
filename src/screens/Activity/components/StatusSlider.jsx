import React, { useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, Animated, StyleSheet } from "react-native";
import { THEME } from "../../../components/appointments/AppointmentCard/constants";
import { COLORS } from "../../../constants/colors";

export default function StatusSlider({ activeTab, onTabChange, tabs }) {
    const sliderX = useRef(new Animated.Value(activeTab * 96)).current;

    useEffect(() => {
        Animated.timing(sliderX, { toValue: activeTab * 96, duration: 250, useNativeDriver: true }).start();
    }, [activeTab]);

    return (
        <View style={statusSliderStyles.wrapper}>
            <View style={statusSliderStyles.container}>
                <Animated.View style={[statusSliderStyles.slider, { transform: [{ translateX: sliderX }] }]} />
                {tabs.map((tab, index) => (
                    <TouchableOpacity key={tab} style={statusSliderStyles.tab} onPress={() => onTabChange(index)} activeOpacity={0.85}>
                        <Text style={[statusSliderStyles.tabText, activeTab === index && statusSliderStyles.tabTextActive]}>{tab}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const statusSliderStyles = StyleSheet.create({
    wrapper: { alignItems: "flex-start", marginTop: 12 },
    container: { flexDirection: "row", backgroundColor: "#F1F5F9", borderRadius: 100, padding: 4, position: "relative" },
    slider: { position: "absolute", top: 4, left: 4, bottom: 4, width: 96, backgroundColor: COLORS.primary, borderRadius: 100 },
    tab: { width: 96, paddingVertical: 8, alignItems: "center", justifyContent: "center", zIndex: 1 },
    tabText: { fontSize: 13, fontWeight: "600", color: THEME.slate400 },
    tabTextActive: { color: COLORS.white },
});
