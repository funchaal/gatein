/**
 * notifications.js — Serviço centralizado de notificações push (FCM).
 *
 * Responsabilidades:
 *  - Solicitar permissão de notificação ao usuário
 *  - Obter o FCM token do dispositivo e enviá-lo ao servidor
 *  - Configurar listeners de foreground (app aberto)
 *  - Lidar com tap em notificações (background/quit)
 *  - Exibir countdown local para notificações do tipo COUNTDOWN
 *
 * Uso:
 *   import { setupNotifications, removeDeviceToken } from './notifications';
 *   await setupNotifications(store.dispatch);
 */

import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid } from 'react-native';
import { Platform, Alert } from 'react-native';
import { API_BASE_URL } from '@env';

// ---------------------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------------------

/**
 * Recupera o token JWT e o deviceId do secure storage para autenticar o request.
 * Importa de forma lazy para evitar import circulares com o store.
 */
async function getAuthHeaders() {
  const { secureStorage } = await import('./secureStorage');
  const { getDeviceId } = await import('./deviceInfo');

  const token = await secureStorage.getToken();
  const deviceId = await getDeviceId();

  console.log({ token, deviceId })

  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (deviceId) headers['X-Device-ID'] = deviceId;
  return headers;
}

/**
 * Envia o FCM token para o servidor (upsert).
 * Silencioso — não lança exceção para não bloquear o fluxo de login.
 */
