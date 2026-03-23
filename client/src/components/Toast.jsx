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
            }, 3000); // Hide after 3 seconds
            return () => clearTimeout(timer);
        }
    }, [toast, dispatch]);

    if (!toast) return null;

    return (
        <div className={`${styles.toast} ${styles[toast.type]}`}>
            {toast.message}
        </div>
    );
};

export default Toast;
