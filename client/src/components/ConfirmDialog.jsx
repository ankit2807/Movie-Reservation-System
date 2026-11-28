import React, { useEffect, useId, useRef } from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import styles from '../styles/ConfirmDialog.module.css';

const ConfirmDialog = ({
  isOpen,
  title,
  description,
  details = null,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}) => {
  const dialogRef = useRef(null);
  const headingId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close('');
    }
  }, [isOpen]);

  // Pointer-bounds light-dismiss fallback for browsers without native closedBy support
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || 'closedBy' in HTMLDialogElement.prototype) return undefined;

    let pointerStartedOutside = false;
    const isOutsideBounds = (event) => {
      const rect = dialog.getBoundingClientRect();
      return (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      );
    };

    const handlePointerDown = (event) => {
      pointerStartedOutside = dialog.open && isOutsideBounds(event);
    };

    const handlePointerUp = (event) => {
      if (pointerStartedOutside && dialog.open && isOutsideBounds(event)) {
        dialog.close('dismiss');
      }
      pointerStartedOutside = false;
    };

    dialog.addEventListener('pointerdown', handlePointerDown);
    dialog.addEventListener('pointerup', handlePointerUp);
    return () => {
      dialog.removeEventListener('pointerdown', handlePointerDown);
      dialog.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  const handleClose = () => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const outcome = dialog.returnValue;
    dialog.returnValue = '';

    if (outcome === 'confirm') {
      onConfirm?.();
    } else {
      onCancel?.();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={headingId}
      closedby="any"
      onClose={handleClose}
    >
      <div className={styles.body}>
        <div className={`${styles.iconBadge} ${variant === 'danger' ? styles.iconDanger : styles.iconInfo}`}>
          {variant === 'danger' ? <AlertTriangle size={22} /> : <Info size={22} />}
        </div>
        <div className={styles.content}>
          <h1 id={headingId} className={styles.title}>
            {title}
          </h1>
          {description && <p className={styles.description}>{description}</p>}
          {details && <div className={styles.detailsBox}>{details}</div>}
        </div>
      </div>

      <form method="dialog" className={styles.actions}>
        <button type="submit" value="cancel" autoFocus className={styles.cancelBtn}>
          {cancelLabel}
        </button>
        <button
          type="submit"
          value="confirm"
          disabled={loading}
          className={`${styles.confirmBtn} ${variant === 'danger' ? styles.confirmDanger : styles.confirmPrimary}`}
        >
          {loading ? 'Processing...' : confirmLabel}
        </button>
      </form>
    </dialog>
  );
};

export default ConfirmDialog;
