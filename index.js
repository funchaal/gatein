/**
 * @format
 */

import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';

// IMPORTANTE: Deve estar no topo do index.js, fora do ciclo de vida do React.
// Trata notificações recebidas quando o app está em BACKGROUND ou QUIT.
messaging().setBackgroundMessageHandler(async remoteMessage => {
  // O Firebase processa e exibe a notificação automaticamente via sistema operacional.
  // Este handler é chamado apenas quando há um `data payload` para processar.
  const { data } = remoteMessage;
  const type = data?.type;

  console.log('[FCM Background] Tipo:', type, '| Dados:', data);

  // Tipos especiais que podem precisar de processamento adicional:
  // - COUNTDOWN: o timer será exibido quando o usuário abrir o app
  // - WINDOW_OPEN: sem ação necessária em background
  // - IN_PROGRESS: sem ação necessária em background
});

AppRegistry.registerComponent(appName, () => App);

