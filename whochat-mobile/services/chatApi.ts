import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Constants from 'expo-constants';

interface ConnectResponse {
  message: string;
  your_id: string;
  partner_id?: string;
}

interface SendMessageRequest {
  message: string;
  from: string;
  to: string;
}

interface DisconnectRequest {
  user_id: string;
}

interface ReconnectRequest {
  user_id: string;
}

interface ReconnectResponse {
  message: string;
  your_id: string;
  partner_id?: string;
}

interface StatusResponse {
  online_users: number;
  waiting_users: number;
}

const BACKEND_URL = Constants.expoConfig?.extra?.BACKEND_URL;


export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: fetchBaseQuery({ baseUrl: BACKEND_URL }), 
  endpoints: (builder) => ({
    connectUser: builder.mutation<ConnectResponse, void>({
      query: () => ({
        url: '/connect',
        method: 'POST',
      }),
    }),
    sendMessage: builder.mutation<void, SendMessageRequest>({
      query: (body) => ({
        url: '/send',
        method: 'POST',
        body,
      }),
    }),
    disconnectUser: builder.mutation<void, DisconnectRequest>({
      query: (body) => ({
        url: '/disconnect',
        method: 'POST',
        body,
      }),
    }),
    reconnectUser: builder.mutation<ReconnectResponse, ReconnectRequest>({
      query: (body) => ({
        url: '/reconnect',
        method: 'POST',
        body,
      }),
    }),
    fetchStatus: builder.query<StatusResponse, void>({
      query: () => '/status',
    }),
    sendHeartbeat: builder.mutation({
      query: ({ user_id }) => ({
        url: '/heartbeat',
        method: 'POST',
        body: { user_id },
      }),
    }),
  }),
});

export const {
  useConnectUserMutation,
  useSendMessageMutation,
  useDisconnectUserMutation,
  useReconnectUserMutation,
  useFetchStatusQuery,
  useSendHeartbeatMutation 
} = chatApi;
