import { createSlice } from '@reduxjs/toolkit';
import { secureStorage } from '../../services/secureStorage';
import { api } from '../../services/api';

const initialState = {
  token: null,
  isAuthenticated: false,
  isOffline: false,
  isLoading: false,        // Spinner de login
  isAppLoading: true,      // Splash Screen
  error: null,
  savedTaxId: null,        // CPF salvo para preencher login
  isDeviceValidated: false,
  user: {
    id: null,
    name: null,
    tax_id: null,
    role: null,
    driver_license: null,
    driver_id: null,
  },
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Logout completo
     * Limpa Keychain e reseta estado
     */
    logout: (state) => {
      state.token = null;
      state.user = initialState.user;
      state.isAuthenticated = false;
      state.isOffline = false;
      state.error = null;
      state.isDeviceValidated = false;
      
      // Limpar Keychain
      secureStorage.clearAll().catch(err => 
        console.error('Error clearing Keychain on logout:', err)
      );
    },

    /**
     * Logout mantendo tax_id
     * Útil para trocar de conta
     */
    logoutKeepTaxId: (state) => {
      state.token = null;
      state.user = initialState.user;
      state.isAuthenticated = false;
      state.isOffline = false;
      state.error = null;
      state.isDeviceValidated = false;
      
      // Limpar apenas o token
      secureStorage.clearToken().catch(err => 
        console.error('Error clearing token on logout:', err)
      );
    },

    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },

    setSavedTaxId: (state, action) => {
      state.savedTaxId = action.payload;
    },

    setDeviceValidated: (state, action) => {
      state.isDeviceValidated = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      // --- LOGIN REQUEST ---
      .addMatcher(api.endpoints.login.matchPending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addMatcher(api.endpoints.login.matchFulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isOffline = false;
        state.savedTaxId = action.payload.user.tax_id;
        state.isDeviceValidated = true; // Dispositivo foi validado no login
      })
      .addMatcher(api.endpoints.login.matchRejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        
        // Se erro for DEVICE_NOT_VALIDATED
        if (action.payload?.data?.error?.code === 'DEVICE_NOT_VALIDATED') {
          state.isDeviceValidated = false;
        }
      })

      // --- RESTORE SESSION (Splash Screen) ---
      .addMatcher(api.endpoints.restoreSession.matchPending, (state) => {
        console.log('restoreSession.pending')
        state.isAppLoading = true;
        state.error = null;
      })
      .addMatcher(api.endpoints.restoreSession.matchFulfilled, (state, action) => {
        state.isAppLoading = false;
        state.isAuthenticated = true;
        state.isOffline = action.payload.isOffline;
        state.token = action.payload.token;

        console.log('deu bom aqui')        
        // Atualiza dados do usuário se retornaram da API
        if (action.payload.user) {
          state.user = action.payload.user;
        }
        
        // Salva tax_id se disponível
        if (action.payload.savedTaxId) {
          state.savedTaxId = action.payload.savedTaxId;
        }
      })
      .addMatcher(api.endpoints.restoreSession.matchRejected, (state, action) => {
        state.isAppLoading = false;
        state.isAuthenticated = false;
        state.token = null;
        
        console.log('deu erro aqui')

        // Se houver um tax_id salvo, mantém para preencher o login
        if (action.payload?.data?.savedTaxId) {
          state.savedTaxId = action.payload.data.savedTaxId;
        }
        
        // Salva erro se houver
        if (action.payload?.data?.error?.message || action.payload?.error?.message) {
          state.error = action.payload;
        }
      });
  },
});

export const { 
  logout, 
  logoutKeepTaxId,
  clearError, 
  setAuthenticated,
  setSavedTaxId,
  setDeviceValidated,
} = authSlice.actions;

export default authSlice.reducer;