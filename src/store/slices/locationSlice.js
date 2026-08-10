import { createSlice } from '@reduxjs/toolkit';

const locationSlice = createSlice({
  name: 'location',
  initialState: {
    coords: null,
    realCoords: null,
    error: null,
    isSimulating: false,
    simulatedCoords: null,
  },
  reducers: {
    updateLocation: (state, action) => {
      if (!action.payload.isSimulated) {
        state.realCoords = action.payload;
      }
      // Se não estiver simulando ou se for uma atualização de simulação forçada
      if (!state.isSimulating || action.payload.isSimulated) {
        state.coords = action.payload;
      }
    },
    setLocationError: (state, action) => {
      state.error = action.payload;
    },
    setSimulating: (state, action) => {
      state.isSimulating = action.payload;
      if (action.payload && state.simulatedCoords) {
        state.coords = { ...state.simulatedCoords, isSimulated: true };
      } else if (!action.payload && state.realCoords) {
        state.coords = state.realCoords;
      }
    },
    updateSimulatedLocation: (state, action) => {
      state.simulatedCoords = action.payload;
      if (state.isSimulating) {
        state.coords = { ...action.payload, isSimulated: true };
      }
    },
  },
});

export const { updateLocation, setLocationError, setSimulating, updateSimulatedLocation } = locationSlice.actions;
export default locationSlice.reducer;
