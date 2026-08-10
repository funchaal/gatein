// components/LocationWatcher.js
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useGeolocation } from '../hooks/useGeolocation';
import { updateLocation, setLocationError } from '../store/slices/locationSlice';

const LocationWatcher = () => {
    const dispatch = useDispatch();
    const { location, errorMsg } = useGeolocation();
    useEffect(() => {
        if (location) {
            dispatch(updateLocation(location.coords));
        }
    }, [location, dispatch]);
    
    useEffect(() => {
        if (errorMsg) {
            dispatch(setLocationError(errorMsg));
        }
    }, [errorMsg, dispatch]);

    return null; // Componente invisível
};

export default LocationWatcher;
