import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import api from '../../services/api'; 
import { mockValidateToken, mockLogin } from '../../services/mockData';

// ==============================================================================
// 1. THUNKS (Ações Assíncronas)
// ==============================================================================

/**
 * Realiza o Login do usuário
 * Retorna { token, user } em caso de sucesso ou erro em caso de falha.
 */
export const loginRequest = createAsyncThunk(
  'auth/loginRequest',
  async ({ tax_id, password }, { rejectWithValue }) => {
    try {
      const response = await mockLogin(tax_id, password);
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
 * Verifica se o token salvo ainda é válido ao abrir o App
 */
export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async (_, { getState, rejectWithValue }) => {
    const { token, user } = getState().auth;

    // Se não tem token salvo, rejeita imediatamente (vai para Login)
    if (!token) {
      return rejectWithValue('No token found');
    }

    try {
      // Tenta validar com o servidor
      const response = await mockValidateToken(token);
      
      // Sucesso: Retorna dados atualizados e flag online
      return { user: response.data, isOffline: false };

    } catch (error) {
      // ERRO 401: Token expirado ou inválido -> Forçar Logout
      if (error.response && error.response.status === 401) {
        return rejectWithValue('Token expired');
      }

      // OUTROS ERROS (Sem internet, Timeout) -> Manter Logado (Modo Offline)
      console.warn('Auth check failed (Network/Server), entering Offline Mode');
      return { user: user, isOffline: true };
    }
  }
);

// ==============================================================================
// 2. SLICE (Estado e Reducers)
// ==============================================================================

const initialState = {
  token: null,
  isAuthenticated: false,
  isOffline: false,
  isLoading: false, // Controla spinners de login
  isAppLoading: true, // Controla a Splash Screen inicial
  error: null,      // Armazena msg de erro para exibir na UI se precisar
  isDeviceValidated: false,
  user: {
    id: null,
    name: null,
    tax_id: null,
    role: null,
    isRegistered: false,
    registerStep: null
    // avatar: null, // Se tiver no futuro
  },
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Logout síncrono (chamado pelo botão "Sair" ou "Trocar Conta")
    logout: (state) => {
      state.token = null;
      state.user = initialState.user;
      state.isAuthenticated = false;
      state.isOffline = false;
      state.error = null;
    },
    setAuthenticaded: (state, action) => {
      state.isAuthenticated = action.payload;
    },
    // Limpar erros (útil quando o usuário tenta logar de novo)
    clearError: (state) => {
      state.error = null;
    }
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
        state.token = action.payload.data.token; // ou mock
        state.user = action.payload.data.user;
        state.isOffline = false;
      })
      .addCase(loginRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload; // Contém { data, status }
      })

      // --- CHECK AUTH STATUS (Splash Screen) ---
      .addCase(checkAuthStatus.pending, (state) => {
        state.isAppLoading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.isAppLoading = false;
        state.isAuthenticated = true;
        state.isOffline = action.payload.isOffline;
        
        // Se a API retornou dados novos do user, atualizamos. 
        // Se for offline, mantemos o antigo (que já está no state via persist, mas garantimos aqui)
        if (action.payload.user) {
            state.user = action.payload.user;
        }
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.isAppLoading = false;
        state.isAuthenticated = false;
        state.token = null; // Garante limpeza se o token estava podre
      });
  },
});

export const { logout, clearError, setAuthenticaded } = authSlice.actions;
export default authSlice.reducer;