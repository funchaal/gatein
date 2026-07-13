import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { secureStorage } from './secureStorage';
import { getDeviceId } from './deviceInfo';

/**
 * servicesApi — RTK Query slice dedicated to company services and service auth.
 *
 * Endpoints:
 *  - fetchCompanyServices   : GET /companies/:id/services
 *  - generateIntegrationAuthToken : GET /services/auth-token
 */
export const servicesApi = createApi({
  reducerPath: 'servicesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://192.168.0.4:8000/api/mobile',
    prepareHeaders: async (headers) => {
      const token = await secureStorage.getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      const deviceId = await getDeviceId();
      if (deviceId) {
        headers.set('X-Device-ID', deviceId);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // Lists all active services offered by a given company
    fetchCompanyServices: builder.query({
      query: (company_id) => ({
        url: `/companies/${company_id}/services`,
        method: 'GET'
      })
    }),

    // Generates a short-lived JWT token (3 min) used to authenticate the user
    // on company-hosted external service pages (handshake flow)
    generateIntegrationAuthToken: builder.query({
      query: () => ({
        url: '/services/auth-token',
        method: 'GET'
      })
    }),
  })
});

export const {
  useFetchCompanyServicesQuery,
  useLazyGenerateIntegrationAuthTokenQuery,
} = servicesApi;
