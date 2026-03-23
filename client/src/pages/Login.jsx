import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { loginStart, loginSuccess, loginFailure } from '../redux/authSlice';
import styles from '../styles/Auth.module.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Reset errors
    setEmailError('');
    setPasswordError('');
    
    dispatch(loginStart());
    try {
      const res = await api.post('/user/login', { email, password });
      dispatch(loginSuccess(res.data));
      navigate('/');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      dispatch(loginFailure(errorMessage));
      
      if (errorMessage.toLowerCase().includes('user not found')) {
          setEmailError(errorMessage);
      } else if (errorMessage.toLowerCase().includes('incorrect password')) {
          setPasswordError(errorMessage);
      }
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authBox}>
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={emailError ? styles.inputError : ''}
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
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className={styles.switchText}>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
        <p className={styles.switchText} style={{ marginTop: '12px' }}>
             <Link to="/admin/login" style={{ fontSize: '12px', color: '#666' }}>Login as Admin</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
