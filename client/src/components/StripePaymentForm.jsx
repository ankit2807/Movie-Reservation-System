import React, { useMemo, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { Lock, ShieldCheck, Loader2 } from 'lucide-react';
import styles from '../styles/StripePaymentForm.module.css';

const stripePromiseCache = new Map();
const getStripePromise = (publishableKey) => {
  if (!publishableKey) return null;
  if (!stripePromiseCache.has(publishableKey)) {
    stripePromiseCache.set(publishableKey, loadStripe(publishableKey));
  }
  return stripePromiseCache.get(publishableKey);
};

const InnerStripeCheckout = ({
  amount,
  customerEmail,
  isSubmittingBooking,
  onPaymentSucceeded,
  onPaymentError,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [confirming, setConfirming] = useState(false);
  const [cardError, setCardError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || confirming || isSubmittingBooking) return;

    setConfirming(true);
    setCardError('');

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
        confirmParams: {
          return_url: window.location.href,
          ...(customerEmail ? { receipt_email: customerEmail } : {}),
        },
      });

      if (error) {
        const msg = error.message || 'Payment could not be completed. Check your card details.';
        setCardError(msg);
        onPaymentError?.(msg);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        await onPaymentSucceeded(paymentIntent.id);
      } else {
        const msg = `Payment status: ${paymentIntent?.status || 'incomplete'}. Please try again.`;
        setCardError(msg);
        onPaymentError?.(msg);
      }
    } catch {
      const msg = 'Unexpected payment gateway error. Please retry.';
      setCardError(msg);
      onPaymentError?.(msg);
    } finally {
      setConfirming(false);
    }
  };

  const isBusy = confirming || isSubmittingBooking;

  return (
    <form onSubmit={handleSubmit} className={styles.stripeForm}>
      <div className={styles.elementWrap}>
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>

      {cardError && (
        <div role="alert" className={styles.errorAlert}>
          {cardError}
        </div>
      )}

      <button
        type="submit"
        id="stripe-pay-submit-btn"
        className={styles.stripeSubmitBtn}
        disabled={!stripe || !elements || isBusy}
      >
        {isBusy ? (
          <>
            <Loader2 size={17} className={styles.spin} />
            <span>{isSubmittingBooking ? 'Issuing M-Ticket...' : 'Authorizing Payment...'}</span>
          </>
        ) : (
          <>
            <Lock size={16} />
            <span>Pay ₹{Number(amount || 0).toFixed(2)} with Stripe</span>
          </>
        )}
      </button>

      <p className={styles.trustLine}>
        <ShieldCheck size={14} />
        <span>256-bit TLS encrypted • PCI-DSS Level 1 processed securely by Stripe</span>
      </p>
    </form>
  );
};

const StripePaymentForm = ({
  clientSecret,
  publishableKey,
  amount,
  mode = 'test',
  customerEmail,
  isSubmittingBooking,
  onPaymentSucceeded,
  onPaymentError,
}) => {
  const stripePromise = useMemo(() => getStripePromise(publishableKey), [publishableKey]);

  const options = useMemo(
    () => ({
      clientSecret,
      appearance: {
        theme: 'stripe',
        variables: {
          colorPrimary: '#f84464',
          colorBackground: '#ffffff',
          colorText: '#1f2533',
          colorDanger: '#dc2626',
          borderRadius: '8px',
          fontFamily: 'Roboto, system-ui, -apple-system, sans-serif',
        },
      },
    }),
    [clientSecret]
  );

  if (!stripePromise || !clientSecret) {
    return (
      <div className={styles.loadingBox}>
        <Loader2 size={20} className={styles.spin} />
        <span>Initializing secure Stripe checkout...</span>
      </div>
    );
  }

  return (
    <div className={styles.stripeContainer}>
      <div className={styles.stripeHeader}>
        <div className={styles.brandRow}>
          <span className={styles.stripeWordmark}>stripe</span>
          <span className={styles.headerText}>Secure Checkout</span>
        </div>
        <span className={`${styles.modeBadge} ${mode === 'live' ? styles.modeLive : styles.modeTest}`}>
          {mode === 'live' ? 'LIVE' : 'TEST MODE'}
        </span>
      </div>

      <Elements stripe={stripePromise} options={options} key={clientSecret}>
        <InnerStripeCheckout
          amount={amount}
          customerEmail={customerEmail}
          isSubmittingBooking={isSubmittingBooking}
          onPaymentSucceeded={onPaymentSucceeded}
          onPaymentError={onPaymentError}
        />
      </Elements>
    </div>
  );
};

export default StripePaymentForm;
