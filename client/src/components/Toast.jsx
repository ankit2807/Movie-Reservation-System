import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearToast } from '../redux/locationSlice';
import styles from '../styles/Toast.module.css';

const Toast = () => {
    const dispatch = useDispatch();
    const { toast } = useSelector((state) => state.location);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => {
                dispatch(clearToast());
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [toast, dispatch]);

    if (!toast) return null;

    return (
        <div
            className={`${styles.toast} ${toast.type ? styles[toast.type] : ''}`}
            role="status"
            aria-live="polite"
            onClick={() => dispatch(clearToast())}
        >
            <span className={styles.iconCircle} aria-hidden="true">
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M12 2C7.86 2 4.5 5.36 4.5 9.5C4.5 15.12 12 22 12 22C12 22 19.5 15.12 19.5 9.5C19.5 5.36 16.14 2 12 2Z"
                        fill="#1A73E8"
                    />
                    <circle cx="12" cy="9.5" r="3" fill="#FFFFFF" />
                </svg>
            </span>
            <span className={styles.message}>{toast.message}</span>
        </div>
    );
};

export default Toast;
