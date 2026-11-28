import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Movie, ShowTime } from '../types';

export interface MovieState {
  movies: Movie[];
  movieDetails: Movie | null;
  showtimes: ShowTime[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
}

const initialState: MovieState = {
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
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    fetchMoviesStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchMoviesSuccess: (state, action: PayloadAction<Movie[]>) => {
      state.loading = false;
      state.movies = action.payload;
    },
    fetchMoviesFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchMovieDetailsSuccess: (state, action: PayloadAction<Movie | null>) => {
      state.loading = false;
      state.movieDetails = action.payload;
    },
    fetchShowtimesSuccess: (state, action: PayloadAction<ShowTime[]>) => {
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
