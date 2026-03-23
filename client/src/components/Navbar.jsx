import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Search, Menu, X, User, ChevronDown } from 'lucide-react';
import { setCity } from '../redux/locationSlice';
import { setSearchQuery } from '../redux/movieSlice';
import styles from '../styles/Navbar.module.css';
import SideMenu from './SideMenu';

import LocationModal from './LocationModal';

const Navbar = () => {
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { currentCity, hasSelectedCity } = useSelector((state) => state.location);
  const { searchQuery } = useSelector((state) => state.movie);

  const handleSearch = (e) => {
    dispatch(setSearchQuery(e.target.value));
  };

  return (
    <>
    <nav className={styles.navbar}>
      <div className={`container ${styles.navContainer}`}>
        <div className={styles.logoSearch}>
          <Link to="/" className={styles.logo}>
            MovieBook
          </Link>
          <div className={styles.searchBar}>
            <Search size={20} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search for Movies, Events, Plays, Sports and Activities"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
        </div>

        <div className={styles.navActions}>
          <div className={styles.locationWrapper}>
            <div className={styles.location} onClick={() => setIsCityModalOpen(true)}>
                {hasSelectedCity && currentCity ? currentCity : 'Select City'} <ChevronDown size={14} />
            </div>
            <LocationModal isOpen={isCityModalOpen} onClose={() => setIsCityModalOpen(false)} />
          </div>
          
          {isAuthenticated ? (
            <div className={styles.userProfile}>
              <User size={20} />
              <span>{user?.name || 'User'}</span>
              <div className={styles.dropdown}>
                 <Link to="/bookings">My Bookings</Link>
                 {(user?.isAdmin || user?.role === 'admin') && <Link to="/admin/dashboard">Admin Dashboard</Link>}
                 <button onClick={() => {
                     dispatch({type: 'auth/logout'});
                     window.location.href = '/';
                 }}>Logout</button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary">
              Sign in
            </Link>
          )}
          
          {/* Hamburger Menu - Visible on Desktop too now */}
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
