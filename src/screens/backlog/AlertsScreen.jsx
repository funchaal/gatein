import React, { useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    FlatList,
    RefreshControl,
    ActivityIndicator,
    Animated
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../constants/colors';
import { useFetchNotificationHistoryQuery } from '../../services/api';
import ListSeparator from '../../components/ui/ListSeparator';

const formatAlertDate = (dateString) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        
        // Se for hoje
        const isToday = date.getDate() === now.getDate() && 
                        date.getMonth() === now.getMonth() && 
                        date.getFullYear() === now.getFullYear();
        
        // Se for ontem
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const isYesterday = date.getDate() === yesterday.getDate() && 
                            date.getMonth() === yesterday.getMonth() && 
                            date.getFullYear() === yesterday.getFullYear();

        if (diffMins < 1) return 'há menos de 1 min';
        if (diffMins < 60) return `há ${diffMins} min`;
        
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        if (diffHours < 24 && isToday) {
            return `hoje, às ${hours}:${minutes}`;
        }
        
        if (isYesterday) {
            return `ontem, às ${hours}:${minutes}`;
        }
        
        const day = String(date.getDate()).padStart(2, '0');
        const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
        const month = months[date.getMonth()];
        return `${day} de ${month}, às ${hours}:${minutes}`;
    } catch (e) {
        return dateString;
    }
};

const AlertItem = ({ item, index }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    
    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            delay: Math.min(index * 60, 450),
            useNativeDriver: true,
        }).start();
    }, [fadeAnim, index]);

    return (
        <Animated.View style={[styles.row, { opacity: fadeAnim }]}>
            <View style={styles.iconWrapperLeft}>
                <FeatherIcon name="bell" size={20} color="#F97316" />
            </View>
            <View style={styles.infoContainer}>
                <View style={styles.rowHeader}>
                    <Text style={styles.rowTitle}>{item.title}</Text>
                    <Text style={styles.rowTime}>{formatAlertDate(item.created_at)}</Text>
                </View>
                <Text style={styles.rowBody}>{item.body}</Text>
            </View>
        </Animated.View>
    );
};

export default function AlertsScreen() {
    const { data: notifications = [], isLoading, isFetching, refetch } = useFetchNotificationHistoryQuery();

    const handleRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    if (isLoading && !isFetching) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Carregando alertas...</Text>
            </View>
        );
    }

    if (notifications.length === 0) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
                <FlatList
                    data={[]}
                    renderItem={null}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <View style={styles.iconWrapper}>
                                <FeatherIcon name="bell-off" size={40} color={COLORS.primary} />
                            </View>
                            <Text style={styles.emptyTitle}>Nenhum alerta</Text>
                            <Text style={styles.emptySubtitle}>
                                Você não possui novos alertas ou notificações nos últimos 7 dias.
                            </Text>
                        </View>
                    }
                    refreshControl={
                        <RefreshControl
                            refreshing={isFetching}
                            onRefresh={handleRefresh}
                            colors={[COLORS.primary]}
                            tintColor={COLORS.primary}
                        />
                    }
                    contentContainerStyle={styles.emptyList}
                />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => <AlertItem item={item} index={index} />}
                ItemSeparatorComponent={ListSeparator}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={isFetching}
                        onRefresh={handleRefresh}
                        colors={[COLORS.primary]}
                        tintColor={COLORS.primary}
                    />
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: COLORS.muted || '#6B7280',
    },
    listContainer: {
        paddingBottom: 24,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        paddingVertical: 80,
    },
    iconWrapper: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: (COLORS.primary || '#F97316') + '14',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textSecondary || '#424242',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 13,
        color: COLORS.textSubtitle || '#666',
        textAlign: 'center',
        lineHeight: 18,
    },
    emptyList: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        paddingVertical: 16,
        paddingHorizontal: 20,
        alignItems: 'flex-start',
    },
    iconWrapperLeft: {
        marginRight: 14,
        marginTop: 2,
    },
    infoContainer: {
        flex: 1,
    },
    rowHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    rowTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.navy || '#413b5e',
        flex: 1,
        marginRight: 12,
    },
    rowTime: {
        fontSize: 11,
        color: COLORS.muted || '#6B7280',
        textAlign: 'right',
        marginTop: 2,
    },
    rowBody: {
        fontSize: 13,
        lineHeight: 18,
        color: '#475569',
        marginTop: 2,
    },
});
