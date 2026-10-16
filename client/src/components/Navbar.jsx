import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Search, Menu, X, User, ChevronDown } from 'lucide-react';
import api from '../api/axios';
import { setCity } from '../redux/locationSlice';
import { setSearchQuery } from '../redux/movieSlice';
import { logout, setAuthModalOpen } from '../redux/authSlice';
import styles from '../styles/Navbar.module.css';
import SideMenu from './SideMenu';

import LocationModal from './LocationModal';

const Navbar = () => {
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState('');
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { currentCity, hasSelectedCity } = useSelector((state) => state.location);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (localSearch.trim()) {
      dispatch(setSearchQuery(localSearch));
      navigate(`/search?q=${encodeURIComponent(localSearch.trim())}`);
    }
  };

  const handleSearchChange = (e) => {
    setLocalSearch(e.target.value);
  };

  const handleSearchFocus = () => {
    navigate('/search');
  };

  const handleLogout = async () => {
    try {
      await api.post('/user/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      dispatch(logout());
      window.location.href = '/';
    }
  };

  return (
    <>
    <nav className={styles.navbar}>
      <div className={`container ${styles.navContainer}`}>
        <div className={styles.logoSearch}>
          <Link to="/" className={styles.logo}>
            <span className={styles.logoMovie}>Movie</span><span className={styles.logoBook}>Book</span>
          </Link>
          <form onSubmit={handleSearchSubmit} className={styles.searchBar}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search for Movies, Events, Plays, Sports and Activities"
              value={localSearch}
              onChange={handleSearchChange} 
              onFocus={handleSearchFocus}
              id="navbar-search-input"
            />
          </form>
        </div>

        <div className={styles.navActions}>
          <div className={styles.locationWrapper}>
            <div className={styles.location} onClick={() => setIsCityModalOpen(true)} id="location-selector">
                {hasSelectedCity && currentCity ? currentCity : 'Select City'} <ChevronDown size={14} />
            </div>
            <LocationModal isOpen={isCityModalOpen} onClose={() => setIsCityModalOpen(false)} />
          </div>
          
          {isAuthenticated ? (
            <div className={styles.userProfile}>
              <div className={styles.userAvatar}>
                <User size={16} />
              </div>
              <span>{user?.name || 'User'}</span>
              <div className={styles.dropdown}>
                 <Link to="/profile">My Profile</Link>
                 <Link to="/bookings">My Bookings</Link>
                 {(user?.isAdmin || user?.role === 'admin') && <Link to="/admin/dashboard">Admin Dashboard</Link>}
                 <button onClick={handleLogout}>Logout</button>
              </div>
            </div>
          ) : (
            <button className={styles.signInBtn} id="sign-in-btn" onClick={() => dispatch(setAuthModalOpen(true))}>
              Sign in
            </button>
          )}
          
          {/* Hamburger Menu */}
          <div className={styles.menuTrigger} onClick={() => setIsSideMenuOpen(true)}>
            <Menu size={24} />
          </div>
        </div>
      </div>
    </nav>
    <SideMenu isOpen={isSideMenuOpen} onClose={() => setIsSideMenuOpen(false)} />
    </>
  );
};

export default Navbar;
