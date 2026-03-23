import { createSlice } from '@reduxjs/toolkit';

// City data with states for search display
const CITY_DATA = [
    // Popular cities
    { name: 'Mumbai', state: 'Maharashtra', aliases: ['Bombay'] },
    { name: 'Delhi-NCR', state: 'Delhi', aliases: ['New Delhi', 'Noida', 'Gurgaon', 'Gurugram', 'Faridabad', 'Ghaziabad'] },
    { name: 'Bengaluru', state: 'Karnataka', aliases: ['Bangalore'] },
    { name: 'Hyderabad', state: 'Telangana', aliases: [] },
    { name: 'Chandigarh', state: 'Chandigarh', aliases: [] },
    { name: 'Ahmedabad', state: 'Gujarat', aliases: [] },
    { name: 'Pune', state: 'Maharashtra', aliases: [] },
    { name: 'Chennai', state: 'Tamil Nadu', aliases: ['Madras'] },
    { name: 'Kolkata', state: 'West Bengal', aliases: ['Calcutta'] },
    { name: 'Kochi', state: 'Kerala', aliases: ['Cochin'] },
    // Other cities
    { name: 'Agra', state: 'Uttar Pradesh', aliases: [] },
    { name: 'Amritsar', state: 'Punjab', aliases: [] },
    { name: 'Bhopal', state: 'Madhya Pradesh', aliases: [] },
    { name: 'Bhubaneswar', state: 'Odisha', aliases: [] },
    { name: 'Coimbatore', state: 'Tamil Nadu', aliases: [] },
    { name: 'Goa', state: 'Goa', aliases: ['Panaji'] },
    { name: 'Guwahati', state: 'Assam', aliases: [] },
    { name: 'Indore', state: 'Madhya Pradesh', aliases: [] },
    { name: 'Jaipur', state: 'Rajasthan', aliases: [] },
    { name: 'Kanpur', state: 'Uttar Pradesh', aliases: [] },
    { name: 'Lucknow', state: 'Uttar Pradesh', aliases: [] },
    { name: 'Ludhiana', state: 'Punjab', aliases: [] },
    { name: 'Madurai', state: 'Tamil Nadu', aliases: [] },
    { name: 'Nagpur', state: 'Maharashtra', aliases: [] },
    { name: 'New Delhi', state: 'Delhi', aliases: [] },
    { name: 'Patna', state: 'Bihar', aliases: [] },
    { name: 'Raipur', state: 'Chhattisgarh', aliases: [] },
    { name: 'Rajkot', state: 'Gujarat', aliases: [] },
    { name: 'Surat', state: 'Gujarat', aliases: [] },
    { name: 'Thiruvananthapuram', state: 'Kerala', aliases: ['Trivandrum'] },
    { name: 'Vadodara', state: 'Gujarat', aliases: ['Baroda'] },
    { name: 'Varanasi', state: 'Uttar Pradesh', aliases: ['Banaras', 'Kashi'] },
    { name: 'Vijayawada', state: 'Andhra Pradesh', aliases: [] },
    { name: 'Visakhapatnam', state: 'Andhra Pradesh', aliases: ['Vizag'] },
];

const initialState = {
    currentCity: localStorage.getItem('currentCity') || '',
    hasSelectedCity: localStorage.getItem('hasSelectedCity') === 'true',
    detectionStatus: 'idle', // 'idle' | 'detecting' | 'success' | 'error'
    detectionError: null,
    toast: null, // { message, type: 'success' | 'error' | 'info' }
    cities: CITY_DATA,
};

const locationSlice = createSlice({
    name: 'location',
    initialState,
    reducers: {
        setCity: (state, action) => {
            const previousCity = state.currentCity;
            state.currentCity = action.payload;
            state.hasSelectedCity = true;
            localStorage.setItem('currentCity', action.payload);
            localStorage.setItem('hasSelectedCity', 'true');

            // Show toast if city changed
            if (previousCity && previousCity !== action.payload) {
                state.toast = {
                    message: `Your location is updated to ${action.payload}`,
                    type: 'success',
                };
            } else if (!previousCity) {
                state.toast = {
                    message: `Location set to ${action.payload}`,
                    type: 'success',
                };
            }
        },
        setDetectionStatus: (state, action) => {
            state.detectionStatus = action.payload;
        },
        setDetectionError: (state, action) => {
            state.detectionError = action.payload;
            state.detectionStatus = 'error';
        },
        showToast: (state, action) => {
            state.toast = action.payload;
        },
        clearToast: (state) => {
            state.toast = null;
        },
    },
});

export const { setCity, setDetectionStatus, setDetectionError, showToast, clearToast } = locationSlice.actions;
export { CITY_DATA };
export default locationSlice.reducer;
