import { createSlice, createSelector } from '@reduxjs/toolkit';
import { api } from '../../services/api';

const initialState = {
    appointments: [],
    trips: [],
    selectedAppointment: null,
    status: 'idle', // idle | loading | succeeded | failed
    error: null,
    hasMore: true, // Controle de fim de paginação
};

const activitySlice = createSlice({
    name: 'activity',
    initialState,
    reducers: {
        selectAppointment: (state, action) => {
            state.selectedAppointment = action.payload;
        },
        updateAppointmentStatus: (state, action) => {
            const { id, status } = action.payload;
            const index = state.appointments.findIndex(item => item.id === id);

            if (index !== -1) {
                state.appointments[index].status = status;
            } else {
                const tripIndex = state.trips.findIndex(item => item.id === id);
                if (tripIndex !== -1) {
                    state.trips[tripIndex].status = status;
                }
            }
            if (state.selectedAppointment?.id === id) {
                state.selectedAppointment.status = status;
            }
        },
        updateAppointmentsStatusCheckinDone: (state, action) => {
            const { id, tickets } = action.payload;
            const index = state.appointments.findIndex(item => item.id === id);

            if (index !== -1) {
                state.appointments[index].status = 'CHECKED-IN';
                state.appointments[index].tickets = tickets;
            } else {
                const tripIndex = state.trips.findIndex(item => item.id === id);
                if (tripIndex !== -1) {
                    state.trips[tripIndex].status = 'CHECKED-IN';
                    state.trips[tripIndex].tickets = tickets;
                }
            }

            if (state.selectedAppointment?.id === id) {
                state.selectedAppointment.status = 'CHECKED-IN';
                state.selectedAppointment.tickets = tickets;
            }
        },
        clearActivity: (state) => {
            state.appointments = [];
            state.trips = [];
            state.status = 'idle';
            state.hasMore = true; // Reseta ao limpar tudo
        }
    },
    extraReducers: (builder) => {
        builder
            .addMatcher(api.endpoints.fetchActivityData.matchPending, (state, action) => {
                state.status = 'loading';
                state.error = null;
                // Se estiver buscando a primeira página, reseta o hasMore
                if (action.meta.arg.originalArgs.offset === 0) {
                    state.hasMore = true;
                }
            })
            .addMatcher(api.endpoints.fetchActivityData.matchFulfilled, (state, action) => {
                state.status = 'succeeded';

                // Agora lê diretamente do meta retornado pela API
                state.hasMore = action.payload.meta?.has_more ?? false;

                const responseData = action.payload.data || {};
                const appointments = responseData.appointments || [];
                const trips = responseData.trips || [];
                const { offset } = action.meta.arg.originalArgs;

                // LOGS PARA INSPEÇÃO
                console.log('\n--- [REDUX SLICE] fetchActivityData ---');
                console.log('1. Parâmetros enviados (Args):', action.meta.arg.originalArgs);
                console.log('2. Resposta completa do Servidor:', action.payload);
                console.log(`3. Itens recebidos nesta requisição: Appointments(${appointments.length}), Trips(${trips.length})`);

                // Sempre realiza o merge para ser cumulativo, atualizando os existentes e adicionando novos
                appointments.forEach(newAppt => {
                    const idx = state.appointments.findIndex(a => a.id === newAppt.id);
                    if (idx !== -1) {
                        state.appointments[idx] = newAppt;
                    } else {
                        state.appointments.push(newAppt);
                    }
                });

                trips.forEach(newTrip => {
                    const idx = state.trips.findIndex(t => t.id === newTrip.id);
                    if (idx !== -1) {
                        state.trips[idx] = newTrip;
                    } else {
                        state.trips.push(newTrip);
                    }
                });
            })
            .addMatcher(api.endpoints.fetchActivityData.matchRejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Erro desconhecido';
                state.hasMore = false; // Falhou, paralisa a rolagem
            })
            .addMatcher(api.endpoints.checkinRequest.matchFulfilled, (state, action) => {
                const companyId = action.meta.arg.originalArgs;
                const ticketsResponse = action.payload;

                ticketsResponse.forEach(ticketItem => {
                    const appointmentRef = ticketItem.appointment_ref;

                    const index = state.appointments.findIndex(
                        (appt) => appt.terminal_id === companyId && appt.ref === appointmentRef
                    );

                    if (index !== -1) {
                        state.appointments[index].status = 'CHECKED-IN';
                        state.appointments[index].ticket = ticketItem.ticket;
                    } else {
                        const tripIndex = state.trips.findIndex(
                            (trip) => trip.terminal_id === companyId && trip.ref === appointmentRef
                        );
                        if (tripIndex !== -1) {
                            state.trips[tripIndex].status = 'CHECKED-IN';
                            state.trips[tripIndex].ticket = ticketItem.ticket;
                        }
                    }
                });
            });
    },
});

