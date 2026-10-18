import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails';
import MovieMultimedia from './pages/MovieMultimedia';
import BuyTickets from './pages/BuyTickets';
import Booking from './pages/Booking';
import Login from './pages/Login';
import Register from './pages/Register';
import SearchResults from './pages/SearchResults';

import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AddMovie from './pages/admin/AddMovie';
import AddShowtime from './pages/admin/AddShowtime';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import SubNavbar from './components/SubNavbar';
import Footer from './components/Footer';
import Toast from './components/Toast';
import AuthModal from './components/AuthModal';

function AppLayout() {
  const location = useLocation();
  const isBookingPage = location.pathname.startsWith('/booking/');

  return (
    <div className="app">
      {!isBookingPage && <Navbar />}
      {!isBookingPage && <SubNavbar />}
      <AuthModal />
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

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={
          <ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>
        } />
        <Route path="/admin/add-movie" element={
          <ProtectedAdminRoute><AddMovie /></ProtectedAdminRoute>
        } />
        <Route path="/admin/add-showtime" element={
          <ProtectedAdminRoute><AddShowtime /></ProtectedAdminRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
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
