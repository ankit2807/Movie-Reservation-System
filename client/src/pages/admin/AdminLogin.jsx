import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { loginSuccess, loginFailure, loginStart } from '../../redux/authSlice';
import styles from '../../styles/Auth.module.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginStart());
    try {
      const res = await api.post('/admin/login', { email, password });
      // Admin API returns { details: {}, isAdmin: true }
      // We pass the whole object to loginSuccess, which extracts isAdmin
      dispatch(loginSuccess(res.data));
      navigate('/admin/dashboard');
    } catch (err) {
      dispatch(loginFailure(err.response?.data?.message || 'Admin Login failed'));
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authBox} style={{borderTop: '4px solid #333'}}>
        <h2>Admin Portal</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Access Dashboard
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
