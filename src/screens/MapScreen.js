import React, { useState, useRef, useCallback, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator, Text, StatusBar, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { openChatModal } from '../store/slices/chatSlice';

// Hooks customizados
import { useGeolocation } from '../hooks/useGeolocation';
import { useCompass } from '../hooks/useCompass';

// Componentes
import { MapControls } from '../components/map/MapControls';

// Utils
import { generateLeafletHTML } from '../services/leafletTemplate';

// Constants
import { LEAFLET_CSS, LEAFLET_JS_BASE64 } from '../constants/LeafletCore';

export default function MapScreen() {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const webViewRef = useRef(null);
    
    // Hooks customizados
    const { location, errorMsg } = useGeolocation();
    const heading = useCompass();
    
    // Estados locais
    const [isFollowingUser, setIsFollowingUser] = useState(true); // Volta para true
    const [isMapReady, setIsMapReady] = useState(false);
    const [routeInfo, setRouteInfo] = useState(null);

    // --- ATUALIZAÇÃO DO MAPA ---
    const updateMap = useCallback(() => {
        if (location && webViewRef.current && isMapReady) {
            const { latitude, longitude, accuracy = 10 } = location.coords;
            const jsCode = `
                if (window.updateMapState) {
                    window.updateMapState(${latitude}, ${longitude}, ${heading}, ${isFollowingUser}, ${accuracy});
                }
            `;
            webViewRef.current.injectJavaScript(jsCode);
        }
    }, [location, heading, isFollowingUser, isMapReady]);

    // Centraliza o mapa na primeira vez que recebe localização
    useEffect(() => {
        if (isMapReady && location && webViewRef.current) {
            const { latitude, longitude } = location.coords;
            // Centraliza imediatamente na primeira localização
            const jsCode = `
                if (window.map && !window.mapInitialized) {
                    map.setView([${latitude}, ${longitude}], 17);
                    window.mapInitialized = true;
                }
            `;
            webViewRef.current.injectJavaScript(jsCode);
        }
    }, [isMapReady, location]);

    useEffect(() => {
        updateMap();
    }, [updateMap]);

    // --- HANDLERS ---
    const handleWebViewMessage = (event) => {
        const data = event.nativeEvent.data;
        console.log('Message received:', data);
        
        if (data === 'USER_DRAGGED_MAP') {
            console.log('Setting isFollowingUser to false');
            setIsFollowingUser(false);
        } else {
            try {
                const parsed = JSON.parse(data);
                if (parsed.type === 'ROUTE_INFO') {
                    // Agora routeInfo pode ter main e alternative
                    setRouteInfo(parsed.data);
                } else if (parsed.type === 'ROUTE_CLEARED') {
                    setRouteInfo(null);
                } else if (parsed.type === 'ROUTE_SWITCHED') {
                    console.log('Route switched to index:', parsed.activeIndex);
                    // Poderia adicionar feedback visual aqui se quiser
                }
            } catch (e) {
                // Não é JSON, ignora
            }
        }
    };

    const handleClearRoute = () => {
        webViewRef.current?.injectJavaScript('window.clearRoute();');
    };

    // --- RENDERIZAÇÃO ---
    if (!location && !errorMsg) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#1E40AF" />
                <Text style={styles.loadingText}>Calibrando GPS e bússola...</Text>
            </View>
        );
    }

    const leafletHTML = generateLeafletHTML(LEAFLET_CSS, LEAFLET_JS_BASE64);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
            
            {/* Só mostra o WebView quando tiver localização */}
            {location ? (
                <WebView
                    ref={webViewRef}
                    originWhitelist={['*']}
                    source={{ html: leafletHTML }}
                    style={styles.map}
                    onMessage={handleWebViewMessage}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    onLoadEnd={() => {
                        setIsMapReady(true);
                    }}
                    userAgent={Platform.OS === 'android' 
                        ? "Mozilla/5.0 (Linux; Android 10; Android SDK built for x86) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36"
                        : undefined
                    }
                />
            ) : (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#1E40AF" />
                    <Text style={styles.loadingText}>Obtendo localização...</Text>
                </View>
            )}

            {location && (
                <MapControls
                    navigation={navigation}
                    dispatch={dispatch}
                    openChatModal={openChatModal}
                    isFollowingUser={isFollowingUser}
                    setIsFollowingUser={setIsFollowingUser}
                    routeInfo={routeInfo}
                    onClearRoute={handleClearRoute}
                    heading={heading}
                    accuracy={location?.coords?.accuracy}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#fff' 
    },
    map: { 
        flex: 1, 
        backgroundColor: '#f5f5f5' 
    },
    centered: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#f5f5f5' 
    },
    loadingText: { 
        marginTop: 10, 
        color: '#666' 
    },
});