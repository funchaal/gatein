import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';

// Importe seus slices aqui
import authReducer from './slices/authSlice';
import chatReducer from './slices/chatSlice';
import appointmentsReducer from './slices/appointmentsSlice';
import terminalsReducer from './slices/terminalsSlice';
import documentReducer from './slices/documentSlice';
import registerReducer from './slices/registerSlice';

// 1. Combina todos os pedaços do estado (Slices)
const rootReducer = combineReducers({
  auth: authReducer,
  chat: chatReducer,
  appointments: appointmentsReducer,
  terminals: terminalsReducer,
  document: documentReducer, 
  register: registerReducer,
});

// 2. Configuração do Redux Persist (O que vai ser salvo no celular)
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  // Whitelist: Define quais dados sobrevivem quando fecha o app
  // 'auth': Mantém o usuário logado
  // 'appointments': Permite ver agendamentos offline (lembra do caso "sem wifi"?)
  whitelist: ['auth', 'terminals', 'appointments'], 
  // 'chat' e 'terminals' não estão aqui, então resetam ao fechar o app (opcional)
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// 3. Cria a Store com middleware para ignorar erros de serialização do Persist
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

// 4. Exporta o Persistor (usado no PersistGate do App.js)
export const persistor = persistStore(store);