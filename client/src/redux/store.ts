import { configureStore } from '@reduxjs/toolkit';
import authReducer, { AuthState } from './authSlice';
import movieReducer from './movieSlice';
import locationReducer from './locationSlice';
import type { User } from '../types';

const loadState = (): AuthState | undefined => {
  try {
    const serializedState = localStorage.getItem('authState');
    if (serializedState === null) {
      return undefined;
    }
    const parsed = JSON.parse(serializedState) as {
      user?: User | null;
      isAuthenticated?: boolean;
    } | null;
    return {
      user: parsed?.user || null,
      isAuthenticated: Boolean(parsed?.isAuthenticated && parsed?.user),
      authChecked: false,
      loading: false,
      error: null,
      isAuthModalOpen: false,
    };
  } catch {
    return undefined;
  }
};

const saveState = (authState: AuthState): void => {
  try {
    const persisted = {
      user: authState?.user || null,
      isAuthenticated: Boolean(authState?.isAuthenticated && authState?.user),
    };
    localStorage.setItem('authState', JSON.stringify(persisted));
  } catch {
    // ignore write errors
  }
};

const preloadedAuth: AuthState = loadState() || {
  user: null,
  isAuthenticated: false,
  authChecked: false,
  loading: false,
  error: null,
  isAuthModalOpen: false,
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    movie: movieReducer,
    location: locationReducer,
  },
  preloadedState: {
    auth: preloadedAuth,
  },
});

store.subscribe(() => {
  saveState(store.getState().auth);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
