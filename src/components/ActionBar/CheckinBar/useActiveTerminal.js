import { useRef, useMemo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { isPointWithinRadius } from 'geolib';
import { selectAllTerminals } from '../../../store/slices/companiesSlice';
import { selectAllActivity } from '../../../store/slices/activitySlice';

export const useActiveTerminal = () => {
  const lastTerminalRef = useRef(null);
  const userCoords = useSelector((state) => state.location.coords);
  const terminalsDict = useSelector(selectAllTerminals);
  const terminals = Object.values(terminalsDict || {});
  const allActivity = useSelector(selectAllActivity);

  // Timer para reavaliar a janela de horário periodicamente
  const [nowTick, setNowTick] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNowTick(Date.now());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const activeTerminal = useMemo(() => {
    if (!userCoords || !terminals || !Array.isArray(terminals) || terminals.length === 0) return null;

    const MARGIN = 50; 
    const userPos = { latitude: userCoords.latitude, longitude: userCoords.longitude };

    const parseTime = (dateStr) => {
      if (!dateStr) return NaN;
      if (typeof dateStr === 'string' && dateStr.includes(' ') && !dateStr.includes('T')) {
        return new Date(dateStr.replace(' ', 'T')).getTime();
      }
      return new Date(dateStr).getTime();
    };

    // Helper: verifica se existe agendamento ativo e na janela de horário para o terminal
    const hasValidAppointmentInWindow = (terminalId) => {
      if (!terminalId || !allActivity || !Array.isArray(allActivity) || allActivity.length === 0) return false;
      const now = Date.now();

      return allActivity.some(item => {
        if (!item) return false;

        // Garante que o agendamento pertence a este terminal
        const itemTerminalId = item.terminal_id || item.terminalId;
        if (itemTerminalId !== terminalId) return false;

        // Ignora agendamentos já checados, deletados, cancelados ou concluídos
        const status = (item.status || '').toUpperCase();
        if (['CHECKED-IN', 'CHECKED_IN', 'DELETED', 'CANCELLED', 'CANCELED', 'COMPLETED', 'FINALIZADO'].includes(status)) {
          return false;
        }

        const startTimeRaw = item.schedule?.start_time || item.window_start || item.start_time;
        if (!startTimeRaw) return false;

        const endTimeRaw = item.schedule?.end_time || item.window_end || item.end_time || startTimeRaw;
        const startTol = Number(item.schedule?.start_tolerance ?? item.start_tolerance ?? 0);
        const endTol = Number(item.schedule?.end_tolerance ?? item.end_tolerance ?? 0);

        const startMs = parseTime(startTimeRaw);
        const endMs = parseTime(endTimeRaw);

        if (isNaN(startMs) || isNaN(endMs)) return false;

        const windowOpen = startMs - (startTol * 60_000);
        const windowClose = endMs + (endTol * 60_000);

        const inWindow = now >= windowOpen && now <= windowClose;
        if (!inWindow) return false;

        // Se o terminal bloqueia check-in por integração pendente
        const terminalConfig = terminalsDict[terminalId]?.config || {};
        if (terminalConfig.safety_integration_blocks_checkin && item.is_safety_integration_pending) {
          return false;
        }

        return true;
      });
    };

    // 1. Verifica se entrou em algum terminal (Raio Estrito + Tem Agendamento Válido na Janela)
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

      if (!isInside) return false;

      return hasValidAppointmentInWindow(t.id);
    });

    if (terminalInside) {
      lastTerminalRef.current = terminalInside;
      return terminalInside;
    }

    // 2. Se já estava em um, verifica a Margem de Saída (Histerese) e o Agendamento
    if (lastTerminalRef.current && lastTerminalRef.current.use_remote_checkin) {
      const t = lastTerminalRef.current;
      const lat = t.geofence?.center?.lat ?? t.address?.lat;
      const lng = t.geofence?.center?.lng ?? t.address?.lng;
      const radius = t.geofence?.radius ?? t.geofenceRadius ?? t.geofence_radius ?? 200;

      if (lat && lng) {
        const stillInsideWithMargin = isPointWithinRadius(
          userPos,
          { latitude: lat, longitude: lng },
          radius + MARGIN
        );

        if (stillInsideWithMargin && hasValidAppointmentInWindow(t.id)) {
          return lastTerminalRef.current;
        }
      }
    }

    lastTerminalRef.current = null;
    return null;
  }, [userCoords, terminals, allActivity, nowTick]);

  return activeTerminal;
};
