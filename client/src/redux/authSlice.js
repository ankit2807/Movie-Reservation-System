import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null,
    isAuthenticated: false,
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
        loginSuccess: (state, action) => {
            state.loading = false;
            state.isAuthenticated = true;
            state.user = action.payload;
        },
        loginFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
        },
        setAuthModalOpen: (state, action) => {
            state.isAuthModalOpen = action.payload;
        },
    },
});

export const { loginStart, loginSuccess, loginFailure, logout, setAuthModalOpen } = authSlice.actions;

export default authSlice.reducer;
