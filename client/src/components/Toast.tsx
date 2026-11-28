import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, MapPin, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { clearToast } from '../redux/locationSlice';
import styles from '../styles/Toast.module.css';

const Toast: React.FC = () => {
  const dispatch = useAppDispatch();
  const { toast } = useAppSelector((state) => state.location);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => {
      dispatch(clearToast());
    }, 3400);
    return () => clearTimeout(timer);
  }, [toast, dispatch]);

  if (!toast) return null;

  const variant = toast.type || 'info';

  const renderIcon = () => {
    if (variant === 'success') {
      return <CheckCircle2 size={18} />;
    }
    if (variant === 'error') {
      return <AlertCircle size={18} />;
    }
    return <MapPin size={18} />;
  };

  return (
    <div
      className={`${styles.toast} ${styles[variant] || styles.info}`}
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
    >
      <span
        className={`${styles.iconCircle} ${styles[`icon_${variant}`] || styles.icon_info}`}
        aria-hidden="true"
      >
        {renderIcon()}
      </span>
      <span className={styles.message}>{toast.message}</span>
      <button
        type="button"
        className={styles.dismissBtn}
        aria-label="Dismiss notification"
        onClick={() => dispatch(clearToast())}
      >
        <X size={15} />
      </button>
    </div>
  );
};

export default Toast;
