/**
 * displayLocalNotification.js — Exibe notificações locais no system tray.
 *
 * Usa o Notifee para criar notificações que aparecem na bandeja de notificações
 * do sistema operacional, mesmo quando o app está em foreground.
 *
 * Substitui o uso de Alert.alert() para notificações push recebidas em foreground,
 * pois o Firebase não exibe banners automáticos nesse estado.
 */

import notifee, { AndroidImportance } from '@notifee/react-native';

const CHANNEL_ID = 'gatein_default';
let channelCreated = false;

/**
 * Garante que o canal de notificação Android exista (idempotente).
 * No iOS, canais não são necessários — a chamada é ignorada silenciosamente.
 */
async function ensureChannel() {
  if (channelCreated) return;
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'GateIn Notificações',
    importance: AndroidImportance.HIGH,
  });
  channelCreated = true;
}

/**
 * Exibe uma notificação local no system tray do dispositivo.
 *
 * @param {string} title   Título da notificação
 * @param {string} body    Corpo/mensagem da notificação
 * @param {object} [data]  Dados extras para anexar à notificação
 */
export async function displayLocalNotification(title, body, data = {}) {
  try {
    await ensureChannel();

    await notifee.displayNotification({
      title,
      body,
      data,
      android: {
        channelId: CHANNEL_ID,
        smallIcon: 'ic_launcher',
        pressAction: { id: 'default' },
      },
    });

    console.log('[Notifee] Notificação local exibida:', title);
  } catch (err) {
    console.warn('[Notifee] Erro ao exibir notificação local:', err.message);
  }
}
