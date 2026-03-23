import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Bell, ShoppingBag, Tv, CreditCard, MessageCircle, Settings, Gift, Star, ChevronRight, User, Info } from 'lucide-react';
import styles from '../styles/SideMenu.module.css';

const SideMenu = ({ isOpen, onClose }) => {
    const { isAuthenticated } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleLogout = () => {
        dispatch({type: 'auth/logout'});
        onClose();
        navigate('/');
    };

    return (
        <>
            <div className={styles.overlay} onClick={onClose}></div>
            <div className={styles.drawer}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerContent}>
                        <h2 className={styles.greeting}>Hey!</h2>
                        {isAuthenticated ? (
                             <div className={styles.profileLink} onClick={() => { onClose(); navigate('/profile'); }}>
                                Edit Profile <ChevronRight size={14} />
                             </div>
                        ) : (
                             <Link to="/login" className={styles.loginLink} onClick={onClose}>Login / Register <ChevronRight size={14} /></Link>
                        )}
                    </div>
                    <div className={styles.avatar}>
                        <User size={32} color="#999" fill="#e0e0e0" />
                    </div>
                </div>

                {/* Promo Strip */}
                <div className={styles.promoStrip}>
                     <div className={styles.promoIcon}>
                         <Info size={16} color="#666" />
                     </div>
                     <div className={styles.promoText}>
                        <div className={styles.promoTitle}>Get tickets on Whatsapp/SMS!</div>
                        <div className={styles.promoSubtitle}>Add your Mobile Number</div>
                     </div>
                     <ChevronRight size={16} color="#aaa" />
                </div>

                {/* Menu Items */}
                <div className={styles.menuItems}>
                    <Link to="/notifications" className={styles.menuItem} onClick={onClose}>
                        <Bell size={20} className={styles.menuIcon} /> 
                        <div className={styles.menuText}>
                            <div className={styles.itemTitle}>Notifications</div>
                        </div>
                        <ChevronRight size={16} className={styles.chevron} />
                    </Link>
                    
                    <Link to="/bookings" className={styles.menuItem} onClick={onClose}>
                        <ShoppingBag size={20} className={styles.menuIcon} /> 
                        <div className={styles.menuText}>
                            <div className={styles.itemTitle}>Your Orders</div>
                            <div className={styles.itemSubtitle}>View all your bookings & purchases</div>
                        </div>
                        <ChevronRight size={16} className={styles.chevron} />
                    </Link>

                    <Link to="/stream" className={styles.menuItem} onClick={onClose}>
                        <Tv size={20} className={styles.menuIcon} /> 
                        <div className={styles.menuText}>
                            <div className={styles.itemTitle}>Stream Library</div>
                            <div className={styles.itemSubtitle}>Rented & Purchased Movies</div>
                        </div>
                        <ChevronRight size={16} className={styles.chevron} />
                    </Link>

                    <Link to="/credit-card" className={styles.menuItem} onClick={onClose}>
                        <CreditCard size={20} className={styles.menuIcon} /> 
                        <div className={styles.menuText}>
                            <div className={styles.itemTitle}>Play Credit Card</div>
                            <div className={styles.itemSubtitle}>View your Play Credit Card details and offers</div>
                        </div>
                        <ChevronRight size={16} className={styles.chevron} />
                    </Link>

                    <Link to="/help" className={styles.menuItem} onClick={onClose}>
                        <MessageCircle size={20} className={styles.menuIcon} /> 
                        <div className={styles.menuText}>
                            <div className={styles.itemTitle}>Help & Support</div>
                            <div className={styles.itemSubtitle}>View commonly asked queries and Chat</div>
                        </div>
                        <ChevronRight size={16} className={styles.chevron} />
                    </Link>

                    <Link to="/settings" className={styles.menuItem} onClick={onClose}>
                        <Settings size={20} className={styles.menuIcon} /> 
                        <div className={styles.menuText}>
                            <div className={styles.itemTitle}>Accounts & Settings</div>
                            <div className={styles.itemSubtitle}>Location, Payments, Permissions & More</div>
                        </div>
                        <ChevronRight size={16} className={styles.chevron} />
                    </Link>

                    <Link to="/rewards" className={styles.menuItem} onClick={onClose}>
                        <Gift size={20} className={styles.menuIcon} /> 
                        <div className={styles.menuText}>
                             <div className={styles.itemTitle}>Rewards</div>
                             <div className={styles.itemSubtitle}>View your rewards & unlock new ones</div>
                        </div>
                        <ChevronRight size={16} className={styles.chevron} />
                    </Link>
                    
                     <Link to="/bookachange" className={styles.menuItem} onClick={onClose}>
                        <Star size={20} className={styles.menuIcon} /> 
                        <div className={styles.menuText}>
                             <div className={styles.itemTitle}>BookAChange</div>
                        </div>
                        <ChevronRight size={16} className={styles.chevron} />
                    </Link>
                </div>

                {/* Footer */}
                {isAuthenticated && (
                     <div className={styles.footer}>
                        <button className={styles.logoutBtn} onClick={handleLogout}>
                            Sign out
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default SideMenu;
