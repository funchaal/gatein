import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';
import { api } from '../services/api';

import authReducer from './slices/authSlice';
import chatReducer from './slices/chatSlice';
import activityReducer from './slices/activitySlice';
import companiesReducer from './slices/companiesSlice';
import registerReducer from './slices/registerSlice';
import locationSlice from './slices/locationSlice';

const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  auth: authReducer,
  chat: chatReducer,
  activity: activityReducer,
  companies: companiesReducer,
  register: registerReducer,
  location: locationSlice
});

// Configuração do Redux Persist
// IMPORTANTE: token e tax_id NÃO são persistidos aqui
// Eles ficam APENAS no Keychain (Secure Storage)
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['companies'], // Apenas dados não-sensíveis
  blacklist: ['auth', api.reducerPath], // Auth usa Keychain, api lida com cache
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(api.middleware),
});

export const persistor = persistStore(store);
