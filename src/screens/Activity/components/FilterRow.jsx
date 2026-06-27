import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { THEME } from "../../../components/appointments/AppointmentCard/constants";

const MONTHS = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export default function FilterRow({ selectedMonths, selectedYears, onMonthPress, onYearPress, onClearMonths, onClearYears }) {
    const hasMonths = selectedMonths.length > 0;
    const hasYears = selectedYears.length > 0;

    const renderMonthText = () => {
        if (!hasMonths) return "Mês";
        if (selectedMonths.length === 1) return MONTHS[selectedMonths[0]].slice(0, 3);
        return `${selectedMonths.length} meses`;
    };

    const renderYearText = () => {
        if (!hasYears) return "Ano";
        if (selectedYears.length === 1) return String(selectedYears[0]);
        return `${selectedYears.length} anos`;
    };

    return (
        <View style={filterStyles.row}>
            <Icon name="tune-variant" size={14} color={THEME.slate400} />
            <Text style={filterStyles.label}>Filtros</Text>
            
            {/* Filtro de Mês */}
            <TouchableOpacity style={[filterStyles.pill, hasMonths && filterStyles.pillActive]} onPress={onMonthPress} activeOpacity={0.7}>
                <Text style={[filterStyles.pillText, hasMonths && filterStyles.pillTextActive]}>{renderMonthText()}</Text>
                {hasMonths ? (
                    <TouchableOpacity onPress={onClearMonths} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Icon name="close" size={14} color={THEME.slate600} />
                    </TouchableOpacity>
                ) : (
                    <Icon name="chevron-down" size={12} color={THEME.slate400} />
                )}
            </TouchableOpacity>

            {/* Filtro de Ano */}
            <TouchableOpacity style={[filterStyles.pill, hasYears && filterStyles.pillActive]} onPress={onYearPress} activeOpacity={0.7}>
                <Text style={[filterStyles.pillText, hasYears && filterStyles.pillTextActive]}>{renderYearText()}</Text>
                {hasYears ? (
                    <TouchableOpacity onPress={onClearYears} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Icon name="close" size={14} color={THEME.slate600} />
                    </TouchableOpacity>
                ) : (
                    <Icon name="chevron-down" size={12} color={THEME.slate400} />
                )}
            </TouchableOpacity>
        </View>
    );
}

const filterStyles = StyleSheet.create({
    row: { flexDirection: "row", alignItems: "center", gap: 7 },
    label: { fontSize: 13, fontWeight: "600", color: THEME.slate400, marginRight: 2 },
    pill: {
        flexDirection: "row", alignItems: "center", gap: 4,
        paddingHorizontal: 16, paddingVertical: 8,
        borderRadius: 100, borderWidth: 1, borderColor: "#E2E8F0", backgroundColor: "#fff",
    },
    pillActive: { borderColor: "#CBD5E1", backgroundColor: "#F8FAFC" },
    pillText: { fontSize: 13, fontWeight: "500", color: THEME.slate400 },
    pillTextActive: { color: THEME.slate900, fontWeight: "600" },
});
