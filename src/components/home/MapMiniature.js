import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator, Text, Platform, PermissionsAndroid } from 'react-native';
import { WebView } from 'react-native-webview';
import Geolocation from '@react-native-community/geolocation';

// Importa o motor Offline (igual ao MapScreen)
import { LEAFLET_CSS, LEAFLET_JS_BASE64 } from '../../constants/LeafletCore';

export default function MapMiniature() {
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);

    useEffect(() => {
        let isMounted = true;
        
        const requestLocationPermission = async () => {
            if (Platform.OS === 'android') {
                try {
                    const granted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                        {
                            title: 'Permissão de Localização',
                            message: 'Este app precisa acessar sua localização',
                            buttonNeutral: 'Perguntar depois',
                            buttonNegative: 'Cancelar',
                            buttonPositive: 'OK',
                        }
                    );
                    return granted === PermissionsAndroid.RESULTS.GRANTED;
                } catch (err) {
                    console.warn(err);
                    return false;
                }
            }
            return true; // iOS pede permissão automaticamente
        };

        const startWatching = async () => {
            try {
                const hasPermission = await requestLocationPermission();
                
                if (!hasPermission) {
                    if (isMounted) setErrorMsg('Permissão negada.');
                    return;
                }

                Geolocation.getCurrentPosition(
                    (position) => {
                        if (isMounted) {
                            setLocation({
                                coords: {
                                    latitude: position.coords.latitude,
                                    longitude: position.coords.longitude,
                                }
                            });
                        }
                    },
                    (error) => {
                        console.log(error);
                        if (isMounted) setErrorMsg('Erro na localização');
                    },
                    { 
                        enableHighAccuracy: false, // Balanced accuracy
                        timeout: 15000,
                        maximumAge: 10000 
                    }
                );
            } catch (error) {
                if (isMounted) setErrorMsg('Erro na localização');
            }
        };
        
        startWatching();
        return () => { isMounted = false; };
    }, []);

    if (!location && !errorMsg) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="small" color="#1e1450" />
            </View>
        );
    }

    if (errorMsg) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>Mapa indisponível</Text>
            </View>
        );
    }

    // --- HTML OTIMIZADO (OFFLINE) ---
    const mapHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0">
        
        <style>
            ${LEAFLET_CSS}
        </style>

        <style>
          body { margin: 0; padding: 0; background: #f5f5f5; }
          #map { height: 100vh; width: 100vw; }
          /* Esconde controles para ficar 'clean' */
          .leaflet-control-zoom { display: none; }
          .leaflet-control-attribution { font-size: 8px; opacity: 0.6; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        
        <script src="data:text/javascript;base64,${LEAFLET_JS_BASE64}"></script>

        <script>
          // Inicia o mapa
          var map = L.map('map', {
            zoomControl: false,
            attributionControl: false, // Sem rodapé na miniatura para limpar visual
            dragging: false, // IMPORTANTE: Trava o mapa
            scrollWheelZoom: false,
            doubleClickZoom: false,
            boxZoom: false,
            tap: false,
            keyboard: false
          }).setView([${location.coords.latitude}, ${location.coords.longitude}], 15);

          // Camada do Mapa (CartoDB Light)
          L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            subdomains: 'abcd',
            maxZoom: 20
          }).addTo(map);

          // Ícone Personalizado (Bolinha Azul com pulso estático)
          var pulsingIcon = L.divIcon({
            className: 'css-icon',
            html: '<div style="background-color: #2196F3; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.3);"></div>',
            iconSize: [18, 18],
            iconAnchor: [9, 9]
          });

          L.marker([${location.coords.latitude}, ${location.coords.longitude}], {icon: pulsingIcon}).addTo(map);
          
          // Garante renderização correta
          setTimeout(function(){ map.invalidateSize(); }, 200);
        </script>
      </body>
      </html>
    `;

    return (
        <View style={styles.container}>
            <WebView
                originWhitelist={['*']}
                source={{ html: mapHTML }}
                style={styles.webview}
                scrollEnabled={false}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                // Desativa interação para parecer uma imagem e passar o scroll da lista
                pointerEvents="none" 
                
                // --- O SEGREDO DO ANDROID ---
                userAgent={Platform.OS === 'android' 
                    ? "Mozilla/5.0 (Linux; Android 10; Android SDK built for x86) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36"
                    : undefined
                }
            />
            {/* Overlay transparente de segurança */}
            <View style={styles.touchOverlay} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
    },
    webview: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
    },
    errorText: {
        fontSize: 12,
        color: '#666',
    },
    touchOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'transparent',
    }
});