import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { secureStorage } from './secureStorage';
import { getDeviceId } from './deviceInfo';
import uuid from 'react-native-uuid';
import {
  mockLogin,
  mockRestoreSession,
  appointmentsAPICall,
  chatsAPICall,
  registerTaxId,
  sendPhoneValidationCode,
  checkPhoneValidationCode,
  validateDriverLicense,
  deleteRegistration,
  uploadDocument,
  validateDocument,
  getDocument
} from './mockData';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://api.example.com/v1', // Replace with real base URL
    prepareHeaders: async (headers) => {
      const token = await secureStorage.getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Appointments', 'Chat', 'Document', 'Register', 'Auth'],
  endpoints: (builder) => ({
    // --- AUTH ---
    login: builder.mutation({
      queryFn: async ({ tax_id, password }) => {
        try {
          const device = await getDeviceId();
          if (!device) throw { response: { status: 500, data: { error: { code: 'DEVICE_ID_ERROR' } } } };
          const response = await mockLogin(tax_id, password, device);
          return { data: response.data.data };
        } catch (error) {
          return { error: { status: error.response?.status, data: error.response?.data } };
        }
      },
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          await secureStorage.saveCredentials(data.token, data.user.tax_id);
        } catch (err) {}
      }
    }),
    restoreSession: builder.mutation({
      queryFn: async () => {
        try {
          const token = await secureStorage.getToken();
          if (!token) {
            return { error: { status: 401, data: { error: { code: 'NO_TOKEN_FOUND', message: 'Token não encontrado' }, success: false } } };
          }
          const device = await getDeviceId();
          if (!device) throw { response: { status: 500, data: { error: { code: 'DEVICE_ID_ERROR' } } } };
          const response = await mockRestoreSession(token, device);
          return { data: { user: response.data.data.user, token, isOffline: false } };
        } catch (error) {
          if (error.response?.status === 401) {
            await secureStorage.clearToken();
            const savedTaxId = await secureStorage.getTaxId();
            return { error: { status: 401, data: { error: error.response?.data?.error, savedTaxId } } };
          }
          const token = await secureStorage.getToken();
          const savedTaxId = await secureStorage.getTaxId();
          return { data: { user: null, token, isOffline: true, savedTaxId } };
        }
      }
    }),

    // --- APPOINTMENTS ---
    fetchAppointmentsData: builder.query({
      queryFn: async (user_id) => {
        try {
          const response = await appointmentsAPICall(user_id);
          return { data: response.data };
        } catch (error) {
          return { error: error.message };
        }
      },
      providesTags: ['Appointments']
    }),

    // --- CHAT ---
    fetchChatData: builder.query({
      queryFn: async (userId) => {
        try {
          const response = await chatsAPICall(userId);
          return { data: response.data };
        } catch (error) {
          return { error: error.message };
        }
      },
      providesTags: ['Chat']
    }),
    sendMessageToServer: builder.mutation({
      queryFn: async () => {
        try {
          const response = await chatsAPICall('driver_me');
          return { data: response.data };
        } catch (error) {
          return { error: error.message };
        }
      },
      invalidatesTags: ['Chat']
    }),

    // --- REGISTER ---
    registerTaxIdRequest: builder.mutation({
      queryFn: async ({ tax_id }) => {
        try {
          const response = await registerTaxId(tax_id);
          return { data: response.data };
        } catch (error) {
          return { error };
        }
      },
      invalidatesTags: ['Register']
    }),
    sendPhoneValidationCodeRequest: builder.mutation({
      queryFn: async ({ tax_id, name, phone }) => {
        try {
          const response = await sendPhoneValidationCode(tax_id, name, phone);
          return { data: response.data };
        } catch (error) {
          return { error };
        }
      },
      invalidatesTags: ['Register']
    }),
    checkPhoneValidationCodeRequest: builder.mutation({
      queryFn: async ({ tax_id, name, phone, code }) => {
        try {
          const response = await checkPhoneValidationCode(tax_id, name, phone, code);
          return { data: response.data };
        } catch (error) {
          return { error };
        }
      },
      invalidatesTags: ['Register']
    }),
    validateDriverLicenseRequest: builder.mutation({
      queryFn: async ({ tax_id, driver_license, device }) => {
        try {
          await validateDriverLicense(tax_id, driver_license, device);
          return { data: { driver_license } };
        } catch (error) {
          return { error };
        }
      },
      invalidatesTags: ['Register']
    }),
    deleteRegistrationRequest: builder.mutation({
      queryFn: async ({ tax_id }) => {
        try {
          await deleteRegistration(tax_id);
          return { data: { tax_id } };
        } catch (error) {
          return { error: error.message };
        }
      },
      invalidatesTags: ['Register']
    }),

    // --- DOCUMENT ---
    uploadDocumentAsync: builder.mutation({
      queryFn: async (documentData) => {
        try {
          const response = await uploadDocument(documentData);
          return { data: response.data };
        } catch (error) {
          return { error: error.message };
        }
      },
      invalidatesTags: ['Document']
    }),
    validateDocumentAsync: builder.mutation({
      queryFn: async (documentId) => {
        try {
          const response = await validateDocument(documentId);
          return { data: response };
        } catch (error) {
          return { error: error.message };
        }
      },
      invalidatesTags: ['Document']
    }),
    getDocumentAsync: builder.query({
      queryFn: async (documentId) => {
        try {
          const response = await getDocument(documentId);
          return { data: response.data };
        } catch (error) {
          return { error: error.message };
        }
      },
      providesTags: ['Document']
    })
  }),
});

export const {
  useLoginMutation,
  useRestoreSessionMutation,
  useFetchAppointmentsDataQuery,
  useLazyFetchAppointmentsDataQuery,
  useFetchChatDataQuery,
  useLazyFetchChatDataQuery,
  useSendMessageToServerMutation,
  useRegisterTaxIdRequestMutation,
  useSendPhoneValidationCodeRequestMutation,
  useCheckPhoneValidationCodeRequestMutation,
  useValidateDriverLicenseRequestMutation,
  useDeleteRegistrationRequestMutation,
  useUploadDocumentAsyncMutation,
  useValidateDocumentAsyncMutation,
  useGetDocumentAsyncQuery,
  useLazyGetDocumentAsyncQuery
} = api;
