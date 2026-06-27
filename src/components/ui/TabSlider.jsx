import React from "react";
import { ScrollView, TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { THEME } from "../appointments/AppointmentCard/constants";
import { COLORS } from "../../constants/colors";

export default function TabSlider({ activeTab, onTabChange, tabs }) {
    return (
        <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={sliderStyles.container}
        >
            {tabs.map((tab, index) => {
                const label = typeof tab === 'string' ? tab : tab.label;
                const count = typeof tab === 'string' ? null : tab.count;
                const isActive = index === activeTab;

                return (
                    <TouchableOpacity
                        key={label}
                        style={sliderStyles.tab}
                        onPress={() => onTabChange(index)}
                        activeOpacity={0.85}
                    >
                        <View style={[
                            sliderStyles.tabInner,
                            isActive ? sliderStyles.tabInnerActive : sliderStyles.tabInnerInactive
                        ]}>
                            <Text
                                style={[
                                    sliderStyles.tabText,
                                    isActive ? sliderStyles.tabTextActive : sliderStyles.tabTextInactive
                                ]}
                                numberOfLines={1}
                            >
                                {label}
                            </Text>
                            {count !== null && count !== undefined && (
                                <View style={[
                                    sliderStyles.badge,
                                    isActive ? sliderStyles.badgeActive : sliderStyles.badgeInactive
                                ]}>
                                    <Text style={[
                                        sliderStyles.badgeText,
                                        isActive ? sliderStyles.badgeTextActive : sliderStyles.badgeTextInactive
                                    ]}>
                                        {count}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
}

const sliderStyles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 20,
        gap: 8,
    },
    tab: {
        // Width auto by default
    },
    tabInner: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 7,
        paddingHorizontal: 13,
        borderRadius: 100,
        borderWidth: 1,
        gap: 4,
    },
    tabInnerInactive: {
        backgroundColor: "transparent",
        borderColor: "#E2E8F0",
    },
    tabInnerActive: {
        backgroundColor: COLORS.primary + "26", // 15% opacity
        borderColor: COLORS.primary + "33", // 20% opacity
    },
    tabText: {
        fontSize: 13,
        fontWeight: "600",
    },
    tabTextInactive: {
        color: THEME.slate500 || "#64748B",
    },
    tabTextActive: {
        color: COLORS.primary,
    },
    badge: {
        paddingHorizontal: 5,
        paddingVertical: 1,
        borderRadius: 20,
    },
    badgeInactive: {
        backgroundColor: "#F1F5F9",
    },
    badgeActive: {
        backgroundColor: COLORS.primary,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: "700",
    },
    badgeTextInactive: {
        color: THEME.slate600 || "#475569",
    },
    badgeTextActive: {
        color: "#ffffff",
    },
});
