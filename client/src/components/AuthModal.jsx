import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Mail, Phone, Lock, User } from 'lucide-react';
import { loginStart, loginSuccess, loginFailure, setAuthModalOpen } from '../redux/authSlice';
import api from '../api/axios';
import styles from '../styles/AuthModal.module.css';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
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

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  // Close when escape is pressed
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // clear error for that field
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
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
      const res = await api.post('/user/login', { email: formData.email, password: formData.password });
      dispatch(loginSuccess(res.data));
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
    dispatch(loginStart()); // reuse loading state

    try {
      await api.post('/user/register', formData);
      dispatch(loginFailure(null)); // clear loading
      setTab('login'); // switch to login tab after success
      setGeneralError('Registration successful. Please log in.');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      dispatch(loginFailure(msg));
      setGeneralError(msg);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={handleClose}>
          <X size={20} />
        </button>

        <div className={styles.header}>
          <h2>Get Started</h2>
          <p>Login to book your favorite shows</p>
        </div>

        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${tab === 'login' ? styles.activeTab : ''}`}
            onClick={() => setTab('login')}
          >
            Login
          </button>
          <button 
            className={`${styles.tab} ${tab === 'register' ? styles.activeTab : ''}`}
            onClick={() => setTab('register')}
          >
            Register
          </button>
        </div>

        {generalError && (
          <div className={styles.generalError} style={generalError.includes('successful') ? { background: '#e8f5e9', color: '#2e7d32' } : {}}>
            {generalError}
          </div>
        )}

        {tab === 'login' ? (
          <form onSubmit={handleLoginSubmit}>
            <div className={styles.inputGroup}>
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className={errors.email ? styles.inputError : ''}
                required
              />
              {errors.email && <span className={styles.inlineError}>{errors.email}</span>}
            </div>
            <div className={styles.inputGroup}>
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className={errors.password ? styles.inputError : ''}
                required
              />
              {errors.password && <span className={styles.inlineError}>{errors.password}</span>}
            </div>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Continuing...' : 'Continue'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit}>
            <div className={styles.inputGroup}>
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 9876543210"
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                required
              />
            </div>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
        )}

        <div className={styles.divider}>OR</div>

        <div className={styles.socialLogin}>
          <button className={styles.socialBtn} type="button">
            <GoogleIcon /> Google
          </button>
          <button className={styles.socialBtn} type="button">
            <Mail size={18} /> Email
          </button>
        </div>

        <p className={styles.terms}>
          I agree to the <a href="#!">Terms & Conditions</a> & <a href="#!">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
