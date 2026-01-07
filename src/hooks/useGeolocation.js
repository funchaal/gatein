import { useState, useEffect } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export const useGeolocation = () => {
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);

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
                        }
                    },
                    (error) => {
                        console.log(error);
                        if (isMounted) setErrorMsg('Erro na localização');
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