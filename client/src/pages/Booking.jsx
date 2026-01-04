import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Loader } from 'lucide-react';
import api from '../api/axios';
import styles from '../styles/Booking.module.css';
import classNames from 'classnames';

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F'];
const COLS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; 

const Booking = () => {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [occupiedSeats, setOccupiedSeats] = useState([]); 
  const [showtime, setShowtime] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  
  const SEAT_PRICE = 250;

  useEffect(() => {
    const fetchShowtime = async () => {
      try {
        const res = await api.get(`/showtimes/${showtimeId}`);
        setShowtime(res.data);
        setBookingDate(res.data.startDate.split('T')[0]); 
      } catch (err) {
        console.error(err);
      }
    };
    fetchShowtime();
  }, [showtimeId]);

  const toggleSeat = (seatId) => {
    if (occupiedSeats.includes(seatId)) return;
    
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatId));
    } else {
      if (selectedSeats.length >= 10) return alert("You can't select more than 10 seats");
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const handleBooking = async () => {
    if (!user) return navigate('/login');
    if (!bookingDate) return alert('Please select a date');
    
    setIsProcessing(true);
    
    // Simulate 2s payment delay
    setTimeout(async () => {
        try {
            await api.post('/movieReservation', {
                movie: showtime.movieId._id,
                showtime: showtimeId,
                seats: selectedSeats,
                date: bookingDate
            });
            setIsProcessing(false);
            alert('Booking Successful!');
            navigate('/bookings');
        } catch (err) {
            setIsProcessing(false);
            alert(err.response?.data?.message || 'Booking Failed');
        }
    }, 2500);
  };

  if (!showtime) return <div className="container">Loading...</div>;

  return (
    <div className={styles.bookingContainer}>
      {isProcessing && (
          <div className={styles.paymentOverlay}>
              <div className={styles.paymentModal}>
                  <Loader className={styles.spinner} size={48} />
                  <h3>Processing Payment...</h3>
                  <p>Please do not close this window.</p>
              </div>
          </div>
      )}

      <div className={styles.header}>
        <div className={styles.movieTitle}>
            <h2>{showtime.movieId.title}</h2>
            <p>{showtime.movieId.certification} • {showtime.movieId.genre}</p>
        </div>
        <div className={styles.showInfo}>
            <div className={styles.dateSelector}>
                <input 
                    type="date" 
                    value={bookingDate} 
                    min={showtime.startDate.split('T')[0]}
                    max={showtime.endDate.split('T')[0]}
                    onChange={(e) => setBookingDate(e.target.value)}
                />
            </div>
            <div className={styles.timeBadge}>{showtime.startAt}</div>
        </div>
      </div>

      <div className={styles.seatLayout}>
        <div className={styles.screen}>
            <span>SCREEN THIS WAY</span>
            <div className={styles.screenGlow}></div>
        </div>

        <div className={styles.seatGrid}>
            <div className={styles.priceTier}>Rs. {SEAT_PRICE} GOLD</div>
            {ROWS.map(row => (
            <div key={row} className={styles.seatRow}>
                <span className={styles.rowLabel}>{row}</span>
                <div className={styles.seats}>
                    {COLS.map(col => {
                    const seatId = `${row}${col}`;
                    const isSelected = selectedSeats.includes(seatId);
                    const isOccupied = occupiedSeats.includes(seatId);
                    
                    return (
                        <div
                        key={seatId}
                        className={classNames(styles.seat, {
                            [styles.selected]: isSelected,
                            [styles.occupied]: isOccupied,
                        })}
                        onClick={() => toggleSeat(seatId)}
                        >
                        {col}
                        </div>
                    );
                    })}
                </div>
            </div>
            ))}
        </div>

        <div className={styles.legend}>
            <div className={styles.legendItem}>
                <div className={`${styles.seat} ${styles.availableLegend}`}></div>
                <span>Available</span>
            </div>
            <div className={styles.legendItem}>
                <div className={`${styles.seat} ${styles.selected}`}></div>
                <span>Selected</span>
            </div>
            <div className={styles.legendItem}>
                <div className={`${styles.seat} ${styles.occupiedLegend}`}></div>
                <span>Sold</span>
            </div>
        </div>
      </div>

      {selectedSeats.length > 0 && (
        <div className={styles.summaryBar}>
            <button 
                className={`btn btn-primary ${styles.payBtn}`}
                onClick={handleBooking}
            >
                Pay Rs. {selectedSeats.length * SEAT_PRICE}
            </button>
        </div>
      )}
    </div>
  );
};

export default Booking;
