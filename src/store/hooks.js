import { useDispatch, useSelector } from 'react-redux';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const selectAuthToken         = (s) => s.auth.token;
export const selectIsAuthenticated   = (s) => s.auth.isAuthenticated;
export const selectAuthUser          = (s) => s.auth.user;
export const selectAuthError         = (s) => s.auth.error;
export const selectIsAppLoading      = (s) => s.auth.isAppLoading;
export const selectSavedTaxId        = (s) => s.auth.savedTaxId;
export const selectIsDeviceValidated = (s) => s.auth.isDeviceValidated;

// ─── Register ─────────────────────────────────────────────────────────────────
export const selectRegisterUser      = (s) => s.register.user;
export const selectRegisterLoading   = (s) => s.register.loading;
export const selectRegisterError     = (s) => s.register.error;

// ─── Appointments ─────────────────────────────────────────────────────────────
export const selectAppointmentsState = (s) => s.appointments;
export const selectAppointmentsItems = (s) => s.appointments.items;
export const selectAppointmentsStatus= (s) => s.appointments.status;

// ─── Terminals ────────────────────────────────────────────────────────────────
export const selectTerminalsItems    = (s) => s.terminals.items;
export const selectSelectedTerminalId= (s) => s.terminals.selectedTerminalId;

// ─── Chat ─────────────────────────────────────────────────────────────────────
export const selectChatStatus        = (s) => s.chat.status;
export const selectActiveChannelId   = (s) => s.chat.activeChannelId;
export const selectIsChatModalVisible= (s) => s.chat.isChatModalVisible;

// ─── Document ─────────────────────────────────────────────────────────────────
export const selectCurrentDocument   = (s) => s.document.currentDocument;
export const selectUploadStatus      = (s) => s.document.uploadStatus;
export const selectUploadProgress    = (s) => s.document.uploadProgress;
export const selectDocumentError     = (s) => s.document.error;
