import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Platform, Linking, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'; // Importando FontAwesome para ícone do Waze

export const MapControls = ({ 
    navigation, 
    dispatch, 
    openChatModal, 
    isFollowingUser, 
    setIsFollowingUser,
    routeInfo,
    onClearRoute,
    heading
}) => {
    const routeCardOffset = routeInfo ? 100 : 0;
    const [availableApps, setAvailableApps] = useState({ waze: false, googleMaps: false });

    // Verifica quais apps estão instalados ao montar o componente
    useEffect(() => {
        const checkApps = async () => {
            const wazeUrl = Platform.OS === 'ios' ? 'waze://' : 'waze://';
            const gmapsUrl = Platform.OS === 'ios' ? 'comgooglemaps://' : 'google.navigation:q=0,0';

            try {
                const [wazeInstalled, gmapsInstalled] = await Promise.all([
                    Linking.canOpenURL(wazeUrl),
                    Linking.canOpenURL(gmapsUrl)
                ]);
                setAvailableApps({ waze: wazeInstalled, googleMaps: gmapsInstalled });
            } catch (error) {
                console.error("Erro verificação apps:", error);
            }
        };
        checkApps();
    }, []);

    // Função para abrir o App externo
    const openGPS = (app) => {
        if (!routeInfo?.destination) return;

        const { latitude, longitude } = routeInfo.destination;
        
        const url = Platform.select({
            ios: app === 'waze' 
                ? `waze://?ll=${latitude},${longitude}&navigate=yes` 
                : `comgooglemaps://?daddr=${latitude},${longitude}&directionsmode=driving`,
            android: app === 'waze'
                ? `waze://?ll=${latitude},${longitude}&navigate=yes`
                : `google.navigation:q=${latitude},${longitude}`
        });

        Linking.openURL(url).catch(() => Alert.alert("Erro", "Não foi possível abrir o mapa."));
    };

    return (
        <>
            {/* Botão Voltar */}
            <Pressable style={[styles.fabButton, styles.backButton]} onPress={() => navigation.goBack()}>
                <Icon name="arrow-back" size={24} color="#333" />
            </Pressable>

            {/* Botão Chat */}
            <Pressable style={[styles.fabButton, styles.chatButton]} onPress={() => dispatch(openChatModal())}>
                <Icon name="chatbubble-ellipses-outline" size={24} color="#333" />
            </Pressable>
            
            {/* Botão Recentralizar */}
            {!isFollowingUser && (
                <Pressable 
                    style={[styles.fabButton, styles.recenterButton, { bottom: 30 + (routeInfo ? 140 : 0) }]} 
                    onPress={() => setIsFollowingUser(true)}
                >
                    <MaterialIcon name="my-location" size={24} color="#1E40AF" />
                </Pressable>
            )}

            {/* CARD DE INFORMAÇÕES DA ROTA */}
            {routeInfo && (
                <View style={styles.routeContainer}>
                    {/* Linha Superior: Dados da Rota */}
                    <View style={styles.routeHeader}>
                        <View style={styles.routeStats}>
                            <View style={styles.statItem}>
                                <Icon name="time" size={18} color="#2563EB" />
                                <Text style={styles.statValue}>
                                    {routeInfo.main ? routeInfo.main.duration : routeInfo.duration}
                                </Text>
                            </View>
                            <View style={styles.statItem}>
                                <Icon name="navigate" size={18} color="#6B7280" />
                                <Text style={styles.statSubValue}>
                                    {routeInfo.main ? routeInfo.main.distance : routeInfo.distance}
                                </Text>
                            </View>
                        </View>

                        <Pressable style={styles.closeButton} onPress={onClearRoute}>
                            <Icon name="close" size={20} color="#EF4444" />
                        </Pressable>
                    </View>

                    {/* Linha Divisória */}
                    <View style={styles.divider} />

                    {/* Linha Inferior: Botões de Ação (Waze/Maps) */}
                    <View style={styles.actionButtonsRow}>
                        {availableApps.waze && (
                            <Pressable 
                                style={[styles.navButton, styles.wazeButton]} 
                                onPress={() => openGPS('waze')}
                            >
                                <FontAwesome5 name="waze" size={18} color="white" style={{ marginRight: 8 }} />
                                <Text style={styles.navButtonText}>Waze</Text>
                            </Pressable>
                        )}

                        {availableApps.googleMaps && (
                            <Pressable 
                                style={[styles.navButton, styles.mapsButton]} 
                                onPress={() => openGPS('google')}
                            >
                                <MaterialIcon name="place" size={20} color="#1F2937" style={{ marginRight: 6 }} />
                                <Text style={[styles.navButtonText, { color: '#1F2937' }]}>Maps</Text>
                            </Pressable>
                        )}
                    </View>
                </View>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    fabButton: {
        position: 'absolute', backgroundColor: 'white', padding: 12, borderRadius: 12,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 5,
        alignItems: 'center', justifyContent: 'center',
    },
    backButton: { top: Platform.OS === 'ios' ? 60 : 50, left: 20 },
    chatButton: { top: Platform.OS === 'ios' ? 60 : 50, right: 20 },
    recenterButton: { right: 15, backgroundColor: 'white' },
    
    // Novo Estilo do Card
    routeContainer: {
        position: 'absolute', bottom: 30, left: 15, right: 15,
        backgroundColor: 'white', borderRadius: 20, padding: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5,
    },
    routeHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12
    },
    routeStats: {
        flexDirection: 'row', alignItems: 'baseline', gap: 12
    },
    statItem: {
        flexDirection: 'row', alignItems: 'center', gap: 6
    },
    statValue: {
        fontSize: 22, fontWeight: '800', color: '#111827', letterSpacing: -0.5
    },
    statSubValue: {
        fontSize: 16, fontWeight: '600', color: '#6B7280'
    },
    closeButton: {
        backgroundColor: '#FEE2E2', padding: 8, borderRadius: 50
    },
    divider: {
        height: 1, backgroundColor: '#F3F4F6', marginBottom: 12
    },
    actionButtonsRow: {
        flexDirection: 'row', gap: 10
    },
    navButton: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 12, borderRadius: 12, elevation: 2
    },
    wazeButton: {
        backgroundColor: '#33CCFF', // Azul Waze
    },
    mapsButton: {
        backgroundColor: '#F3F4F6', // Cinza claro padrão Google Maps UI
        borderWidth: 1, borderColor: '#E5E7EB'
    },
    navButtonText: {
        fontSize: 14, fontWeight: '700', color: 'white'
    }
});