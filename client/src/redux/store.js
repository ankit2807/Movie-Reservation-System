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
        return JSON.parse(serializedState);
    } catch (err) {
        return undefined;
    }
};

const saveState = (state) => {
    try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem('authState', serializedState);
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
    }
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