export const {
    selectAppointment,
    updateAppointmentStatus,
    clearActivity,
    updateAppointmentsStatusCheckinDone
} = activitySlice.actions;

// ... (Seletores Básicos permanecem os mesmos) ...
export const selectAllAppointments = (state) => state.activity.appointments;
export const selectAllTrips = (state) => state.activity.trips;
export const selectAllActivity = createSelector(
    [selectAllAppointments, selectAllTrips],
    (appointments, trips) => [...(appointments || []), ...(trips || [])]
);
export const selectSelectedAppointment = (state) => state.activity.selectedAppointment;
export const selectActivityStatus = (state) => state.activity.status;

// Novo Seletor exportado
export const selectHasMoreActivity = (state) => state.activity.hasMore;

export const selectAppointmentById = (state, id) =>
    state.activity.appointments.find(item => item.id === id) || state.activity.trips.find(item => item.id === id);

// ... (Seletores Derivados permanecem os mesmos) ...
export const selectOnGoingAppointments = createSelector(
    [selectAllActivity],
    (items) => (items || []).filter(item =>
        ['CHECKED-IN', 'ON_GOING'].includes(item?.status) && !(item?.type === 'trip' || item?.is_trip)
    )
);

export const selectOnGoingTerminalId = createSelector(
    [selectOnGoingAppointments],
    (items) => (items && items.length > 0) ? items[0].terminal_id : undefined
);

export const selectIsDriverCheckedIn = createSelector(
    [selectOnGoingAppointments],
    (appointments) => appointments.length > 0
);

const ACTIVE_STATUSES = ['CHECKED-IN', 'ON_GOING', 'ACTIVE', 'PAUSED', 'PLANNED', 'AGENDADO', 'NO PÁTIO', 'EM ANDAMENTO', 'PAUSADO'];

const isActiveItem = (item) => {
    if (!item || item.status === 'DELETED') return false;
    if (ACTIVE_STATUSES.includes(item.status)) return true;
    if (item.status === 'DEACTIVATED' || item.status === 'DESATIVADO') {
        const refTime = item.deactivated_at || item.updated_at;
        if (!refTime) return true;
        return (Date.now() - new Date(refTime).getTime()) <= 12 * 60 * 60 * 1000;
    }
    return false;
};

export const selectByType = {
    "active-all": createSelector([selectAllActivity], items =>
        (items || []).filter(isActiveItem)
    ),
    "active-appointments": createSelector([selectAllActivity], items =>
        (items || []).filter(i => isActiveItem(i) && !(i.type === "trip" || i.is_trip))
    ),
    "active-trips": createSelector([selectAllActivity], items =>
        (items || []).filter(i => isActiveItem(i) && (i.type === "trip" || i.is_trip))
    ),
    "history-all": createSelector([selectAllActivity], items =>
        (items || []).filter(i => i.status !== 'DELETED' && !isActiveItem(i))
    ),
    "history-appointments": createSelector([selectAllActivity], items =>
        (items || []).filter(i => i.status !== 'DELETED' && !isActiveItem(i) && !(i.type === "trip" || i.is_trip))
    ),
    "history-trips": createSelector([selectAllActivity], items =>
        (items || []).filter(i => i.status !== 'DELETED' && !isActiveItem(i) && (i.type === "trip" || i.is_trip))
    ),
};

export default activitySlice.reducer;