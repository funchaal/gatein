import { createSlice } from '@reduxjs/toolkit';
import { api } from '../../services/api';

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
      .addMatcher(api.endpoints.uploadDocumentAsync.matchPending, (state) => {
        state.uploadStatus = 'loading';
        state.error = null;
        state.uploadProgress = 0;
      })
      .addMatcher(api.endpoints.uploadDocumentAsync.matchFulfilled, (state, action) => {
        state.uploadStatus = 'succeeded';
        state.currentDocument = action.payload;
        state.uploadProgress = 100;
        state.error = null;
      })
      .addMatcher(api.endpoints.uploadDocumentAsync.matchRejected, (state, action) => {
        state.uploadStatus = 'failed';
        state.error = action.payload || 'Erro ao fazer upload do documento';
        state.uploadProgress = 0;
      })
      
      // Validate Document
      .addMatcher(api.endpoints.validateDocumentAsync.matchPending, (state) => {
        state.validationStatus = 'loading';
      })
      .addMatcher(api.endpoints.validateDocumentAsync.matchFulfilled, (state, action) => {
        state.validationStatus = 'succeeded';
        if (state.currentDocument) {
          state.currentDocument.status = action.payload.status;
          state.currentDocument.validatedAt = action.payload.validatedAt;
        }
      })
      .addMatcher(api.endpoints.validateDocumentAsync.matchRejected, (state, action) => {
        state.validationStatus = 'failed';
        state.error = action.payload || 'Erro ao validar documento';
      })
      
      // Get Document
      .addMatcher(api.endpoints.getDocumentAsync.matchPending, (state) => {
        state.uploadStatus = 'loading';
      })
      .addMatcher(api.endpoints.getDocumentAsync.matchFulfilled, (state, action) => {
        state.uploadStatus = 'succeeded';
        state.currentDocument = action.payload;
      })
      .addMatcher(api.endpoints.getDocumentAsync.matchRejected, (state, action) => {
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