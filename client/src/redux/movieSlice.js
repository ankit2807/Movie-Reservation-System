import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    movies: [],
    movieDetails: null,
    showtimes: [],
    loading: false,
    error: null,
    searchQuery: '',
};

const movieSlice = createSlice({
    name: 'movie',
    initialState,
    reducers: {
        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload;
        },
        fetchMoviesStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchMoviesSuccess: (state, action) => {
            state.loading = false;
            state.movies = action.payload;
        },
        fetchMoviesFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        fetchMovieDetailsSuccess: (state, action) => {
            state.loading = false;
            state.movieDetails = action.payload;
        },
        fetchShowtimesSuccess: (state, action) => {
            state.loading = false;
            state.showtimes = action.payload;
        },
    },
});

export const {
    setSearchQuery,
    fetchMoviesStart,
    fetchMoviesSuccess,
    fetchMoviesFailure,
    fetchMovieDetailsSuccess,
    fetchShowtimesSuccess,
} = movieSlice.actions;

export default movieSlice.reducer;
