import React from "react";
import { View, StyleSheet } from "react-native";
import SearchBar from "../../../components/ui/SearchBar";
import FilterRow from "./FilterRow";
import ScreenHeader from "../../../components/ui/ScreenHeader";

export default function FixedFilters({
    search, onSearch,
    selectedMonths, selectedYears,
    onMonthPress, onYearPress, onClearMonths, onClearYears,
    onLayout
}) {
    return (
        <View style={fixedFiltersStyles.container} onLayout={onLayout}>
            {/* Header row with Back Button and Centered Title */}
            <ScreenHeader title="Histórico" noBorder={true} />

            {/* Padded Content for Search Bar & Filters */}
            <View style={fixedFiltersStyles.paddedContent}>
                {/* Search Bar Row */}
                <View style={fixedFiltersStyles.searchRow}>
                    <SearchBar value={search} onChangeText={onSearch} placeholder="Buscar agendamento..." />
                </View>

                {/* Filter tags Row */}
                <FilterRow
                    selectedMonths={selectedMonths}
                    selectedYears={selectedYears}
                    onMonthPress={onMonthPress}
                    onYearPress={onYearPress}
                    onClearMonths={onClearMonths}
                    onClearYears={onClearYears}
                />
            </View>
        </View>
    );
}

const fixedFiltersStyles = StyleSheet.create({
    container: {
        backgroundColor: "#fff",
        zIndex: 5,
        borderBottomWidth: 1, 
        borderBottomColor: "#E2E8F0",
    },
    paddedContent: {
        paddingHorizontal: 16,
        paddingBottom: 10,
    },
    searchRow: {
        marginBottom: 12,
    },
});
