import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import api from './api/axios';
import { loginSuccess, logout, setAuthChecked } from './redux/authSlice';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import SubNavbar from './components/SubNavbar';
import Footer from './components/Footer';
import Toast from './components/Toast';
import AuthModal from './components/AuthModal';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import Home from './pages/Home';

const MovieDetails = lazy(() => import('./pages/MovieDetails'));
const MovieMultimedia = lazy(() => import('./pages/MovieMultimedia'));
const BuyTickets = lazy(() => import('./pages/BuyTickets'));
const Booking = lazy(() => import('./pages/Booking'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const SearchResults = lazy(() => import('./pages/SearchResults'));
const MyBookings = lazy(() => import('./pages/MyBookings'));
const Profile = lazy(() => import('./pages/Profile'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AddMovie = lazy(() => import('./pages/admin/AddMovie'));
const AddShowtime = lazy(() => import('./pages/admin/AddShowtime'));
const NotFound = lazy(() => import('./pages/NotFound'));

const RouteLoader = () => (
  <div
    style={{
      minHeight: '55vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#64748b',
      fontSize: '14px',
    }}
  >
    Loading MovieBook...
  </div>
);

const getPageTitle = (pathname, city) => {
  if (pathname === '/' || pathname.startsWith('/explore/home')) {
    return `MovieBook ${city ? `— Movies, Concerts & Events in ${city}` : '— Movie Tickets & Live Events'}`;
  }
  if (pathname === '/movies') return `Movies in ${city || 'Your City'} — MovieBook`;
  if (pathname === '/stream') return 'Premiere Stream — Watch Latest Releases | MovieBook';
  if (pathname === '/events') return `Live Concerts & Comedy Shows in ${city || 'Your City'} | MovieBook`;
  if (pathname === '/plays') return 'Theatre & Stage Plays | MovieBook';
  if (pathname === '/sports') return 'Sports & Stadium Tickets | MovieBook';
  if (pathname === '/activities') return 'Amusement Parks & Fun Activities | MovieBook';
  if (pathname === '/offers') return 'Bank, UPI & Cinema Promo Offers | MovieBook';
  if (pathname === '/gift-cards') return 'Instant Entertainment Gift Cards | MovieBook';
  if (pathname === '/bookings') return 'Your Orders & QR M-Tickets | MovieBook';
  if (pathname === '/profile' || pathname === '/settings') return 'Account Profile | MovieBook';
  if (pathname.startsWith('/booking/')) return 'Select Seats & Checkout | MovieBook';
  if (pathname.startsWith('/admin')) return 'Admin Control Center | MovieBook';
  return 'MovieBook — Movie Tickets, Concerts, Plays & Sports';
};

function AppLayout() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { currentCity } = useSelector((state) => state.location);
  const isBookingPage = location.pathname.startsWith('/booking/');

  useEffect(() => {
    document.title = getPageTitle(location.pathname, currentCity);
    window.scrollTo(0, 0);
  }, [location.pathname, currentCity]);

  // Listen for 401 unauthorized events from Axios interceptor
  useEffect(() => {
    const handleUnauthorized = () => {
      dispatch(logout());
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [dispatch]);

  // Restore customer or admin session from httpOnly JWT cookie once on app boot
  useEffect(() => {
    let isMounted = true;
    api
      .get('/user/session')
      .then((res) => {
        if (!isMounted) return;
        if (res.data?.authenticated && res.data?.user) {
          dispatch(loginSuccess(res.data.user));
        } else {
          dispatch(setAuthChecked());
        }
      })
      .catch(() => {
        if (isMounted) {
          dispatch(setAuthChecked());
        }
      });
    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  return (
    <div className="app">
      {!isBookingPage && <Navbar />}
      {!isBookingPage && <SubNavbar />}
      <AuthModal />
      <ErrorBoundary>
        <Suspense fallback={<RouteLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore/home/:city" element={<Home />} />
            <Route path="/movies" element={<Home type="Movie" />} />
            <Route path="/stream" element={<Home type="Stream" />} />
            <Route path="/events" element={<Home type="Event" />} />
            <Route path="/plays" element={<Home type="Play" />} />
            <Route path="/sports" element={<Home type="Sport" />} />
            <Route path="/activities" element={<Home type="Activity" />} />

            <Route path="/offers" element={<Home pageMode="offers" />} />
            <Route path="/gift-cards" element={<Home pageMode="gift-cards" />} />
            <Route path="/list-your-show" element={<Home pageMode="list-your-show" />} />
            <Route path="/corporates" element={<Home pageMode="corporates" />} />
            <Route path="/rewards" element={<Home pageMode="offers" />} />
            <Route path="/credit-card" element={<Home pageMode="offers" />} />
            <Route path="/notifications" element={<Home pageMode="offers" />} />
            <Route path="/help" element={<Home pageMode="list-your-show" />} />
            <Route path="/bookachange" element={<Home pageMode="corporates" />} />
            <Route path="/contact" element={<Home pageMode="list-your-show" />} />

            <Route path="/search" element={<SearchResults />} />
            <Route path="/movie/:id" element={<MovieDetails />} />
            <Route path="/movie/:id/multimedia" element={<MovieMultimedia />} />
            <Route path="/movies/:city/:slug/:id" element={<MovieDetails />} />
            <Route path="/movies/:city/:slug/:id/multimedia" element={<MovieMultimedia />} />
            <Route path="/movie/:id/buytickets" element={<BuyTickets />} />
            <Route path="/buytickets/:city/:slug/:id" element={<BuyTickets />} />
            <Route path="/booking/:showtimeId" element={<Booking />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/bookings" element={<MyBookings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Profile />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/add-movie"
              element={
                <ProtectedAdminRoute>
                  <AddMovie />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/edit-movie/:id"
              element={
                <ProtectedAdminRoute>
                  <AddMovie />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/add-showtime"
              element={
                <ProtectedAdminRoute>
                  <AddShowtime />
                </ProtectedAdminRoute>
              }
            />

            {/* 404 Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
      {!isBookingPage && <Footer />}
      <Toast />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
