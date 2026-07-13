import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform, Linking, Alert, Animated, Easing, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../constants/colors';

export const MapControls = ({ 
    navigation, 
    dispatch, 
    openChatModal, 
    isFollowingUser, 
    setIsFollowingUser,
    routeInfo,
    onClearRoute,
    heading,
    selectedCompany,
    onClearSelectedCompany,
    onCalculateRoute,
    isRouteLoading = false,
    userCoords
}) => {
    const slideAnim = React.useRef(new Animated.Value(300)).current;
    const isVisible = !!(routeInfo || selectedCompany || isRouteLoading);

    // Estados locais temporários para reter o conteúdo enquanto a gaveta desliza para fora
    const [tempRouteInfo, setTempRouteInfo] = React.useState(null);
    const [tempSelectedCompany, setTempSelectedCompany] = React.useState(null);
    const [serverDuration, setServerDuration] = React.useState(null);

    // Sincroniza estados temporários para evitar collapse imediato do conteúdo ao fechar
    React.useEffect(() => {
        if (routeInfo) {
            setTempRouteInfo(routeInfo);
            setTempSelectedCompany(null);
        }
    }, [routeInfo]);

    React.useEffect(() => {
        if (selectedCompany) {
            setTempSelectedCompany(selectedCompany);
            setTempRouteInfo(null);
        }
    }, [selectedCompany]);

    // Busca a estimativa de tempo real do servidor OSRM em background
    React.useEffect(() => {
        const company = selectedCompany || tempSelectedCompany;
        if (userCoords && company) {
            const startLat = userCoords.latitude;
            const startLng = userCoords.longitude;
            const endLat = company.addressLat ?? company.geofenceLat;
            const endLng = company.addressLng ?? company.geofenceLng;
            
            if (startLat && startLng && endLat && endLng) {
                const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=false`;
                
                fetch(url)
                    .then(res => res.json())
                    .then(data => {
                        if (data.routes && data.routes.length > 0) {
                            const durationSec = data.routes[0].duration;
                            // Multiplica por 1.5 para estimativa de caminhão/tráfego realista
                            const durationMin = Math.round((durationSec * 1.5) / 60);
                            setServerDuration(`${durationMin} min`);
                        }
                    })
                    .catch(err => {
                        console.log('Error fetching background OSRM route:', err);
                    });
            }
        } else {
            setServerDuration(null);
        }
    }, [selectedCompany, tempSelectedCompany, userCoords]);

    React.useEffect(() => {
        if (isVisible) {
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 100,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: 300,
                duration: 100,
                easing: Easing.in(Easing.ease),
                useNativeDriver: true
            }).start(({ finished }) => {
                if (finished) {
                    setTempRouteInfo(null);
                    setTempSelectedCompany(null);
                }
            });
        }
    }, [isVisible, slideAnim]);

    const openHeight = Platform.select({ ios: 322, android: 282 });
    const closedHeight = 40;
    const shiftDistance = openHeight - closedHeight;

    const recenterShiftY = slideAnim.interpolate({
        inputRange: [0, 300],
        outputRange: [0, shiftDistance]
    });

    // Calcula a distância e o tempo estimado para a empresa selecionada
    let distanceString = '--';
    
    if (userCoords && tempSelectedCompany) {
        const compLat = tempSelectedCompany.addressLat ?? tempSelectedCompany.geofenceLat;
        const compLng = tempSelectedCompany.addressLng ?? tempSelectedCompany.geofenceLng;
        
        if (compLat && compLng) {
            const lat1 = userCoords.latitude;
            const lon1 = userCoords.longitude;
            const lat2 = compLat;
            const lon2 = compLng;
            
            const R = 6371; // km
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = 
                Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
                Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            const distance = R * c;
            
            if (distance < 1) {
                distanceString = `${Math.round(distance * 1000)} m`;
            } else {
                distanceString = `${distance.toFixed(1)} km`;
            }
        }
    }

    // Abre a gaveta de navegação GPS nativa usando o esquema geo: no Android e maps: no iOS
    const handleOpenGPSOptions = async () => {
        const dest = routeInfo?.destination || tempRouteInfo?.destination;
        if (!dest) return;

        const { latitude, longitude } = dest;

        const url = Platform.select({
            ios: `maps://0,0?q=${latitude},${longitude}`,
            android: `geo:${latitude},${longitude}?q=${latitude},${longitude}`
        });

        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                // Fallback para Google Maps via URL padrão
                const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
                await Linking.openURL(fallbackUrl);
            }
        } catch (error) {
            Alert.alert("Erro", "Não foi possível abrir o aplicativo de GPS.");
        }
    };

    const renderAddressDetails = () => {
        const company = selectedCompany || tempSelectedCompany;
        if (!company) return null;
        const { addressStreet, addressNumber, addressCity, addressState, addressZip, formattedAddress } = company;
        
        if (formattedAddress) {
            return <Text style={styles.routeSubtitle}>{formattedAddress}</Text>;
        }
        
        if (!addressStreet && !addressCity) {
            return <Text style={styles.routeSubtitle}>Sem endereço cadastrado</Text>;
        }
        
        return (
            <>
                <Text style={styles.routeSubtitle} numberOfLines={1}>
                    {addressStreet}{addressNumber ? `, ${addressNumber}` : ''}
                </Text>
                {(addressCity || addressZip) && (
                    <Text style={styles.routeSubtitleDetail} numberOfLines={1}>
                        {addressCity}{addressState ? ` - ${addressState}` : ''}
                        {addressZip ? ` | CEP: ${addressZip}` : ''}
                    </Text>
                )}
            </>
        );
    };

    const formatDuration = (durationStr) => {
        if (!durationStr) return '--';
        
        // Se o formato já contiver h, d, ou não contiver "min", retorna direto
        if (typeof durationStr !== 'string' || !durationStr.includes('min')) {
            return durationStr;
        }
        
        // Extrai o número de minutos
        const minsTotal = parseInt(durationStr.replace(/[^\d]/g, ''), 10);
        if (isNaN(minsTotal)) return durationStr;
        
        if (minsTotal < 60) {
            return `${minsTotal} min`;
        }
        
        const hoursTotal = Math.floor(minsTotal / 60);
        const mins = minsTotal % 60;
        
        if (hoursTotal < 24) {
            return mins > 0 ? `${hoursTotal}h ${mins}min` : `${hoursTotal}h`;
        }
        
        const days = Math.floor(hoursTotal / 24);
        const hours = hoursTotal % 24;
        
        let result = `${days}d`;
        if (hours > 0) result += ` ${hours}h`;
        if (mins > 0) result += ` ${mins}min`;
        
        return result;
    };

    const statsCardLabelStyle = [styles.statsCardLabel, { color: '#64748B' }];

    return (
        <>
            {/* Botão Voltar */}
            <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
                <MaterialCommunityIcon name="chevron-left" size={24} color={COLORS.primary} />
            </Pressable>
            
            {/* Botão Recentralizar (Animado e sincronizado com o modal) */}
            {!isFollowingUser && (
                <Animated.View 
                    style={[
                        styles.recenterButton, 
                        { 
                            transform: [{ translateY: recenterShiftY }]
                        }
                    ]}
                >
                    <Pressable style={styles.recenterPressableRow} onPress={() => setIsFollowingUser(true)}>
                        <MaterialIcon name="my-location" size={20} color="#2563EB" style={styles.recenterIconStyle} />
                        <Text style={styles.recenterButtonText}>Centralizar</Text>
                    </Pressable>
                </Animated.View>
            )}

            {/* CARD DE INFORMAÇÕES DA ROTA OU EMPRESA (Slide Animado) */}
            <Animated.View 
                style={[
                    styles.routeContainer,
                    { transform: [{ translateY: slideAnim }] }
                ]}
                pointerEvents={isVisible ? 'auto' : 'none'}
            >
                {/* Indicador de Drag */}
                <View style={styles.dragHandle} />

                {tempRouteInfo || isRouteLoading ? (
                    /* Modo de Rota (Navegação Ativa) ou Loading de Rota */
                    <>
                        {isRouteLoading || !tempRouteInfo ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={COLORS.primary} />
                            </View>
                        ) : (
                            <>
                                {/* Linha Superior: Cabeçalho */}
                                <View style={styles.routeHeader}>
                                    <View>
                                        <Text style={styles.routeTitle}>Percurso Recomendado</Text>
                                    </View>

                                    <Pressable style={styles.closeButton} onPress={onClearRoute}>
                                        <Icon name="close" size={18} color="#64748B" />
                                    </Pressable>
                                </View>

                                {/* Blocos de Informação sem caixa */}
                                <View style={styles.statsCardRow}>
                                    <View style={styles.statsCardItem}>
                                        <Text style={statsCardLabelStyle}>Tempo estimado</Text>
                                        <View style={styles.statsCardContent}>
                                            <Icon name="time-outline" size={20} color={COLORS.primary} style={styles.cardIcon} />
                                            <Text style={styles.statsCardValue}>
                                                {formatDuration(tempRouteInfo.main ? tempRouteInfo.main.duration : tempRouteInfo.duration)}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.verticalDivider} />

                                    <View style={styles.statsCardItem}>
                                        <Text style={statsCardLabelStyle}>Distância</Text>
                                        <View style={styles.statsCardContent}>
                                            <Icon name="navigate-outline" size={20} color="#64748B" style={styles.cardIcon} />
                                            <Text style={styles.statsCardValue}>
                                                {tempRouteInfo.main ? tempRouteInfo.main.distance : tempRouteInfo.distance}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Linha Inferior: Botão de Ação Genérico */}
                                <View style={styles.actionButtonsRow}>
                                    <Pressable 
                                        style={[styles.navButton, styles.genericGpsButton]} 
                                        onPress={handleOpenGPSOptions}
                                    >
                                        <MaterialCommunityIcon name="navigation" size={20} color="white" style={styles.gpsIcon} />
                                        <Text style={styles.navButtonText}>Abrir no aplicativo de GPS</Text>
                                    </Pressable>
                                </View>
                            </>
                        )}
                    </>
                ) : tempSelectedCompany ? (
                    /* Modo de Detalhes da Empresa selecionada */
                    <>
                        {/* Linha Superior: Cabeçalho da Empresa */}
                        <View style={styles.routeHeader}>
                            <View style={styles.companyHeaderInfo}>
                                <Text style={styles.routeTitle} numberOfLines={1}>
                                    {tempSelectedCompany.name}
                                </Text>
                                {renderAddressDetails()}
                            </View>

                            <Pressable style={styles.closeButton} onPress={onClearSelectedCompany}>
                                <Icon name="close" size={18} color="#64748B" />
                            </Pressable>
                        </View>

                        {/* Blocos de Informação sem caixa com Botão de Rotas Redondo/Menor ao lado */}
                        <View style={styles.statsCardRow}>
                            <View style={styles.statsCardItem}>
                                <Text style={styles.statsCardLabel}>Distância estimada</Text>
                                <View style={styles.statsCardContent}>
                                    <Icon name="pin-outline" size={20} color={COLORS.primary} style={styles.cardIcon} />
                                    <Text style={styles.statsCardValue}>{distanceString}</Text>
                                </View>
                                {serverDuration ? (
                                    <View style={styles.statsCardSubContent}>
                                        <Icon name="time-outline" size={14} color="#64748B" style={styles.subCardIcon} />
                                        <Text style={styles.statsCardSubValue}>Cerca de {formatDuration(serverDuration)}</Text>
                                    </View>
                                ) : distanceString !== '--' ? (
                                    <View style={styles.statsCardSubContent}>
                                        <Icon name="time-outline" size={14} color="#64748B" style={styles.subCardIcon} />
                                        <Text style={styles.statsCardSubValue}>Calculando tempo...</Text>
                                    </View>
                                ) : null}
                            </View>

                            <Pressable 
                                style={styles.smallRoundRotasButton} 
                                onPress={() => onCalculateRoute(tempSelectedCompany)}
                            >
                                <MaterialCommunityIcon name="directions" size={18} color="white" style={styles.smallGpsIcon} />
                                <Text style={styles.smallRoundRotasButtonText}>Rotas</Text>
                            </Pressable>
                        </View>
                    </>
                ) : null}
            </Animated.View>
        </>
    );
};

