import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  ChevronLeft, X, Edit2, CheckCircle, AlertCircle, Loader2,
  ChevronDown, ChevronUp, Utensils, ShieldCheck, Tag, Smartphone, CreditCard, Wallet, Building2
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { setAuthModalOpen } from '../redux/authSlice';
import api from '../api/axios';
import {
  SEAT_TIERS,
  getTierForSeat,
  getTotalColsForTier,
  getTheatresForCity,
  buildShowKey,
  generateBaselineOccupiedSeats,
  FOOD_MENU,
  createPosterFallback,
} from '../utils/bookmyshowData';
import styles from '../styles/Booking.module.css';

/* ─── BookMyShow Vehicle SVG Illustrations for "How Many Seats?" Modal ─── */
const VehicleIllustration = ({ count }) => {
  if (count === 1) {
    // 1 Seat: Bicycle
    return (
      <svg viewBox="0 0 180 90" className={styles.vehicleSvg}>
        <circle cx="48" cy="62" r="18" fill="none" stroke="#333" strokeWidth="3.5" />
        <circle cx="48" cy="62" r="4" fill="#f84464" />
        <circle cx="132" cy="62" r="18" fill="none" stroke="#333" strokeWidth="3.5" />
        <circle cx="132" cy="62" r="4" fill="#f84464" />
        <path d="M48 62 L78 34 L118 34 L90 62 Z" fill="none" stroke="#f84464" strokeWidth="4" strokeLinejoin="round" />
        <path d="M78 34 L68 22 M60 22 L74 22" stroke="#333" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M132 62 L114 24 L126 20" fill="none" stroke="#333" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (count === 2) {
    // 2 Seats: Scooter / Vespa
    return (
      <svg viewBox="0 0 180 90" className={styles.vehicleSvg}>
        <circle cx="48" cy="66" r="14" fill="none" stroke="#333" strokeWidth="4" />
        <circle cx="48" cy="66" r="5" fill="#f84464" />
        <circle cx="130" cy="66" r="14" fill="none" stroke="#333" strokeWidth="4" />
        <circle cx="130" cy="66" r="5" fill="#f84464" />
        <path d="M34 62 Q48 38 82 44 L110 62 L34 62 Z" fill="#f84464" />
        <path d="M110 62 L124 24 L112 20" fill="none" stroke="#333" strokeWidth="4" strokeLinecap="round" />
        <rect x="52" y="34" width="34" height="9" rx="4.5" fill="#2b3148" />
        <circle cx="128" cy="28" r="5" fill="#ffd700" stroke="#333" strokeWidth="2" />
      </svg>
    );
  }
  if (count === 3) {
    // 3 Seats: Auto Rickshaw
    return (
      <svg viewBox="0 0 180 90" className={styles.vehicleSvg}>
        <path d="M38 58 L38 28 Q38 16 54 16 L108 16 Q124 16 132 36 L142 58 Z" fill="#ffc107" stroke="#333" strokeWidth="3" />
        <path d="M38 42 L136 42 L142 58 L38 58 Z" fill="#1ea83c" />
        <rect x="46" y="22" width="32" height="16" rx="3" fill="#fff" stroke="#333" strokeWidth="2" />
        <rect x="86" y="22" width="28" height="16" rx="3" fill="#fff" stroke="#333" strokeWidth="2" />
        <circle cx="54" cy="64" r="12" fill="#333" />
        <circle cx="54" cy="64" r="5" fill="#fff" />
        <circle cx="130" cy="64" r="12" fill="#333" />
        <circle cx="130" cy="64" r="5" fill="#fff" />
      </svg>
    );
  }
  if (count === 4) {
    // 4 Seats: Compact Car
    return (
      <svg viewBox="0 0 180 90" className={styles.vehicleSvg}>
        <path d="M28 58 L38 34 Q44 22 60 22 L114 22 Q130 22 140 36 L154 58 Z" fill="#f84464" stroke="#333" strokeWidth="3" />
        <rect x="22" y="46" width="136" height="18" rx="8" fill="#f84464" stroke="#333" strokeWidth="3" />
        <path d="M48 44 L56 27 L86 27 L86 44 Z" fill="#fff" stroke="#333" strokeWidth="2" />
        <path d="M92 44 L92 27 L120 27 L130 44 Z" fill="#fff" stroke="#333" strokeWidth="2" />
        <circle cx="52" cy="66" r="13" fill="#2b3148" stroke="#333" strokeWidth="3" />
        <circle cx="52" cy="66" r="5" fill="#fff" />
        <circle cx="128" cy="66" r="13" fill="#2b3148" stroke="#333" strokeWidth="3" />
        <circle cx="128" cy="66" r="5" fill="#fff" />
      </svg>
    );
  }
  if (count <= 7) {
    // 5-7 Seats: SUV / Sedan
    return (
      <svg viewBox="0 0 180 90" className={styles.vehicleSvg}>
        <path d="M20 58 L28 28 Q32 18 48 18 L124 18 Q138 18 148 34 L162 58 Z" fill="#2b3148" stroke="#333" strokeWidth="3" />
        <rect x="16" y="44" width="148" height="20" rx="7" fill="#f84464" stroke="#333" strokeWidth="3" />
        <rect x="36" y="24" width="28" height="16" rx="2" fill="#fff" />
        <rect x="70" y="24" width="28" height="16" rx="2" fill="#fff" />
        <rect x="104" y="24" width="26" height="16" rx="2" fill="#fff" />
        <circle cx="46" cy="66" r="14" fill="#333" />
        <circle cx="46" cy="66" r="6" fill="#fff" />
        <circle cx="134" cy="66" r="14" fill="#333" />
        <circle cx="134" cy="66" r="6" fill="#fff" />
      </svg>
    );
  }
  // 8-10 Seats: Mini Bus / Van
  return (
    <svg viewBox="0 0 180 90" className={styles.vehicleSvg}>
      <rect x="16" y="18" width="148" height="46" rx="10" fill="#f84464" stroke="#333" strokeWidth="3" />
      <rect x="16" y="46" width="148" height="10" fill="#2b3148" />
      <rect x="26" y="25" width="22" height="16" rx="2" fill="#fff" />
      <rect x="54" y="25" width="22" height="16" rx="2" fill="#fff" />
      <rect x="82" y="25" width="22" height="16" rx="2" fill="#fff" />
      <rect x="110" y="25" width="22" height="16" rx="2" fill="#fff" />
      <rect x="138" y="25" width="18" height="16" rx="2" fill="#fff" />
      <circle cx="46" cy="66" r="13" fill="#333" />
      <circle cx="46" cy="66" r="5" fill="#fff" />
      <circle cx="134" cy="66" r="13" fill="#333" />
      <circle cx="134" cy="66" r="5" fill="#fff" />
    </svg>
  );
};

/* ─── M-Ticket Confirmation Modal with QR Code ─── */
const ConfirmationModal = ({ booking, onClose }) => (
  <div className={styles.modalOverlay} onClick={onClose}>
    <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
      <div className={styles.confirmHeaderBadge}>
        <CheckCircle size={44} color="#1ea83c" />
        <div>
          <h2>Booking Confirmed!</h2>
          <p className={styles.confirmSubtitle}>Your M-Ticket has been sent to {booking.email || 'your account'}</p>
        </div>
      </div>

      <div className={styles.mTicketCard}>
        <div className={styles.mTicketTop}>
          <img
            src={booking.posterImage || createPosterFallback(booking.movieTitle)}
            alt={booking.movieTitle}
            className={styles.mTicketPoster}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = createPosterFallback(booking.movieTitle);
            }}
          />
          <div className={styles.mTicketMeta}>
            <h3>{booking.movieTitle}</h3>
            <p className={styles.mTicketSub}>{booking.certification || 'UA'} • {booking.language || 'Hindi'}, {booking.format || '2D'}</p>
            <p className={styles.mTicketVenue}>{booking.theatreName}</p>
            <p className={styles.mTicketDateTime}>{booking.date} | {booking.time}</p>
            <span className={styles.mTicketScreen}>{booking.screen || 'AUDI 01'}</span>
          </div>
        </div>

        <div className={styles.mTicketPerforation}>
          <span className={styles.perfCutLeft} />
          <div className={styles.perfDash} />
          <span className={styles.perfCutRight} />
        </div>

        <div className={styles.mTicketBody}>
          <div className={styles.qrBox}>
            <QRCodeCanvas
              value={`MOVIEBOOK|${booking.id}|${booking.movieTitle}|${booking.seats.join(',')}|${booking.date}|${booking.time}`}
              size={92}
              bgColor="#ffffff"
              fgColor="#1f2533"
              level="M"
            />
          </div>
          <div className={styles.mTicketSeatDetails}>
            <div className={styles.mTicketStat}>
              <span className={styles.mTicketLabel}>{booking.seats.length} Ticket{booking.seats.length > 1 ? 's' : ''} ({booking.tierSummary})</span>
              <strong className={styles.mTicketSeats}>{booking.seats.join(', ')}</strong>
            </div>
            {booking.food && booking.food.length > 0 && (
              <div className={styles.mTicketStat}>
                <span className={styles.mTicketLabel}>Food & Beverage</span>
                <span>{booking.food.map(f => `${f.qty}x ${f.name}`).join(', ')}</span>
              </div>
            )}
            <div className={styles.mTicketStatRow}>
              <span>BOOKING ID: <strong>{booking.id}</strong></span>
              <span className={styles.mTicketPaid}>Paid ₹{booking.total}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.confirmActions}>
        <Link to="/bookings" className={styles.viewBookingsBtn}>View in My Bookings</Link>
        <button className={styles.closeConfirmBtn} onClick={onClose}>Back to Home</button>
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════
   ─── BookMyShow Ticket Booking Page ───
   ═══════════════════════════════════════ */
