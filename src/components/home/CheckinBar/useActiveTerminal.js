import { useRef, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { isPointWithinRadius } from 'geolib';

export const useActiveTerminal = () => {
  const lastTerminalRef = useRef(null);
  const userCoords = useSelector((state) => state.location.coords);
  const terminals = useSelector((state) => state.terminals.items);

  const activeTerminal = useMemo(() => {
    if (!userCoords || !terminals?.length) return null;

    const MARGIN = 50; 
    const userPos = { latitude: userCoords.latitude, longitude: userCoords.longitude };

    // 1. Verifica se entrou em algum terminal (Raio Estrito)
    const terminalInside = terminals.find(t => {
      const isInside = isPointWithinRadius(
        userPos,
        { latitude: t.latitude, longitude: t.longitude },
        t.geofenceRadius
      );
      
      // if (isInside) console.log(`📍 Dentro do raio de: ${t.name}`);
      return isInside;
    });

    if (terminalInside) {
      lastTerminalRef.current = terminalInside;
      return terminalInside;
    }

    // 2. Se já estava em um, verifica a Margem de Saída (Histerese)
    if (lastTerminalRef.current) {
      const stillInsideWithMargin = isPointWithinRadius(
        userPos,
        { latitude: lastTerminalRef.current.latitude, longitude: lastTerminalRef.current.longitude },
        lastTerminalRef.current.geofenceRadius + MARGIN
      );

      if (stillInsideWithMargin) {
        console.log(`🟡 Mantendo ${lastTerminalRef.current.name} pela margem de erro.`);
        return lastTerminalRef.current;
      } else {
        console.log(`🚶 Usuário saiu da margem de ${lastTerminalRef.current.name}.`);
      }
    }

    lastTerminalRef.current = null;
    return null;
  }, [userCoords, terminals]);

  return activeTerminal;
};