const styles = StyleSheet.create({
    backButton: { 
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 50, 
        left: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
        alignItems: 'center',
        justifyContent: 'center',
    },
    recenterButton: {
        position: 'absolute',
        bottom: Platform.select({ ios: 322, android: 282 }),
        right: 20,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#ffffff',
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    
    // Estilo do Card como Bottom Sheet
    routeContainer: {
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        right: 0,
        backgroundColor: 'white', 
        borderTopLeftRadius: 24, 
        borderTopRightRadius: 24,
        paddingHorizontal: 24, 
        paddingTop: 16,
        paddingBottom: Platform.OS === 'ios' ? 48 : 36,
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: -10 }, 
        shadowOpacity: 0.08, 
        shadowRadius: 16, 
        elevation: 10,
    },
    dragHandle: {
        width: 38,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#E2E8F0',
        alignSelf: 'center',
        marginBottom: 20,
    },
    routeHeader: {
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 20,
    },
    routeTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
        letterSpacing: -0.2,
    },
    routeSubtitle: {
        fontSize: 13,
        color: '#64748B',
        marginTop: 4,
        fontWeight: '400',
    },
    routeSubtitleDetail: {
        fontSize: 12,
        color: '#94A3B8',
        marginTop: 2,
        fontWeight: '400',
    },
    closeButton: {
        backgroundColor: '#F1F5F9', 
        padding: 8, 
        borderRadius: 20,
    },
    statsCardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    statsCardItem: {
        flex: 1,
        alignItems: 'flex-start',
    },
    statsCardLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    statsCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statsCardValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
    },
    statsCardSubContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    statsCardSubValue: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '500',
    },
    subCardIcon: {
        marginRight: 4,
    },
    recenterPressableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    recenterIconStyle: {
        marginRight: 6,
    },
    recenterButtonText: {
        color: '#2563EB',
        fontSize: 14,
        fontWeight: '600',
    },
    smallRoundRotasButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 38,
        paddingHorizontal: 16,
        borderRadius: 19,
        alignSelf: 'center',
    },
    smallRoundRotasButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    verticalDivider: {
        width: 1,
        height: 32,
        backgroundColor: '#E2E8F0',
        marginHorizontal: 20,
    },
    cardIcon: {
        marginRight: 6,
    },
    smallGpsIcon: {
        marginRight: 4,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 160,
    },
    actionButtonsRow: {
        flexDirection: 'row', 
        gap: 12,
        marginTop: 8,
    },
    navButton: {
        flex: 1, 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center',
        paddingVertical: 14, 
        borderRadius: 14,
    },
    genericGpsButton: {
        backgroundColor: COLORS.primary, // Orange solid background
    },
    gpsIcon: {
        marginRight: 8,
    },
    navButtonText: {
        fontSize: 15, 
        fontWeight: '700', 
        color: 'white',
    },
    companyHeaderInfo: {
        flex: 1,
        marginRight: 8,
    }
});
