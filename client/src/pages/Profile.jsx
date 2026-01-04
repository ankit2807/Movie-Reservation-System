import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { User, ShoppingBag, Tv, CreditCard, Gift, Monitor, LogOut } from 'lucide-react';
import api from '../api/axios';
import { loginSuccess } from '../redux/authSlice';
import styles from '../styles/Profile.module.css';

const Profile = () => {
    const { user } = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        gender: '',
        isMarried: false,
        birthday: ''
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phone: user.phone || '',
                gender: user.gender || '',
                isMarried: user.isMarried || false,
                birthday: user.birthday || ''
            });
        }
    }, [user]);

    const handleLogout = () => {
        dispatch({ type: 'auth/logout' });
        navigate('/');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRadioChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const res = await api.put('/user/profile', formData);
            // Updating local user state
            dispatch(loginSuccess(res.data));
            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error(err);
            setMessage('Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.wrapper}>
                {/* Sidebar */}
                <div className={styles.sidebar}>
                    <div className={styles.sidebarHeader}>
                        <h2>My Account</h2>
                    </div>
                    <div className={styles.menuList}>
                        <div className={`${styles.menuItem} ${styles.active}`}>
                            <User size={18} /> Profile
                        </div>
                        <div className={styles.menuItem} onClick={() => navigate('/bookings')}>
                            <ShoppingBag size={18} /> Your Orders
                        </div>
                        <div className={styles.menuItem}>
                            <Monitor size={18} /> Saved Devices
                        </div>
                        <div className={styles.menuItem}>
                            <Tv size={18} /> Stream Library
                        </div>
                        <div className={styles.menuItem}>
                            <CreditCard size={18} /> QuikPay
                        </div>
                        <div className={styles.menuItem}>
                            <Gift size={18} /> Rewards
                        </div>
                        <div className={`${styles.menuItem} ${styles.signOut}`} onClick={handleLogout}>
                            <LogOut size={18} /> Sign Out
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className={styles.content}>
                    {message && <div className={styles.successMessage}>{message}</div>}
                    
                    <div className={styles.profileHeader}>
                        <div className={styles.avatarLarge}>
                            <User size={64} />
                        </div>
                        <div className={styles.userName}>{user?.name || 'Guest'}</div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className={styles.formSection}>
                            <div className={styles.sectionTitle}>Account Details</div>
                            <div className={styles.inputRow}>
                                <div className={styles.inputGroup}>
                                    <label>Mobile Number</label>
                                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Email Address</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} disabled />
                                </div>
                            </div>
                        </div>

                        <div className={styles.formSection}>
                            <div className={styles.sectionTitle}>Personal Details</div>
                            <div className={styles.inputRow}>
                                <div className={styles.inputGroup}>
                                    <label>First Name</label>
                                    <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Enter first name" />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Last Name</label>
                                    <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Enter last name" />
                                </div>
                            </div>

                            <div className={styles.inputRow}>
                                <div className={styles.inputGroup}>
                                    <label>Birthday (Optional)</label>
                                    <input type="text" name="birthday" value={formData.birthday} onChange={handleChange} placeholder="dd/mm/yyyy" />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Gender (Optional)</label>
                                    <div className={styles.radioGroup}>
                                        {['Female', 'Male'].map(option => (
                                            <div 
                                                key={option}
                                                className={`${styles.radioOption} ${formData.gender === option ? styles.selected : ''}`}
                                                onClick={() => handleRadioChange('gender', option)}
                                            >
                                                {option}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                             <div className={styles.inputRow}>
                                <div className={styles.inputGroup}>
                                    <label>Married? (Optional)</label>
                                    <div className={styles.radioGroup}>
                                        <div 
                                            className={`${styles.radioOption} ${formData.isMarried === true ? styles.selected : ''}`}
                                            onClick={() => handleRadioChange('isMarried', true)}
                                        >
                                            Yes
                                        </div>
                                         <div 
                                            className={`${styles.radioOption} ${formData.isMarried === false ? styles.selected : ''}`}
                                            onClick={() => handleRadioChange('isMarried', false)}
                                        >
                                            No
                                        </div>
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
