import { createSlice } from '@reduxjs/toolkit';

const locationSlice = createSlice({
  name: 'location',
  initialState: {
    coords: null,
    error: null,
  },
  reducers: {
    updateLocation: (state, action) => {
      state.coords = action.payload;
    },
    setLocationError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { updateLocation, setLocationError } = locationSlice.actions;
export default locationSlice.reducer;
