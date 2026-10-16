import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Ticket, MapPin, Utensils, XCircle, CheckCircle2 } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import api from '../api/axios';
import { createPosterFallback } from '../utils/bookmyshowData';
import styles from '../styles/MyBookings.module.css';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      let dbBookings = [];
      try {
        const res = await api.get('/movieReservation');
        dbBookings = Array.isArray(res.data) ? res.data : [];
      } catch (dbErr) {
        console.warn('Database bookings fallback to local storage:', dbErr.message);
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

      // Deduplicate by bookingId or _id
      const seen = new Set();
      const merged = [];
      [...dbBookings, ...localBookings].forEach((b) => {
        if (!b || !(b.movie?.title || b.movieTitle)) return;
        const key = b.bookingId || b._id;
        if (key && seen.has(key)) return;
        if (key) seen.add(key);
        merged.push(b);
      });

      merged.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
      setBookings(merged);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (booking) => {
    if (!window.confirm('Are you sure you want to cancel this M-Ticket?')) return;
    setCancellingId(booking._id);

    try {
      if (booking._id && !String(booking._id).startsWith('local-') && !String(booking._id).startsWith('mock-')) {
        await api.patch(`/movieReservation/${booking._id}/cancel`);
      }

      // Also update localStorage backup if present
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
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to cancel booking.');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Loading your M-Tickets...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className={styles.bookingsHeader}>
        <div>
          <h2>Your Orders & M-Tickets</h2>
          <p className={styles.headerSub}>Show the QR code at the cinema entrance for hassle-free entry</p>
        </div>
        <span className={styles.ticketCount}>{bookings.length} {bookings.length === 1 ? 'Order' : 'Orders'}</span>
      </div>

      {bookings.length === 0 ? (
        <div className={styles.noBookings}>
          <Ticket size={64} className={styles.noBookingsIcon} />
          <h3>No Bookings Found</h3>
          <p>You haven't booked any tickets yet. Explore the latest 2025–2026 blockbusters and book your seats now!</p>
          <Link to="/" className={styles.exploreCta}>Explore Movies</Link>
        </div>
      ) : (
        <div className={styles.bookingGrid}>
          {bookings.map((booking) => {
            const movieTitle = booking.movie?.title || booking.movieTitle || 'Movie';
            const posterImage = booking.movie?.posterImage || booking.posterImage || createPosterFallback(movieTitle);
            const showTime = booking.showTime || booking.showtime?.startAt || booking.time || '07:30 PM';
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
                  <span className={`${styles.statusBadge} ${isCancelled ? styles.statusCancelled : styles.statusConfirmed}`}>
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
                      <span>{theatreName} ({screenName})</span>
                    </div>

                    <div className={styles.detailRow}>
                      <Calendar size={14} className={styles.detailIcon} />
                      <span>{formattedDate} | {showTime}</span>
                    </div>

                    <div className={styles.seatsInfo}>
                      <span className={styles.seatsLabel}>
                        {booking.seats?.length || 1} {(booking.seats?.length || 1) === 1 ? 'Ticket' : 'Tickets'}
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
                      <span className={styles.bookingIdLabel}>BOOKING ID</span>
                      <span className={styles.bookingId}>{bookingCode}</span>
                    </div>
                    <div className={styles.stubBottomRow}>
                      <span className={styles.paidAmount}>Total Paid: ₹{totalAmount}</span>
                      {!isCancelled && (
                        <button
                          type="button"
                          className={styles.cancelBtn}
                          disabled={cancellingId === booking._id}
                          onClick={() => handleCancelBooking(booking)}
                        >
                          {cancellingId === booking._id ? 'Cancelling...' : 'Cancel Ticket'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
