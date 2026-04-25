import 'react-native-gesture-handler';

import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BootSplash from 'react-native-bootsplash';

import { store, persistor } from './src/store'; 
import { PersistGate } from 'redux-persist/integration/react';

import AppNavigator from './src/navigation/AppNavigator';
import AppointmentDetailsModal from './src/components/appointments/AppointmentDetailsModal';
import ChatModal from './src/components/chat/ChatModal';
import { closeChatModal } from './src/store/slices/chatSlice';
import LocationWatcher from './src/components/LocationWatcher';
import StateGate from './src/components/common/StateGate';

// ✅ Importe o hook da mutation
import { useRestoreSessionMutation } from './src/services/api';

function AppContent() {
  const { isChatModalVisible } = useSelector((state) => state.chat);
  const { isAppLoading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useSelector((state) => state.location);
  
  // ✅ Instancie a mutation
  const [restoreSession] = useRestoreSessionMutation();
  
  // ✅ Execute direto a função gerada pelo hook
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    if (!isAppLoading) {
      BootSplash.hide({ fade: true });
    }
  }, [isAppLoading]);

  if (isAppLoading) {
    return null;
  }

  return (
     <StateGate>
      <LocationWatcher />
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <AppNavigator />
      <AppointmentDetailsModal />
      <ChatModal 
        visible={isChatModalVisible} 
        onClose={() => dispatch(closeChatModal())} 
      />
    </StateGate>
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