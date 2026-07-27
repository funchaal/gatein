/**
 * localNotificationStorage.js — Serviço de histórico local de notificações (AsyncStorage).
 *
 * Armazena e gerencia as notificações recebidas via FCM diretamente no celular.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@gatein_notification_history';
const MAX_LOCAL_NOTIFICATIONS = 100;

// Listeners inscritos para receber atualizações em tempo real no app (UI)
const listeners = new Set();

/**
 * Notifica todos os componentes inscritos sobre alterações na lista de notificações.
 * @param {Array} notifications 
 */
function notifyListeners(notifications) {
  listeners.forEach((listener) => {
    try {
      listener(notifications);
    } catch (e) {
      console.warn('[LocalNotificationStorage] Erro ao notificar listener:', e);
    }
  });
}

/**
 * Inscreve um callback para ser executado sempre que o histórico local for alterado.
 * @param {function} listener 
 * @returns {function} Unsubscribe
 */
export function subscribeLocalNotifications(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Obtém todas as notificações salvas localmente no dispositivo.
 * @returns {Promise<Array>} Lista de notificações ordenadas por data (mais recente primeiro)
 */
export async function getLocalNotifications() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } catch (err) {
    console.warn('[LocalNotificationStorage] Erro ao carregar notificações:', err);
    return [];
  }
}

/**
 * Salva uma nova notificação vinda do FCM no AsyncStorage.
 * Evita duplicados e mantém até MAX_LOCAL_NOTIFICATIONS itens.
 *
 * @param {object} remoteMessage Payload retornado pelo FCM
 * @returns {Promise<Array>} Lista atualizada de notificações
 */
export async function saveLocalNotification(remoteMessage) {
  if (!remoteMessage) return [];

  const { notification, data, messageId, sentTime } = remoteMessage;

  const title = notification?.title || data?.title || 'Notificação';
  const body = notification?.body || data?.body || '';

  // Se não tem nem título nem corpo explicito, não adiciona ao histórico visual
  if (!title && !body) return await getLocalNotifications();

  const id = messageId || data?.id || `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  const created_at = sentTime ? new Date(sentTime).toISOString() : new Date().toISOString();

  try {
    const currentList = await getLocalNotifications();

    // Evita duplicatas se a mesma notificação for entregue mais de uma vez
    const exists = currentList.some((item) => item.id === id);
    if (exists) {
      return currentList;
    }

    const newItem = {
      id,
      title,
      body,
      data: data || {},
      created_at,
      read: false,
    };

    const updatedList = [newItem, ...currentList].slice(0, MAX_LOCAL_NOTIFICATIONS);

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    notifyListeners(updatedList);
    console.log('[LocalNotificationStorage] Notificação salva localmente:', title);

    return updatedList;
  } catch (err) {
    console.warn('[LocalNotificationStorage] Erro ao salvar notificação:', err);
    return [];
  }
}

/**
 * Remove uma notificação específica do histórico local pelo ID.
 * @param {string} id 
 * @returns {Promise<Array>}
 */
export async function deleteLocalNotification(id) {
  try {
    const currentList = await getLocalNotifications();
    const updatedList = currentList.filter((item) => item.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    notifyListeners(updatedList);
    return updatedList;
  } catch (err) {
    console.warn('[LocalNotificationStorage] Erro ao deletar notificação:', err);
    return [];
  }
}

/**
 * Limpa todo o histórico de notificações salvas localmente.
 * @returns {Promise<void>}
 */
export async function clearLocalNotifications() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    notifyListeners([]);
    console.log('[LocalNotificationStorage] Histórico local de notificações limpo.');
  } catch (err) {
    console.warn('[LocalNotificationStorage] Erro ao limpar notificações:', err);
  }
}
