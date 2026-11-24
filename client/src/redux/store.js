import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import movieReducer from './movieSlice';
import locationReducer from './locationSlice';

const loadState = () => {
    try {
        const serializedState = localStorage.getItem('authState');
        if (serializedState === null) {
            return undefined;
        }
        const parsed = JSON.parse(serializedState);
        return {
            user: parsed?.user || null,
            isAuthenticated: Boolean(parsed?.isAuthenticated && parsed?.user),
            loading: false,
            error: null,
            isAuthModalOpen: false,
        };
    } catch {
        return undefined;
    }
};

const saveState = (authState) => {
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

const preloadedState = {
    auth: loadState() || {
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        isAuthModalOpen: false,
    },
};

export const store = configureStore({
    reducer: {
        auth: authReducer,
        movie: movieReducer,
        location: locationReducer,
    },
    preloadedState,
});

store.subscribe(() => {
    saveState(store.getState().auth);
});
