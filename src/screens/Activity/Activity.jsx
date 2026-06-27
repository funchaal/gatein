import React, { useState, useRef, useCallback, useMemo } from "react";
import {
    View, StyleSheet, TouchableOpacity,
    Animated,
} from "react-native";
import ScreenWrapper from "../../components/common/ScreenWrapper";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { selectByType } from "../../store/slices/activitySlice";
import ActivityList from "../../components/appointments/ActivityList";
import TabSlider from "../../components/ui/TabSlider";
import ScreenHeader from "../../components/ui/ScreenHeader";

const getAppointmentDate = (appt) => {
    const raw = appt?.schedule_start_time || appt?.Start_Time || appt?.start_time || appt?.scheduled_time;
    if (!raw) return null;
    try { return new Date(raw); } catch { return null; }
};

const isSameDay = (d1, d2) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
};

export default function ActivityScreen() {
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState(0);
    const listRef = useRef(null);

    const activeAppointments = useSelector(selectByType["active-all"]) || [];
    const tripsCount = activeAppointments.filter(a => a.type === "trip" || a.is_trip).length;
    const appointmentsCount = activeAppointments.length - tripsCount;

    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const todayCount = activeAppointments.filter(item => {
        const date = getAppointmentDate(item);
        return date ? isSameDay(date, today) : false;
    }).length;

    const tomorrowCount = activeAppointments.filter(item => {
        const date = getAppointmentDate(item);
        return date ? isSameDay(date, tomorrow) : false;
    }).length;

    const TABS = [
        { label: "Todos",        count: activeAppointments.length },
        { label: "Hoje",         count: todayCount },
        { label: "Amanhã",       count: tomorrowCount },
        { label: "Agendamentos", count: appointmentsCount },
        { label: "Viagens",      count: tripsCount },
    ];

    const extraFilters = useMemo(() => {
        const t = new Date();
        const tom = new Date();
        tom.setDate(t.getDate() + 1);

        if (activeTab === 0) return []; // "Todos"
        if (activeTab === 1) { // "Hoje"
            return [{
                key: "hoje",
                filter: (_, item) => {
                    const date = getAppointmentDate(item);
                    return date ? isSameDay(date, t) : false;
                }
            }];
        }
        if (activeTab === 2) { // "Amanhã"
            return [{
                key: "amanha",
                filter: (_, item) => {
                    const date = getAppointmentDate(item);
                    return date ? isSameDay(date, tom) : false;
                }
            }];
        }
        if (activeTab === 3) { // "Agendamentos"
            return [{
                key: "agendamentos",
                filter: (_, item) => !(item.type === "trip" || item.is_trip)
            }];
        }
        if (activeTab === 4) { // "Viagens"
            return [{
                key: "viagens",
                filter: (_, item) => (item.type === "trip" || item.is_trip)
            }];
        }
        return [];
    }, [activeTab]);

    const scrollY = useRef(new Animated.Value(0)).current;

    // floating tabs
    const floatingAnim   = useRef(new Animated.Value(0)).current;
    const floatingVisible = useRef(false);
    const [isFloatingActive, setIsFloatingActive] = useState(false);
    const lastScrollY    = useRef(0);
    const upwardAccum    = useRef(0);
    const tabsBlockHeight = useRef(60);
    const fixedHeaderHeight = useRef(48);

    const UPWARD_THRESHOLD   = 80;
    const DOWNWARD_THRESHOLD = 5;
    const TITLE_TRAVEL       = 48; // altura da linha scrollável com título+botão

    // ── helpers floating ──
    const hideFloating = useCallback(() => {
        if (!floatingVisible.current) return;
        floatingVisible.current = false;
        setIsFloatingActive(false);
        upwardAccum.current = 0;
        Animated.timing(floatingAnim, { toValue: 0, duration: 160, useNativeDriver: true }).start();
    }, [floatingAnim]);

    const showFloating = useCallback(() => {
        if (floatingVisible.current) return;
        floatingVisible.current = true;
        setIsFloatingActive(true);
        Animated.timing(floatingAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    }, [floatingAnim]);

    // ── troca de tab: reseta scroll e recolhe floating ──
    const handleTabChange = useCallback((index) => {
        setActiveTab(index);
        hideFloating();
        scrollY.setValue(0);
        lastScrollY.current = 0;
        upwardAccum.current = 0;
        listRef.current?.scrollToOffset({ offset: 0, animated: false });
    }, [hideFloating, scrollY]);

    // ── scroll handler ──
    const handleScroll = useCallback((event) => {
        const currentY = event.nativeEvent.contentOffset.y;
        scrollY.setValue(currentY);

        const delta = currentY - lastScrollY.current;
        lastScrollY.current = currentY;

        const tabsOffsetThreshold = TITLE_TRAVEL + 120;
        const tabsOutOfView = currentY > tabsOffsetThreshold;

        if (!tabsOutOfView) { hideFloating(); upwardAccum.current = 0; return; }
        if (delta > DOWNWARD_THRESHOLD) { upwardAccum.current = 0; hideFloating(); }
        else if (delta < 0) {
            upwardAccum.current += Math.abs(delta);
            if (upwardAccum.current >= UPWARD_THRESHOLD) showFloating();
        }
    }, [showFloating, hideFloating, scrollY]);

    // floating aparece logo abaixo do header fixo (não no top: 0)
    const floatingTranslateY = floatingAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-(tabsBlockHeight.current + 16), 0],
    });

    const emptyState = useMemo(() => {
        switch (activeTab) {
            case 1: // Hoje
                return {
                    icon: "calendar-today",
                    title: "Nada para hoje",
                    subtitle: "Seus agendamentos e viagens de hoje aparecerão aqui."
                };
            case 2: // Amanhã
                return {
                    icon: "calendar-clock",
                    title: "Nada para amanhã",
                    subtitle: "Seus agendamentos e viagens de amanhã aparecerão aqui."
                };
            case 3: // Agendamentos
                return {
                    icon: "calendar-text",
                    title: "Nenhum agendamento",
                    subtitle: "Seus agendamentos ativos aparecerão aqui."
                };
            case 4: // Viagens
                return {
                    icon: "truck-outline",
                    title: "Nenhuma viagem",
                    subtitle: "Suas viagens ativas aparecerão aqui."
                };
            case 0: // Todos
            default:
                return {
                    icon: "calendar-blank-outline",
                    title: "Nenhuma atividade ativa",
                    subtitle: "Seus agendamentos e viagens ativos aparecerão aqui."
                };
        }
    }, [activeTab]);

    // ── header que rola com a lista ──
    const renderScrollableHeader = () => (
        <View 
            onLayout={(e) => { tabsBlockHeight.current = e.nativeEvent.layout.height; }}
            style={{ marginBottom: 8 }}
        >
            <TabSlider activeTab={activeTab} onTabChange={handleTabChange} tabs={TABS} />
        </View>
    );

    return (
        <ScreenWrapper noPadding={true}>
            <View style={styles.container}>

                {/* ── HEADER FIXO ── */}
                <View onLayout={(e) => { fixedHeaderHeight.current = e.nativeEvent.layout.height; }}>
                    <ScreenHeader 
                        title="Atividades" 
                        noBorder={true}
                        rightElement={
                            <TouchableOpacity
                                onPress={() => navigation.navigate("ActivityHistory")}
                                style={styles.historyHeaderButton}
                            >
                                <Icon name="history" size={24} color="#64748B" />
                            </TouchableOpacity>
                        }
                    />
                </View>

                {/* ── LISTA ── */}
                <View style={{ flex: 1 }}>
                    <ActivityList
                        ref={listRef}
                        type="active-all"
                        extraFilters={extraFilters}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        contentContainerStyle={{ paddingBottom: 80 }}
                        ListHeaderComponent={renderScrollableHeader()}
                        padded={true}
                        emptyState={emptyState}
                    />
                </View>

                {/* ── FLOATING TABS: abaixo do header fixo, vem por trás ── */}
                <Animated.View
                    pointerEvents={isFloatingActive ? "auto" : "none"}
                    style={[
                        styles.floatingTabs,
                        {
                            top: fixedHeaderHeight.current,
                            opacity: floatingAnim,
                            transform: [{ translateY: floatingTranslateY }],
                        },
                    ]}
                >
                    <View onLayout={(e) => { tabsBlockHeight.current = e.nativeEvent.layout.height; }}>
                        <TabSlider activeTab={activeTab} onTabChange={handleTabChange} tabs={TABS} />
                    </View>
                </Animated.View>

            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    fixedHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: "#fff",
        zIndex: 20,
    },
    headerLeftContainer: {
        width: 36,
        alignItems: "flex-start",
        justifyContent: "center",
    },
    headerRightContainer: {
        width: 36,
    },
    headerTitleFixed: {
        fontSize: 20,
        fontWeight: "700",
        color: "#0F172A",
        textAlign: "center",
        flex: 1,
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "rgba(249, 115, 22, 0.08)",
        alignItems: "center",
        justifyContent: "center",
    },
    historyHeaderButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#F1F5F9",
        alignItems: "center",
        justifyContent: "center",
    },

    floatingTabs: {
        position: "absolute",
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
        zIndex: 10,
    },
});