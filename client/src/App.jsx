import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails';
import Booking from './pages/Booking';
import Login from './pages/Login';
import Register from './pages/Register';

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

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <SubNavbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Home type="Movie" />} />
          <Route path="/stream" element={<Home type="Stream" />} />
          <Route path="/events" element={<Home type="Event" />} />
          <Route path="/plays" element={<Home type="Play" />} />
          <Route path="/sports" element={<Home type="Sport" />} />
          <Route path="/activities" element={<Home type="Activity" />} />
          
          <Route path="/movie/:id" element={<MovieDetails />} />
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
        <Footer />
        <Toast />
      </div>
    </Router>
  );
}

export default App;