async function registerTokenOnServer(fcmToken) {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/notifications/token`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        fcm_token: fcmToken,
        device_os: Platform.OS, // 'android' | 'ios'
      }),
    });
    if (!response.ok) {
      const body = await response.json();
      console.warn('[FCM] Falha ao registrar token:', body);
    } else {
      console.log('[FCM] Token registrado/atualizado no servidor.');
    }
  } catch (err) {
    console.warn('[FCM] Erro de rede ao registrar token:', err.message);
  }
}

// ---------------------------------------------------------------------------
// Permissão
// ---------------------------------------------------------------------------

/**
 * Solicita permissão de notificações ao sistema operacional.
 * No Android 13+ isso exige permissão explícita (POST_NOTIFICATIONS).
 * No iOS abre o diálogo nativo.
 *
 * @returns {Promise<boolean>} true se o usuário concedeu permissão
 */
export async function requestNotificationPermission() {
  // Trata explicitamente o Android 13+
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('[FCM] Permissão negada pelo usuário no Android.');
        return false;
      }
    } catch (err) {
      console.warn('[FCM] Erro ao pedir permissão no Android:', err);
      return false;
    }
  }

  // Faz a verificação/registro para o iOS e mantém o padrão para Android antigo
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (!enabled) {
    console.log('[FCM] Permissão de notificação negada pelo usuário.');
  }
  return enabled;
}

// ---------------------------------------------------------------------------
// Setup principal
// ---------------------------------------------------------------------------

/**
 * Inicializa o sistema de notificações para o usuário autenticado.
 * Deve ser chamado após uma sessão ser restaurada com sucesso.
 *
 * Fluxo:
 *  1. Solicita permissão
 *  2. Obtém o FCM token atual do dispositivo
 *  3. Registra o token no servidor
 *  4. Ouve refresh automático de token (se o Firebase rolar o token)
 */
export async function setupNotifications() {
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return;

  try {
    const token = await messaging().getToken();
    if (token) {
      await registerTokenOnServer(token);
    }
  } catch (err) {
    console.warn('[FCM] Erro ao obter FCM token:', err.message);
  }

  // Atualiza automaticamente o token se o Firebase emitir um novo
  messaging().onTokenRefresh(async (newToken) => {
    console.log('[FCM] Token atualizado automaticamente.');
    await registerTokenOnServer(newToken);
  });
}

// ---------------------------------------------------------------------------
// Listeners de mensagens
// ---------------------------------------------------------------------------

/**
 * Configura o listener de mensagens em FOREGROUND (app aberto na tela).
 * Retorna uma função de cleanup (para usar em useEffect).
 *
 * O Firebase não exibe banners automáticos em foreground no Android/iOS —
 * é responsabilidade do app tratar a mensagem (ex: exibir um Alert ou toast).
 *
 * @param {function} onMessage - Callback chamado com o remoteMessage recebido
 * @returns {function} Função de unsubscribe
 */
export function onForegroundMessage(onMessage) {
  const unsubscribe = messaging().onMessage(async (remoteMessage) => {
    console.log('[FCM] Mensagem em foreground:', remoteMessage);

    // Salva a notificação no histórico local do celular
    const { saveLocalNotification } = await import('./localNotificationStorage');
    await saveLocalNotification(remoteMessage);

    const { notification, data } = remoteMessage;
    const type = data?.type;

    // Countdown: delega para handler especial
    if (type === 'COUNTDOWN') {
      handleCountdownNotification(data);
      return;
    }

    // Para outros tipos, propaga para o callback do chamador
    if (onMessage) {
      onMessage(remoteMessage);
    }
  });

  return unsubscribe;
}

/**
 * Configura o listener de tap em notificações quando o app estava em BACKGROUND
 * (não estava fechado, apenas em segundo plano).
 *
 * @param {function} onOpen - Callback chamado com o remoteMessage
 * @returns {function} Função de unsubscribe
 */
export function onBackgroundNotificationOpen(onOpen) {
  const unsubscribe = messaging().onNotificationOpenedApp((remoteMessage) => {
    console.log('[FCM] App aberto via notificação background:', remoteMessage);
    if (onOpen) onOpen(remoteMessage);
  });
  return unsubscribe;
}

/**
 * Verifica se o app foi iniciado clicando em uma notificação (estado QUIT).
 * Deve ser chamado uma vez na inicialização do app.
 *
 * @returns {Promise<object|null>} remoteMessage ou null
 */
export async function getInitialNotification() {
  const remoteMessage = await messaging().getInitialNotification();
  if (remoteMessage) {
    console.log('[FCM] App aberto via notificação quit:', remoteMessage);
  }
  return remoteMessage;
}

// ---------------------------------------------------------------------------
// Countdown (tipo COUNTDOWN)
// ---------------------------------------------------------------------------

/**
 * Exibe um Alert com as informações do agendamento que está chegando.
 * Para um countdown visual completo, integre com uma biblioteca como
 * react-native-push-notification ou lógica de timer local no componente.
 *
 * @param {object} data - Payload da notificação (data.target_timestamp, etc.)
 */
export function handleCountdownNotification(data) {
  const { target_timestamp, count } = data || {};

  if (!target_timestamp) return;

  const target = new Date(target_timestamp);
  const now = new Date();
  const diffMs = target - now;

  if (diffMs <= 0) return;

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  const label = count && parseInt(count, 10) > 1
    ? `${count} agendamentos`
    : 'seu agendamento';

  Alert.alert(
    '⏱ Em breve!',
    `Faltam ${hours}h ${minutes}min para ${label}. Prepare-se!`,
    [{ text: 'OK' }],
  );
}

// ---------------------------------------------------------------------------
// Remoção do token (logout)
// ---------------------------------------------------------------------------

/**
 * Remove o token FCM do servidor ao fazer logout.
 * Garante que o dispositivo pare de receber notificações após a saída.
 */
export async function removeDeviceToken() {
  try {
    const token = await messaging().getToken();
    if (!token) return;

    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/notifications/token`, {
      method: 'DELETE',
      headers,
      body: JSON.stringify({ fcm_token: token }),
    });

    if (!response.ok) {
      console.warn('[FCM] Falha ao remover token no logout.');
    } else {
      console.log('[FCM] Token removido do servidor com sucesso.');
    }
  } catch (err) {
    console.warn('[FCM] Erro ao remover token:', err.message);
  }
}
