import 'react-native-gesture-handler';

import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BootSplash from 'react-native-bootsplash';
import { PersistGate } from 'redux-persist/integration/react';

import { store, persistor } from './src/store';
import { useRestoreSessionMutation, api } from './src/services/api';
import { closeChatModal } from './src/store/slices/chatSlice';

import AppNavigator from './src/navigation/AppNavigator';
import AppointmentDetailsModal from './src/components/appointments/AppointmentDetailsModal';
import ChatModal from './src/components/chat/ChatModal';
import LocationWatcher from './src/components/LocationWatcher';
import StateGate from './src/components/common/StateGate';
import CheckinSuccessModal from './src/components/common/CheckinSuccessModal';

// Separado porque precisa estar dentro do <Provider> para usar hooks Redux
function AppContent() {
  const dispatch = useDispatch();
  const { isChatModalVisible } = useSelector((state) => state.chat);
  const { isAppLoading, user } = useSelector((state) => state.auth);
  const [restoreSession] = useRestoreSessionMutation();
  const [checkinSuccessModalVisible, setCheckinSuccessModalVisible] = useState(false);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    if (!isAppLoading) BootSplash.hide({ fade: true });
  }, [isAppLoading]);

  // Inicializa notificações push após sessão restaurada e usuário autenticado
  useEffect(() => {
    if (isAppLoading || !user) return;

    const {
      setupNotifications,
      onForegroundMessage,
      onBackgroundNotificationOpen,
      getInitialNotification,
    } = require('./src/services/notifications');

    // Registra o token FCM no servidor (upsert silencioso)
    setupNotifications();

    /**
     * Tipos de push que indicam mudança de dados no servidor.
     * Ao receber qualquer um deles, invalidamos o cache RTK Query
     * para que a lista de agendamentos seja re-buscada automaticamente.
     *
     * Isso garante que o app nunca fique desatualizado — sem precisar
     * que o usuário faça pull-to-refresh manualmente.
     */
    const DATA_CHANGE_TYPES = new Set([
      'SCHEDULED_UPDATE',   // Horário ou info de exibição alterados
      'SCHEDULED_CREATED',  // Novo agendamento criado
      'CANCELLED',          // Agendamento excluído/cancelado
      'CHECKIN_CANCELLED',  // Check-in revertido
      'CHECKED-IN',         // Check-in realizado (atualiza status local)
      'ON_GOING',        // Passou para em andamento
    ]);

    /** Invalida o cache e força um refetch da lista de atividades */
    const refreshActivities = () => {
      dispatch(api.util.invalidateTags(['Activity']));
      console.log('[FCM] Cache de atividades invalidado → refetch automático.');
    };

    /** Processa uma mensagem recebida de qualquer estado (foreground/background/quit) */
    const handleMessage = (remoteMessage) => {
      if (!remoteMessage) return;

      const { notification, data } = remoteMessage;
      const type = data?.type;

      // Se é uma mudança de dados → refaz fetch silencioso
      if (type && DATA_CHANGE_TYPES.has(type)) {
        refreshActivities();
      }

      if (type === 'CHECKED-IN') {
        setCheckinSuccessModalVisible(true);
      } else {
        // Exibe notificação local no system tray (em foreground o Firebase
        // não exibe banners automáticos, então usamos o Notifee)
        const title = notification?.title || data?.title || 'GateIn';
        const body = notification?.body || data?.body;
        if (body) {
          const { displayLocalNotification } = require('./src/services/displayLocalNotification');
          displayLocalNotification(
            title,
            body,
            data || {},
          );
        }
      }
    };

    // ── Foreground: app aberto na tela ──────────────────────────────────────
    const unsubForeground = onForegroundMessage(handleMessage);

    // ── Background: usuário clicou no banner com app em segundo plano ───────
    const unsubBackground = onBackgroundNotificationOpen((remoteMessage) => {
      if (!remoteMessage) return;
      const { saveLocalNotification } = require('./src/services/localNotificationStorage');
      saveLocalNotification(remoteMessage);

      const type = remoteMessage?.data?.type;
      if (type && DATA_CHANGE_TYPES.has(type)) {
        refreshActivities();
      }
      if (type === 'CHECKED-IN') {
        setCheckinSuccessModalVisible(true);
      }
    });

    // ── Quit: app estava completamente fechado quando a notificação chegou ──
    getInitialNotification().then((remoteMessage) => {
      if (!remoteMessage) return;
      const { saveLocalNotification } = require('./src/services/localNotificationStorage');
      saveLocalNotification(remoteMessage);

      const type = remoteMessage?.data?.type;
      console.log('[FCM] App aberto via notificação tipo:', type);
      // Refaz fetch se era uma mudança de dado
      if (type && DATA_CHANGE_TYPES.has(type)) {
        refreshActivities();
      }
      if (type === 'CHECKED-IN') {
        setCheckinSuccessModalVisible(true);
      }
    });

    return () => {
      unsubForeground?.();
      unsubBackground?.();
    };
  }, [isAppLoading, user, dispatch]);


  if (isAppLoading) return null;

  return (
    <>
      <StateGate>
        <LocationWatcher />
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <AppNavigator />
        <ChatModal
          visible={isChatModalVisible}
          onClose={() => dispatch(closeChatModal())}
        />
      </StateGate>
      <AppointmentDetailsModal />
      <CheckinSuccessModal
        visible={checkinSuccessModalVisible}
        onClose={() => setCheckinSuccessModalVisible(false)}
      />
    </>
  );
}


export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaProvider>
          <NavigationContainer>
            <AppContent />
          </NavigationContainer>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}