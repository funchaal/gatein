import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SvgUri } from 'react-native-svg';
import { useFetchCompanyServicesQuery, useLazyGenerateIntegrationAuthTokenQuery } from '../../services/servicesApi';
import { selectTerminalById, selectTruckingCompanyById } from '../../store/slices/companiesSlice';
import ListItem from '../../components/ui/ListItem';
import ListSeparator from '../../components/ui/ListSeparator';
import LoadingModal from '../../components/ui/LoadingModal';
import { COLORS } from '../../constants/colors';
import { isPlaceholderUrl } from '../../utils/tools';

export default function CompanyServicesScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const { companyId, companyName } = route.params;

    // Fetch the company info from Redux Cache
    const terminal = useSelector(state => selectTerminalById(state, companyId));
    const trucking = useSelector(state => selectTruckingCompanyById(state, companyId));
    const company = terminal || trucking;

    const { data: responseData, isLoading, isError } = useFetchCompanyServicesQuery(companyId);
    const [generateToken, { isLoading: isGeneratingToken }] = useLazyGenerateIntegrationAuthTokenQuery();

    const [headerLogoError, setHeaderLogoError] = useState(false);

    // Reset error state if the company changes
    useEffect(() => {
        setHeaderLogoError(false);
    }, [companyId]);

    // Adjust native header (hide title, remove divider)
    useEffect(() => {
        navigation.setOptions({
            title: '',
            headerTintColor: COLORS.primary,
            headerStyle: {
                backgroundColor: '#FFFFFF',
                elevation: 0,
                shadowOpacity: 0,
                borderBottomWidth: 0, // Remove divider below native navigation header
            }
        });
    }, [navigation]);

    const handleServiceClick = async (service) => {
        if (service.url) {
            try {
                const response = await generateToken().unwrap();
                const token = response.data?.token || response.token;
                navigation.navigate('ServiceWebView', { url: service.url, title: service.title, integrationToken: token });
            } catch (error) {
                Alert.alert('Erro', 'Não foi possível autenticar com o servidor da empresa.');
            }
        } else {
            Alert.alert('Aviso', 'Este serviço não possui uma URL disponível.');
        }
    };

    const renderItem = ({ item }) => (
        <ListItem
            onPress={() => handleServiceClick(item)}
            title={item.title}
            subtitles={[item.description]}
            logoUrl={item.icon_url}
            rightElement={
                <Icon name="chevron-right" size={20} color="#CCCCCC" />
            }
        />
    );

    const renderHeader = () => {
        if (!company) return null;
        
        const initial = company.name ? company.name.charAt(0).toUpperCase() : '';
        const showSvg = company.logo_url && !headerLogoError && !isPlaceholderUrl(company.logo_url);

        return (
            <View style={styles.companyHeader}>
                <View style={styles.headerTopRow}>
                    <View style={styles.headerLogoCircle}>
                        {showSvg ? (
                            <View style={styles.headerSvgWrapper}>
                                <SvgUri
                                    width={48}
                                    height={48}
                                    uri={company.logo_url}
                                    onError={() => setHeaderLogoError(true)}
                                />
                            </View>
                        ) : (
                            <Text style={styles.headerLogoInitial}>{initial}</Text>
                        )}
                    </View>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.companyNameText}>{company.name}</Text>
                        {company.branch_name ? (
                            <Text style={styles.companyBranchText}>{company.branch_name}</Text>
                        ) : null}
                    </View>
                </View>
                
                <Text style={styles.servicesTitle}>Serviços Disponíveis</Text>
            </View>
        );
    };

    const services = responseData?.data || [];

    return (
        <View style={styles.container}>
            <LoadingModal 
                visible={isGeneratingToken} 
                text="Autenticando com o servidor da empresa..." 
            />
            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={services}
                    keyExtractor={(item) => item.id.toString()}
                    ListHeaderComponent={renderHeader}
                    renderItem={renderItem}
                    ItemSeparatorComponent={ListSeparator}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Text style={styles.emptyText}>Nenhum serviço encontrado para esta empresa.</Text>
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
        backgroundColor: '#FFFFFF', // White background
    },
    listContent: {
        paddingBottom: 24,
    },
    companyHeader: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        marginTop: 8,
        marginBottom: 8,
    },
    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    headerLogoCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    headerLogoInitial: {
        fontSize: 24,
        fontWeight: '700',
        color: '#475569',
    },
    headerSvgWrapper: {
        width: 48,
        height: 48,
        borderRadius: 24,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTextContainer: {
        flex: 1,
    },
    companyNameText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 2,
    },
    companyBranchText: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 2,
    },
    companyTaxText: {
        fontSize: 13,
        color: '#94A3B8',
    },
    servicesTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
        marginTop: 14,
        marginBottom: 4,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 15,
        color: '#64748B',
        textAlign: 'center',
    }
});