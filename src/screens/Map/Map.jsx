import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { openChatModal } from '../../store/slices/chatSlice';

// Hooks customizados
import { useCompass } from '../../hooks/useCompass';

// Componentes
import ScreenWrapper from '../../components/common/ScreenWrapper';
import { MapControls } from '../../components/map/MapControls';
import MapLoading from './components/MapLoading';

// Redux & API
import { selectAllTerminals } from '../../store/slices/companiesSlice';
import { useFetchInitialCompaniesQuery } from '../../services/api';

// Utils & Constants
import { generateLeafletHTML } from '../../services/leafletTemplate';
import { LEAFLET_CSS, LEAFLET_JS_BASE64 } from '../../constants/LeafletCore';
import { 
    getUpdateMapJsCode, 
    getCenterMapJsCode, 
    parseWebViewMessage, 
    getClearRouteJsCode 
} from './helpers';

import { styles } from './Map.styles';

export default function MapScreen() {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const webViewRef = useRef(null);
    
    // Pegar a localização e erro do Redux em vez do hook useGeolocation local
    const coords = useSelector((state) => state.location.coords);
    const errorMsg = useSelector((state) => state.location.error);
    const heading = useCompass();

    // Pegar os terminais do Redux
    const terminals = useSelector(selectAllTerminals);

    // Dispara a busca por empresas/terminais próximos baseando-se na localização do usuário
    useFetchInitialCompaniesQuery(
        coords ? { lat: coords.latitude, lng: coords.longitude } : undefined,
        { skip: !coords }
    );
    
    // Estados locais
    const [isFollowingUser, setIsFollowingUser] = useState(true);
    const [isMapReady, setIsMapReady] = useState(false);
    const [routeInfo, setRouteInfo] = useState(null);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [isRouteLoading, setIsRouteLoading] = useState(false);

    // Formata a lista de terminais resolvendo coordenadas físicas e da geocerca para uso no mapa
    const terminalsList = Object.values(terminals || {}).map((t) => {
        // Coordenadas físicas da empresa/endereço
        const addressLat = t.address?.lat ?? t.latitude;
        const addressLng = t.address?.lng ?? t.longitude;

        // Coordenadas do centro da geocerca
        const geofenceLat = t.geofence?.center?.lat ?? t.latitude;
        const geofenceLng = t.geofence?.center?.lng ?? t.longitude;

        // Raio da geocerca
        let radius = t.geofenceRadius ?? t.geofence_radius;
        if (radius === undefined || radius === null) {
            radius = t.geofence?.radius ?? 0;
        }

        return {
            id: t.id,
            name: t.name,
            addressLat: addressLat ? Number(addressLat) : null,
            addressLng: addressLng ? Number(addressLng) : null,
            geofenceLat: geofenceLat ? Number(geofenceLat) : null,
            geofenceLng: geofenceLng ? Number(geofenceLng) : null,
            geofenceRadius: Number(radius),
            logo_url: t.logo_url || null,
            addressStreet: t.address?.street || null,
            addressNumber: t.address?.number || null,
            addressCity: t.address?.city || null,
            addressState: t.address?.state || null,
            addressZip: t.address?.zip || null,
            formattedAddress: typeof t.address === 'string' ? t.address : null
        };
    }).filter((t) => t.addressLat !== null && t.addressLng !== null);

    // --- ATUALIZAÇÃO DO MAPA ---
    const updateMap = useCallback(() => {
        if (coords && webViewRef.current && isMapReady) {
            const { latitude, longitude, accuracy } = coords;
            const jsCode = getUpdateMapJsCode(latitude, longitude, heading, isFollowingUser, accuracy);
            webViewRef.current.injectJavaScript(jsCode);
        }
    }, [coords, heading, isFollowingUser, isMapReady]);

    // Centraliza o mapa na primeira vez que recebe localização
    useEffect(() => {
        if (isMapReady && coords && webViewRef.current) {
            const { latitude, longitude } = coords;
            const jsCode = getCenterMapJsCode(latitude, longitude);
            webViewRef.current.injectJavaScript(jsCode);
        }
    }, [isMapReady, coords]);

    // Atualiza os marcadores de terminais/empresas e geocercas no mapa
    useEffect(() => {
        if (isMapReady && webViewRef.current && terminalsList.length > 0) {
            const jsCode = `
                if (window.updateCompanyMarkers) {
                    window.updateCompanyMarkers(${JSON.stringify(terminalsList)});
                }
            `;
            webViewRef.current.injectJavaScript(jsCode);
        }
    }, [isMapReady, terminalsList]);

    useEffect(() => {
        updateMap();
    }, [updateMap]);

    // --- HANDLERS ---
    const handleWebViewMessage = (event) => {
        const data = event.nativeEvent.data;
        // console.log('Message received:', data);
        
        const parsedMessage = parseWebViewMessage(data);
        
        if (parsedMessage?.type === 'USER_DRAGGED_MAP') {
            // console.log('Setting isFollowingUser to false');
            setIsFollowingUser(false);
        } else if (parsedMessage?.type === 'MAP_INITIALIZED') {
            setIsMapReady(true);
        } else if (parsedMessage?.type === 'COMPANY_SELECTED') {
            const company = terminalsList.find((t) => t.id === parsedMessage.companyId);
            if (company) {
                setSelectedCompany(company);
            }
        } else if (parsedMessage) {
            if (parsedMessage.type === 'ROUTE_INFO') {
                setRouteInfo(parsedMessage.data);
                setIsRouteLoading(false);
            } else if (parsedMessage.type === 'ROUTE_CLEARED') {
                setRouteInfo(null);
                setIsRouteLoading(false);
            } else if (parsedMessage.type === 'ROUTE_CALCULATION_STARTED') {
                // Limpa rota e empresa imediatamente para fechar a gaveta anterior
                setRouteInfo(null);
                setSelectedCompany(null);
                setIsRouteLoading(false);
                
                // Abre a gaveta de carregamento após 100ms
                setTimeout(() => {
                    setIsRouteLoading(true);
                }, 100);
            } else if (parsedMessage.type === 'ROUTE_SWITCHED') {
                setRouteInfo((prev) => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        main: {
                            ...prev.main,
                            distance: parsedMessage.distance,
                            duration: parsedMessage.duration
                        }
                    };
                });
            }
        }
    };

    const handleCalculateRoute = (company) => {
        if (webViewRef.current && company) {
            const lat = company.addressLat;
            const lng = company.addressLng;
            
            // Limpa a empresa selecionada imediatamente para animar a gaveta descendo
            setSelectedCompany(null);
            
            // Chama o script exposto no window para traçar rota até o endereço físico do terminal
            webViewRef.current.injectJavaScript(`
                if (window.drawRoute) {
                    window.drawRoute(${lat}, ${lng}, true);
                }
            `);
            
            // Define o carregamento como verdadeiro após 100ms (tempo para a gaveta anterior fechar completamente)
            setTimeout(() => {
                setIsRouteLoading(true);
            }, 100);
        }
    };

    const handleClearRoute = () => {
        webViewRef.current?.injectJavaScript(getClearRouteJsCode());
        setRouteInfo(null);
        setIsRouteLoading(false);
    };

    // --- RENDERIZAÇÃO ---
    // Se ocorrer erro e não temos coordenadas de localização
    if (errorMsg && !coords) {
        return (
            <ScreenWrapper noPadding={true}>
                <MapLoading text={`Erro de localização: ${errorMsg}`} isError={true} />
            </ScreenWrapper>
        );
    }

    if (!coords && !errorMsg) {
        return (
            <ScreenWrapper noPadding={true}>
                <MapLoading text="Calibrando GPS e bússola..." />
            </ScreenWrapper>
        );
    }

    const leafletHTML = generateLeafletHTML(LEAFLET_CSS, LEAFLET_JS_BASE64);

    return (
        <ScreenWrapper noPadding={true}>
            <View style={styles.container}>
                {coords ? (
                    <WebView
                        ref={webViewRef}
                        originWhitelist={['*']}
                        source={{ html: leafletHTML }}
                        style={styles.map}
                        onMessage={handleWebViewMessage}
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                        onLoadEnd={() => {}}
                        userAgent={Platform.OS === 'android' 
                            ? "Mozilla/5.0 (Linux; Android 10; Android SDK built for x86) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36"
                            : undefined
                        }
                    />
                ) : (
                    <MapLoading text="Obtendo localização..." />
                )}

                {coords && (
                    <MapControls
                        navigation={navigation}
                        dispatch={dispatch}
                        openChatModal={openChatModal}
                        isFollowingUser={isFollowingUser}
                        setIsFollowingUser={setIsFollowingUser}
                        routeInfo={routeInfo}
                        onClearRoute={handleClearRoute}
                        heading={heading}
                        accuracy={coords.accuracy}
                        selectedCompany={selectedCompany}
                        onClearSelectedCompany={() => setSelectedCompany(null)}
                        onCalculateRoute={handleCalculateRoute}
                        isRouteLoading={isRouteLoading}
                        userCoords={coords}
                    />
                )}
            </View>
        </ScreenWrapper>
    );
}
