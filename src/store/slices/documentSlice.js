// store/slices/documentSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { uploadDocument, validateDocument, getDocument } from '../../services/mockData';

// AsyncThunks
export const uploadDocumentAsync = createAsyncThunk(
  'document/upload',
  async (documentData, { rejectWithValue }) => {
    try {
      const response = await uploadDocument(documentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const validateDocumentAsync = createAsyncThunk(
  'document/validate',
  async (documentId, { rejectWithValue }) => {
    try {
      const response = await validateDocument(documentId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getDocumentAsync = createAsyncThunk(
  'document/get',
  async (documentId, { rejectWithValue }) => {
    try {
      const response = await getDocument(documentId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  currentDocument: null,
  uploadStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  validationStatus: 'idle',
  error: null,
  uploadProgress: 0,
};

const documentSlice = createSlice({
  name: 'document',
  initialState,
  reducers: {
    resetDocumentState: (state) => {
      state.currentDocument = null;
      state.uploadStatus = 'idle';
      state.validationStatus = 'idle';
      state.error = null;
      state.uploadProgress = 0;
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Upload Document
      .addCase(uploadDocumentAsync.pending, (state) => {
        state.uploadStatus = 'loading';
        state.error = null;
        state.uploadProgress = 0;
      })
      .addCase(uploadDocumentAsync.fulfilled, (state, action) => {
        state.uploadStatus = 'succeeded';
        state.currentDocument = action.payload;
        state.uploadProgress = 100;
        state.error = null;
      })
      .addCase(uploadDocumentAsync.rejected, (state, action) => {
        state.uploadStatus = 'failed';
        state.error = action.payload || 'Erro ao fazer upload do documento';
        state.uploadProgress = 0;
      })
      
      // Validate Document
      .addCase(validateDocumentAsync.pending, (state) => {
        state.validationStatus = 'loading';
      })
      .addCase(validateDocumentAsync.fulfilled, (state, action) => {
        state.validationStatus = 'succeeded';
        if (state.currentDocument) {
          state.currentDocument.status = action.payload.status;
          state.currentDocument.validatedAt = action.payload.validatedAt;
        }
      })
      .addCase(validateDocumentAsync.rejected, (state, action) => {
        state.validationStatus = 'failed';
        state.error = action.payload || 'Erro ao validar documento';
      })
      
      // Get Document
      .addCase(getDocumentAsync.pending, (state) => {
        state.uploadStatus = 'loading';
      })
      .addCase(getDocumentAsync.fulfilled, (state, action) => {
        state.uploadStatus = 'succeeded';
        state.currentDocument = action.payload;
      })
      .addCase(getDocumentAsync.rejected, (state, action) => {
        state.uploadStatus = 'failed';
        state.error = action.payload || 'Erro ao buscar documento';
      });
  },
});

export const { resetDocumentState, setUploadProgress, clearError } = documentSlice.actions;

// Selectors
export const selectCurrentDocument = (state) => state.document.currentDocument;
export const selectUploadStatus = (state) => state.document.uploadStatus;
export const selectValidationStatus = (state) => state.document.validationStatus;
export const selectDocumentError = (state) => state.document.error;
export const selectUploadProgress = (state) => state.document.uploadProgress;

export default documentSlice.reducer;