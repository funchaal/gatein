import { createSlice, createSelector } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import { selectOnGoingTerminalId } from './activitySlice';

const initialState = {
  terminals: {},
  truckingCompanies: {},
  layouts: {
    appointment: {},
    ticket: {},
    trip: {}
  },
  selectedCompanyId: null,
};

const mergeCompaniesList = (state, companiesList) => {
  if (!Array.isArray(companiesList)) return;
  companiesList.forEach((company) => {
    if (!company || !company.id) return;
    if (company.type === 'terminal') {
      state.terminals[company.id] = {
        ...state.terminals[company.id],
        ...company,
      };
    } else {
      state.truckingCompanies[company.id] = {
        ...state.truckingCompanies[company.id],
        ...company,
      };
    }
  });
};

const companiesSlice = createSlice({
  name: 'companies',
  initialState,
  reducers: {
    selectCompany: (state, action) => {
      state.selectedCompanyId = action.payload;
    },
    clearCompaniesData: (state) => {
      state.terminals = {};
      state.truckingCompanies = {};
      state.layouts = { appointment: {}, ticket: {}, trip: {} };
      state.selectedCompanyId = null;
    }
  },
  extraReducers: (builder) => {
    builder.addMatcher(api.endpoints.fetchActivityData.matchFulfilled, (state, action) => {
      // Usa fallback para objetos vazios caso a API retorne undefined em alguma chave
      const { 
        terminals = {}, 
        trucking_companies = {}, 
        layouts = { appointment: {}, ticket: {}, trip: {} } 
      } = action.payload.data;

      // Merge de dicionários: mantém os cacheados e adiciona os novos da paginação
      state.terminals = { ...state.terminals, ...terminals };
      state.truckingCompanies = { ...state.truckingCompanies, ...trucking_companies };
      
      state.layouts.appointment = { ...state.layouts.appointment, ...layouts.appointment };
      state.layouts.ticket = { ...state.layouts.ticket, ...layouts.ticket };
      state.layouts.trip = { ...state.layouts.trip, ...layouts.trip };
    });

    builder.addMatcher(
      (action) =>
        api.endpoints.fetchInitialCompanies.matchFulfilled(action) ||
        api.endpoints.fetchNearbyCompanies.matchFulfilled(action) ||
        api.endpoints.searchCompanies.matchFulfilled(action),
      (state, action) => {
        mergeCompaniesList(state, action.payload);
      }
    );
  }
});

export const { selectCompany, clearCompaniesData } = companiesSlice.actions;

// ============================================================================
// Seletores Básicos
// ============================================================================
// Retornam objetos (dicionários) para busca O(1) no frontend
export const selectAllTerminals = (state) => state.companies.terminals;
export const selectAllTruckingCompanies = (state) => state.companies.truckingCompanies;
export const selectAllLayouts = (state) => state.companies.layouts;

// Buscas diretas por ID
export const selectTerminalById = (state, id) => state.companies.terminals[id];
export const selectTruckingCompanyById = (state, id) => state.companies.truckingCompanies[id];

export const selectCurrentCompanyConfig = (state) => {
  const id = state.companies.selectedCompanyId;
  return state.companies.terminals[id] || state.companies.truckingCompanies[id];
};

// ============================================================================
// Seletores Derivados
// ============================================================================
export const selectTicketLayoutsForOngoingTerminal = createSelector(
  [selectAllLayouts, selectOnGoingTerminalId],
  (layouts, terminalId) => {
    if (!terminalId || !layouts?.ticket) return {};
    
    // O backend envia as chaves no formato "terminalId_ref".
    // Filtramos apenas os layouts pertencentes ao terminal em andamento.
    const terminalTicketLayouts = {};
    Object.entries(layouts.ticket).forEach(([key, layoutData]) => {
      if (key.startsWith(`${terminalId}_`)) {
        terminalTicketLayouts[key] = layoutData;
      }
    });
    
    return terminalTicketLayouts;
  }
);

export default companiesSlice.reducer;