import { createSlice } from '@reduxjs/toolkit';
import { api } from '../../services/api';

const initialState = {
  items: [],
  selectedTerminalId: null,
};

const terminalsSlice = createSlice({
  name: 'terminals',
  initialState,
  reducers: {
    // Ação para selecionar um terminal manualmente (ex: ao clicar no mapa)
    selectTerminal: (state, action) => {
      state.selectedTerminalId = action.payload;
    },
    // Ação futura para atualizar a lista via API
    setTerminals: (state, action) => {
        state.items = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder.addMatcher(api.endpoints.fetchAppointmentsData.matchFulfilled, (state, action) => {
      state.items = action.payload.terminals;
    });
  }
});

export const { selectTerminal, setTerminals } = terminalsSlice.actions;

// Seletores
export const selectAllTerminals = (state) => state.terminals.items;
export const selectTerminalById = (state, id) => state.terminals.items.find(t => t.id === id);
export const selectCurrentTerminalConfig = (state) => {
const id = state.terminals.selectedTerminalId;
return state.terminals.items.find(t => t.id === id);
}

export default terminalsSlice.reducer;