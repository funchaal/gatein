import { useState, useEffect } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export const useGeolocation = () => {
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);

    const requestLocationPermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const hasPermission = await PermissionsAndroid.check(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                );
                if (hasPermission) return true;

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
        return true;
    };

    useEffect(() => {
        let watchId;
        let isMounted = true;

        const startWatching = async () => {
            try {
                const hasPermission = await requestLocationPermission();
                
                if (!hasPermission) {
                    if (isMounted) setErrorMsg('Permissão negada.');
                    return;
                }

                // 1. Tenta obter a posição atual imediatamente (Alta Precisão)
                Geolocation.getCurrentPosition(
                    (position) => {
                        if (isMounted) {
                            setLocation({
                                coords: {
                                    latitude: position.coords.latitude,
                                    longitude: position.coords.longitude,
                                    accuracy: position.coords.accuracy,
                                }
                            });
                            setErrorMsg(null);
                        }
                    },
                    (error) => {
                        console.log('Erro no GPS de alta precisão, tentando baixa precisão...', error);
                        // 2. Fallback para baixa precisão (Rede/Torres) se GPS de alta precisão falhar ou demorar
                        Geolocation.getCurrentPosition(
                            (position) => {
                                if (isMounted) {
                                    setLocation({
                                        coords: {
                                            latitude: position.coords.latitude,
                                            longitude: position.coords.longitude,
                                            accuracy: position.coords.accuracy,
                                        }
                                    });
                                    setErrorMsg(null);
                                }
                            },
                            (err) => {
                                console.log('Erro no fallback de localização:', err);
                                if (isMounted && !location) setErrorMsg('Erro ao obter localização. Verifique se o GPS está ativado.');
                            },
                            { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
                        );
                    },
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
                );

                // 3. Monitoramento contínuo da posição
                watchId = Geolocation.watchPosition(
                    (position) => {
                        if (isMounted) {
                            setLocation({
                                coords: {
                                    latitude: position.coords.latitude,
                                    longitude: position.coords.longitude,
                                    accuracy: position.coords.accuracy,
                                }
                            });
                            setErrorMsg(null);
                        }
                    },
                    (error) => {
                        console.log('Erro no watchPosition:', error);
                    },
                    { 
                        enableHighAccuracy: true,
                        timeout: 20000,
                        maximumAge: 1000,
                        distanceFilter: 1
                    }
                );
            } catch (error) {
                if (isMounted) setErrorMsg('Erro no GPS.');
            }
        };

        startWatching();

        return () => {
            isMounted = false;
            if (watchId !== undefined) {
                Geolocation.clearWatch(watchId);
            }
        };
    }, []);

    return { location, errorMsg };
};

