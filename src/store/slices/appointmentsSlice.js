import { createSlice, createSelector, createAsyncThunk } from '@reduxjs/toolkit';
import { setTerminals } from './terminalsSlice'; // Importamos a ação da outra slice
import { appointmentsAPICall } from '../../services/mockData'; // Simulação da API

// --- THUNK ASSÍNCRONO ---
export const fetchAppointmentsData = createAsyncThunk(
    'appointments/fetchAppointmentsData',
    async (user_id, { dispatch, rejectWithValue }) => {
        try {
            const response = await appointmentsAPICall(user_id);
            const { appointments, terminals } = response.data;

            // 1. Atualiza a outra slice (Terminals)
            // Isso dispara a ação setTerminals definida no terminalsSlice
            dispatch(setTerminals(terminals));

            // 2. Retorna os agendamentos para atualizar esta slice (Appointments)
            return appointments;

        } catch (error) {
            console.error('Erro no fetch:', error);
            return rejectWithValue(error.message || 'Erro ao carregar dados');
        }
    }
);

// --- SLICE ---
const initialState = {
    items: [],
    selectedAppointment: null,
    status: 'idle', // idle | loading | succeeded | failed
    error: null,
};

const appointmentsSlice = createSlice({
    name: 'appointments',
    initialState,
    reducers: {
        selectAppointment: (state, action) => {
            state.selectedAppointment = action.payload;
        },
        updateAppointmentStatus: (state, action) => {
            const { id, status } = action.payload;
            const index = state.items.findIndex(item => item.id === id);
            if (index !== -1) {
                state.items[index].status = status;
            }
        },
        clearAppointments: (state) => {
            state.items = [];
            state.status = 'idle';
        }
    },
    // Aqui tratamos o resultado do Thunk
    extraReducers: (builder) => {
        builder
            .addCase(fetchAppointmentsData.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchAppointmentsData.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // O payload aqui é APENAS o array de appointments que retornamos no thunk
                state.items = action.payload;
            })
            .addCase(fetchAppointmentsData.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Erro desconhecido';
            });
    },
});

export const { selectAppointment, updateAppointmentStatus, clearAppointments } = appointmentsSlice.actions;

// Seletores
export const selectAllAppointments = (state) => state.appointments.items;
export const selectSelectedAppointment = (state) => state.appointments.selectedAppointment;
export const selectAppointmentsStatus = (state) => state.appointments.status;

export const selectActiveAppointments = createSelector(
    [selectAllAppointments],
    (items) => items.filter(item => 
        ['Agendado', 'Em Andamento', 'No Pátio', 'SCHEDULED', 'CHECKED_IN', 'IN_PROGRESS'].includes(item.status)
    )
);

export const selectHistoryAppointments = createSelector(
    [selectAllAppointments],
    (items) => items // Retorna tudo ou filtra por status finalizados
);

export const selectAppointmentById = (state, id) => 
    state.appointments.items.find(item => item.id === id);

export default appointmentsSlice.reducer;