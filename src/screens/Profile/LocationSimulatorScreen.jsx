import React, { useState, useRef, useMemo, useEffect } from 'react';
import { StyleSheet, View, Text, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { useDispatch, useSelector } from 'react-redux';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import ScreenHeader from '../../components/ui/ScreenHeader';
import Input from '../../components/ui/Input';
import { COLORS } from '../../constants/colors';
import { generateLeafletHTML } from '../../services/leafletTemplate';
import { LEAFLET_CSS, LEAFLET_JS_BASE64 } from '../../constants/LeafletCore';
import { setSimulating, updateSimulatedLocation } from '../../store/slices/locationSlice';
import { getCenterMapJsCode, parseWebViewMessage } from '../Map/helpers';

export default function LocationSimulatorScreen({ navigation }) {
    const dispatch = useDispatch();
    const user = useSelector(state => state.auth.user) || {};
    const companyLocation = user.company_location;
    const { isSimulating, simulatedCoords, coords: currentCoords, realCoords } = useSelector(state => state.location);
    
    // Position priority: simulated if simulating, else realCoords, else currentCoords, else company or default
    const activeCoords = isSimulating ? (simulatedCoords || currentCoords) : (realCoords || (!currentCoords?.isSimulated ? currentCoords : null));
    const initialLat = activeCoords?.latitude || companyLocation?.lat || -23.9241566;
    const initialLng = activeCoords?.longitude || companyLocation?.lng || -46.3493093;

    const [lat, setLat] = useState(initialLat.toString());
    const [lng, setLng] = useState(initialLng.toString());
    const [simulating, setSimulatingLocal] = useState(isSimulating);
    const [isMapReady, setIsMapReady] = useState(false);
    
    const webViewRef = useRef(null);
    const leafletHTML = useMemo(() => generateLeafletHTML(LEAFLET_CSS, LEAFLET_JS_BASE64), []);

    const toggleSwitch = (val) => {
        setSimulatingLocal(val);
        dispatch(setSimulating(val));

        if (val) {
            // Turning simulation ON
            const parsedLat = parseFloat(lat);
            const parsedLng = parseFloat(lng);
            if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
                dispatch(updateSimulatedLocation({
                    latitude: parsedLat,
                    longitude: parsedLng,
                    accuracy: 5
                }));
                if (isMapReady && webViewRef.current) {
                    webViewRef.current.injectJavaScript(getCenterMapJsCode(parsedLat, parsedLng));
                    webViewRef.current.injectJavaScript(`
                        if (window.updateMapState) {
                            window.updateMapState(${parsedLat}, ${parsedLng}, 0, false, 5);
                        }
                    `);
                }
            }
        } else {
            // Turning simulation OFF -> revert immediately to real position
            const targetRealCoords = realCoords || (!currentCoords?.isSimulated ? currentCoords : null);
            const targetLat = targetRealCoords?.latitude || companyLocation?.lat || -23.9241566;
            const targetLng = targetRealCoords?.longitude || companyLocation?.lng || -46.3493093;

            setLat(targetLat.toString());
            setLng(targetLng.toString());

            if (isMapReady && webViewRef.current) {
                webViewRef.current.injectJavaScript(getCenterMapJsCode(targetLat, targetLng));
                webViewRef.current.injectJavaScript(`
                    if (window.updateMapState) {
                        window.updateMapState(${targetLat}, ${targetLng}, 0, false, 5);
                    }
                `);
            }
        }
    };

    const handleLatChange = (newLatStr) => {
        setLat(newLatStr);
        if (simulating) {
            const parsedLat = parseFloat(newLatStr);
            const parsedLng = parseFloat(lng);
            if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
                dispatch(updateSimulatedLocation({
                    latitude: parsedLat,
                    longitude: parsedLng,
                    accuracy: 5
                }));
                if (isMapReady && webViewRef.current) {
                    webViewRef.current.injectJavaScript(getCenterMapJsCode(parsedLat, parsedLng));
                    webViewRef.current.injectJavaScript(`
                        if (window.updateMapState) {
                            window.updateMapState(${parsedLat}, ${parsedLng}, 0, false, 5);
                        }
                    `);
                }
            }
        }
    };

    const handleLngChange = (newLngStr) => {
        setLng(newLngStr);
        if (simulating) {
            const parsedLat = parseFloat(lat);
            const parsedLng = parseFloat(newLngStr);
            if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
                dispatch(updateSimulatedLocation({
                    latitude: parsedLat,
                    longitude: parsedLng,
                    accuracy: 5
                }));
                if (isMapReady && webViewRef.current) {
                    webViewRef.current.injectJavaScript(getCenterMapJsCode(parsedLat, parsedLng));
                    webViewRef.current.injectJavaScript(`
                        if (window.updateMapState) {
                            window.updateMapState(${parsedLat}, ${parsedLng}, 0, false, 5);
                        }
                    `);
                }
            }
        }
    };

    useEffect(() => {
        if (isMapReady && webViewRef.current) {
            // override the map click
            webViewRef.current.injectJavaScript(`
                if (!window.simClickRegistered && window.map) {
                    window.map.off('click'); // remove old click handler
                    window.map.on('click', function(e) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MAP_CLICKED', lat: e.latlng.lat, lng: e.latlng.lng }));
                    });
                    window.simClickRegistered = true;
                }
            `);

            // Draw company geofence
            if (companyLocation) {
                const terminalList = [{
                    id: 1, // dummy id
                    name: 'Terminal Teste',
                    addressLat: companyLocation.lat,
                    addressLng: companyLocation.lng,
                    geofenceLat: companyLocation.geofence?.center?.lat || companyLocation.lat,
                    geofenceLng: companyLocation.geofence?.center?.lng || companyLocation.lng,
                    geofenceRadius: companyLocation.geofence?.radius || 100,
                }];
                webViewRef.current.injectJavaScript(`
                    if (window.updateCompanyMarkers) {
                        window.updateCompanyMarkers(${JSON.stringify(terminalList)});
                    }
                `);
            }

            // Draw current position
            const parsedLat = parseFloat(lat);
            const parsedLng = parseFloat(lng);
            if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
                webViewRef.current.injectJavaScript(getCenterMapJsCode(parsedLat, parsedLng));
                webViewRef.current.injectJavaScript(`
                    if (window.updateMapState) {
                        window.updateMapState(${parsedLat}, ${parsedLng}, 0, false, 5);
                    }
                `);
            }
        }
    }, [isMapReady, companyLocation]);

    const handleMessage = (event) => {
        const data = event.nativeEvent.data;
        const parsedMessage = parseWebViewMessage(data);
        if (parsedMessage?.type === 'MAP_INITIALIZED') {
            setIsMapReady(true);
        }
        
        if (parsedMessage?.type === 'MAP_CLICKED') {
            // Se a simulação estiver desativada, ignora qualquer clique no mapa
            if (!simulating) return;

            const clickedLat = parsedMessage.lat;
            const clickedLng = parsedMessage.lng;
            setLat(clickedLat.toFixed(7).toString());
            setLng(clickedLng.toFixed(7).toString());

            dispatch(updateSimulatedLocation({
                latitude: clickedLat,
                longitude: clickedLng,
                accuracy: 5
            }));
            if (webViewRef.current) {
                webViewRef.current.injectJavaScript(getCenterMapJsCode(clickedLat, clickedLng));
                webViewRef.current.injectJavaScript(`
                    if (window.updateMapState) {
                        window.updateMapState(${clickedLat}, ${clickedLng}, 0, false, 5);
                    }
                `);
            }
        }
    };

    return (
        <ScreenWrapper noPadding={true}>
            <ScreenHeader title="Simulador de Localização" />
            <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <View style={styles.form}>
                    <View style={styles.switchRow}>
                        <View style={{ flex: 1, paddingRight: 12 }}>
                            <Text style={styles.switchTitle}>Ativar Simulação</Text>
                            <Text style={styles.switchSubtitle}>Sobrescreve o GPS do aparelho</Text>
                        </View>
                        <Switch
                            value={simulating}
                            onValueChange={toggleSwitch}
                            trackColor={{ false: '#CBD5E1', true: '#FDBA74' }}
                            thumbColor={simulating ? COLORS.primary : '#FFFFFF'}
                            ios_backgroundColor="#CBD5E1"
                        />
                    </View>

                    {simulating && (
                        <View style={styles.hintBanner}>
                            <Text style={styles.hintText}>Clique no mapa para atualizar a sua localização</Text>
                        </View>
                    )}
                    
                    <View style={styles.row}>
                        <Input
                            label="Latitude"
                            value={lat}
                            onChangeText={handleLatChange}
                            keyboardType="numeric"
                            placeholder="-23.924"
                            containerStyle={styles.flexInput}
                            editable={simulating}
                        />
                        <Input
                            label="Longitude"
                            value={lng}
                            onChangeText={handleLngChange}
                            keyboardType="numeric"
                            placeholder="-46.349"
                            containerStyle={styles.flexInput}
                            editable={simulating}
                        />
                    </View>
                </View>

                <View style={styles.mapContainer}>
                    <WebView
                        ref={webViewRef}
                        originWhitelist={['*']}
                        source={{ html: leafletHTML }}
                        onMessage={handleMessage}
                        style={styles.map}
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    form: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    switchTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0F172A',
    },
    switchSubtitle: {
        fontSize: 13,
        color: '#64748B',
        marginTop: 2,
    },
    hintBanner: {
        backgroundColor: 'rgba(249, 115, 22, 0.08)',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 16,
        borderLeftWidth: 3,
        borderLeftColor: COLORS.primary,
    },
    hintText: {
        fontSize: 13,
        color: COLORS.primary,
        fontWeight: '500',
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    flexInput: {
        flex: 1,
    },
    mapContainer: {
        flex: 1,
    },
    map: {
        flex: 1,
    }
});
