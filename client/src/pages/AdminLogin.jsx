import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { loginStart, loginSuccess, loginFailure } from '../redux/authSlice';
import styles from '../styles/Auth.module.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');
    
    dispatch(loginStart());
    try {
      const res = await api.post('/admin/login', { email, password });
      dispatch(loginSuccess(res.data));
      navigate('/admin/dashboard');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      dispatch(loginFailure(errorMessage));
      
      if (errorMessage.toLowerCase().includes('admin not found')) {
          setEmailError(errorMessage);
      } else if (errorMessage.toLowerCase().includes('incorrect password')) {
          setPasswordError(errorMessage);
      }
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authBox} style={{ borderTop: '4px solid #DC3558' }}>
        <h2>Admin Login</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={emailError ? styles.inputError : ''}
              placeholder="admin@example.com"
            />
            {emailError && <span className={styles.inlineError}>{emailError}</span>}
          </div>
          <div className={styles.inputGroup}>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={passwordError ? styles.inputError : ''}
            />
            {passwordError && <span className={styles.inlineError}>{passwordError}</span>}
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ backgroundColor: '#333' }}>
            {loading ? 'Logging in...' : 'Access Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
