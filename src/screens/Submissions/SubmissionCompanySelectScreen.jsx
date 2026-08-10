import React, { useState, useEffect, useMemo } from 'react';
import { View, FlatList, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import SearchBar from '../../components/ui/SearchBar';
import ListItem from '../../components/ui/ListItem';
import ListSeparator from '../../components/ui/ListSeparator';
import {
  useFetchInitialCompaniesQuery,
  useLazySearchCompaniesQuery,
  useLazyFetchCompanySubmissionTypesQuery,
} from '../../services/api';
import { COLORS } from '../../constants/colors';
import { normalizeSearchText } from '../../utils/tools';

function calculateDistance(lat1, lon1, lat2, lon2) {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return null;
  if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) return null;
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistance(distanceKm) {
  if (distanceKm === undefined || distanceKm === null) return null;
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

const DEFAULT_SUBMISSION_TYPE = {
  id: null,
  title: 'Diversos',
  ref: 'default',
  allow_edit: true,
  accepts_attachment: true,
  multiple_attachments: true,
  allowed_formats: ['image', 'pdf'],
  attachment_required: false,
  fields: [
    {
      id: 'informacoes',
      label: 'Informações',
      type: 'text',
      multiline: true,
      required: false,
      placeholder: 'Digite as informações do envio...',
    },
  ],
};

export default function SubmissionCompanySelectScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [loadingCompanyId, setLoadingCompanyId] = useState(null);
  const navigation = useNavigation();
  const coords = useSelector((state) => state.location.coords);

  const [fetchTypes] = useLazyFetchCompanySubmissionTypesQuery();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(normalizeSearchText(searchQuery));
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const isSearching = debouncedQuery.length > 2;

  const { data: initialData, isLoading: isInitialLoading } = useFetchInitialCompaniesQuery(
    { lat: coords?.latitude, lng: coords?.longitude },
    { skip: isSearching }
  );

  const [triggerSearch, { data: searchData, isLoading: isSearchLoading }] = useLazySearchCompaniesQuery();

  useEffect(() => {
    if (isSearching) {
      triggerSearch({ q: debouncedQuery, lat: coords?.latitude, lng: coords?.longitude });
    }
  }, [debouncedQuery, triggerSearch, isSearching, coords]);

  const handleSelectCompany = async (company) => {
    if (loadingCompanyId) return;
    setLoadingCompanyId(company.id);

    try {
      const res = await fetchTypes(company.id).unwrap();
      const customList = (res?.data || []).filter((t) => t.ref !== 'default');
      const hasCustom = res?.has_custom_types === true || customList.length > 0;

      if (hasCustom) {
        navigation.navigate('SubmissionTypeSelect', {
          company,
          typesData: { ...res, data: customList.length > 0 ? customList : res.data },
        });
      } else {
        const defaultType = res?.default_option || DEFAULT_SUBMISSION_TYPE;
        navigation.navigate('SubmissionForm', {
          company,
          submissionType: defaultType,
        });
      }
    } catch (e) {
      // Fallback directly to default form
      navigation.navigate('SubmissionForm', {
        company,
        submissionType: DEFAULT_SUBMISSION_TYPE,
      });
    } finally {
      setLoadingCompanyId(null);
    }
  };

  const renderItem = ({ item }) => {
    const subtitles = [item.branch_name];

    const appts = item.appointment_count || 0;
    const trips = item.trip_count || 0;
    if (appts > 0 || trips > 0) {
      const parts = [];
      if (appts > 0) parts.push(`${appts} ${appts === 1 ? 'agendamento' : 'agendamentos'}`);
      if (trips > 0) parts.push(`${trips} ${trips === 1 ? 'viagem' : 'viagens'}`);
      subtitles.push({
        text: `Você tem ${parts.join(' e ')} nesta empresa`,
        style: {
          color: COLORS.textSubtitle,
          fontWeight: '600',
          marginTop: 4,
          fontStyle: 'italic',
        },
      });
    }

    const compLat = item.geofence?.center?.lat ?? item.address?.lat;
    const compLng = item.geofence?.center?.lng ?? item.address?.lng;

    const rawDistance =
      item.distance_km !== undefined && item.distance_km !== null
        ? item.distance_km
        : calculateDistance(coords?.latitude, coords?.longitude, compLat, compLng);

    const distanceStr = formatDistance(rawDistance);
    const isThisLoading = loadingCompanyId === item.id;

    return (
      <ListItem
        onPress={() => handleSelectCompany(item)}
        title={item.name}
        subtitles={subtitles}
        logoUrl={item.logo_url}
        rightElement={
          isThisLoading ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : distanceStr ? (
            <View style={styles.distanceContainer}>
              <Text style={styles.distanceText}>{distanceStr}</Text>
            </View>
          ) : null
        }
      />
    );
  };

  const rawDataToDisplay = isSearching ? searchData : initialData;
  const isLoading = isSearching ? isSearchLoading : (!initialData && isInitialLoading);

  const dataToDisplay = useMemo(() => {
    if (!rawDataToDisplay) return [];
    return [...rawDataToDisplay].sort((a, b) => {
      const aCount = (a.appointment_count || 0) + (a.trip_count || 0);
      const bCount = (b.appointment_count || 0) + (b.trip_count || 0);
      if (aCount > 0 && bCount === 0) return -1;
      if (aCount === 0 && bCount > 0) return 1;
      return 0;
    });
  }, [rawDataToDisplay]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerInstruction}>
          Selecione a empresa para a qual deseja realizar o envio:
        </Text>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar empresas ou terminais..."
        />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={dataToDisplay}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          ItemSeparatorComponent={ListSeparator}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>Nenhuma empresa encontrada.</Text>
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
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerInstruction: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 12,
  },
  listContent: {
    paddingVertical: 8,
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
  },
});
