import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { secureStorage } from './secureStorage';
import { getDeviceId } from './deviceInfo';
import uuid from 'react-native-uuid';
import {
  appointmentsAPICall,
  chatsAPICall,
  deleteRegistration,
  uploadDocument,
  validateDocument,
  getDocument
} from './mockData';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://10.0.2.2:8000/api/v1/mobile',
    prepareHeaders: async (headers) => {
      const token = await secureStorage.getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      // 2. Injeta o Device ID
      const deviceId = await getDeviceId();
      if (deviceId) {
        headers.set('X-Device-ID', deviceId); // O nome tem que bater com o alias do FastAPI
      }
      return headers;
    },
  }),
  tagTypes: ['Appointments', 'Chat', 'Document', 'Register', 'Auth'],
  endpoints: (builder) => ({
    // --- AUTH ---
    login: builder.mutation({
      queryFn: async ({ tax_id, password }, _api, _extraOptions, fetchWithBQ) => {
        const device = await getDeviceId();
        if (!device) return { error: { status: 500, data: { error: { code: 'DEVICE_ID_ERROR' } } } };

        const response = await fetchWithBQ({
          url: '/auth/login',
          method: 'POST',
          body: { tax_id, password, device }
        });

        if (response.error) return { error: response.error };
        return { data: response.data.data };
      },
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          await secureStorage.saveCredentials(data.token, data.user.tax_id);
        } catch (err) {}
      }
    }),
    
    restoreSession: builder.mutation({
      queryFn: async (_, _api, _extraOptions, fetchWithBQ) => {
        const token = await secureStorage.getToken();
        const savedTaxId = await secureStorage.getTaxId();

        if (!token) {
          return { error: { status: 401, data: { error: { code: 'NO_TOKEN_FOUND', message: 'Token não encontrado' } } } };
        }

        const response = await fetchWithBQ({
          url: '/auth/session/restore', // ou '/auth/session/restore' dependendo da sua URL base
          method: 'POST'
        });

        if (response.error) {
          // Se for erro de internet (backend fora do ar ou sem wifi)
          if (response.error.status === 'FETCH_ERROR') {
            return { data: { user: null, token, isOffline: true, savedTaxId } };
          }
          
          // Qualquer outro erro HTTP (401, 422, 500...), recusa a sessão
          await secureStorage.clearToken();
          return { error: { status: response.error.status, data: response.error.data, savedTaxId } };
        }

        return { data: { user: response.data.data.user, token, isOffline: false } };
      }
    }),

    // --- CHECKIN ---
    checkinRequest: builder.mutation({
      query: (terminal_id) => ({
        url: `/checkin/${terminal_id}`,
        method: 'POST',
        timeout: process.env.CHECKIN_TIMEOUT ? parseInt(process.env.CHECKIN_TIMEOUT, 10) : 30000,
      }),
      // invalidatesTags: ['Appointments'],
    }),

    // --- APPOINTMENTS ---
    fetchAppointmentsData: builder.query({
      queryFn: async (user_id) => {
        try {
          console.log('Fetching appointments data...');
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
      query: ({ tax_id }) => ({
        url: '/check-status',
        method: 'POST',
        body: { tax_id }
      }),
      invalidatesTags: ['Register']
    }),
    
    sendPhoneValidationCodeRequest: builder.mutation({
      query: ({ tax_id, name, phone }) => ({
        url: '/auth/otp/send',
        method: 'POST',
        body: { tax_id, name, phone }
      }),
      invalidatesTags: ['Register']
    }),
    
    checkPhoneValidationCodeRequest: builder.mutation({
      query: ({ tax_id, name, phone, code }) => ({
        url: '/auth/otp/verify',
        method: 'POST',
        body: { tax_id, name, phone, code }
      }),
      invalidatesTags: ['Register']
    }),
    
    validateDriverLicenseRequest: builder.mutation({
      queryFn: async ({ tax_id, driver_license, device, from_login }, _api, _extraOptions, fetchWithBQ) => {
        const actualDevice = device || await getDeviceId();
        const response = await fetchWithBQ({
          url: '/auth/driver-license/validate',
          method: 'POST',
          body: { tax_id, driver_license, device: actualDevice, from_login: from_login || false }
        });
        
        if (response.error) return { error: response.error };
        return { data: { driver_license } };
      },
      invalidatesTags: ['Register']
    }),

    // Endpoint mapeado do backend para finalizar o registro com a senha
    registerFinalizeRequest: builder.mutation({
      queryFn: async ({ tax_id, password }, _api, _extraOptions, fetchWithBQ) => {
        const device = await getDeviceId();
        const response = await fetchWithBQ({
          url: '/auth/register',
          method: 'POST',
          body: { tax_id, password, device }
        });
        
        if (response.error) return { error: response.error };
        return { data: response.data.data };
      },
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          await secureStorage.saveCredentials(data.token, data.user.tax_id);
        } catch (err) {}
      },
      invalidatesTags: ['Register', 'Auth']
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
  useCheckinRequestMutation,
  useFetchAppointmentsDataQuery,
  useLazyFetchAppointmentsDataQuery,
  useFetchChatDataQuery,
  useLazyFetchChatDataQuery,
  useSendMessageToServerMutation,
  useRegisterTaxIdRequestMutation,
  useSendPhoneValidationCodeRequestMutation,
  useCheckPhoneValidationCodeRequestMutation,
  useValidateDriverLicenseRequestMutation,
  useRegisterFinalizeRequestMutation,
  useDeleteRegistrationRequestMutation,
  useUploadDocumentAsyncMutation,
  useValidateDocumentAsyncMutation,
  useGetDocumentAsyncQuery,
  useLazyGetDocumentAsyncQuery
} = api;