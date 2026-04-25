import { createSlice, isAnyOf } from '@reduxjs/toolkit';
import { secureStorage } from '../../services/secureStorage';
import { api } from '../../services/api';

const initialState = {
  token: null,
  isAuthenticated: false,
  isOffline: false,
  isLoading: false,
  isAppLoading: true,
  error: null,
  savedTaxId: null,
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
    logout: (state) => {
      state.token = null;
      state.user = initialState.user;
      state.isAuthenticated = false;
      state.isOffline = false;
      state.error = null;
      state.isDeviceValidated = false;
      
      secureStorage.clearAll().catch(err => 
        console.error('Error clearing Keychain on logout:', err)
      );
    },

    logoutKeepTaxId: (state) => {
      state.token = null;
      state.user = initialState.user;
      state.isAuthenticated = false;
      state.isOffline = false;
      state.error = null;
      state.isDeviceValidated = false;
      
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
      // --- LOGIN E REGISTRO (Ambos logam o usuário) ---
      .addMatcher(
        isAnyOf(api.endpoints.login.matchPending, api.endpoints.registerFinalizeRequest.matchPending), 
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        isAnyOf(api.endpoints.login.matchFulfilled, api.endpoints.registerFinalizeRequest.matchFulfilled), 
        (state, action) => {
          state.isLoading = false;
          state.isAuthenticated = true;
          state.token = action.payload.token;
          state.user = action.payload.user;
          state.isOffline = false;
          state.savedTaxId = action.payload.user.tax_id;
          state.isDeviceValidated = true; 
        }
      )
      .addMatcher(
        isAnyOf(api.endpoints.login.matchRejected, api.endpoints.registerFinalizeRequest.matchRejected), 
        (state, action) => {
          state.isLoading = false;
          state.error = action.payload;
          
          // FastAPI usa 'detail' para as mensagens do HTTPException
          const errorCode = action.payload?.data?.detail?.code || action.payload?.data?.error?.code;
          
          if (errorCode === 'DEVICE_NOT_VALIDATED') {
            state.isDeviceValidated = false;
          }
        }
      )

      // --- RESTORE SESSION (Splash Screen) ---
      .addMatcher(api.endpoints.restoreSession.matchPending, (state) => {
        state.isAppLoading = true;
        state.error = null;
      })
      .addMatcher(api.endpoints.restoreSession.matchFulfilled, (state, action) => {
        state.isAppLoading = false;
        state.isAuthenticated = true;
        state.isOffline = action.payload.isOffline;
        state.token = action.payload.token;

        if (action.payload.user) {
          state.user = action.payload.user;
        }
        
        if (action.payload.savedTaxId) {
          state.savedTaxId = action.payload.savedTaxId;
        }
      })
      .addMatcher(api.endpoints.restoreSession.matchRejected, (state, action) => {
        state.isAppLoading = false;
        state.isAuthenticated = false;
        state.token = null;
        
        if (action.payload?.data?.savedTaxId) {
          state.savedTaxId = action.payload.data.savedTaxId;
        }
        
        // Verifica tanto detail (FastAPI) quanto error 
        if (action.payload?.data?.detail || action.payload?.data?.error || action.payload?.error) {
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