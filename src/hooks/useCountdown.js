/**
 * useCountdown.js — Hook para calcular tempo restante até uma data-alvo.
 *
 * Atualiza a cada segundo enquanto o componente está montado.
 * Eficiente: usa um único setInterval e para automaticamente quando
 * o tempo chega a zero.
 *
 * ---
 * Uso básico:
 *   const { hours, minutes, seconds, totalSeconds, label, phase } =
 *     useCountdown(appointment.window_start);
 *
 * Uso com janela de tolerância (para a janela de check-in):
 *   const { phase } = useCountdown(
 *     appointment.window_start,
 *     appointment.window_end,
 *     { startToleranceMinutes: appointment.start_tolerance,
 *       endToleranceMinutes: appointment.end_tolerance }
 *   );
 * ---
 *
 * Fases retornadas (string `phase`):
 *   'far'         → mais de 24h → não mostra countdown, só a data
 *   'today'       → entre 24h e 1h → mostra "hoje às HH:MM"
 *   'soon'        → entre 1h e o início da janela → mostra countdown em horas/minutos
 *   'window'      → dentro da janela de check-in → mostra "até HH:MM para entrar"
 *   'ended'       → passou do fim da janela → mostra "encerrado"
 */

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * @param {string | Date | null} startTimeISO  Data/hora de início do agendamento
 * @param {string | Date | null} [endTimeISO]  Data/hora de fim do agendamento (opcional)
 * @param {object} [opts]
 * @param {number} [opts.startToleranceMinutes=0]  Tolerância de abertura antes do início
 * @param {number} [opts.endToleranceMinutes=0]    Tolerância após o fim
 * @param {number} [opts.tickMs=1000]              Intervalo do timer em ms (padrão: 1s)
 */
export function useCountdown(startTimeISO, endTimeISO = null, opts = {}) {
  const {
    startToleranceMinutes = 0,
    endToleranceMinutes = 0,
    tickMs = 1000,
  } = opts;

  const computeState = useCallback(() => {
    if (!startTimeISO) {
      return _emptyState();
    }

    const now = Date.now();
    const start = new Date(startTimeISO).getTime();
    const end = endTimeISO ? new Date(endTimeISO).getTime() : start;

    // Janela real considerando tolerâncias
    const windowOpen = start - startToleranceMinutes * 60_000;
    const windowClose = end + endToleranceMinutes * 60_000;

    const msUntilStart = start - now;
    const msUntilWindowOpen = windowOpen - now;
    const msUntilWindowClose = windowClose - now;

    // ── FASE: encerrado ──────────────────────────────────────────────────────
    if (now > windowClose) {
      return {
        ..._emptyState(),
        phase: 'ended',
        label: 'Encerrado',
        windowCloseTime: _formatTime(windowClose),
      };
    }

    // ── FASE: dentro da janela de check-in ───────────────────────────────────
    if (now >= windowOpen && now <= windowClose) {
      const { hours, minutes, seconds, totalSeconds } = _breakdown(msUntilWindowClose);
      return {
        hours, minutes, seconds, totalSeconds,
        phase: 'window',
        label: `Até ${_formatTime(windowClose)} para entrar`,
        windowCloseTime: _formatTime(windowClose),
        startTime: _formatTime(start),
      };
    }

    // ── FASE: mais de 1h antes do início da janela ──────────────────────────
    if (msUntilWindowOpen > 60 * 60_000) {
      return {
        ..._emptyState(),
        phase: 'upcoming',
        label: _formatDateTime(start),
        startTime: _formatTime(start),
      };
    }

    // ── FASE: em breve (menos de 1h até a janela abrir) ──────────────────────
    const { hours, minutes, seconds, totalSeconds } = _breakdown(msUntilWindowOpen > 0 ? msUntilWindowOpen : msUntilStart);
    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    parts.push(`${String(minutes).padStart(2, '0')}min`);
    if (hours === 0) parts.push(`${String(seconds).padStart(2, '0')}s`);

    return {
      hours, minutes, seconds, totalSeconds,
      phase: 'soon',
      label: `Em ${parts.join(' ')}`,
      startTime: _formatTime(start),
    };
  }, [startTimeISO, endTimeISO, startToleranceMinutes, endToleranceMinutes]);

  const [state, setState] = useState(() => computeState());
  const intervalRef = useRef(null);

  useEffect(() => {
    // Atualiza imediatamente
    setState(computeState());

    // Para quando não há data ou quando já encerrou
    const initialState = computeState();
    if (!startTimeISO || initialState.phase === 'ended') {
      return; // Sem timer para fases estáticas
    }

    intervalRef.current = setInterval(() => {
      const next = computeState();
      setState(next);

      // Para o timer quando o contador chega a zero ou encerra
      if (next.phase === 'ended' || next.totalSeconds <= 0) {
        clearInterval(intervalRef.current);
      }
    }, tickMs);

    return () => clearInterval(intervalRef.current);
  }, [computeState, startTimeISO, tickMs]);

  return state;
}

// ---------------------------------------------------------------------------
// Helpers privados
// ---------------------------------------------------------------------------

function _emptyState() {
  return {
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0,
    phase: 'far',
    label: '',
    startTime: null,
    windowCloseTime: null,
  };
}

function _breakdown(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { hours, minutes, seconds, totalSeconds };
}

function _formatTime(ts) {
  return new Date(ts).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function _formatDateTime(ts) {
  const d = new Date(ts);
  const now = new Date();

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const targetDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const isToday = targetDate.getTime() === today.getTime();
  const isTomorrow = targetDate.getTime() === tomorrow.getTime();

  if (isToday) {
    return 'Hoje';
  }
  if (isTomorrow) {
    return 'Amanhã';
  }

  const rawWeekday = d.toLocaleDateString('pt-BR', { weekday: 'long' });
  const cleanWeekday = rawWeekday.replace('-feira', '');
  return cleanWeekday.charAt(0).toUpperCase() + cleanWeekday.slice(1);
}
