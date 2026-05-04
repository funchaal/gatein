import React from "react";
import { View, StyleSheet } from "react-native";
import TabSlider from "./TabSlider";
import StatusSlider from "./StatusSlider";

export default function TabsBlock({ activeTab, onTabChange, activeStatusTab, onStatusTabChange, tabs, statusTabs }) {
    return (
        <View>
            <View style={tabsBlockStyles.inner}>
                <TabSlider activeTab={activeTab} onTabChange={onTabChange} tabs={tabs} />
                {activeTab === 0 && (
                    <StatusSlider activeTab={activeStatusTab} onTabChange={onStatusTabChange} tabs={statusTabs} />
                )}
            </View>
        </View>
    );
}

const tabsBlockStyles = StyleSheet.create({
    divider: {
        height: 1,
        backgroundColor: "#E2E8F0",
        marginHorizontal: 0,
    },
    inner: {
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
});
