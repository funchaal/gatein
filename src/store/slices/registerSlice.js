import { createSlice } from '@reduxjs/toolkit';
import { api } from '../../services/api';

const initialState = {
  error: null,      
  user: {
    id: null,
    name: null,
    tax_id: null,
    role: 'driver',
    registered: null, 
    registerStep: null, 
    phone: null, 
    phone_validated: false, 
    driver_license: null,
  },
  loading: false, 
};

const registerSlice = createSlice({
  name: 'register',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }, 
    setName: (state, action) => {
      state.user.name = action.payload;
    }, 
    setPhone: (state, action) => {
      state.user.phone = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(api.endpoints.registerTaxIdRequest.matchPending, (state) => {
        state.error = null;
      })
      .addMatcher(api.endpoints.registerTaxIdRequest.matchFulfilled, (state, action) => {
        state.user.tax_id = action.meta.arg.originalArgs.tax_id;
      })
      .addMatcher(api.endpoints.registerTaxIdRequest.matchRejected, (state, action) => {
        state.error = action.payload; 
      })
      .addMatcher(api.endpoints.sendPhoneValidationCodeRequest.matchPending, (state) => {
        state.error = null;
        state.loading = true;
      })
      .addMatcher(api.endpoints.sendPhoneValidationCodeRequest.matchFulfilled, (state, action) => {
        state.loading = false;
        state.user.phone = action.meta.arg.originalArgs.phone;
      })
      .addMatcher(api.endpoints.sendPhoneValidationCodeRequest.matchRejected, (state, action) => {
        state.error = action.payload
        state.loading = false;
      })
      .addMatcher(api.endpoints.checkPhoneValidationCodeRequest.matchPending, (state) => {
        state.error = null;
        state.loading = true;
      })
      .addMatcher(api.endpoints.checkPhoneValidationCodeRequest.matchFulfilled, (state, action) => {
        state.loading = false;
        state.user.phone_validated = true;
        if (action.payload.user) {
            Object.assign(state.user, action.payload.user);
        }
      })
      .addMatcher(api.endpoints.checkPhoneValidationCodeRequest.matchRejected, (state, action) => {
        state.error = action.payload
        state.loading = false;
      })
      .addMatcher(api.endpoints.validateDriverLicenseRequest.matchPending, (state) => {
        state.error = null;
        state.loading = true;
      })
      .addMatcher(api.endpoints.validateDriverLicenseRequest.matchFulfilled, (state, action) => {
        state.loading = false;
        state.user.driver_license = action.payload.driver_license;
      })
      .addMatcher(api.endpoints.validateDriverLicenseRequest.matchRejected, (state, action) => {
        state.error = action.payload
        state.loading = false;
      })
      .addMatcher(api.endpoints.deleteRegistrationRequest.matchPending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher(api.endpoints.deleteRegistrationRequest.matchFulfilled, (state, action) => {
        state.loading = false;
        Object.assign(state, initialState);
      })
      .addMatcher(api.endpoints.deleteRegistrationRequest.matchRejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setName, setPhone } = registerSlice.actions;

export default registerSlice.reducer;
