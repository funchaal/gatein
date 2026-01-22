import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mockLogin, mockRestoreSession } from '../../services/mockData';
import { secureStorage } from '../../services/secureStorage';
import { getDeviceId } from '../../services/deviceInfo';

// ==============================================================================
// ASYNC THUNKS
// ==============================================================================

/**
 * Login Request
 * Envia tax_id, password e device_id
 * Salva token e tax_id no Keychain após sucesso
 */
export const loginRequest = createAsyncThunk(
  'auth/loginRequest',
  async ({ tax_id, password }, { rejectWithValue }) => {
    try {
      // Obter Device ID
      const device = await getDeviceId();
      
      if (!device) {
        return rejectWithValue({
          data: {
            success: false,
            error: {
              code: 'DEVICE_ID_ERROR',
              message: 'Não foi possível identificar o dispositivo',
            },
          },
          status: 500,
        });
      }

      // Fazer requisição de login com device_id
      const response = await mockLogin(tax_id, password, device);
      
      // Salvar token e tax_id no Keychain (Secure Storage)
      const saved = await secureStorage.saveCredentials(
        response.data.data.token,
        response.data.data.user.tax_id
      );

      if (!saved) {
        console.warn('Failed to save credentials to Keychain');
      } else {
        console.log('Credentials saved to Keychain');
      }
      
      return response;
    } catch (error) {
      const errorPayload = {
        data: error.response?.data,
        status: error.response?.status,
      };
      return rejectWithValue(errorPayload);
    }
  }
);

/**
 * Restore Session (Auto-Login na Splash Screen)
 * Rota: POST /api/v1/auth/session/restore
 */
export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    try {
      // 1. Recuperar credenciais do Keychain
      const token = await secureStorage.getToken();

      // 2. Se não existirem credenciais, redireciona para Welcome
      if (!token) {
        console.log('No credentials found in Keychain');
        // redirectTo: 'Welcome'
        return rejectWithValue({
          data: {
            success: false,
            error: {
              code: 'NO_TOKEN_FOUND',
              message: 'Token não encontrado'
            }, 
            status: 401,
        }});
      }

      console.log('Credentials found, validating session...');
      
      const device = await getDeviceId();
      
      if (!device) {
        return rejectWithValue({
          data: {
            success: false,
            error: {
              code: 'DEVICE_ID_ERROR',
              message: 'Não foi possível identificar o dispositivo',
            },
            status: 500,
          },
        });
      }

      // 3. Validar sessão com o servidor
      const response = await mockRestoreSession(token, device);

      console.log('Session validated successfully');

      // 4. Sucesso: retorna dados atualizados
      return {
        user: response.data.data.user,
        token: token,
        isOffline: false,
      };

    } catch (error) {
      // CASO 2: Token expirado ou sessão inválida (401)
      if (error.response?.status === 401) {
        console.log('Session expired, clearing token');
        
        // Limpa apenas o token, mantém tax_id para facilitar novo login
        await secureStorage.clearToken();
        const savedTaxId = await secureStorage.getTaxId();
        
        //redirectTo: 'Login'
        return rejectWithValue({ 
          data: {
            error: {
              code: error.response?.data?.error?.code || 'SESSION_EXPIRED',
              message: error.response?.data?.error?.message || 'Sessão expirada',
            }, 
            status: 401,
            savedTaxId: savedTaxId,
        }});
      }

      // OUTROS ERROS: Sem internet/timeout -> Modo Offline
      console.warn('Session restore failed (Network), entering Offline Mode');
      
      return {
        user: null, // Será populado pelo Redux Persist se houver
        token: await secureStorage.getToken(),
        isOffline: true,
        savedTaxId: await secureStorage.getTaxId(),
      };
    }
  }
);

// ==============================================================================
// SLICE
// ==============================================================================

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
      .addCase(loginRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.data.data.token;
        state.user = action.payload.data.data.user;
        state.isOffline = false;
        state.savedTaxId = action.payload.data.data.user.tax_id;
        state.isDeviceValidated = true; // Dispositivo foi validado no login
      })
      .addCase(loginRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        
        // Se erro for DEVICE_NOT_VALIDATED
        if (action.payload?.data?.error?.code === 'DEVICE_NOT_VALIDATED') {
          state.isDeviceValidated = false;
        }
      })

      // --- RESTORE SESSION (Splash Screen) ---
      .addCase(restoreSession.pending, (state) => {
        state.isAppLoading = true;
        state.error = null;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.isAppLoading = false;
        state.isAuthenticated = true;
        state.isOffline = action.payload.isOffline;
        state.token = action.payload.token;
        
        // Atualiza dados do usuário se retornaram da API
        if (action.payload.user) {
          state.user = action.payload.user;
        }
        
        // Salva tax_id se disponível
        if (action.payload.savedTaxId) {
          state.savedTaxId = action.payload.savedTaxId;
        }
      })
      .addCase(restoreSession.rejected, (state, action) => {
        state.isAppLoading = false;
        state.isAuthenticated = false;
        state.token = null;
        
        // Se houver um tax_id salvo, mantém para preencher o login
        if (action.payload?.data?.savedTaxId) {
          state.savedTaxId = action.payload.data.savedTaxId;
        }
        
        // Salva erro se houver
        if (action.payload?.error.message) {
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