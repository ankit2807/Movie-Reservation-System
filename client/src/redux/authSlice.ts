import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../types';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  authChecked: boolean;
  loading: boolean;
  error: string | null;
  isAuthModalOpen: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  authChecked: false,
  loading: false,
  error: null,
  isAuthModalOpen: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.authChecked = true;
      state.user = action.payload;
    },
    loginFailure: (state, action: PayloadAction<string | null>) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.authChecked = true;
    },
    setAuthChecked: (state) => {
      state.authChecked = true;
    },
    setAuthModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isAuthModalOpen = action.payload;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  setAuthChecked,
  setAuthModalOpen,
} = authSlice.actions;

export default authSlice.reducer;
