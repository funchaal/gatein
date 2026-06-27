import { useRef, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { isPointWithinRadius } from 'geolib';
import { selectAllTerminals } from '../../../store/slices/companiesSlice';

export const useActiveTerminal = () => {
  const lastTerminalRef = useRef(null);
  const userCoords = useSelector((state) => state.location.coords);
  const terminalsDict = useSelector(selectAllTerminals);
  const terminals = Object.values(terminalsDict || {});

  const activeTerminal = useMemo(() => {
    if (!userCoords || !terminals?.length) return null;

    const MARGIN = 50; 
    const userPos = { latitude: userCoords.latitude, longitude: userCoords.longitude };

    // 1. Verifica se entrou em algum terminal (Raio Estrito)
    const terminalInside = terminals.find(t => {
      if (!t.use_remote_checkin) return false;

      const lat = t.geofence?.center?.lat ?? t.address?.lat;
      const lng = t.geofence?.center?.lng ?? t.address?.lng;
      const radius = t.geofence?.radius ?? t.geofenceRadius ?? t.geofence_radius ?? 200;

      if (!lat || !lng) return false;

      const isInside = isPointWithinRadius(
        userPos,
        { latitude: lat, longitude: lng },
        radius
      );
      
      // if (isInside) console.log(`📍 Dentro do raio de: ${t.name}`);
      return isInside;
    });

    if (terminalInside) {
      lastTerminalRef.current = terminalInside;
      return terminalInside;
    }

    // 2. Se já estava em um, verifica a Margem de Saída (Histerese)
    if (lastTerminalRef.current && lastTerminalRef.current.use_remote_checkin) {
      const lat = lastTerminalRef.current.geofence?.center?.lat ?? lastTerminalRef.current.address?.lat;
      const lng = lastTerminalRef.current.geofence?.center?.lng ?? lastTerminalRef.current.address?.lng;
      const radius = lastTerminalRef.current.geofence?.radius ?? lastTerminalRef.current.geofenceRadius ?? lastTerminalRef.current.geofence_radius ?? 200;

      if (lat && lng) {
        const stillInsideWithMargin = isPointWithinRadius(
          userPos,
          { latitude: lat, longitude: lng },
          radius + MARGIN
        );

        if (stillInsideWithMargin) {
          // console.log(`🟡 Mantendo ${lastTerminalRef.current.name} pela margem de erro.`);
          return lastTerminalRef.current;
        }
      }
    }

    lastTerminalRef.current = null;
    return null;
  }, [userCoords, terminals]);

  return activeTerminal;
};
