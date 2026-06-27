// components/LocationWatcher.js
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useGeolocation } from '../hooks/useGeolocation';
import { updateLocation, setLocationError } from '../store/slices/locationSlice';

const LocationWatcher = () => {
    const dispatch = useDispatch();
    const { location, errorMsg } = useGeolocation();
    const DEBUG_MODE = true;

    useEffect(() => {
        // Evita conflito com o GPS real se o mock estiver ativo
        if (location && !DEBUG_MODE) {
            dispatch(updateLocation(location.coords));
        }
    }, [location, dispatch]);
    
    useEffect(() => {
        if (errorMsg) {
            dispatch(setLocationError(errorMsg));
        }
    }, [errorMsg, dispatch]);

    // 2. Monitoramento Mock (Simulado com deslocamento)
    useEffect(() => {
        if (DEBUG_MODE) {
            // console.log("🛠️ Mock GPS Ativado: Iniciando deslocamento lento...");
            
            // Posição inicial
            let currentLat = -23.924156643454374;
            let currentLng = -46.34930933223951;
            
            const interval = setInterval(() => {
                // Incremento de ~5 metros por ciclo (ajuste conforme necessário)
                currentLat -= 0.00005; 
                currentLng -= 0.00005;

                const mockCoords = { 
                    latitude: currentLat, 
                    longitude: currentLng, 
                    accuracy: 5, 
                };

                dispatch(updateLocation(mockCoords));
                
                // Print detalhado no console
                // console.log(`📍 Mock movido para -> Lat: ${currentLat.toFixed(7)} | Lng: ${currentLng.toFixed(7)}`);
            }, 3000);

            return () => {
                // console.log("🛑 Mock GPS Desativado.");
                clearInterval(interval);
            };
        }
    }, [dispatch]);

    return null; // Componente invisível
};

export default LocationWatcher;
