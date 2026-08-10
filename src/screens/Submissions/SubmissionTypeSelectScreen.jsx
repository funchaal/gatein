import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CompanyLogo from '../../components/common/CompanyLogo';
import ListSeparator from '../../components/ui/ListSeparator';
import { useFetchCompanySubmissionTypesQuery } from '../../services/api';
import { COLORS } from '../../constants/colors';

export default function SubmissionTypeSelectScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const company = route.params?.company;
  const passedTypesData = route.params?.typesData;

  const { data: fetchedResponse, isLoading } = useFetchCompanySubmissionTypesQuery(company?.id, {
    skip: !company?.id || Boolean(passedTypesData),
  });

  const response = passedTypesData || fetchedResponse;
  const types = response?.data || [];
  const hasCustomTypes = response?.has_custom_types;
  const defaultOption = response?.default_option;

  // Requirement: If the company has no custom submission types, goes DIRECTLY to default option ("Enviar outra coisa").
  useEffect(() => {
    if (response && !hasCustomTypes && defaultOption) {
      navigation.replace('SubmissionForm', {
        company,
        submissionType: defaultOption,
      });
    }
  }, [response, hasCustomTypes, defaultOption, company, navigation]);

  const handleSelectType = (typeItem) => {
    navigation.navigate('SubmissionForm', {
      company,
      submissionType: typeItem,
    });
  };

  const renderItem = ({ item }) => {
    const isDefault = item.ref === 'default';

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.itemCard}
        onPress={() => handleSelectType(item)}
      >
        <View style={styles.itemIconWrap}>
          <Icon
            name={isDefault ? 'file-send-outline' : 'file-document-outline'}
            size={24}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.itemContent}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemSubtitle}>
            {isDefault
              ? 'Opção padrão para qualquer outro tipo de envio'
              : `${item.fields?.length || 0} campos • ${
                  item.accepts_attachment ? 'Aceita anexos' : 'Sem anexos'
                }`}
          </Text>
        </View>

        <Icon name="chevron-right" size={20} color="#94A3B8" />
      </TouchableOpacity>
    );
  };

  if (isLoading || (!hasCustomTypes && defaultOption)) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.companyInfo}>
          <CompanyLogo
            logoUrl={company?.logo_url}
            name={company?.name}
            companyId={company?.id}
            size={28}
            style={{ marginRight: 10 }}
          />
          <View>
            <Text style={styles.companyName}>{company?.name}</Text>
            {company?.branch_name ? (
              <Text style={styles.branchName}>{company?.branch_name}</Text>
            ) : null}
          </View>
        </View>
        <Text style={styles.instruction}>Selecione o tipo de envio desejado:</Text>
      </View>

      <FlatList
        data={types}
        keyExtractor={(item, index) => String(item.id || item.ref || index)}
        renderItem={renderItem}
        ItemSeparatorComponent={ListSeparator}
        contentContainerStyle={styles.listContent}
      />
    </View>
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
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  branchName: {
    fontSize: 12,
    color: '#64748B',
  },
  instruction: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  listContent: {
    paddingVertical: 8,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  itemIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
});
