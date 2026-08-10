import React, { forwardRef, useState, useCallback, useMemo, useEffect, useRef } from "react";
import { FlatList, Text, StyleSheet, ActivityIndicator, View } from "react-native";
import { useSelector } from "react-redux";
import { selectByType, selectHasMoreActivity } from "../../store/slices/activitySlice";
import { selectAllTerminals, selectAllTruckingCompanies, selectAllLayouts } from "../../store/slices/companiesSlice"; 
import AppointmentCard from "./AppointmentCard";
import { DEFAULT_TRIP_LAYOUT, DEFAULT_APPOINTMENT_LAYOUT } from "./AppointmentCard/constants";
import { useFetchActivityDataQuery, useLogActivityEventsMutation } from "../../services/api";
import { useFuzzyFilter } from "../../utils/levenshtein_search";
import { trackViewed } from "../../utils/activityTracker";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { COLORS } from "../../constants/colors";

const PAGE_LIMIT = 50;

const ActivityList = forwardRef(function ActivityList({
    type = "active-all",
    search = "",
    extraFilters = {},
    onScroll,
    scrollEventThrottle = 16,
    contentContainerStyle,
    ListHeaderComponent,
    padded = false,
    emptyState,
    isFiltered = false,
    scrollable = true,
}, ref) {
    const [page, setPage] = useState(0);

    const apiStatusFilter = useMemo(() => {
        if (type.startsWith("active")) return "active";
        if (type.startsWith("history")) return "history";
        return "all";
    }, [type]);

    // Reseta a paginação sempre que o tipo de filtro (aba) mudar
    useEffect(() => {
        // console.log(`[ActivityList] Filtro alterado para: ${apiStatusFilter}. Resetando página para 0.`);
        setPage(0);
    }, [apiStatusFilter]);

    const { isFetching } = useFetchActivityDataQuery({
        status_filter: apiStatusFilter,
        limit: PAGE_LIMIT,
        offset: page * PAGE_LIMIT
    });

    const selector = selectByType[type] ?? selectByType["active-all"];
    const rawData = useSelector(selector);
    const terminals = useSelector(selectAllTerminals);
    const truckingCompanies = useSelector(selectAllTruckingCompanies);
    const layouts = useSelector(selectAllLayouts);
    
    // Novo seletor para saber se o backend ainda tem dados a enviar
    const hasMore = useSelector(selectHasMoreActivity);

    const data = useFuzzyFilter({
        data: rawData ?? [],
        searchText: search,
        extraFilters: Object.values(extraFilters),
        minResults: 0,
    });

    const [logEvents] = useLogActivityEventsMutation();

    const handleItemsViewed = useCallback((items) => {
        const unseenEvents = [];
        items.forEach(item => {
            const activityId = item.id;
            const isTripItem = item.type === "trip" || !!item.is_trip;
            const activityType = isTripItem ? "trip" : "appointment";
            
            if (trackViewed(activityId)) {
                unseenEvents.push({
                    activity_type: activityType,
                    activity_id: activityId,
                    event: "viewed",
                    message: `${isTripItem ? "Viagem" : "Agendamento"} visualizado no app móvel.`
                });
            }
        });

        if (unseenEvents.length > 0) {
            logEvents({ events: unseenEvents }).unwrap().catch(err => {
                console.error("Erro ao enviar logs de visualização:", err);
            });
        }
    }, [logEvents]);

    useEffect(() => {
        if (!scrollable && data && data.length > 0) {
            handleItemsViewed(data);
        }
    }, [scrollable, data, handleItemsViewed]);

    const onViewableItemsChanged = useRef(({ viewableItems }) => {
        const visibleItems = viewableItems.map(({ item }) => item).filter(Boolean);
        handleItemsViewed(visibleItems);
    }).current;

    const viewabilityConfig = useRef({
        viewAreaCoveragePercentThreshold: 50
    }).current;

    const defaultEmptyState = useMemo(() => {
        if (type.startsWith("active")) {
            return {
                icon: "calendar-blank-outline",
                title: "Nenhum agendamento ativo",
                subtitle: "Seus agendamentos e viagens ativos aparecerão aqui."
            };
        } else {
            return {
                icon: "history",
                title: "Histórico vazio",
                subtitle: "Seus agendamentos e viagens concluídos aparecerão aqui."
            };
        }
    }, [type]);

    const activeEmptyState = useMemo(() => {
        if (isFiltered || (search && search.trim() !== "")) {
            return {
                icon: "magnify",
                title: "Nada encontrado",
                subtitle: "Tente ajustar os filtros de busca ou data."
            };
        }
        return emptyState || defaultEmptyState;
    }, [isFiltered, search, emptyState, defaultEmptyState]);

    const getCardConfig = useCallback((item) => {
        if (!item) return null;
        const isTrip = item.type === "trip" || !!item.is_trip;
        if (isTrip) {
            const companyId = item.trucking_company_id;
            return layouts?.trip?.[`${companyId}_${item.layout_ref}`]?.layout || DEFAULT_TRIP_LAYOUT;
        } else {
            const terminalId = item.terminal_id;
            return layouts?.appointment?.[`${terminalId}_${item.layout_ref}`]?.layout || DEFAULT_APPOINTMENT_LAYOUT;
        }
    }, [layouts]);

    const handleLoadMore = () => {
        // console.log(`[ActivityList] onEndReached acionado | isFetching: ${isFetching} | hasMore: ${hasMore} | Pagina atual: ${page}`);
        
        // Só avança a página se não estiver buscando E se o backend tiver mais dados
        if (!isFetching && hasMore) {
            setPage(prev => prev + 1);
        }
    };

    if (!scrollable) {
        return (
            <View ref={ref} style={contentContainerStyle}>
                {ListHeaderComponent}
                {data.map(item => {
                    const isTripItem = item.type === "trip" || !!item.is_trip;
                    return (
                        <View key={item.id.toString()} style={padded ? styles.cardWrapper : null}>
                            <AppointmentCard 
                                item={item} 
                                config={getCardConfig(item)} 
                                company={isTripItem ? truckingCompanies?.[item.trucking_company_id] : terminals?.[item.terminal_id]}
                            />
                        </View>
                    );
                })}
                {!isFetching && data.length === 0 && (
                    <View style={activeEmptyState.isDiscreet ? styles.discreetEmptyContainer : styles.emptyContainer}>
                        {activeEmptyState.icon && (
                            <View style={activeEmptyState.isDiscreet ? styles.discreetIconWrapper : styles.iconWrapper}>
                                <Icon 
                                    name={activeEmptyState.icon} 
                                    size={activeEmptyState.isDiscreet ? 22 : 40} 
                                    color={activeEmptyState.isDiscreet ? "#94A3B8" : COLORS.primary} 
                                />
                            </View>
                        )}
                        <Text style={activeEmptyState.isDiscreet ? styles.discreetEmptyTitle : styles.emptyTitle}>{activeEmptyState.title}</Text>
                        {activeEmptyState.subtitle ? (
                            <Text style={activeEmptyState.isDiscreet ? styles.discreetEmptySubtitle : styles.emptySubtitle}>{activeEmptyState.subtitle}</Text>
                        ) : null}
                    </View>
                )}
                {isFetching && <ActivityIndicator style={styles.loader} color="#3b82f6" />}
            </View>
        );
    }

    return (
        <FlatList
            ref={ref}
            data={data}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => {
                const isTripItem = item.type === "trip" || !!item.is_trip;
                return (
                    <View style={padded ? styles.cardWrapper : null}>
                        <AppointmentCard 
                            item={item} 
                            config={getCardConfig(item)} 
                            company={isTripItem ? truckingCompanies?.[item.trucking_company_id] : terminals?.[item.terminal_id]}
                        />
                    </View>
                );
            }}
            contentContainerStyle={[styles.listContent, contentContainerStyle]}
            ListHeaderComponent={ListHeaderComponent}
            ListEmptyComponent={
                !isFetching && (
                    <View style={activeEmptyState.isDiscreet ? styles.discreetEmptyContainer : styles.emptyContainer}>
                        {activeEmptyState.icon && (
                            <View style={activeEmptyState.isDiscreet ? styles.discreetIconWrapper : styles.iconWrapper}>
                                <Icon 
                                    name={activeEmptyState.icon} 
                                    size={activeEmptyState.isDiscreet ? 22 : 40} 
                                    color={activeEmptyState.isDiscreet ? "#94A3B8" : COLORS.primary} 
                                />
                            </View>
                        )}
                        <Text style={activeEmptyState.isDiscreet ? styles.discreetEmptyTitle : styles.emptyTitle}>{activeEmptyState.title}</Text>
                        {activeEmptyState.subtitle ? (
                            <Text style={activeEmptyState.isDiscreet ? styles.discreetEmptySubtitle : styles.emptySubtitle}>{activeEmptyState.subtitle}</Text>
                        ) : null}
                    </View>
                )
            }
            ListFooterComponent={
                // Mostra o loader apenas se estiver buscando e não for a primeira carga vazia
                isFetching ? <ActivityIndicator style={styles.loader} color="#3b82f6" /> : null
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5} 
            onScroll={onScroll}
            scrollEventThrottle={scrollEventThrottle}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
        />
    );
});

export default ActivityList;

const styles = StyleSheet.create({
    listContent: { paddingBottom: 32 },
    emptyText: { textAlign: "center", color: "#64748B", marginTop: 20 },
    loader: { marginVertical: 20 },
    cardWrapper: {
        paddingHorizontal: 20,
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
        paddingVertical: 48,
    },
    iconWrapper: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.primary + "14", // ~8% opacity
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: COLORS.textSecondary,
        marginBottom: 8,
        textAlign: "center",
    },
    emptySubtitle: {
        fontSize: 14,
        color: COLORS.textSubtitle,
        textAlign: "center",
        lineHeight: 20,
    },
    discreetEmptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        marginHorizontal: 20,
        marginTop: 16,
    },
    discreetIconWrapper: {
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
    },
    discreetEmptyTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#64748B",
        marginBottom: 2,
        textAlign: "center",
    },
    discreetEmptySubtitle: {
        fontSize: 12,
        color: "#94A3B8",
        textAlign: "center",
        lineHeight: 16,
    },
});