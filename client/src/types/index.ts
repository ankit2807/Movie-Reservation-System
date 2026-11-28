export type MovieCategory = 'Movie' | 'Event' | 'Play' | 'Sport' | 'Activity' | 'Stream';

export interface PersonCredit {
  name: string;
  role?: string;
  image?: string;
}

export interface Movie {
  _id: string;
  title: string;
  description: string;
  posterImage: string;
  backdropImage?: string;
  duration: string;
  genre: string;
  languages: string[];
  format?: string;
  type: MovieCategory | string;
  rating: string;
  votes?: string;
  tagline?: string;
  releaseDate: string;
  certification?: string;
  cast?: PersonCredit[];
  crew?: PersonCredit[];
  tmdbId?: number;
  mediaType?: 'movie' | 'tv';
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  gender?: 'Male' | 'Female' | 'Other' | '';
  isMarried?: boolean;
  birthday?: string;
  isAdmin?: boolean;
  role?: 'admin' | 'user';
  createdAt?: string;
  updatedAt?: string;
}

export interface ShowTime {
  _id: string;
  startAt: string;
  format?: string;
  price?: number;
  theatre?: string;
  screen?: string;
  startDate?: string;
  endDate?: string;
  movieId?: Movie | string;
}

export interface ShowTierSummary {
  label: string;
  price: number;
  status: string;
}

export interface TheatreShow {
  _id: string;
  time: string;
  startAt: string;
  format: string;
  language: string;
  screen: string;
  status: 'AVAILABLE' | 'FAST_FILLING' | 'ALMOST_FULL' | string;
  price: number;
  tiers: ShowTierSummary[];
}

export interface Theatre {
  id: string;
  chain?: string;
  name: string;
  address: string;
  tags: string[];
  cancellable: boolean;
  facilities: string[];
  shows: TheatreShow[];
}

export interface SeatTier {
  tier: string;
  label: string;
  price: number;
  rows: string[];
  blocks: number[];
  isRecliner: boolean;
}

export interface SeatDetail {
  seat: string;
  tier: string;
  price: number;
}

export interface FoodMenuItem {
  id: string;
  name: string;
  desc: string;
  price: number;
  originalPrice: number;
  category: string;
  veg: boolean;
  bestseller: boolean;
  image: string;
}

export interface FoodLineItem {
  id: string;
  name: string;
  qty: number;
  price: number;
}

export interface ReservationAmounts {
  tickets: number;
  convenienceFee: number;
  gst: number;
  food: number;
  discount: number;
  total: number;
}

export interface TheatreSnapshot {
  id?: string;
  name?: string;
  address?: string;
  screen?: string;
}

export interface Reservation {
  _id: string;
  user?: string | User;
  movie?: Movie | string;
  showtime?: ShowTime | string;
  showKey?: string;
  bookingId?: string;
  status?: 'CONFIRMED' | 'CANCELLED';
  cancelledAt?: string;
  refundAmount?: number;
  movieRef?: string;
  movieTitle?: string;
  posterImage?: string;
  certification?: string;
  language?: string;
  format?: string;
  theatre?: TheatreSnapshot;
  showDate?: string;
  showTime?: string;
  showDateTime?: string;
  seatDetails?: SeatDetail[];
  food?: FoodLineItem[];
  amounts?: ReservationAmounts;
  promoCode?: string;
  paymentMethod?: string;
  paymentProvider?: 'STRIPE' | 'DEMO';
  paymentStatus?: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
  paymentIntentId?: string;
  stripeRefundId?: string;
  contact?: {
    email?: string;
    phone?: string;
  };
  seats: string[];
  date: string;
  createdAt?: string;
  updatedAt?: string;
  message?: string;
}

export interface Review {
  _id: string;
  movieId?: string;
  user?: {
    _id?: string;
    name?: string;
  };
  rating: number;
  comment: string;
  hashtags?: string;
  likes?: number;
  timeAgo?: string;
  createdAt?: string;
}

export interface TrailerItem {
  videoId: string;
  title: string;
  language: string;
}

export interface OfferItem {
  id: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  code: string;
  logo: string;
  description: string;
  terms: string[];
}

export interface CityInfo {
  name: string;
  state: string;
  aliases: string[];
}

export interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export interface PaymentConfig {
  stripeEnabled: boolean;
  publishableKey: string | null;
  currency: string;
  mode: 'demo' | 'test' | 'live';
}

export interface AdminRecentBooking {
  _id: string;
  bookingId: string;
  status: string;
  customerName: string;
  customerEmail: string;
  movieTitle: string;
  theatreName: string;
  showDate: string;
  showTime: string;
  seats: string[];
  total: number;
  createdAt?: string;
}

export interface AdminStats {
  totalMovies: number;
  totalUsers: number;
  totalShowtimes: number;
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  totalSeatsSold: number;
  totalRevenue: number;
  categoryBreakdown: Record<string, number>;
  recentBookings: AdminRecentBooking[];
}

export interface ApiErrorResponse {
  message?: string;
  takenSeats?: string[];
}

export function getApiErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (typeof err === 'object' && err !== null) {
    const axiosErr = err as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    if (axiosErr.response?.data?.message) {
      return axiosErr.response.data.message;
    }
    if (axiosErr.message) {
      return axiosErr.message;
    }
  }
  return fallback;
}
