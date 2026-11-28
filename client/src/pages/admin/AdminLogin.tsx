import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { loginSuccess, loginFailure, loginStart } from '../../redux/authSlice';
import { getApiErrorMessage, User } from '../../types';
import styles from '../../styles/Auth.module.css';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading } = useAppSelector((state) => state.auth);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');
    dispatch(loginStart());
    try {
      const res = await api.post<User>('/admin/login', { email, password });
      dispatch(loginSuccess(res.data));
      navigate('/admin/dashboard');
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err, 'Admin sign in failed');
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
