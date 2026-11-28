import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  ShoppingBag,
  Tv,
  CreditCard,
  Gift,
  Monitor,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import api from '../api/axios';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { loginSuccess, logout, setAuthModalOpen } from '../redux/authSlice';
import { showToast } from '../redux/locationSlice';
import { getApiErrorMessage, User } from '../types';
import styles from '../styles/Profile.module.css';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Other' | '';
  isMarried: boolean;
  birthday: string;
}

const buildFormFromUser = (u: User | null): ProfileFormData => {
  const parts = String(u?.name || '').trim().split(/\s+/).filter(Boolean);
  return {
    firstName: u?.firstName || parts[0] || '',
    lastName: u?.lastName || (parts.length > 1 ? parts.slice(1).join(' ') : ''),
    email: u?.email || '',
    phone: u?.phone || '',
    gender: u?.gender || '',
    isMarried: Boolean(u?.isMarried),
    birthday: u?.birthday || '',
  };
};

const Profile: React.FC = () => {
  const { user, isAuthenticated, authChecked } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [prevUser, setPrevUser] = useState<User | null>(user);
  const [formData, setFormData] = useState<ProfileFormData>(() => buildFormFromUser(user));
  if (prevUser !== user) {
    setPrevUser(user);
    setFormData(buildFormFromUser(user));
  }

  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      await api.post('/user/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      dispatch(logout());
      dispatch(showToast({ message: 'You have been signed out.', type: 'info' }));
      navigate('/');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenderChange = (value: 'Male' | 'Female' | 'Other') => {
    setFormData((prev) => ({ ...prev, gender: value }));
  };

  const handleMarriedChange = (value: boolean) => {
    setFormData((prev) => ({ ...prev, isMarried: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put<User>('/user/profile', formData);
      dispatch(loginSuccess(res.data));
      dispatch(showToast({ message: 'Profile updated successfully!', type: 'success' }));
    } catch (err: unknown) {
      dispatch(
        showToast({
          message: getApiErrorMessage(err, 'Failed to update profile.'),
          type: 'error',
        })
      );
    } finally {
      setLoading(false);
    }
  };

  if (authChecked && !isAuthenticated) {
    return (
      <div className={styles.container}>
        <div
          style={{
            maxWidth: '460px',
            margin: '48px auto',
            background: '#ffffff',
            borderRadius: '14px',
            padding: '36px 28px',
            textAlign: 'center',
            border: '1px solid #e2e8f0',
            boxShadow: '0 6px 24px rgba(15, 23, 42, 0.06)',
          }}
        >
          <UserIcon size={48} color="#f84464" style={{ marginBottom: '12px' }} />
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: '#0f172a' }}>
            Sign in to view your Profile
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '22px' }}>
            Manage your personal details, mobile number for M-Tickets, and booking history.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => dispatch(setAuthModalOpen(true))}
          >
            Sign In / Create Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h2>My Account</h2>
          </div>
          <div className={styles.menuList}>
            <div className={`${styles.menuItem} ${styles.active}`}>
              <UserIcon size={18} /> Profile
            </div>
            <div className={styles.menuItem} onClick={() => navigate('/bookings')}>
              <ShoppingBag size={18} /> Your Orders
            </div>
            {(user?.isAdmin || user?.role === 'admin') && (
              <div className={styles.menuItem} onClick={() => navigate('/admin/dashboard')}>
                <ShieldCheck size={18} /> Admin Dashboard
              </div>
            )}
            <div
              className={styles.menuItem}
              onClick={() =>
                dispatch(
                  showToast({
                    message: 'Active session secured with HTTP-only JWT cookie on this browser.',
                    type: 'info',
                  })
                )
              }
            >
              <Monitor size={18} /> Active Session
            </div>
            <div className={styles.menuItem} onClick={() => navigate('/stream')}>
              <Tv size={18} /> Stream Library
            </div>
            <div className={styles.menuItem} onClick={() => navigate('/offers')}>
              <CreditCard size={18} /> Offers &amp; QuikPay
            </div>
            <div className={styles.menuItem} onClick={() => navigate('/rewards')}>
              <Gift size={18} /> Rewards
            </div>
            <div className={`${styles.menuItem} ${styles.signOut}`} onClick={handleLogout}>
              <LogOut size={18} /> Sign Out
            </div>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.profileHeader}>
            <div className={styles.avatarLarge}>
              <UserIcon size={64} />
            </div>
            <div className={styles.userName}>{user?.name || 'MovieBook Member'}</div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles.formSection}>
              <div className={styles.sectionTitle}>Account Details</div>
              <div className={styles.inputRow}>
                <div className={styles.inputGroup}>
                  <label htmlFor="prof-phone">Mobile Number</label>
                  <input
                    id="prof-phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="prof-email">Email Address</label>
                  <input id="prof-email" type="email" name="email" value={formData.email} disabled />
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <div className={styles.sectionTitle}>Personal Details</div>
              <div className={styles.inputRow}>
                <div className={styles.inputGroup}>
                  <label htmlFor="prof-first">First Name</label>
                  <input
                    id="prof-first"
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter first name"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="prof-last">Last Name</label>
                  <input
                    id="prof-last"
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div className={styles.inputRow}>
                <div className={styles.inputGroup}>
                  <label htmlFor="prof-bday">Birthday (Optional)</label>
                  <input
                    id="prof-bday"
                    type="text"
                    name="birthday"
                    value={formData.birthday}
                    onChange={handleChange}
                    placeholder="dd/mm/yyyy"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Gender (Optional)</label>
                  <div className={styles.radioGroup}>
                    {(['Female', 'Male', 'Other'] as const).map((option) => (
                      <button
                        type="button"
                        key={option}
                        className={`${styles.radioOption} ${
                          formData.gender === option ? styles.selected : ''
                        }`}
                        onClick={() => handleGenderChange(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.inputRow}>
                <div className={styles.inputGroup}>
                  <label>Married? (Optional)</label>
                  <div className={styles.radioGroup}>
                    <button
                      type="button"
                      className={`${styles.radioOption} ${
                        formData.isMarried === true ? styles.selected : ''
                      }`}
                      onClick={() => handleMarriedChange(true)}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      className={`${styles.radioOption} ${
                        formData.isMarried === false ? styles.selected : ''
                      }`}
                      onClick={() => handleMarriedChange(false)}
                    >
                      No
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" className={styles.saveBtn} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
