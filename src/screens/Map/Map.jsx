import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, StatusBar, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { openChatModal } from '../../store/slices/chatSlice';

// Hooks customizados
import { useGeolocation } from '../../hooks/useGeolocation';
import { useCompass } from '../../hooks/useCompass';

// Componentes
import { MapControls } from '../../components/map/MapControls';
import MapLoading from './components/MapLoading';

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
    
    // Hooks customizados
    const { location, errorMsg } = useGeolocation();
    const heading = useCompass();
    
    // Estados locais
    const [isFollowingUser, setIsFollowingUser] = useState(true);
    const [isMapReady, setIsMapReady] = useState(false);
    const [routeInfo, setRouteInfo] = useState(null);

    // --- ATUALIZAÇÃO DO MAPA ---
    const updateMap = useCallback(() => {
        if (location && webViewRef.current && isMapReady) {
            const { latitude, longitude, accuracy } = location.coords;
            const jsCode = getUpdateMapJsCode(latitude, longitude, heading, isFollowingUser, accuracy);
            webViewRef.current.injectJavaScript(jsCode);
        }
    }, [location, heading, isFollowingUser, isMapReady]);

    // Centraliza o mapa na primeira vez que recebe localização
    useEffect(() => {
        if (isMapReady && location && webViewRef.current) {
            const { latitude, longitude } = location.coords;
            const jsCode = getCenterMapJsCode(latitude, longitude);
            webViewRef.current.injectJavaScript(jsCode);
        }
    }, [isMapReady, location]);

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
        } else if (parsedMessage) {
            if (parsedMessage.type === 'ROUTE_INFO') {
                setRouteInfo(parsedMessage.data);
            } else if (parsedMessage.type === 'ROUTE_CLEARED') {
                setRouteInfo(null);
            } else if (parsedMessage.type === 'ROUTE_SWITCHED') {
                // console.log('Route switched to index:', parsedMessage.activeIndex);
            }
        }
    };

    const handleClearRoute = () => {
        webViewRef.current?.injectJavaScript(getClearRouteJsCode());
    };

    // --- RENDERIZAÇÃO ---
    if (!location && !errorMsg) {
        return <MapLoading text="Calibrando GPS e bússola..." />;
    }

    const leafletHTML = generateLeafletHTML(LEAFLET_CSS, LEAFLET_JS_BASE64);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
            
            {location ? (
                <WebView
                    ref={webViewRef}
                    originWhitelist={['*']}
                    source={{ html: leafletHTML }}
                    style={styles.map}
                    onMessage={handleWebViewMessage}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    onLoadEnd={() => setIsMapReady(true)}
                    userAgent={Platform.OS === 'android' 
                        ? "Mozilla/5.0 (Linux; Android 10; Android SDK built for x86) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36"
                        : undefined
                    }
                />
            ) : (
                <MapLoading text="Obtendo localização..." />
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
