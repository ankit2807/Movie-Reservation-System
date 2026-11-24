import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { loginSuccess, loginFailure, loginStart } from '../../redux/authSlice';
import styles from '../../styles/Auth.module.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    dispatch(loginStart());
    try {
      const res = await api.post('/admin/login', { email, password });
      dispatch(loginSuccess(res.data));
      navigate('/admin/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Admin sign in failed';
      setErrorMessage(msg);
      dispatch(loginFailure(msg));
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authBox} style={{ borderTop: '4px solid #f84464' }}>
        <h2>Admin Portal</h2>
        {errorMessage && <p className={styles.error}>{errorMessage}</p>}
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="admin-email">Email</label>
            <input
              id="admin-email"
              name="email"
              type="email"
              autoComplete="username"
              spellCheck={false}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@moviebook.com"
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
