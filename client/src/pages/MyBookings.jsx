import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, Ticket, MapPin, Utensils, XCircle, CheckCircle2, Printer } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import api from '../api/axios';
import { setAuthModalOpen } from '../redux/authSlice';
import { showToast } from '../redux/locationSlice';
import { createPosterFallback } from '../utils/moviebookData';
import ConfirmDialog from '../components/ConfirmDialog';
import styles from '../styles/MyBookings.module.css';

const MyBookings = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, authChecked } = useSelector((state) => state.auth);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    if (!authChecked) return undefined;
    let isMounted = true;
    const fetchBookings = async () => {
      try {
        let dbBookings = [];
        if (isAuthenticated) {
          try {
            const res = await api.get('/movieReservation');
            dbBookings = Array.isArray(res.data) ? res.data : [];
          } catch (dbErr) {
            console.warn('Database bookings fetch error:', dbErr.message);
          }
        }

        let localBookings = [];
        try {
          const saved = localStorage.getItem('my-bookings');
          if (saved) {
            localBookings = JSON.parse(saved);
          }
        } catch (storageErr) {
          console.warn('Error reading local bookings:', storageErr);
        }

        const seen = new Set();
        const merged = [];
        [...dbBookings, ...localBookings].forEach((b) => {
          if (!b || !(b.movie?.title || b.movieTitle)) return;
          const key = b.bookingId || b._id;
          if (key && seen.has(key)) return;
          if (key) seen.add(key);
          merged.push(b);
        });

        const sorted = merged.toSorted(
          (a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
        );
        if (isMounted) setBookings(sorted);
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBookings();
    return () => {
      isMounted = false;
    };
  }, [authChecked, isAuthenticated]);

  const executeCancelBooking = async () => {
    if (!bookingToCancel) return;
    const booking = bookingToCancel;
    setCancellingId(booking._id);

    try {
      let refundSummary = '';
      if (
        booking._id &&
        !String(booking._id).startsWith('local-') &&
        !String(booking._id).startsWith('mock-')
      ) {
        const res = await api.patch(`/movieReservation/${booking._id}/cancel`);
        if (res.data?.refundAmount !== undefined) {
          refundSummary = ` Refund of ₹${res.data.refundAmount} initiated.`;
        }
      }

      const saved = JSON.parse(localStorage.getItem('my-bookings') || '[]');
      const updatedLocal = saved.map((item) =>
        item._id === booking._id || item.bookingId === booking.bookingId
          ? { ...item, status: 'CANCELLED' }
          : item
      );
      localStorage.setItem('my-bookings', JSON.stringify(updatedLocal));

      setBookings((prev) =>
        prev.map((item) =>
          item._id === booking._id ? { ...item, status: 'CANCELLED' } : item
        )
      );
      dispatch(
        showToast({
          message: `M-Ticket cancelled.${refundSummary}`,
          type: 'success',
        })
      );
    } catch (err) {
      dispatch(
        showToast({
          message: err.response?.data?.message || 'Unable to cancel booking.',
          type: 'error',
        })
      );
    } finally {
      setCancellingId(null);
      setBookingToCancel(null);
    }
  };

  const handlePrintTicket = () => {
    window.print();
  };

  const counts = useMemo(() => {
    const cancelled = bookings.filter((b) => b.status === 'CANCELLED').length;
    return {
      all: bookings.length,
      confirmed: bookings.length - cancelled,
      cancelled,
    };
  }, [bookings]);

  const visibleBookings = useMemo(() => {
    if (statusFilter === 'CONFIRMED') {
      return bookings.filter((b) => b.status !== 'CANCELLED');
    }
    if (statusFilter === 'CANCELLED') {
      return bookings.filter((b) => b.status === 'CANCELLED');
    }
    return bookings;
  }, [bookings, statusFilter]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Loading your M-Tickets...</p>
      </div>
    );
  }

  const cancelEstimate = bookingToCancel
    ? Math.max(
        0,
        (bookingToCancel.amounts?.total || (bookingToCancel.seats?.length || 1) * 290) -
          (bookingToCancel.amounts?.convenienceFee || (bookingToCancel.seats?.length || 1) * 30) -
          (bookingToCancel.amounts?.gst || 0)
      )
    : 0;

  return (
    <div className="container">
      <div className={styles.bookingsHeader}>
        <div>
          <h2>Your Orders &amp; M-Tickets</h2>
          <p className={styles.headerSub}>
            Show the QR code at the cinema entrance for hassle-free paperless entry
          </p>
        </div>
        <span className={styles.ticketCount}>
          {bookings.length} {bookings.length === 1 ? 'Order' : 'Orders'}
        </span>
      </div>

      {bookings.length > 0 && (
        <div className={styles.filterTabsRow} role="tablist" aria-label="Filter bookings by status">
          {[
            { id: 'ALL', label: `All (${counts.all})` },
            { id: 'CONFIRMED', label: `Confirmed (${counts.confirmed})` },
            { id: 'CANCELLED', label: `Cancelled (${counts.cancelled})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={statusFilter === tab.id}
              className={`${styles.filterTabBtn} ${statusFilter === tab.id ? styles.filterTabActive : ''}`}
              onClick={() => setStatusFilter(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {visibleBookings.length === 0 ? (
        <div className={styles.noBookings}>
          <Ticket size={64} className={styles.noBookingsIcon} />
          <h3>
            {!isAuthenticated && bookings.length === 0
              ? 'Sign in to view your M-Tickets'
              : bookings.length === 0
              ? 'No Bookings Found'
              : 'No Matching Tickets'}
          </h3>
          <p>
            {!isAuthenticated && bookings.length === 0
              ? 'Sign in to access your confirmed QR M-Tickets, seat passes, and cancellation options.'
              : bookings.length === 0
              ? 'You have not booked any tickets yet. Explore the latest blockbusters and live events now!'
              : 'No orders match the selected filter tab.'}
          </p>
          {!isAuthenticated && bookings.length === 0 ? (
            <button
              type="button"
              className={styles.exploreCta}
              onClick={() => dispatch(setAuthModalOpen(true))}
            >
              Sign In
            </button>
          ) : bookings.length === 0 ? (
            <Link to="/" className={styles.exploreCta}>
              Explore Movies
            </Link>
          ) : (
            <button
              type="button"
              className={styles.exploreCta}
              onClick={() => setStatusFilter('ALL')}
            >
              Show All Orders
            </button>
          )}
        </div>
      ) : (
        <div className={styles.bookingGrid}>
          {visibleBookings.map((booking) => {
            const movieTitle = booking.movie?.title || booking.movieTitle || 'Movie';
            const posterImage =
              booking.movie?.posterImage || booking.posterImage || createPosterFallback(movieTitle);
            const showTime =
              booking.showTime || booking.showtime?.startAt || booking.time || '07:30 PM';
            const rawDate = booking.showDate || booking.date;
            const formattedDate = rawDate
              ? new Date(rawDate).toLocaleDateString('en-IN', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : 'Upcoming';

            const theatreName =
              booking.theatre?.name ||
              booking.showtime?.theatre ||
              'PVR: Logix City Centre Mall, Noida';
            const screenName = booking.theatre?.screen || booking.showtime?.screen || 'AUDI 01';
            const format = booking.format || booking.showtime?.format || '2D';
            const language = booking.language || 'Hindi';
            const certification = booking.certification || booking.movie?.certification || 'UA';
            const bookingCode =
              booking.bookingId ||
              (String(booking._id).startsWith('mock-')
                ? String(booking._id).replace('mock-', 'BMS')
                : String(booking._id).slice(-8).toUpperCase());
            const isCancelled = booking.status === 'CANCELLED';
            const totalAmount = booking.amounts?.total || (booking.seats?.length || 1) * 290;

            return (
              <div
                key={booking._id || bookingCode}
                className={`${styles.ticketCard} ${isCancelled ? styles.ticketCancelled : ''}`}
              >
                <div className={styles.ticketTopStatus}>
                  <span className={styles.mTicketTag}>M-TICKET</span>
                  <span
                    className={`${styles.statusBadge} ${
                      isCancelled ? styles.statusCancelled : styles.statusConfirmed
                    }`}
                  >
                    {isCancelled ? (
                      <>
                        <XCircle size={13} /> CANCELLED
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={13} /> CONFIRMED
                      </>
                    )}
                  </span>
                </div>

                <div className={styles.ticketMain}>
                  <div className={styles.poster}>
                    <img
                      src={posterImage}
                      alt={movieTitle}
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = createPosterFallback(movieTitle);
                      }}
                    />
                  </div>
                  <div className={styles.ticketDetails}>
                    <div>
                      <h3 className={styles.movieTitle}>{movieTitle}</h3>
                      <p className={styles.langFormatSub}>
                        {certification} • {language}, {format}
                      </p>
                    </div>

                    <div className={styles.detailRow}>
                      <MapPin size={14} className={styles.detailIcon} />
                      <span>
                        {theatreName} ({screenName})
                      </span>
                    </div>

                    <div className={styles.detailRow}>
                      <Calendar size={14} className={styles.detailIcon} />
                      <span>
                        {formattedDate} | {showTime}
                      </span>
                    </div>

                    <div className={styles.seatsInfo}>
                      <span className={styles.seatsLabel}>
                        {booking.seats?.length || 1}{' '}
                        {(booking.seats?.length || 1) === 1 ? 'Ticket' : 'Tickets'}
                      </span>
                      <span className={styles.seatsValue}>{booking.seats?.join(', ')}</span>
                    </div>

                    {booking.food && booking.food.length > 0 && (
                      <div className={styles.foodRow}>
                        <Utensils size={12} />
                        <span>{booking.food.map((f) => `${f.qty}x ${f.name}`).join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.ticketDivider}>
                  <div className={styles.leftCutout} />
                  <div className={styles.rightCutout} />
                </div>

                <div className={styles.ticketStub}>
                  <div className={styles.qrWrapper}>
                    <QRCodeCanvas
                      value={`MOVIEBOOK|${bookingCode}|${movieTitle}|${(booking.seats || []).join(',')}|${formattedDate}|${showTime}`}
                      size={68}
                      bgColor="#ffffff"
                      fgColor={isCancelled ? '#9ca3af' : '#1f2533'}
                      level="M"
                    />
                  </div>
                  <div className={styles.stubRight}>
                    <div className={styles.stubMetaRow}>
                      <span className={styles.bookingIdLabel}>
                        BOOKING ID{' '}
                        {booking.paymentProvider === 'STRIPE' && (
                          <strong style={{ color: '#635bff', marginLeft: '6px' }}>• STRIPE</strong>
                        )}
                      </span>
                      <span className={styles.bookingId}>{bookingCode}</span>
                      {booking.stripeRefundId && (
                        <span style={{ fontSize: '10.5px', color: '#059669', marginTop: '2px' }}>
                          Stripe Refund: {booking.stripeRefundId}
                        </span>
                      )}
                    </div>
                    <div className={styles.stubBottomRow}>
                      <span className={styles.paidAmount}>Total Paid: ₹{totalAmount}</span>
                      {!isCancelled && (
                        <div className={styles.ticketActionsGroup}>
                          <button
                            type="button"
                            className={styles.printBtn}
                            onClick={handlePrintTicket}
                            title="Print or save PDF ticket"
                          >
                            <Printer size={12} /> Print
                          </button>
                          <button
                            type="button"
                            className={styles.cancelBtn}
                            disabled={cancellingId === booking._id}
                            onClick={() => setBookingToCancel(booking)}
                          >
                            {cancellingId === booking._id ? 'Cancelling...' : 'Cancel'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(bookingToCancel)}
        title="Cancel this M-Ticket?"
        description={
          bookingToCancel
            ? `Release seats ${(bookingToCancel.seats || []).join(', ')} for "${
                bookingToCancel.movie?.title || bookingToCancel.movieTitle || 'Movie'
              }"? Cancellations are permitted up to 20 minutes before showtime.`
            : ''
        }
        details={
          bookingToCancel ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
              <span>Estimated Refund (Tickets + F&amp;B):</span>
              <span style={{ color: '#059669' }}>₹{Math.round(cancelEstimate * 100) / 100}</span>
            </div>
          ) : null
        }
        confirmLabel="Confirm Cancellation"
        cancelLabel="Keep Ticket"
        variant="danger"
        loading={Boolean(cancellingId)}
        onConfirm={executeCancelBooking}
        onCancel={() => setBookingToCancel(null)}
      />
    </div>
  );
};

export default MyBookings;
