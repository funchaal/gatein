import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { secureStorage } from './secureStorage';
import { getDeviceId } from './deviceInfo';
import uuid from 'react-native-uuid';
import {
  activityAPICall,
  chatsAPICall,
  deleteRegistration,
  uploadDocument,
  validateDocument,
  getDocument
} from './mockData';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://192.168.0.4:8000/api/mobile',
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
  tagTypes: ['Activity', 'Chat', 'Document', 'Register', 'Auth'],
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
        } catch (err) { }
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
      // invalidatesTags: ['Activity'],
    }),

    // --- ACTIVITY ---
    fetchActivityData: builder.query({
      query: ({ status_filter, limit, offset }) => ({
        url: '/activities',
        method: 'GET',
        params: { status_filter, limit, offset }
      }),
      // Desativa a mesclagem automática do RTK Query já que você faz isso manualmente no slice
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      }
    }),

    logActivityEvents: builder.mutation({
      query: ({ events }) => ({
        url: '/activities/log-events',
        method: 'POST',
        body: { events }
      })
    }),

    logAnnouncementEvents: builder.mutation({
      query: ({ events }) => ({
        url: '/announcements/log-events',
        method: 'POST',
        body: { events }
      })
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
        url: '/auth/check-status',
        method: 'POST',
        body: { tax_id }
      }),
      invalidatesTags: ['Register']
    }),

    sendPhoneValidationCodeRequest: builder.mutation({
      query: ({ tax_id, name, phone }) => ({
        url: '/auth/otp/send',
        method: 'POST',
        body: { tax_id, phone }
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
      queryFn: async ({ tax_id, driver_license, from_login }, _api, _extraOptions, fetchWithBQ) => {
        const device = await getDeviceId();

        const response = await fetchWithBQ({
          url: '/auth/driver-license/validate',
          method: 'POST',
          body: { tax_id, driver_license, device, from_login: !!from_login }
        });

        return response;
      },
      invalidatesTags: ['Register']
    }),

    // Endpoint mapeado do backend para finalizar o registro com a senha
    registerRequest: builder.mutation({
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
        } catch (err) { }
      },
      invalidatesTags: ['Register', 'Auth']
    }),

    deleteRegistrationRequest: builder.mutation({
      query: ({ tax_id }) => ({
        url: 'auth/register-request',
        method: 'DELETE',
        body: { tax_id }
      }),
      invalidatesTags: ['Register']
    }),

    // --- COMPANIES & ANNOUNCEMENTS ---
    fetchInitialCompanies: builder.query({
      query: ({ lat, lng }) => ({
        url: '/companies/initial',
        method: 'GET',
        params: { lat, lng }
      })
    }),
    fetchActiveAnnouncements: builder.query({
      query: ({ lat, lng } = {}) => ({
        url: '/announcements',
        method: 'GET',
        params: { lat, lng }
      })
    }),
    fetchNearbyCompanies: builder.query({
      query: ({ lat, lng, radius_km = 50 }) => ({
        url: '/companies/nearby',
        method: 'GET',
        params: { lat, lng, radius_km }
      })
    }),
    searchCompanies: builder.query({
      query: ({ q, lat, lng }) => ({
        url: '/companies/search',
        method: 'GET',
        params: { q, lat, lng }
      })
    }),

    // --- SECURITY ---
    verifyCurrentPassword: builder.mutation({
      query: ({ current_password }) => ({
        url: '/password/reset/verify',
        method: 'POST',
        body: { current_password }
      })
    }),
    changePassword: builder.mutation({
      query: ({ new_password, token }) => ({
        url: '/password/change',
        method: 'POST',
        body: { new_password },
        headers: {
          'X-Password-Reset-Token': token
        }
      })
    }),
    forgotPassword: builder.mutation({
      queryFn: async ({ tax_id, driver_license }, _api, _extraOptions, fetchWithBQ) => {
        const device = await getDeviceId();
        const response = await fetchWithBQ({
          url: '/password/forgot',
          method: 'POST',
          body: { tax_id, driver_license, device }
        });
        return response;
      }
    }),
    validateForgotPasswordCode: builder.mutation({
      queryFn: async ({ tax_id, code }, _api, _extraOptions, fetchWithBQ) => {
        const device = await getDeviceId();
        const response = await fetchWithBQ({
          url: '/password/validate-code',
          method: 'POST',
          body: { tax_id, device, code }
        });
        return response;
      }
    }),
    updateProfilePhone: builder.mutation({
      query: ({ phone, code }) => ({
        url: '/auth/profile/phone/verify',
        method: 'POST',
        body: { phone, code }
      })
    }),
    sendEmailValidationCode: builder.mutation({
      query: ({ email }) => ({
        url: '/auth/profile/email/send-code',
        method: 'POST',
        body: { email }
      })
    }),
    verifyEmailValidationCode: builder.mutation({
      query: ({ email, code }) => ({
        url: '/auth/profile/email/verify',
        method: 'POST',
        body: { email, code }
      })
    }),
  })
});

export const {
  useLoginMutation,
  useRestoreSessionMutation,
  useCheckinRequestMutation,
  useFetchActivityDataQuery,
  useLazyFetchActivityDataQuery,
  useFetchChatDataQuery,
  useLazyFetchChatDataQuery,
  useSendMessageToServerMutation,
  useRegisterTaxIdRequestMutation,
  useSendPhoneValidationCodeRequestMutation,
  useCheckPhoneValidationCodeRequestMutation,
  useValidateDriverLicenseRequestMutation,
  useRegisterRequestMutation,
  useDeleteRegistrationRequestMutation,
  useFetchInitialCompaniesQuery,
  useFetchActiveAnnouncementsQuery,
  useLazyFetchActiveAnnouncementsQuery,
  useFetchNearbyCompaniesQuery,
  useLazySearchCompaniesQuery,
  useVerifyCurrentPasswordMutation,
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useValidateForgotPasswordCodeMutation,
  useUpdateProfilePhoneMutation,
  useSendEmailValidationCodeMutation,
  useVerifyEmailValidationCodeMutation,
  useLogActivityEventsMutation,
  useLogAnnouncementEventsMutation
} = api;
