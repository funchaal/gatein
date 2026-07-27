import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import ListSeparator from '../../components/ui/ListSeparator';
import CompanyLogo from '../../components/common/CompanyLogo';

import { selectAllAppointments, selectHasMoreActivity } from '../../store/slices/activitySlice';
import { selectAllTerminals, selectAllLayouts } from '../../store/slices/companiesSlice';
import { useFetchActivityDataQuery } from '../../services/api';

const PAGE_LIMIT = 50;

const getAppointmentDate = (appt) => {
    const raw = appt?.window_start || appt?.Start_Time || appt?.start_time || appt?.scheduled_time;
    if (!raw) return null;
    try { return new Date(raw); } catch { return null; }
};

const getTicketDateLabel = (dateString) => {
    if (!dateString) return { relativeDay: '', time: '', weekday: '' };
    try {
        const date = new Date(dateString);
        const today = new Date();
        
        // Zero out times for calendar date comparison
        const dateZero = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        const diffTime = dateZero.getTime() - todayZero.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        
        let relativeDay = '';
        if (diffDays === 0) {
            relativeDay = 'Hoje';
        } else if (diffDays === -1) {
            relativeDay = 'Ontem';
        } else if (diffDays === -2) {
            relativeDay = 'Anteontem';
        } else if (diffDays === 1) {
            relativeDay = 'Amanhã';
        } else {
            // e.g., "18 de jul."
            const day = date.getDate();
            const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
            const monthStr = months[date.getMonth()];
            relativeDay = `${day} de ${monthStr}`;
        }
        
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const timeStr = `${hours}:${minutes}`;
        
        let weekday = date.toLocaleDateString('pt-BR', { weekday: 'long' });
        if (weekday) {
            weekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
        }
        
        return {
            relativeDay,
            time: timeStr,
            weekday,
        };
    } catch (e) {
        return {
            relativeDay: dateString || '',
            time: '',
            weekday: '',
        };
    }
};

export default function TicketsListScreen() {
    const navigation = useNavigation();
    const [page, setPage] = useState(0);

    const { isFetching } = useFetchActivityDataQuery({
        status_filter: 'all',
        limit: PAGE_LIMIT,
        offset: page * PAGE_LIMIT
    });

    const hasMore = useSelector(selectHasMoreActivity);
    const appointments = useSelector(selectAllAppointments);
    const terminals = useSelector(selectAllTerminals) || {};
    const layouts = useSelector(selectAllLayouts) || {};

    const appointmentsWithTickets = useMemo(() => {
        const appts = appointments || [];
        return appts
            .filter(appt => appt.tickets && appt.tickets.length > 0)
            .sort((a, b) => {
                const dateA = getAppointmentDate(a) || new Date(0);
                const dateB = getAppointmentDate(b) || new Date(0);
                return dateB - dateA; // Newest appointments first
            });
    }, [appointments]);

    const handleLoadMore = () => {
        if (!isFetching && hasMore) {
            setPage(prev => prev + 1);
        }
    };

    const navigateToTicketDetail = (appt) => {
        if (!appt.tickets || appt.tickets.length === 0) return;
        
        // Sort tickets descending by created_at (newest first)
        const sortedTickets = [...appt.tickets].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        const activeTicket = sortedTickets[0];
        
        let layout = null;
        if (activeTicket.layout_ref) {
            const layoutKey = `${appt.terminal_id}_${activeTicket.layout_ref}`;
            const layoutObj = layouts.ticket?.[layoutKey] || layouts.ticket?.[activeTicket.layout_ref];
            layout = layoutObj?.layout?.elements || layoutObj?.elements || layoutObj || null;
        }

        navigation.navigate('Ticket', {
            appointment: appt,
            ticket: activeTicket,
            layout: layout
        });
    };

    const renderItem = ({ item }) => {
        const dateObj = getAppointmentDate(item);
        const { relativeDay, time, weekday } = getTicketDateLabel(dateObj);
        const terminalName = terminals[item.terminal_id]?.name || 'Terminal Desconhecido';
        const ticketCount = item.tickets.length;

        return (
            <TouchableOpacity 
                activeOpacity={0.7}
                style={styles.row}
                onPress={() => navigateToTicketDetail(item)}
            >
                <View style={styles.rowHeader}>
                    <View style={styles.dateContainer}>
                        <Text style={styles.relativeDay}>{relativeDay}</Text>
                        {weekday ? <Text style={styles.timeAndWeekday}>{weekday} • {time}</Text> : null}
                    </View>
                    {ticketCount > 1 ? (
                        <View style={styles.badge}>
                            <Icon name="cards-outline" size={13} color="#F97316" />
                            <Text style={styles.badgeText}>{ticketCount} tickets</Text>
                        </View>
                    ) : null}
                </View>
                
                <View style={styles.rowBody}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <CompanyLogo
                            logoUrl={terminals[item.terminal_id]?.logo_url || item.terminal_logo_url}
                            name={terminalName}
                            companyId={item.terminal_id}
                            size={22}
                            style={{ marginRight: 8 }}
                        />
                        <Text style={styles.terminalName}>{terminalName}</Text>
                    </View>
                    <Text style={styles.summary} numberOfLines={2}>
                        {item.summary || 'Sem resumo disponível'}
                    </Text>
                    <View style={styles.rowFooter}>
                        <Text style={styles.ref}>#{item.ref || '—'}</Text>
                        <View style={styles.actionLink}>
                            <Text style={styles.actionText}>Ver Ticket</Text>
                            <Icon name="chevron-right" size={16} color="#F97316" />
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <ScreenWrapper noPadding={true} edges={['left', 'right', 'bottom']}>
            <View style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
                <FlatList
                    data={appointmentsWithTickets}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={renderItem}
                    ItemSeparatorComponent={ListSeparator}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        isFetching ? <ActivityIndicator style={{ marginVertical: 20 }} color="#F97316" /> : null
                    }
                    ListEmptyComponent={
                        !isFetching && (
                            <View style={styles.emptyContainer}>
                                <View style={styles.emptyIconWrapper}>
                                    <Icon name="ticket-outline" size={48} color="#94A3B8" />
                                </View>
                                <Text style={styles.emptyTitle}>Nenhum ticket disponível</Text>
                                <Text style={styles.emptySubtitle}>
                                    Seus tickets de acesso aparecerão aqui após realizar o check-in nos terminais autorizados.
                                </Text>
                            </View>
                        )
                    }
                />
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    listContent: {
        paddingTop: 8,
        paddingBottom: 40,
    },
    row: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    rowHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    dateContainer: {
        flex: 1,
    },
    relativeDay: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 2,
    },
    timeAndWeekday: {
        fontSize: 12,
        fontWeight: '500',
        color: '#64748B',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF7ED',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#FFEDD5',
        gap: 4,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#F97316',
    },
    rowBody: {
        marginTop: 4,
    },
    terminalName: {
        fontSize: 12,
        fontWeight: '700',
        color: '#F97316',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 6,
    },
    summary: {
        fontSize: 15,
        fontWeight: '600',
        color: '#334155',
        lineHeight: 20,
        marginBottom: 14,
    },
    rowFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    ref: {
        fontSize: 12,
        fontWeight: '700',
        color: '#94A3B8',
        backgroundColor: '#F8FAFC',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    actionLink: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    actionText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#F97316',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        paddingHorizontal: 32,
    },
    emptyIconWrapper: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 6,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 13,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 18,
    },
});
