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
  async ({ cpf, password }, { rejectWithValue }) => {
    try {
      // Simula delay de rede (opcional, bom para testar loading)
      // await new Promise(resolve => setTimeout(resolve, 1000));

      // Chamada API (Mockada)
      console.log('Chamando mockLogin com:', cpf, password);
      const response = await mockLogin(cpf, password);
      console.log('Resposta do mockLogin:', response);
      
      // O Redux Toolkit pega esse retorno e joga no action.payload do 'fulfilled'
      return response.data; 
    } catch (error) {
      console.log('Erro no loginRequest:', error);
      // Pega a mensagem de erro da API ou usa uma genérica
      const errorMessage = error.response?.data?.message || 'Falha ao realizar login.';
      return rejectWithValue(errorMessage);
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
  user: {
    id: null,
    name: null,
    tax_id: null,
    role: null,
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
    // Limpar erros (útil quando o usuário tenta logar de novo)
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // --- LOGIN REQUEST ---
      .addCase(loginRequest.pending, (state) => {
        // state.isLoading = true;
        state.error = null;
      })
      .addCase(loginRequest.fulfilled, (state, action) => {
        console.log('Login bem-sucedido: stoy aqui');
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isOffline = false;
      })
      .addCase(loginRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload; // "Senha incorreta", etc.
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

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;