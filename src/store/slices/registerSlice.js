import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import api from '../../services/api'; 
import { registerTaxId, sendPhoneValidationCode, checkPhoneValidationCode, validateDriverLicense, deleteRegistration } from '../../services/mockData';

// ==============================================================================
// 1. THUNKS (Ações Assíncronas)
// ==============================================================================

/**
 * Checks the initial registration status for a given Tax ID.
 *
 * Expected success responses:
 * 1. For a registered user: `{ success: true, register_step: "registered" }`
 * 2. For an in-progress registration: `{ success: true, data: { user: { register_step: '<step>', name: '<masked_name>' } } }`
 * 3. For a new user: `{ success: true, data: { user: { register_step: 'new' } } }`
 */
export const registerTaxIdRequest = createAsyncThunk(
  'auth/registerTaxIdRequest',
  async ({ tax_id }, { rejectWithValue }) => {
    try {
      const response = await registerTaxId(tax_id);
      console.log('Resposta do register', response);
      
      // The Redux Toolkit will pass this return to the 'fulfilled' action.payload
      return response.data;
    } catch (error) {
      console.log('Erro no loginRequest:', error);
      // Fetches the error message from the API or uses a generic one
      // const errorMessage = error.response?.message || 'Falha ao realizar register.';
      return rejectWithValue(error);
    }
  }
);

/**
 * Requests a validation code to be sent to the user's phone.
 * The thunk pulls `tax_id` and `name` from the state.
 * Expected success response: `{ success: true }`
 */
export const sendPhoneValidationCodeRequest = createAsyncThunk(
  'auth/sendPhoneValidationCodeRequest',
  async ({ phone }, { rejectWithValue, getState }) => {
    const tax_id = getState().register.user.tax_id;
    const name = getState().register.user.name;
    try {
      const response = await sendPhoneValidationCode(tax_id, name, phone);
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

/**
 * Sends the phone validation code to the API for verification.
 * Expected success response: `{ success: true, data: { user: { id, tax_id, name, phone } }, message: null }`
 */
export const checkPhoneValidationCodeRequest = createAsyncThunk(
  'auth/checkPhoneValidationCodeRequest',
  async ({ code }, { rejectWithValue, getState }) => {
    const tax_id = getState().register.user.tax_id;
    const name = getState().register.user.name;
    const phone = getState().register.user.phone;
    try {
      const response = await checkPhoneValidationCode(tax_id, name, phone, code);
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

/**
 * Validates the driver's license number against the user's tax_id.
 * Expected success response: `{ success: true, message: null }`
 */
export const validateDriverLicenseRequest = createAsyncThunk(
  'auth/validateDriverLicenseRequest',
  async ({ driver_license, device }, { rejectWithValue, getState }) => {
    try {
      const tax_id = getState().register.user.tax_id;
      // The user wants me to adjust the returns, so I'm commenting the fetch, not implementing it.
      await validateDriverLicense(tax_id, driver_license, device);
      console.log(`Mock validation for tax_id: ${tax_id}, driver_license: ${driver_license}, device: ${device}`);
      return { driver_license };
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

/**
 * Deletes an in-progress registration attempt for a given tax_id.
 * Expected success response: `{ success: true }`
 */
export const deleteRegistrationRequest = createAsyncThunk(
  'auth/deleteRegistrationRequest',
  async ({ tax_id }, { rejectWithValue }) => {
    try {
      await deleteRegistration(tax_id);
      return { tax_id };
    } catch (error) {
      return rejectWithValue(error.message || 'Error deleting registration.');
    }
  }
);

// ==============================================================================
// 2. SLICE (Estado e Reducers)
// ==============================================================================

const initialState = {
  error: null,      // Armazena msg de erro para exibir na UI se precisar
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
    // avatar: null, // Se tiver no futuro
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
      .addCase(registerTaxIdRequest.pending, (state) => {
        state.error = null;

      })
      .addCase(registerTaxIdRequest.fulfilled, (state, action) => {
        // The tax_id is passed as an argument to the thunk
        state.user.tax_id = action.meta.arg.tax_id;
        // Other user data might come in different shapes depending on the response
        if (action.payload.data && action.payload.data.user) {
            state.user.id = action.payload.data.user.id; // if available
        }
      })
      .addCase(registerTaxIdRequest.rejected, (state, action) => {
        state.error = action.payload; // "Senha incorreta", etc.
      })
      .addCase(sendPhoneValidationCodeRequest.pending, (state) => {
        state.error = null;
        state.loading = true;
      })
      .addCase(sendPhoneValidationCodeRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.user.phone = action.meta.arg.phone;
      })
      .addCase(sendPhoneValidationCodeRequest.rejected, (state, action) => {
        state.error = action.payload
        state.loading = false;
      })
      .addCase(checkPhoneValidationCodeRequest.pending, (state) => {
        state.error = null;
        state.loading = true;
      })
      .addCase(checkPhoneValidationCodeRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.user.phone_validated = true;
        if (action.payload.data && action.payload.data.user) {
            Object.assign(state.user, action.payload.data.user);
        }
      })
      .addCase(checkPhoneValidationCodeRequest.rejected, (state, action) => {
        state.error = action.payload
        state.loading = false;
      })
      .addCase(validateDriverLicenseRequest.pending, (state) => {
        state.error = null;
        state.loading = true;
      })
      .addCase(validateDriverLicenseRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.user.driver_license = action.payload.driver_license;
      })
      .addCase(validateDriverLicenseRequest.rejected, (state, action) => {
        state.error = action.payload
        state.loading = false;
      })
      .addCase(deleteRegistrationRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRegistrationRequest.fulfilled, (state, action) => {
        state.loading = false;
        // Reset state to initial values, effectively starting the registration over
        Object.assign(state, initialState);
      })
      .addCase(deleteRegistrationRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  },
});

export const { clearError, setName, setPhone } = registerSlice.actions;

export default registerSlice.reducer;