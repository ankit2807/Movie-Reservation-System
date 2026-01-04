import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import styles from '../styles/MyBookings.module.css';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get('/movieReservation');
        setBookings(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <h2 style={{marginTop: '32px', marginBottom: '24px'}}>My Bookings</h2>
      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <div className={styles.bookingGrid}>
          {bookings.map((booking) => (
            <div key={booking._id} className={styles.ticketCard}>
              <div className={styles.poster}>
                <img src={booking.movie.posterImage} alt={booking.movie.title} />
              </div>
              <div className={styles.ticketInfo}>
                <h3>{booking.movie.title}</h3>
                <p><strong>Date:</strong> {new Date(booking.date).toDateString()}</p>
                <p><strong>Time:</strong> {booking.showtime.startAt}</p>
                <p><strong>Seats:</strong> {booking.seats.join(', ')}</p>
                <div className={styles.ticketId}>
                    ID: {booking._id}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
