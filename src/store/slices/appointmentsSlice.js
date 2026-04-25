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
            if (state.selectedAppointment?.id === id) {
                state.selectedAppointment.status = status;
            }
        },
        updateAppointmentsStatusCheckinDone: (state, action) => {
            const { id, tickets } = action.payload;
            const index = state.items.findIndex(item => item.id === id);
            
            if (index !== -1) {
                state.items[index].status = 'CHECKED_IN';
                state.items[index].tickets = tickets; 
            }
            
            if (state.selectedAppointment?.id === id) {
                state.selectedAppointment.status = 'CHECKED_IN';
                state.selectedAppointment.tickets = tickets;
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
                console.log("Loading... ad")
                state.error = null;
            })
            .addMatcher(api.endpoints.fetchAppointmentsData.matchFulfilled, (state, action) => {
                state.status = 'succeeded';
                console.log("Fulfilled... ad")
                console.log(action.payload.appointments)
                state.items = action.payload.appointments;
            })
            .addMatcher(api.endpoints.fetchAppointmentsData.matchRejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Erro desconhecido';
            })
            .addMatcher(api.endpoints.checkinRequest.matchFulfilled, (state, action) => {
                const companyId = action.meta.arg.originalArgs;
                
                const ticketsResponse = action.payload;

                ticketsResponse.forEach(ticketItem => {
                    const appointmentRef = ticketItem.appointment_ref;
                    
                    // 4. Buscamos o agendamento cruzando companyId E ref
                    const index = state.items.findIndex(
                        (appt) => appt.company_id === companyId && appt.ref === appointmentRef
                    );
                    
                    if (index !== -1) {
                        state.items[index].status = 'CHECKED_IN';
                        state.items[index].ticket = ticketItem;
                    }
                });
            })
                },
            });

// ============================================================================
// Actions
// ============================================================================
export const { 
    selectAppointment, 
    updateAppointmentStatus, 
    clearAppointments, 
    updateAppointmentsStatusCheckinDone 
} = appointmentsSlice.actions;

// ============================================================================
// Seletores Básicos
// ============================================================================
export const selectAllAppointments = (state) => state.appointments.items;
export const selectSelectedAppointment = (state) => state.appointments.selectedAppointment;
export const selectAppointmentsStatus = (state) => state.appointments.status;

export const selectAppointmentById = (state, id) => 
    state.appointments.items.find(item => item.id === id);

// ============================================================================
// Seletores Derivados (Memoizados)
// ============================================================================
export const selectOnGoingAppointments = createSelector(
    [selectAllAppointments],
    (items) => items.filter(item => 
        ['CHECKED_IN', 'IN_PROGRESS'].includes(item.status)
    )
);

export const selectActiveAppointments = createSelector(
    [selectAllAppointments],
    (items) => items.filter(item => 
        ['CHECKED_IN', 'IN_PROGRESS', 'SCHEDULED'].includes(item.status)
    )
);

export const selectHistoryAppointments = createSelector(
    [selectAllAppointments],
    (items) => items 
);

export const selectCurrentCheckedInAppointment = createSelector(
    [selectAllAppointments],
    (items) => items.find(item => item.status === 'CHECKED_IN')
);

export const selectIsDriverCheckedIn = createSelector(
    [selectCurrentCheckedInAppointment],
    (appointment) => !!appointment 
);

// ============================================================================
// Exportação Padrão do Reducer
// ============================================================================
export default appointmentsSlice.reducer;