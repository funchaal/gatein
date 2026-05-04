import React from "react";
import { View, StyleSheet } from "react-native";
import SearchBar from "./SearchBar";
import FilterRow from "./FilterRow";

export default function FixedFilters({
    search, onSearch,
    selectedMonths, selectedYears,
    onMonthPress, onYearPress, onClearMonths, onClearYears,
    onLayout
}) {
    return (
        <View style={fixedFiltersStyles.container} onLayout={onLayout}>
            <SearchBar value={search} onChangeText={onSearch} />
            <FilterRow
                selectedMonths={selectedMonths}
                selectedYears={selectedYears}
                onMonthPress={onMonthPress}
                onYearPress={onYearPress}
                onClearMonths={onClearMonths}
                onClearYears={onClearYears}
            />
        </View>
    );
}

const fixedFiltersStyles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 12,
        backgroundColor: "#fff",
        zIndex: 5,
        borderBottomWidth: 1, 
        borderBottomColor: "#E2E8F0",
    },
});
