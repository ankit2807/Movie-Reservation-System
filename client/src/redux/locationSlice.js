import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    currentCity: localStorage.getItem('currentCity') || 'New Delhi',
    cities: ['New Delhi', 'Mumbai', 'Bengaluru', 'Chennai', 'Pune', 'Hyderabad', 'Kolkata']
};

const locationSlice = createSlice({
    name: 'location',
    initialState,
    reducers: {
        setCity: (state, action) => {
            state.currentCity = action.payload;
            localStorage.setItem('currentCity', action.payload);
        },
    },
});

export const { setCity } = locationSlice.actions;
export default locationSlice.reducer;
