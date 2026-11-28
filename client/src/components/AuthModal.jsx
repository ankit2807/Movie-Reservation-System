import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { X, Mail } from 'lucide-react';
import { loginStart, loginSuccess, loginFailure, setAuthModalOpen } from '../redux/authSlice';
import { showToast } from '../redux/locationSlice';
import api from '../api/axios';
import styles from '../styles/AuthModal.module.css';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

const AuthModal = () => {
  const dispatch = useDispatch();
  const { isAuthModalOpen, loading } = useSelector((state) => state.auth);
  const [tab, setTab] = useState('login'); // 'login' | 'register'

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') dispatch(setAuthModalOpen(false));
    };
    if (isAuthModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, dispatch]);

  if (!isAuthModalOpen) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: null }));
    }
  };

  const handleClose = () => {
    dispatch(setAuthModalOpen(false));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setGeneralError('');
    dispatch(loginStart());

    try {
      const res = await api.post('/user/login', {
        email: formData.email,
        password: formData.password,
      });
      dispatch(loginSuccess(res.data));
      dispatch(showToast({ message: `Welcome back, ${res.data?.name || 'Guest'}!`, type: 'success' }));
      handleClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      dispatch(loginFailure(msg));
      if (msg.toLowerCase().includes('user not found')) {
        setErrors({ email: msg });
      } else if (msg.toLowerCase().includes('incorrect password')) {
        setErrors({ password: msg });
      } else {
        setGeneralError(msg);
      }
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setGeneralError('');
    dispatch(loginStart());

    try {
      await api.post('/user/register', formData);
      dispatch(loginFailure(null));
      setTab('login');
      setGeneralError('Registration successful. Please sign in.');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      dispatch(loginFailure(msg));
      setGeneralError(msg);
    }
  };

  return (
    <div
      className={styles.modalOverlay}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Sign in or create an account"
    >
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button type="button" className={styles.closeBtn} onClick={handleClose} aria-label="Close">
          <X size={20} />
        </button>

        <div className={styles.header}>
          <h2>Get Started</h2>
          <p>Sign in to book your favorite shows</p>
        </div>

        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${tab === 'login' ? styles.activeTab : ''}`}
            onClick={() => {
              setTab('login');
              setErrors({});
              setGeneralError('');
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`${styles.tab} ${tab === 'register' ? styles.activeTab : ''}`}
            onClick={() => {
              setTab('register');
              setErrors({});
              setGeneralError('');
            }}
          >
            Sign Up
          </button>
        </div>

        {generalError && (
          <div
            className={styles.generalError}
            style={generalError.includes('successful') ? { background: '#e8f5e9', color: '#2e7d32' } : {}}
          >
            {generalError}
          </div>
        )}

        {tab === 'login' ? (
          <form onSubmit={handleLoginSubmit}>
            <div className={styles.inputGroup}>
              <label htmlFor="modal-login-email">Email Address</label>
              <input
                id="modal-login-email"
                type="email"
                name="email"
                autoComplete="username"
                spellCheck={false}
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className={errors.email ? styles.inputError : ''}
                required
              />
              {errors.email && <span className={styles.inlineError}>{errors.email}</span>}
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="modal-login-password">Password</label>
              <input
                id="modal-login-password"
                type="password"
                name="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className={errors.password ? styles.inputError : ''}
                required
              />
              {errors.password && <span className={styles.inlineError}>{errors.password}</span>}
            </div>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit}>
            <div className={styles.inputGroup}>
              <label htmlFor="modal-register-name">Full Name</label>
              <input
                id="modal-register-name"
                type="text"
                name="name"
                autoComplete="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Aditi Rao"
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="modal-register-email">Email Address</label>
              <input
                id="modal-register-email"
                type="email"
                name="email"
                autoComplete="username"
                spellCheck={false}
                value={formData.email}
                onChange={handleChange}
                placeholder="aditi@example.com"
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="modal-register-phone">Phone Number</label>
              <input
                id="modal-register-phone"
                type="tel"
                name="phone"
                autoComplete="tel"
                inputMode="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="9876543210"
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="modal-register-password">Password</label>
              <input
                id="modal-register-password"
                type="password"
                name="password"
                autoComplete="new-password"
                minLength={7}
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 7 characters"
                required
              />
            </div>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}

        <div className={styles.divider}>OR</div>

        <div className={styles.socialLogin}>
          <button className={styles.socialBtn} type="button" onClick={() => document.getElementById('modal-login-email')?.focus()}>
            <GoogleIcon /> Google
          </button>
          <button className={styles.socialBtn} type="button" onClick={() => document.getElementById('modal-login-email')?.focus()}>
            <Mail size={18} /> Email
          </button>
        </div>

        <p className={styles.terms}>
          I agree to the <Link to="/help" onClick={handleClose}>Terms &amp; Conditions</Link> &amp;{' '}
          <Link to="/help" onClick={handleClose}>Privacy Policy</Link> •{' '}
          <Link to="/admin/login" onClick={handleClose}>Admin Portal</Link>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
