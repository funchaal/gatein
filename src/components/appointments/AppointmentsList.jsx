// AppointmentList.jsx — versão atualizada

import React from "react";
import { FlatList, Text, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import {
    selectActiveAppointments,
    selectHistoryAppointments,
} from "../../store/slices/appointmentsSlice";
import { selectAllTerminals } from "../../store/slices/terminalsSlice";
import AppointmentCard from "./AppointmentCard";
import { useFetchAppointmentsDataQuery } from "../../services/api";
import { selectAuthUser } from "../../store/hooks";

// ── Helpers de filtro (mesma lógica de antes, movida para cá) ──
const MONTHS_COUNT = 12;

function getAppointmentDate(appt) {
    const dateStr =
        appt?.schedule_start_time ||
        appt?.Start_Time ||
        appt?.start_time ||
        appt?.scheduled_time;
    if (!dateStr) return null;
    try { return new Date(dateStr); } catch { return null; }
}

function applyFilters(data, search, selectedMonths, selectedYears) {
    if (!data || data.length === 0) return [];
    return data.filter((appt) => {
        const date = getAppointmentDate(appt);
        if (date) {
            if (selectedMonths.length > 0 && !selectedMonths.includes(date.getMonth())) return false;
            if (selectedYears.length > 0 && !selectedYears.includes(date.getFullYear())) return false;
        }
        if (search?.trim()) {
            const q = search.toLowerCase();
            const fields = [
                appt.booking_number,
                appt.Appt,
                appt.id,
                appt.booking,
                appt.status?.Status,
                appt.status,
            ]
                .filter(Boolean)
                .map((v) => String(v).toLowerCase());
            return fields.some((f) => f.includes(q));
        }
        return true;
    });
}

export default function AppointmentList({
    type = "active",
    search = "",
    selectedMonths = [],
    selectedYears = [],
    onScroll,
    scrollEventThrottle = 16,
    ListHeaderComponent, 
}) {
    const user = useSelector(selectAuthUser);
    const USER_ID = user?.id;

    useFetchAppointmentsDataQuery(USER_ID);

    const rawData = useSelector((state) =>
        type === "active"
            ? selectActiveAppointments(state)
            : selectHistoryAppointments(state)
    );

    const terminals = useSelector(selectAllTerminals);

    const data = applyFilters(rawData, search, selectedMonths, selectedYears);

    const getCardConfig = (appt) => {
        if (!terminals || terminals.length === 0) return null;
        const terminal = terminals.find((t) => t.id === appt.terminal_id);
        if (!terminal) return null;
        return (
            terminal.appointments_layouts.find((c) => c.type === appt.type) ||
            terminal.appointments_layouts.find((c) => c.type === "DEFAULT") ||
            terminal.appointments_layouts[0]
        );
    };

    return (
        <FlatList
            data={data}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item: appt }) => (
                <AppointmentCard item={appt} config={getCardConfig(appt)} />
            )}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={ListHeaderComponent}
            ListEmptyComponent={
                <Text style={styles.emptyText}>
                    {type === "active" ? "Nenhum agendamento ativo." : "Histórico vazio."}
                </Text>
            }
            onScroll={onScroll}
            scrollEventThrottle={scrollEventThrottle}
        />
    );
}

const styles = StyleSheet.create({
    listContent: { paddingBottom: 32 },
    emptyText: { textAlign: "center", color: "#64748B", marginTop: 20 },
});