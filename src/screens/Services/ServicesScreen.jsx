import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import SearchBar from '../../components/ui/SearchBar';
import ListItem from '../../components/ui/ListItem';
import ListSeparator from '../../components/ui/ListSeparator';
import { useFetchInitialCompaniesQuery, useLazySearchCompaniesQuery } from '../../services/api';
import { COLORS } from '../../constants/colors';
import { normalizeSearchText } from '../../utils/tools';

function calculateDistance(lat1, lon1, lat2, lon2) {
    if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return null;
    if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) return null;
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
}

function formatDistance(distanceKm) {
    if (distanceKm === undefined || distanceKm === null) return null;
    if (distanceKm < 1) {
        const meters = Math.round(distanceKm * 1000);
        return `${meters} m`;
    }
    return `${distanceKm.toFixed(1)} km`;
}

export default function ServicesScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const navigation = useNavigation();
    const coords = useSelector((state) => state.location.coords);

    // Debounce logic
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(normalizeSearchText(searchQuery));
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    const isSearching = debouncedQuery.length > 2;

    // Fetch initial companies (recent + nearby) when there's no active search query.
    const { 
        data: initialData, 
        isLoading: isInitialLoading,
    } = useFetchInitialCompaniesQuery(
        { lat: coords?.latitude, lng: coords?.longitude },
        { skip: isSearching }
    );

    // Fetch search results when there's a search query
    const [triggerSearch, { 
        data: searchData, 
        isLoading: isSearchLoading,
    }] = useLazySearchCompaniesQuery();

    useEffect(() => {
        if (isSearching) {
            triggerSearch({ q: debouncedQuery, lat: coords?.latitude, lng: coords?.longitude });
        }
    }, [debouncedQuery, triggerSearch, isSearching, coords]);

    const renderItem = ({ item }) => {
        const subtitles = [item.branch_name];
        
        const appts = item.appointment_count || 0;
        const trips = item.trip_count || 0;
        if (appts > 0 || trips > 0) {
            const parts = [];
            if (appts > 0) {
                parts.push(`${appts} ${appts === 1 ? 'agendamento' : 'agendamentos'}`);
            }
            if (trips > 0) {
                parts.push(`${trips} ${trips === 1 ? 'viagem' : 'viagens'}`);
            }
            subtitles.push({
                text: `Você tem ${parts.join(' e ')} nesta empresa`,
                style: {
                    color: COLORS.textSubtitle,
                    fontWeight: '600',
                    marginTop: 4,
                    fontStyle: 'italic'
                }
            });
        }

        // Get effective company coordinates for client-side fallback
        const compLat = item.geofence?.center?.lat ?? item.address?.lat;
        const compLng = item.geofence?.center?.lng ?? item.address?.lng;
        
        // Use server-side distance or calculate client-side
        const rawDistance = item.distance_km !== undefined && item.distance_km !== null 
            ? item.distance_km 
            : calculateDistance(coords?.latitude, coords?.longitude, compLat, compLng);
            
        const distanceStr = formatDistance(rawDistance);

        return (
            <ListItem
                onPress={() => navigation.navigate('CompanyServices', { companyId: item.id, companyName: item.name })}
                title={item.name}
                subtitles={subtitles}
                logoUrl={item.logo_url}
                rightElement={
                    distanceStr ? (
                        <View style={styles.distanceContainer}>
                            <Text style={styles.distanceText}>{distanceStr}</Text>
                        </View>
                    ) : null
                }
            />
        );
    };

    const dataToDisplay = isSearching ? searchData : initialData;
    const isLoading = isSearching ? isSearchLoading : (!initialData && isInitialLoading);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <SearchBar 
                    value={searchQuery} 
                    onChangeText={setSearchQuery} 
                    placeholder="Buscar serviços ou empresas..." 
                />
            </View>

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={dataToDisplay || []}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    ItemSeparatorComponent={ListSeparator}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Text style={styles.emptyText}>Nenhum resultado encontrado.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF', // Fundo branco
    },
    header: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    listContent: {
        paddingVertical: 8,
        // Removido o gap e padding horizontal para o item preencher a largura toda
    },
    distanceContainer: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: 'rgba(249, 115, 22, 0.08)',
        borderRadius: 6,
    },
    distanceText: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.primary,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 15,
        color: '#666666',
        textAlign: 'center',
    }
});