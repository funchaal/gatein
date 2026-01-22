import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';

import authReducer from './slices/authSlice';
import chatReducer from './slices/chatSlice';
import appointmentsReducer from './slices/appointmentsSlice';
import terminalsReducer from './slices/terminalsSlice';
import documentReducer from './slices/documentSlice';
import registerReducer from './slices/registerSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  chat: chatReducer,
  appointments: appointmentsReducer,
  terminals: terminalsReducer,
  document: documentReducer,
  register: registerReducer,
});

// Configuração do Redux Persist
// IMPORTANTE: token e tax_id NÃO são persistidos aqui
// Eles ficam APENAS no Keychain (Secure Storage)
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['terminals'], // Apenas dados não-sensíveis
  blacklist: ['auth'], // Auth usa Keychain, não AsyncStorage
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);