const Booking = () => {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { currentCity } = useSelector((state) => state.location);

  // Read state or query params
  const passedState = location.state || {};
  const urlMovieId = searchParams.get('movieId');
  const urlTheatreId = searchParams.get('theatreId');
  const urlTheatreName = searchParams.get('theatreName');
  const urlDate = searchParams.get('date');
  const urlTime = searchParams.get('time');
  const urlFormat = searchParams.get('format');
  const urlScreen = searchParams.get('screen');
  const urlLang = searchParams.get('lang');

  const bookingDate = urlDate || passedState.date || new Date().toISOString().split('T')[0];

  const [movie, setMovie] = useState(passedState.movie || null);
  const [theatre, setTheatre] = useState(passedState.theatre || null);
  const [activeShow, setActiveShow] = useState(passedState.show || null);
  const [loading, setLoading] = useState(!passedState.movie);
  const [error, setError] = useState(null);

  // Seat & Qty state
  const [ticketQty, setTicketQty] = useState(2);
  const [hoveredQty, setHoveredQty] = useState(null);
  const [isQtyModalOpen, setIsQtyModalOpen] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [occupiedSeats, setOccupiedSeats] = useState([]);

  // Checkout / F&B / Summary state
  const [step, setStep] = useState('seats'); // 'seats' | 'checkout'
  const [foodCart, setFoodCart] = useState({});
  const [foodCategory, setFoodCategory] = useState('All');
  const [feeExpanded, setFeeExpanded] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [contactEmail, setContactEmail] = useState(user?.email || 'aditi@example.com');
  const [contactPhone, setContactPhone] = useState(user?.phone || '9876543210');

  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  useEffect(() => {
    if (user?.email) setContactEmail(user.email);
    if (user?.phone) setContactPhone(user.phone);
  }, [user]);

  // Resolve Movie, Theatre, and Showtimes even on hard refresh
  useEffect(() => {
    const resolveContext = async () => {
      try {
        setLoading(true);
        setError(null);

        let targetMovie = passedState.movie;
        let extractedMovieId = urlMovieId;
        let extractedTheatreId = urlTheatreId;
        let extractedSlotIdx = 0;

        // Parse bms__<movieId>__<theatreId>__<slotIdx>
        if (showtimeId && showtimeId.startsWith('bms__')) {
          const parts = showtimeId.split('__');
          extractedMovieId = extractedMovieId || parts[1];
          extractedTheatreId = extractedTheatreId || parts[2];
          extractedSlotIdx = parseInt(parts[3] || '0', 10);
        } else if (showtimeId && showtimeId.startsWith('mock-')) {
          const m = showtimeId.match(/^mock-(.+)-(\d+)$/);
          if (m) {
            extractedMovieId = extractedMovieId || m[1];
            extractedSlotIdx = Math.max(0, parseInt(m[2], 10) - 1);
          }
        }

        if (!targetMovie) {
          if (extractedMovieId) {
            const res = await api.get(`/movie/find/${extractedMovieId}`);
            targetMovie = res.data;
          } else if (showtimeId && /^[0-9a-fA-F]{24}$/.test(showtimeId)) {
            const stRes = await api.get(`/showtimes/find/${showtimeId}`).catch(() => null);
            if (stRes?.data?.movieId) {
              targetMovie = stRes.data.movieId;
            }
          }
          if (!targetMovie) {
            const listRes = await api.get('/movie');
            targetMovie = listRes.data?.[0];
          }
        }

        if (!targetMovie) {
          setError('Movie details could not be loaded.');
          return;
        }

        setMovie(targetMovie);

        const cityTheatres = getTheatresForCity(currentCity || 'Noida', targetMovie);
        const foundTheatre =
          cityTheatres.find((t) => t.id === extractedTheatreId) ||
          cityTheatres.find((t) => t.name === urlTheatreName) ||
          passedState.theatre ||
          cityTheatres[0];

        setTheatre(foundTheatre);

        const matchingShow =
          foundTheatre.shows.find((s) => s.time === urlTime) ||
          foundTheatre.shows[extractedSlotIdx] ||
          passedState.show ||
          foundTheatre.shows[0];

        setActiveShow({
          ...matchingShow,
          time: urlTime || matchingShow.time,
          format: urlFormat || matchingShow.format,
          screen: urlScreen || matchingShow.screen,
          language: urlLang || matchingShow.language || 'Hindi',
        });
      } catch (err) {
        console.error('Error loading booking context:', err);
        setError('Unable to load showtime details.');
      } finally {
        setLoading(false);
      }
    };

    resolveContext();
  }, [showtimeId]);

  const currentShowKey = useMemo(() => {
    if (!movie || !theatre || !activeShow) return '';
    return buildShowKey(movie._id, theatre.id, bookingDate, activeShow.time);
  }, [movie, theatre, activeShow, bookingDate]);

  // Fetch occupied seats from backend + deterministic baseline seats
  useEffect(() => {
    if (!currentShowKey) return;
    let isMounted = true;

    const loadOccupiedSeats = async () => {
      const baseline = generateBaselineOccupiedSeats(currentShowKey);
      let localSaved = [];
      try {
        localSaved = JSON.parse(localStorage.getItem(`occupied-${currentShowKey}`) || '[]');
      } catch {
        localSaved = [];
      }

      try {
        const res = await api.get('/movieReservation/occupied', {
          params: { showKey: currentShowKey },
        });
        const serverSeats = Array.isArray(res.data) ? res.data : [];
        if (isMounted) {
          setOccupiedSeats(Array.from(new Set([...baseline, ...localSaved, ...serverSeats])));
        }
      } catch {
        if (isMounted) {
          setOccupiedSeats(Array.from(new Set([...baseline, ...localSaved])));
        }
      }
    };

    loadOccupiedSeats();
    setSelectedSeats([]);
    return () => {
      isMounted = false;
    };
  }, [currentShowKey]);

  // Switch showtime pill directly on the Seat Layout page (BookMyShow feature)
  const handleSwitchShowtime = (slot) => {
    setActiveShow({
      ...slot,
      language: activeShow?.language || slot.language || 'Hindi',
    });
    setStep('seats');
    setSearchParams({
      movieId: movie?._id || '',
      theatreId: theatre?.id || '',
      theatreName: theatre?.name || '',
      date: bookingDate,
      time: slot.time,
      format: slot.format,
      screen: slot.screen,
      lang: activeShow?.language || slot.language || 'Hindi',
    });
  };

  /* ─── BookMyShow Smart Consecutive Seat Selection ─── */
  const handleSeatClick = (seatId, tier, blockStartCol, blockEndCol) => {
    if (occupiedSeats.includes(seatId)) return;

    // If clicking an already selected seat, toggle it off
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats((prev) => prev.filter((s) => s !== seatId));
      return;
    }

    const row = seatId[0];
    const clickedCol = parseInt(seatId.slice(1), 10);

    // Determine how many seats we still need to select
    // If user already has full ticketQty selected, clicking a new seat starts a fresh selection of ticketQty
    const startingFresh = selectedSeats.length === 0 || selectedSeats.length >= ticketQty;
    const baseSeats = startingFresh ? [] : [...selectedSeats];
    const needed = ticketQty - baseSeats.length;

    const newlyPicked = [];
    // 1. Try selecting consecutive available seats to the right within the same block
    for (let c = clickedCol; c <= blockEndCol && newlyPicked.length < needed; c++) {
      const candidate = `${row}${c}`;
      if (!occupiedSeats.includes(candidate) && !baseSeats.includes(candidate)) {
        newlyPicked.push(candidate);
      } else {
        break;
      }
    }

    // 2. If we hit the end of the block or an occupied seat, try extending to the left of clickedCol in the same block
    if (newlyPicked.length < needed) {
      for (let c = clickedCol - 1; c >= blockStartCol && newlyPicked.length < needed; c--) {
        const candidate = `${row}${c}`;
        if (!occupiedSeats.includes(candidate) && !baseSeats.includes(candidate) && !newlyPicked.includes(candidate)) {
          newlyPicked.unshift(candidate);
        } else {
          break;
        }
      }
    }

    setSelectedSeats([...baseSeats, ...newlyPicked]);
  };

  /* ─── Food Cart Helpers ─── */
  const updateFoodQty = (itemId, delta) => {
    setFoodCart((prev) => {
      const nextQty = Math.max(0, (prev[itemId] || 0) + delta);
      const updated = { ...prev };
      if (nextQty === 0) delete updated[itemId];
      else updated[itemId] = nextQty;
      return updated;
    });
  };

  const foodLineItems = useMemo(() => {
    return Object.entries(foodCart)
      .map(([id, qty]) => {
        const item = FOOD_MENU.find((f) => f.id === id);
        return item && qty > 0 ? { ...item, qty } : null;
      })
      .filter(Boolean);
  }, [foodCart]);

  /* ─── Price Calculations (BookMyShow Structure) ─── */
  const seatDetails = useMemo(() => {
    return selectedSeats.map((seat) => {
      const t = getTierForSeat(seat);
      return { seat, tier: t.label, price: t.price };
    });
  }, [selectedSeats]);

  const ticketsAmount = seatDetails.reduce((sum, s) => sum + s.price, 0);
  const baseFee = selectedSeats.length * 30;
  const igst = Math.round(baseFee * 0.18 * 100) / 100;
  const convenienceFeeTotal = Math.round((baseFee + igst) * 100) / 100;
  const foodAmount = foodLineItems.reduce((sum, f) => sum + f.price * f.qty, 0);

  const discountAmount = useMemo(() => {
    if (!appliedPromo) return 0;
    if (appliedPromo === 'FIRSTSHOW') return Math.min(150, Math.round(ticketsAmount * 0.15));
    if (appliedPromo === 'PAYTM150') return ticketsAmount >= 300 ? 150 : 75;
    if (appliedPromo === 'RUPAY25') return Math.min(120, Math.round((ticketsAmount + foodAmount) * 0.2));
    return 0;
  }, [appliedPromo, ticketsAmount, foodAmount]);

  const grandTotal = Math.max(0, Math.round((ticketsAmount + convenienceFeeTotal + foodAmount - discountAmount) * 100) / 100);

  const handleApplyPromo = (codeToApply) => {
    const clean = (codeToApply || promoCode).trim().toUpperCase();
    if (['FIRSTSHOW', 'PAYTM150', 'RUPAY25'].includes(clean)) {
      setAppliedPromo(clean);
      setPromoCode(clean);
    } else {
      alert('Try valid BookMyShow promo codes: FIRSTSHOW, PAYTM150, or RUPAY25');
    }
  };

  /* ─── Complete Booking (Saves to MongoDB + LocalStorage backup) ─── */
  const handleConfirmPayment = async () => {
    if (!isAuthenticated) {
      dispatch(setAuthModalOpen(true));
      return;
    }
    if (selectedSeats.length === 0) return;

    setIsProcessing(true);

    try {
      const payload = {
        showKey: currentShowKey,
        movie: movie?._id,
        movieTitle: movie?.title,
        posterImage: movie?.posterImage,
        certification: movie?.certification || 'UA',
        language: activeShow?.language || 'Hindi',
        format: activeShow?.format || '2D',
        theatre: {
          id: theatre?.id || 'pvr-logix-noida',
          name: theatre?.name || 'PVR: Logix City Centre Mall, Noida',
          address: theatre?.address || 'Sector 32, Noida',
          screen: activeShow?.screen || 'AUDI 01',
        },
        showDate: bookingDate,
        showTime: activeShow?.time || '07:30 PM',
        seatDetails,
        food: foodLineItems.map((f) => ({
          id: f.id,
          name: f.name,
          qty: f.qty,
          price: f.price,
        })),
        paymentMethod,
        contact: {
          email: contactEmail,
          phone: contactPhone,
        },
      };

      let bookingId = 'MB' + Date.now().toString(36).toUpperCase().slice(-7);
      let savedRecord = null;

      try {
        const res = await api.post('/movieReservation', payload);
        savedRecord = res.data;
        if (savedRecord?.bookingId) bookingId = savedRecord.bookingId;
      } catch (apiErr) {
        if (apiErr.response?.status === 409) {
          alert(apiErr.response.data.message || 'Selected seats were just taken. Please pick other seats.');
          setIsProcessing(false);
          setStep('seats');
          return;
        }
        console.warn('Saving to local backup:', apiErr.message);
      }

      // Persist occupied seats locally as well
      const nextOccupied = Array.from(new Set([...occupiedSeats, ...selectedSeats]));
      setOccupiedSeats(nextOccupied);
      localStorage.setItem(`occupied-${currentShowKey}`, JSON.stringify(nextOccupied));

      // Also save in localStorage my-bookings for instant fallback
      const localEntry = {
        _id: savedRecord?._id || `local-${Date.now()}`,
        bookingId,
        status: 'CONFIRMED',
        movieTitle: movie?.title,
        posterImage: movie?.posterImage,
        certification: movie?.certification || 'UA',
        language: activeShow?.language || 'Hindi',
        format: activeShow?.format || '2D',
        theatre: {
          id: theatre?.id,
          name: theatre?.name,
          address: theatre?.address,
          screen: activeShow?.screen || 'AUDI 01',
        },
        showDate: bookingDate,
        showTime: activeShow?.time,
        seats: selectedSeats,
        seatDetails,
        food: foodLineItems,
        amounts: {
          tickets: ticketsAmount,
          convenienceFee: baseFee,
          gst: igst,
          food: foodAmount,
          total: grandTotal,
        },
        date: new Date().toISOString(),
      };

      if (!savedRecord?._id) {
        const prevLocal = JSON.parse(localStorage.getItem('my-bookings') || '[]');
        localStorage.setItem('my-bookings', JSON.stringify([localEntry, ...prevLocal]));
      }

      const tierNames = Array.from(new Set(seatDetails.map((s) => s.tier))).join(', ');
      const formattedDateStr = new Date(bookingDate).toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

      setConfirmedBooking({
        id: bookingId,
        movieTitle: movie?.title,
        posterImage: movie?.posterImage,
        certification: movie?.certification || 'UA',
        language: activeShow?.language || 'Hindi',
        format: activeShow?.format || '2D',
        theatreName: theatre?.name,
        screen: activeShow?.screen || 'AUDI 01',
        date: formattedDateStr,
        time: activeShow?.time,
        seats: selectedSeats,
        tierSummary: tierNames,
        food: foodLineItems,
        total: grandTotal,
        email: contactEmail,
      });

      setSelectedSeats([]);
      setFoodCart({});
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.stateContainer}>
        <div className={styles.spinner} />
        <p>Loading auditorium seat layout...</p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className={styles.stateContainer}>
        <AlertCircle size={48} color="#f84464" />
        <h3>{error || 'Showtime unavailable'}</h3>
        <button className={styles.goBackBtn} onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  const formattedBookingDate = new Date(bookingDate).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const displayQty = hoveredQty || ticketQty;
  const filteredFoodMenu = foodCategory === 'All'
    ? FOOD_MENU
    : FOOD_MENU.filter((f) => f.category === foodCategory);

  return (
    <div className={styles.bookingPage}>
      {/* ═══════ 1. BOOKMYSHOW "HOW MANY SEATS?" MODAL ═══════ */}
      {isQtyModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsQtyModalOpen(false)}>
          <div className={styles.qtyModal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.qtyTitle}>How Many Seats?</h3>

            <div className={styles.vehicleGraphic}>
              <VehicleIllustration count={displayQty} />
            </div>

            <div className={styles.qtyPills}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  className={`${styles.qtyPill} ${ticketQty === num ? styles.qtyPillActive : ''}`}
                  onMouseEnter={() => setHoveredQty(num)}
                  onMouseLeave={() => setHoveredQty(null)}
                  onClick={() => setTicketQty(num)}
                >
                  {num}
                </button>
              ))}
            </div>

            <div className={styles.qtyCategories}>
              {SEAT_TIERS.map((tier) => (
                <div key={tier.tier} className={styles.qtyCat}>
                  <span className={styles.qtyCatName}>{tier.label}</span>
                  <span className={styles.qtyCatPrice}>Rs. {tier.price}.00</span>
                  <span className={styles.qtyCatStatus}>AVAILABLE</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              className={styles.qtySubmit}
              id="select-seats-confirm-btn"
              onClick={() => {
                setIsQtyModalOpen(false);
                if (selectedSeats.length > ticketQty) {
                  setSelectedSeats((prev) => prev.slice(0, ticketQty));
                }
              }}
            >
              Select Seats
            </button>
          </div>
        </div>
      )}

      {/* ═══════ 2. PAYMENT PROCESSING OVERLAY ═══════ */}
      {isProcessing && (
        <div className={styles.paymentOverlay}>
          <div className={styles.paymentModal}>
            <Loader2 className={styles.processingSpinner} size={48} />
            <h3>Confirming Your Seats...</h3>
            <p>Please do not close or refresh this window</p>
          </div>
        </div>
      )}

      {/* ═══════ 3. M-TICKET CONFIRMATION MODAL ═══════ */}
      {confirmedBooking && (
        <ConfirmationModal
          booking={confirmedBooking}
          onClose={() => {
            setConfirmedBooking(null);
            navigate('/');
          }}
        />
      )}

      {/* ═══════ 4. TOP DARK HEADER BAR (Exact BookMyShow Style) ═══════ */}
      <header className={styles.topBar}>
        <div className={styles.topBarInner}>
          <div className={styles.topBarLeft}>
            <button
              type="button"
              className={styles.backBtnArrow}
              onClick={() => (step === 'checkout' ? setStep('seats') : navigate(`/movie/${movie._id}/buytickets?lang=${encodeURIComponent(activeShow?.language || 'English')}`))}
              aria-label="Go back"
            >
              <ChevronLeft size={26} />
            </button>
            <div className={styles.movieMeta}>
              <div className={styles.movieNameRow}>
                <h1 className={styles.movieName}>{movie.title}</h1>
                <span className={styles.certBadgeInline}>{movie.certification || 'UA'}</span>
              </div>
              <p className={styles.movieSubheader}>
                {theatre?.name} &nbsp;|&nbsp; {formattedBookingDate}, {activeShow?.time} ({activeShow?.format})
              </p>
            </div>
          </div>

          <div className={styles.topBarRight}>
            <button
              type="button"
              className={styles.ticketQtyEdit}
              onClick={() => setIsQtyModalOpen(true)}
            >
              <span>{ticketQty} Tickets</span>
              <Edit2 size={13} />
            </button>
            <button
              type="button"
              className={styles.closePageBtn}
              onClick={() => navigate(`/movie/${movie._id}/buytickets?lang=${encodeURIComponent(activeShow?.language || 'English')}`)}
              aria-label="Close booking"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* ═══════ 5. SHOWTIME TIME-SLOT SWITCHER STRIP (BookMyShow Subheader) ═══════ */}
      {step === 'seats' && theatre?.shows && (
        <div className={styles.showtimeStrip}>
          <div className={styles.showtimeStripInner}>
            <div className={styles.timePillsList}>
              {theatre.shows.map((slot) => {
                const isActive = slot.time === activeShow?.time;
                return (
                  <button
                    key={slot._id}
                    type="button"
                    className={`${styles.timeSlotPill} ${isActive ? styles.timeSlotPillActive : ''}`}
                    onClick={() => handleSwitchShowtime(slot)}
                  >
                    <span className={styles.pillTimeText}>{slot.time}</span>
                    <span className={styles.pillFormatText}>{slot.format}</span>
                  </button>
                );
              })}
            </div>
            <div className={styles.stripScreenBadge}>
              <span>{activeShow?.screen || 'AUDI 01'}</span>
              <span>•</span>
              <span>{activeShow?.language || 'Hindi'}</span>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ 6A. STEP 1: AUDITORIUM SEAT MAP VIEW (Full-Width BookMyShow Style) ═══════ */}
      {step === 'seats' && (
        <div className={styles.auditoriumContainer}>
          <div className={styles.seatCanvas}>
            {SEAT_TIERS.map((tier) => {
              const totalCols = getTotalColsForTier(tier);
              // Compute cumulative block boundaries for aisles
              const blockRanges = [];
              let cursor = 1;
              tier.blocks.forEach((bCount) => {
                blockRanges.push({ start: cursor, end: cursor + bCount - 1 });
                cursor += bCount;
              });

              return (
                <div key={tier.tier} className={styles.tierBlock}>
                  <div className={styles.tierDividerHeader}>
                    Rs. {tier.price} {tier.label}
                  </div>

                  {tier.rows.map((row) => (
                    <div key={row} className={styles.seatRow}>
                      <span className={styles.rowLetter}>{row}</span>

                      <div className={styles.rowBlocksWrap}>
                        {blockRanges.map((range, bIdx) => (
                          <div key={bIdx} className={styles.seatBlockGroup}>
                            {Array.from(
                              { length: range.end - range.start + 1 },
                              (_, idx) => range.start + idx
                            ).map((col) => {
                              const seatId = `${row}${col}`;
                              const isSelected = selectedSeats.includes(seatId);
                              const isOccupied = occupiedSeats.includes(seatId);
                              return (
                                <button
                                  key={seatId}
                                  id={`seat-${seatId}`}
                                  type="button"
                                  disabled={isOccupied}
                                  title={`${tier.label} Seat ${seatId} — ₹${tier.price}`}
                                  className={`${styles.seatBtn} ${tier.isRecliner ? styles.seatRecliner : ''} ${
                                    isSelected ? styles.seatSelected : ''
                                  } ${isOccupied ? styles.seatSold : ''}`}
                                  onClick={() => handleSeatClick(seatId, tier, range.start, range.end)}
                                >
                                  {String(col).padStart(2, '0')}
                                </button>
                              );
                            })}
                          </div>
                        ))}
                      </div>

                      <span className={styles.rowLetter}>{row}</span>
                    </div>
                  ))}
                </div>
              );
            })}

            {/* BookMyShow Screen Illustration at the Bottom of the Auditorium */}
            <div className={styles.screenContainer}>
              <svg viewBox="0 0 360 44" className={styles.screenSvg}>
                <defs>
                  <linearGradient id="screenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#cce4ff" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#e8f3ff" stopOpacity="0.2" />
                  </linearGradient>
                </defs>
                <polygon points="36,8 324,8 348,32 12,32" fill="url(#screenGrad)" stroke="#9ec5fe" strokeWidth="1.5" />
                <line x1="36" y1="8" x2="324" y2="8" stroke="#6ea8fe" strokeWidth="3" />
              </svg>
              <p className={styles.screenCaption}>All eyes this way please!</p>
            </div>
          </div>

          {/* ── Sticky Bottom Bar: Legend + Pay CTA (Exact BookMyShow Bottom Bar) ── */}
          <div className={styles.bottomStickyBar}>
            <div className={styles.bottomBarInner}>
              <div className={styles.seatLegend}>
                <div className={styles.legendEntry}>
                  <span className={`${styles.legendBox} ${styles.legendAvailable}`} />
                  <span>Available</span>
                </div>
                <div className={styles.legendEntry}>
                  <span className={`${styles.legendBox} ${styles.legendSelected}`} />
                  <span>Selected</span>
                </div>
                <div className={styles.legendEntry}>
                  <span className={`${styles.legendBox} ${styles.legendSold}`} />
                  <span>Sold</span>
                </div>
              </div>

              {selectedSeats.length > 0 && (
                <div className={styles.bottomPayActions}>
                  <div className={styles.selectedMiniInfo}>
                    <span className={styles.miniSeatCount}>
                      {selectedSeats.length} {selectedSeats.length === 1 ? 'Seat' : 'Seats'}: <strong>{selectedSeats.join(', ')}</strong>
                    </span>
                    {selectedSeats.length < ticketQty && (
                      <span className={styles.miniSeatHint}>
                        (Select {ticketQty - selectedSeats.length} more or proceed)
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    id="pay-button"
                    className={styles.bmsPayCta}
                    onClick={() => setStep('checkout')}
                  >
                    Pay Rs. {ticketsAmount}.00
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════ 6B. STEP 2: GRAB A BITE (F&B) + BOOKING SUMMARY CHECKOUT (BookMyShow Style) ═══════ */}
      {step === 'checkout' && (
        <div className={`container ${styles.checkoutLayout}`}>
          {/* Left Column: Grab a Bite! Food & Beverages */}
          <div className={styles.fnbColumn}>
            <div className={styles.fnbCard}>
              <div className={styles.fnbHeader}>
                <div>
                  <h2 className={styles.fnbTitle}>
                    Grab a <span className={styles.fnbHighlight}>bite!</span>
                  </h2>
                  <p className={styles.fnbSubtitle}>Prebook Your Meal and Save More! Delivered right to your seat.</p>
                </div>
                <Utensils size={28} color="#f84464" />
              </div>

              <div className={styles.fnbTabs}>
                {['All', 'Combos', 'Popcorn', 'Snacks', 'Beverages'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`${styles.fnbTab} ${foodCategory === cat ? styles.fnbTabActive : ''}`}
                    onClick={() => setFoodCategory(cat)}
                  >
                    {cat.toUpperCase()}
                  </button>
                ))}
              </div>

              <div className={styles.fnbGrid}>
                {filteredFoodMenu.map((item) => {
                  const qty = foodCart[item.id] || 0;
                  return (
                    <div key={item.id} className={styles.fnbItemCard}>
                      <div className={styles.fnbImgWrap}>
                        <img src={item.image} alt={item.name} className={styles.fnbImg} />
                        <span className={styles.vegIndicator} title="100% Vegetarian">
                          <span className={styles.vegDot} />
                        </span>
                      </div>
                      <div className={styles.fnbItemBody}>
                        <div className={styles.fnbItemTop}>
                          <h4>{item.name}</h4>
                          <p>{item.desc}</p>
                        </div>
                        <div className={styles.fnbItemBottom}>
                          <div className={styles.fnbPriceWrap}>
                            <span className={styles.fnbPrice}>₹{item.price}</span>
                            {item.originalPrice && (
                              <span className={styles.fnbStrike}>₹{item.originalPrice}</span>
                            )}
                          </div>
                          {qty === 0 ? (
                            <button
                              type="button"
                              className={styles.fnbAddBtn}
                              onClick={() => updateFoodQty(item.id, 1)}
                            >
                              Add
                            </button>
                          ) : (
                            <div className={styles.fnbStepper}>
                              <button type="button" onClick={() => updateFoodQty(item.id, -1)}>−</button>
                              <span>{qty}</span>
                              <button type="button" onClick={() => updateFoodQty(item.id, 1)}>+</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Contact & Payment Method Section */}
            <div className={styles.fnbCard}>
              <h3 className={styles.checkoutSubHeading}>Share Your Contact Details (For M-Ticket)</h3>
              <div className={styles.contactGrid}>
                <div className={styles.contactField}>
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="yourname@email.com"
                  />
                </div>
                <div className={styles.contactField}>
                  <label>Mobile Number</label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>

              <h3 className={styles.checkoutSubHeading} style={{ marginTop: '20px' }}>Preferred Payment Option</h3>
              <div className={styles.paymentMethodGrid}>
                {[
                  { id: 'UPI', label: 'UPI (GPay / PhonePe / Paytm)', icon: Smartphone },
                  { id: 'CARD', label: 'Credit / Debit Card', icon: CreditCard },
                  { id: 'WALLET', label: 'Paytm / Amazon Pay Wallet', icon: Wallet },
                  { id: 'NETBANKING', label: 'Net Banking', icon: Building2 },
                ].map((pm) => {
                  const Icon = pm.icon;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      className={`${styles.pmOption} ${paymentMethod === pm.id ? styles.pmOptionActive : ''}`}
                      onClick={() => setPaymentMethod(pm.id)}
                    >
                      <Icon size={16} />
                      <span>{pm.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: BookMyShow Ticket Receipt Summary */}
          <aside className={styles.summarySidebar}>
            <div className={styles.receiptCard}>
              <span className={styles.cutoutLeft} />
              <span className={styles.cutoutRight} />

              <h3 className={styles.receiptHeader}>BOOKING SUMMARY</h3>

              <div className={styles.receiptShowMeta}>
                <strong>{movie.title} ({movie.certification || 'UA'})</strong>
                <span>{activeShow?.language || 'Hindi'}, {activeShow?.format}</span>
                <span>{theatre?.name} ({activeShow?.screen || 'AUDI 01'})</span>
                <span>{formattedBookingDate} • {activeShow?.time}</span>
              </div>

              <div className={styles.receiptLine}>
                <div>
                  <span className={styles.receiptMainItem}>
                    {seatDetails[0]?.tier || 'PRIME'} - {selectedSeats.join(', ')}
                  </span>
                  <span className={styles.receiptSubCount}>({selectedSeats.length} {selectedSeats.length === 1 ? 'Ticket' : 'Tickets'})</span>
                </div>
                <span className={styles.receiptValue}>Rs. {ticketsAmount.toFixed(2)}</span>
              </div>

              {/* Expandable Convenience Fees */}
              <div className={styles.receiptFeeBlock}>
                <div
                  className={styles.receiptFeeHeader}
                  onClick={() => setFeeExpanded(!feeExpanded)}
                >
                  <span className={styles.feeToggleLabel}>
                    {feeExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    Convenience fees
                  </span>
                  <span>Rs. {convenienceFeeTotal.toFixed(2)}</span>
                </div>
                {feeExpanded && (
                  <div className={styles.feeSubRows}>
                    <div className={styles.feeSubRow}>
                      <span>Base Amount (₹30 × {selectedSeats.length})</span>
                      <span>Rs. {baseFee.toFixed(2)}</span>
                    </div>
                    <div className={styles.feeSubRow}>
                      <span>Integrated GST (IGST) @ 18%</span>
                      <span>Rs. {igst.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.receiptDash} />

              <div className={styles.receiptSubtotalRow}>
                <span>Sub total</span>
                <span>Rs. {(ticketsAmount + convenienceFeeTotal).toFixed(2)}</span>
              </div>

              {/* Food & Beverages Breakdown */}
              {foodLineItems.length > 0 && (
                <div className={styles.receiptFoodSection}>
                  <div className={styles.receiptFoodHeader}>
                    <span>Food & Beverage</span>
                    <span>Rs. {foodAmount.toFixed(2)}</span>
                  </div>
                  {foodLineItems.map((f) => (
                    <div key={f.id} className={styles.receiptFoodLine}>
                      <span>{f.qty} × {f.name}</span>
                      <span>Rs. {(f.qty * f.price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Promo / Offer Code Box */}
              <div className={styles.promoBox}>
                <div className={styles.promoInputRow}>
                  <Tag size={14} color="#f84464" />
                  <input
                    type="text"
                    placeholder="Have a Promo Code? (e.g. FIRSTSHOW)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                  <button type="button" onClick={() => handleApplyPromo(promoCode)}>Apply</button>
                </div>
                <div className={styles.promoQuickChips}>
                  {['FIRSTSHOW', 'PAYTM150', 'RUPAY25'].map((code) => (
                    <button
                      key={code}
                      type="button"
                      className={`${styles.promoChip} ${appliedPromo === code ? styles.promoChipActive : ''}`}
                      onClick={() => handleApplyPromo(code)}
                    >
                      {code}
                    </button>
                  ))}
                </div>
                {discountAmount > 0 && (
                  <div className={styles.discountRow}>
                    <span>Offer Discount ({appliedPromo})</span>
                    <span>- Rs. {discountAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Payable Bar */}
              <div className={styles.payableBanner}>
                <span>Amount Payable</span>
                <strong>Rs. {grandTotal.toFixed(2)}</strong>
              </div>

              <button
                type="button"
                id="confirm-payment-btn"
                className={styles.proceedPayBtn}
                disabled={isProcessing}
                onClick={handleConfirmPayment}
              >
                <span>TOTAL: Rs. {grandTotal.toFixed(2)}</span>
                <span>Proceed</span>
              </button>

              <p className={styles.cancellationNote}>
                <ShieldCheck size={14} /> By proceeding, I express my consent to complete this transaction.
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default Booking;
