import React, { useState, useRef, useMemo, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, Switch, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { WebView } from 'react-native-webview';
import { useDispatch, useSelector } from 'react-redux';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import ScreenHeader from '../../components/ui/ScreenHeader';
import MainAsyncButton from '../../components/ui/MainAsyncButton';
import { COLORS } from '../../constants/colors';
import { generateLeafletHTML } from '../../services/leafletTemplate';
import { LEAFLET_CSS, LEAFLET_JS_BASE64 } from '../../constants/LeafletCore';
import { setSimulating, updateSimulatedLocation } from '../../store/slices/locationSlice';
import { getCenterMapJsCode, parseWebViewMessage } from '../Map/helpers';

export default function LocationSimulatorScreen({ navigation }) {
    const dispatch = useDispatch();
    const user = useSelector(state => state.auth.user) || {};
    const companyLocation = user.company_location;
    const { isSimulating, simulatedCoords, coords: currentCoords } = useSelector(state => state.location);
    
    // Initial lat/lng based on simulated, current, or company location, or a default
    const initialLat = simulatedCoords?.latitude || currentCoords?.latitude || companyLocation?.lat || -23.9241566;
    const initialLng = simulatedCoords?.longitude || currentCoords?.longitude || companyLocation?.lng || -46.3493093;

    const [lat, setLat] = useState(initialLat.toString());
    const [lng, setLng] = useState(initialLng.toString());
    const [simulating, setSimulatingLocal] = useState(isSimulating);
    const [isMapReady, setIsMapReady] = useState(false);
    
    const webViewRef = useRef(null);
    const leafletHTML = useMemo(() => generateLeafletHTML(LEAFLET_CSS, LEAFLET_JS_BASE64), []);

    const toggleSwitch = (val) => {
        setSimulatingLocal(val);
        dispatch(setSimulating(val));
    };

    const handleUpdate = () => {
        const parsedLat = parseFloat(lat);
        const parsedLng = parseFloat(lng);
        if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
            dispatch(updateSimulatedLocation({
                latitude: parsedLat,
                longitude: parsedLng,
                accuracy: 5
            }));
            Keyboard.dismiss();
            
            // Centraliza o mapa
            if (isMapReady && webViewRef.current) {
                webViewRef.current.injectJavaScript(getCenterMapJsCode(parsedLat, parsedLng));
                webViewRef.current.injectJavaScript(`
                    if (window.updateMapState) {
                        window.updateMapState(${parsedLat}, ${parsedLng}, 0, false, 5);
                    }
                `);
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
            setLat(parsedMessage.lat.toFixed(7).toString());
            setLng(parsedMessage.lng.toFixed(7).toString());
        }
    };

    return (
        <ScreenWrapper noPadding={true}>
            <ScreenHeader title="Simulador de Localização" />
            <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <View style={styles.form}>
                    <View style={styles.switchRow}>
                        <View>
                            <Text style={styles.switchTitle}>Ativar Simulação</Text>
                            <Text style={styles.switchSubtitle}>Sobrescreve o GPS do aparelho</Text>
                        </View>
                        <Switch
                            value={simulating}
                            onValueChange={toggleSwitch}
                            trackColor={{ false: '#CBD5E1', true: COLORS.primary }}
                        />
                    </View>
                    
                    <View style={styles.row}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Latitude</Text>
                            <TextInput
                                style={styles.input}
                                value={lat}
                                onChangeText={setLat}
                                keyboardType="numeric"
                                placeholder="-23.924"
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Longitude</Text>
                            <TextInput
                                style={styles.input}
                                value={lng}
                                onChangeText={setLng}
                                keyboardType="numeric"
                                placeholder="-46.349"
                            />
                        </View>
                    </View>
                    
                    <MainAsyncButton 
                        title="Atualizar Localização" 
                        onPress={handleUpdate} 
                        style={styles.button}
                        disabled={!simulating}
                    />
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
        marginBottom: 20,
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
    row: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    inputGroup: {
        flex: 1,
    },
    label: {
        fontSize: 13,
        fontWeight: '500',
        color: '#475569',
        marginBottom: 6,
    },
    input: {
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: '#0F172A',
        fontSize: 15,
    },
    button: {
        marginTop: 4,
    },
    mapContainer: {
        flex: 1,
    },
    map: {
        flex: 1,
    }
});
