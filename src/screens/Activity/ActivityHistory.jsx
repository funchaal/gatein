import React, { useState, useRef, useCallback, useMemo } from "react";
import {
    View,
    Animated,
    StyleSheet,
} from "react-native";
import ScreenWrapper from "../../components/common/ScreenWrapper";
import ActivityList from "../../components/appointments/ActivityList";
import FixedFilters from "./components/FixedFilters";
import TabSlider from "../../components/ui/TabSlider";
import BottomPickerModal from "./components/BottomPickerModal";
import { useSelector } from "react-redux";
import { selectByType } from "../../store/slices/activitySlice";

const MONTHS = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 7 }, (_, i) => currentYear - 3 + i);
const TAB_TYPE_MAP = ["history-all", "history-appointments", "history-trips"];

function getAppointmentDate(appt) {
    const raw = appt?.schedule_start_time || appt?.Start_Time || appt?.start_time || appt?.scheduled_time;
    if (!raw) return null;
    try { return new Date(raw); } catch { return null; }
}

export default function ActivityHistoryScreen() {
    const [activeTab, setActiveTab] = useState(0);
    const [search, setSearch] = useState("");
    const [selectedMonths, setSelectedMonths] = useState([]);
    const [selectedYears, setSelectedYears] = useState([]);
    const [monthPickerVisible, setMonthPickerVisible] = useState(false);
    const [yearPickerVisible, setYearPickerVisible] = useState(false);
    const [fixedFiltersHeight, setFixedFiltersHeight] = useState(88);
    const [tabsInScrollHeight, setTabsInScrollHeight] = useState(60);

    // ── ref para resetar scroll ──
    const listRef = useRef(null);

    const allHistory = useSelector(selectByType["history-all"]);
    const tripsCount = allHistory.filter(a => a.type === "trip" || a.is_trip).length;
    const appointmentsCount = allHistory.length - tripsCount;

    const TABS = [
        { label: "Todos",        count: allHistory.length },
        { label: "Agendamentos", count: appointmentsCount },
        { label: "Viagens",      count: tripsCount },
    ];

    // ── Floating header ──
    const floatingAnim = useRef(new Animated.Value(0)).current;
    const floatingVisible = useRef(false);
    const [isFloatingActive, setIsFloatingActive] = useState(false);
    const lastScrollY = useRef(0);
    const upwardAccum = useRef(0);
    const tabsBlockHeight = useRef(60);
    const ignoreScrollUntil = useRef(0);

    const UPWARD_THRESHOLD   = 80;
    const DOWNWARD_THRESHOLD = 5;

    const showFloating = useCallback(() => {
        if (floatingVisible.current) return;
        floatingVisible.current = true;
        setIsFloatingActive(true);
        Animated.timing(floatingAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    }, [floatingAnim]);

    const hideFloating = useCallback(() => {
        if (!floatingVisible.current) return;
        floatingVisible.current = false;
        setIsFloatingActive(false);
        upwardAccum.current = 0;
        Animated.timing(floatingAnim, { toValue: 0, duration: 160, useNativeDriver: true }).start();
    }, [floatingAnim]);

    const handleScroll = useCallback((event) => {
        if (Date.now() < ignoreScrollUntil.current) return;
        const currentY = event.nativeEvent.contentOffset.y;
        const delta = currentY - lastScrollY.current;
        lastScrollY.current = currentY;

        if (currentY <= tabsBlockHeight.current) {
            hideFloating();
            upwardAccum.current = 0;
            return;
        }

        if (delta > DOWNWARD_THRESHOLD) {
            upwardAccum.current = 0;
            hideFloating();
        } else if (delta < 0) {
            upwardAccum.current += Math.abs(delta);
            if (upwardAccum.current >= UPWARD_THRESHOLD) showFloating();
        }
    }, [showFloating, hideFloating]);

    // ── troca de tab: reseta scroll e recolhe floating ──
    const handleTabChange = useCallback((index) => {
        setActiveTab(index);
        hideFloating();
        lastScrollY.current = 0;
        upwardAccum.current = 0;
        ignoreScrollUntil.current = Date.now() + 300;
        listRef.current?.scrollToOffset({ offset: 0, animated: false });
    }, [hideFloating]);

    const extraFilters = useMemo(() => {
        if (selectedMonths.length === 0 && selectedYears.length === 0) return [];
        return [{
            date: (_, item) => {
                const date = getAppointmentDate(item);
                if (!date) return false;
                if (selectedMonths.length > 0 && !selectedMonths.includes(date.getMonth())) return false;
                if (selectedYears.length > 0 && !selectedYears.includes(date.getFullYear())) return false;
                return true;
            },
        }];
    }, [selectedMonths, selectedYears]);

    const floatingTranslateY = floatingAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-tabsInScrollHeight - 20, 0],
    });

    const emptyState = useMemo(() => {
        switch (activeTab) {
            case 1: // Agendamentos
                return {
                    icon: "calendar-check-outline",
                    title: "Sem agendamentos",
                    subtitle: "Seus agendamentos concluídos aparecerão aqui."
                };
            case 2: // Viagens
                return {
                    icon: "truck-check-outline",
                    title: "Sem viagens",
                    subtitle: "Suas viagens concluídas aparecerão aqui."
                };
            case 0: // Todos
            default:
                return {
                    icon: "history",
                    title: "Histórico vazio",
                    subtitle: "Seus agendamentos e viagens concluídos aparecerão aqui."
                };
        }
    }, [activeTab]);

    const isFiltered = selectedMonths.length > 0 || selectedYears.length > 0 || search.trim() !== "";
    const tabsProps = { activeTab, onTabChange: handleTabChange, tabs: TABS };

    return (
        <ScreenWrapper noPadding={true}>
            <View style={styles.container}>

                <FixedFilters
                    search={search}
                    onSearch={setSearch}
                    selectedMonths={selectedMonths}
                    selectedYears={selectedYears}
                    onMonthPress={() => setMonthPickerVisible(true)}
                    onYearPress={() => setYearPickerVisible(true)}
                    onClearMonths={() => setSelectedMonths([])}
                    onClearYears={() => setSelectedYears([])}
                    onLayout={(e) => setFixedFiltersHeight(e.nativeEvent.layout.height)}
                />

                <View style={{ flex: 1 }}>
                    <ActivityList
                        ref={listRef}
                        type={TAB_TYPE_MAP[activeTab]}
                        search={search}
                        extraFilters={extraFilters}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        ListHeaderComponent={
                            <View
                                onLayout={(e) => {
                                    const h = e.nativeEvent.layout.height;
                                    tabsBlockHeight.current = h;
                                    setTabsInScrollHeight(h);
                                }}
                                style={{ marginBottom: 8 }}
                            >
                                <TabSlider {...tabsProps} />
                            </View>
                        }
                        padded={true}
                        emptyState={emptyState}
                        isFiltered={isFiltered}
                    />
                </View>

                <Animated.View
                    pointerEvents={isFloatingActive ? "auto" : "none"}
                    style={[
                        styles.floatingTabs,
                        {
                            top: fixedFiltersHeight,
                            opacity: floatingAnim,
                            transform: [{ translateY: floatingTranslateY }],
                        },
                    ]}
                >
                    <TabSlider {...tabsProps} />
                </Animated.View>

            </View>

            <BottomPickerModal
                visible={monthPickerVisible}
                onClose={() => setMonthPickerVisible(false)}
                items={MONTHS}
                selectedValues={selectedMonths.map((m) => MONTHS[m])}
                onApply={(vals) => setSelectedMonths(vals.map((v) => MONTHS.indexOf(v)))}
                title="Selecionar meses"
            />
            <BottomPickerModal
                visible={yearPickerVisible}
                onClose={() => setYearPickerVisible(false)}
                items={YEARS}
                selectedValues={selectedYears}
                onApply={setSelectedYears}
                title="Selecionar anos"
            />
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    floatingTabs: {
        position: "absolute",
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
        zIndex: 4,
    },
});