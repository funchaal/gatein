import React, { useState, useRef, useCallback } from "react";
import {
    View,
    SafeAreaView,
    Animated,
    StyleSheet,
    Platform,
    StatusBar,
} from "react-native";
import AppointmentList from "../../components/appointments/AppointmentsList";
import FixedFilters from "./components/FixedFilters";
import TabsBlock from "./components/TabsBlock";
import BottomPickerModal from "./components/BottomPickerModal";
import TripsPlaceholder from "./trips/TripsPlaceholder";

const TABS = ["Agendamentos", "Viagens"];
const STATUS_TABS = ["Upcoming", "Histórico"];
const MONTHS = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 7 }, (_, i) => currentYear - 3 + i);

export default function ActivityScreen() {
    const [activeTab, setActiveTab] = useState(0);
    const [activeStatusTab, setActiveStatusTab] = useState(0);
    const [search, setSearch] = useState("");
    const [selectedMonths, setSelectedMonths] = useState([]);
    const [selectedYears, setSelectedYears] = useState([]);
    const [monthPickerVisible, setMonthPickerVisible] = useState(false);
    const [yearPickerVisible, setYearPickerVisible] = useState(false);
    const [fixedFiltersHeight, setFixedFiltersHeight] = useState(88);

    // ── Floating header ──
    const floatingAnim = useRef(new Animated.Value(0)).current;
    const floatingVisible = useRef(false);
    const lastScrollY = useRef(0);
    // Acumulador de distância rolada para cima sem interrupção
    const upwardAccum = useRef(0);
    // Altura do TabsBlock dentro do scroll (medida via onLayout)
    const tabsBlockHeight = useRef(80);

    const UPWARD_THRESHOLD = 80; // px para cima para aparecer
    // px para baixo para sumir (0 = qualquer movimento já esconde)
    const DOWNWARD_THRESHOLD = 5;

    const showFloating = useCallback(() => {
        if (floatingVisible.current) return;
        floatingVisible.current = true;
        Animated.timing(floatingAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
        }).start();
    }, [floatingAnim]);

    const hideFloating = useCallback(() => {
        if (!floatingVisible.current) return;
        floatingVisible.current = false;
        upwardAccum.current = 0;
        Animated.timing(floatingAnim, {
            toValue: 0,
            duration: 160,
            useNativeDriver: true,
        }).start();
    }, [floatingAnim]);

    const handleScroll = useCallback((event) => {
        const currentY = event.nativeEvent.contentOffset.y;
        const delta = currentY - lastScrollY.current;
        lastScrollY.current = currentY;

        const tabsOutOfView = currentY > tabsBlockHeight.current;

        if (!tabsOutOfView) {
            // TabsBlock ainda visível no scroll → flutuante sempre escondido
            hideFloating();
            upwardAccum.current = 0;
            return;
        }

        if (delta > DOWNWARD_THRESHOLD) {
            // Rolando para baixo → esconde imediatamente, zera acumulador
            upwardAccum.current = 0;
            hideFloating();
        } else if (delta < 0) {
            // Rolando para cima → acumula
            upwardAccum.current += Math.abs(delta);
            if (upwardAccum.current >= UPWARD_THRESHOLD) {
                showFloating();
            }
        }
    }, [showFloating, hideFloating]);

    const filterProps = {
        search,
        onSearch: setSearch,
        selectedMonths,
        selectedYears,
        onMonthPress: () => setMonthPickerVisible(true),
        onYearPress: () => setYearPickerVisible(true),
        onClearMonths: () => setSelectedMonths([]),
        onClearYears: () => setSelectedYears([]),
    };

    const tabsProps = {
        activeTab,
        onTabChange: setActiveTab,
        activeStatusTab,
        onStatusTabChange: setActiveStatusTab,
        tabs: TABS,
        statusTabs: STATUS_TABS,
    };

    const floatingTranslateY = floatingAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-tabsBlockHeight.current - 20, 0],
    });

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>

                {/* ── FIXO: SearchBar + Filtros ── */}
                <FixedFilters
                    {...filterProps}
                    onLayout={(e) => setFixedFiltersHeight(e.nativeEvent.layout.height)}
                />

                {/* ── LISTA com TabsBlock como header ── */}
                <View style={{ flex: 1 }}>
                    {activeTab === 0 ? (
                        <AppointmentList
                            type={activeStatusTab === 0 ? "active" : "history"}
                            search={search}
                            selectedMonths={selectedMonths}
                            selectedYears={selectedYears}
                            onScroll={handleScroll}
                            scrollEventThrottle={16}
                            ListHeaderComponent={
                                <View
                                    onLayout={(e) => {
                                        tabsBlockHeight.current = e.nativeEvent.layout.height;
                                    }}
                                >
                                    <TabsBlock {...tabsProps} />
                                </View>
                            }
                        />
                    ) : (
                        <>
                            <TabsBlock {...tabsProps} />
                            <TripsPlaceholder />
                        </>
                    )}
                </View>

                {/* ── FLUTUANTE: TabsBlock (aparece ao rolar 20px pra cima) ── */}
                {activeTab === 0 && (
                    <Animated.View
                        pointerEvents={floatingVisible.current ? "auto" : "none"}
                        style={[
                            styles.floatingTabs,
                            {
                                top: fixedFiltersHeight,
                                opacity: floatingAnim,
                                transform: [{ translateY: floatingTranslateY }],
                            },
                        ]}
                    >
                        <TabsBlock {...tabsProps} />
                    </Animated.View>
                )}

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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 24) + 10 : 0,
    },
    container: {
        flex: 1
    },
    floatingTabs: {
        position: "absolute",
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0"
    },
});
