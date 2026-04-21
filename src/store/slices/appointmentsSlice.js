import { createSlice, createSelector } from '@reduxjs/toolkit';
import { api } from '../../services/api';

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
    extraReducers: (builder) => {
        builder
            .addMatcher(api.endpoints.fetchAppointmentsData.matchPending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addMatcher(api.endpoints.fetchAppointmentsData.matchFulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload.appointments;
            })
            .addMatcher(api.endpoints.fetchAppointmentsData.matchRejected, (state, action) => {
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