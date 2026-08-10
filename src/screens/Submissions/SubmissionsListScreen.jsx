import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FeatherIcon from 'react-native-vector-icons/Feather';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import ListSeparator from '../../components/ui/ListSeparator';
import CompanyLogo from '../../components/common/CompanyLogo';
import { useFetchMySubmissionsQuery } from '../../services/api';
import { COLORS } from '../../constants/colors';

const formatDateLabel = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} às ${hours}:${minutes}`;
  } catch (e) {
    return dateString;
  }
};

export default function SubmissionsListScreen() {
  const navigation = useNavigation();
  const { data: response, isLoading, refetch, isFetching } = useFetchMySubmissionsQuery();

  const submissions = response?.data || [];

  const renderItem = ({ item }) => {
    const isEdited = item.status === 'EDITED';
    const attachmentsCount = item.attachments?.length || 0;
    const fieldsCount = Object.keys(item.field_data || {}).length;

    const rawTitle = item.type_title || '';
    const displayTitle =
      rawTitle === 'Enviar outra coisa' || rawTitle === 'Outros envios' || rawTitle === 'Outros'
        ? 'Diversos'
        : rawTitle;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.card}
        onPress={() => navigation.navigate('SubmissionDetail', { submission: item })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.companyRow}>
            <CompanyLogo
              logoUrl={item.company_logo_url}
              name={item.company_name}
              companyId={item.company_id}
              size={24}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.companyName} numberOfLines={1}>
              {item.company_name} {item.company_branch_name ? `• ${item.company_branch_name}` : ''}
            </Text>
          </View>
        </View>

        <View style={styles.titleStatusRow}>
          <Text style={styles.typeTitle}>{displayTitle}</Text>
          {isEdited ? (
            <View style={[styles.statusBadge, styles.statusBadgeEdited]}>
              <Icon name="pencil-outline" size={12} color="#2563EB" />
              <Text style={[styles.statusBadgeText, styles.statusBadgeTextEdited]}>Editado</Text>
            </View>
          ) : (
            <View style={[styles.statusBadge, styles.statusBadgeSent]}>
              <Icon name="check" size={12} color="#059669" />
              <Text style={[styles.statusBadgeText, styles.statusBadgeTextSent]}>Enviado</Text>
            </View>
          )}
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Icon name="paperclip" size={14} color="#64748B" />
            <Text style={styles.metaText}>
              {attachmentsCount === 0
                ? 'Sem anexos'
                : `${attachmentsCount} ${attachmentsCount === 1 ? 'anexo' : 'anexos'}`}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Icon name="text-box-outline" size={14} color="#64748B" />
            <Text style={styles.metaText}>{fieldsCount} campos</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.dateText}>{formatDateLabel(item.created_at)}</Text>
          <View style={styles.detailLink}>
            <Text style={styles.detailLinkText}>Ver detalhes</Text>
            <Icon name="chevron-right" size={16} color={COLORS.primary} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenWrapper noPadding={true} edges={['left', 'right', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.container}>
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            data={submissions}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            refreshing={isFetching}
            onRefresh={refetch}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconWrapper}>
                  <Icon name="email-outline" size={44} color="#94A3B8" />
                </View>
                <Text style={styles.emptyTitle}>Nenhum envio realizado</Text>
                <Text style={styles.emptySubtitle}>
                  Você ainda não realizou nenhum envio para as empresas. Clique no botão abaixo para criar um novo envio.
                </Text>
              </View>
            }
          />
        )}

        {/* WhatsApp style Floating Action Button (FAB) at bottom right */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.fab}
          onPress={() => navigation.navigate('SubmissionCompanySelect')}
        >
          <FeatherIcon name="plus" size={24} color="#FFFFFF" />
          <Text style={styles.fabText}>Novo Envio</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingVertical: 8,
    paddingBottom: 100, // Space for FAB
  },
  card: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  companyName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  titleStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 3,
  },
  statusBadgeSent: {
    backgroundColor: '#ECFDF5',
  },
  statusBadgeEdited: {
    backgroundColor: '#EFF6FF',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusBadgeTextSent: {
    color: '#059669',
  },
  statusBadgeTextEdited: {
    color: '#2563EB',
  },
  typeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  dateText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
  },
  detailLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  detailLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyIconWrapper: {
    width: 76,
    height: 76,
    borderRadius: 38,
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
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    gap: 8,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
