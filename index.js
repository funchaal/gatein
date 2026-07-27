/**
 * @format
 */

import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';

import { saveLocalNotification } from './src/services/localNotificationStorage';

// IMPORTANTE: Deve estar no topo do index.js, fora do ciclo de vida do React.
// Trata notificações recebidas quando o app está em BACKGROUND ou QUIT.
messaging().setBackgroundMessageHandler(async remoteMessage => {
  // Salva a notificação no histórico local do celular
  await saveLocalNotification(remoteMessage);

  const { data } = remoteMessage;
  const type = data?.type;

  console.log('[FCM Background] Tipo:', type, '| Dados:', data);
});

AppRegistry.registerComponent(appName, () => App);

