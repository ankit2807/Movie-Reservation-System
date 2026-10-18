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

/* ─── Official BookMyShow Vehicle SVG Sprite Illustration (1..10) ─── */
const VehicleIllustration = ({ count }) => {
  const safeCount = Math.min(10, Math.max(1, Number(count) || 2));
  return (
    <svg className={styles.vehicleSvg} aria-hidden="true">
      <use
        href={`/seat-selector-icons.svg#icon-vehicle-${safeCount}`}
        xlinkHref={`/seat-selector-icons.svg#icon-vehicle-${safeCount}`}
      />
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
  const [bestsellerChecked, setBestsellerChecked] = useState(false);
  const [isQtyModalOpen, setIsQtyModalOpen] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showZoomTip, setShowZoomTip] = useState(true);

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
          if (extractedMovieId && /^[0-9a-fA-F]{24}$/.test(extractedMovieId)) {
            const res = await api.get(`/movie/find/${extractedMovieId}`).catch(() => null);
            targetMovie = res?.data;
          } else if (showtimeId && /^[0-9a-fA-F]{24}$/.test(showtimeId)) {
            const stRes = await api.get(`/showtimes/find/${showtimeId}`).catch(() => null);
            if (stRes?.data?.movieId) {
              targetMovie = stRes.data.movieId;
            }
          }
          if (!targetMovie) {
            const listRes = await api.get('/movie').catch(() => null);
            targetMovie = listRes?.data?.[0];
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
          language: urlLang || matchingShow.language || 'English',
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
      language: activeShow?.language || slot.language || 'English',
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
      lang: activeShow?.language || slot.language || 'English',
    });
  };

  /* ─── Bestseller Seat Identification (Matches BookMyShow Auditorium Bestseller Zone) ─── */
  const isBestsellerSeat = (seatId) => {
    if (!seatId) return false;
    const row = seatId[0];
    const col = parseInt(seatId.slice(1), 10);
    if (row === 'C') return col >= 4 && col <= 7;
    if (row === 'D') return (col >= 12 && col <= 14) || (col >= 4 && col <= 7);
    if (['E', 'F', 'G', 'H'].includes(row)) return col >= 4 && col <= 12;
    return false;
  };

  /* ─── Build descending seat blocks (15..01, 17..15 | 14..01, etc.) ─── */
  const getDescendingBlocksForTier = (tier) => {
    const totalCols = getTotalColsForTier(tier);
    let high = totalCols;
    return tier.blocks.map((count) => {
      const end = high;
      const start = high - count + 1;
      high -= count;
      const cols = Array.from({ length: count }, (_, idx) => end - idx);
      return { start, end, cols };
    });
  };

  /* ─── Helper to find block boundaries for any seat ─── */
  const getBlockBoundsForSeat = (seatId) => {
    const tier = getTierForSeat(seatId);
    const col = parseInt(seatId.slice(1), 10);
    const totalCols = getTotalColsForTier(tier);
    const descBlocks = getDescendingBlocksForTier(tier);
    for (const blk of descBlocks) {
      if (col >= blk.start && col <= blk.end) {
        return { tier, blockStartCol: blk.start, blockEndCol: blk.end, totalCols };
      }
    }
    return { tier, blockStartCol: 1, blockEndCol: totalCols, totalCols };
  };

  /* ─── Smart Consecutive Seat Picker for 1..10 Seats ─── */
  const buildConsecutiveSelection = (startSeatId, targetQty, currentOccupied, existingBase = []) => {
    const row = startSeatId[0];
    const clickedCol = parseInt(startSeatId.slice(1), 10);
    const { tier, blockStartCol, blockEndCol, totalCols } = getBlockBoundsForSeat(startSeatId);

    const baseSeats = [...existingBase];
    const needed = Math.max(0, targetQty - baseSeats.length);
    const newlyPicked = [];

    const isTaken = (id) =>
      currentOccupied.includes(id) || baseSeats.includes(id) || newlyPicked.includes(id);

    // 1. Try consecutive available seats within the same block
    for (let c = clickedCol; c <= blockEndCol && newlyPicked.length < needed; c++) {
      const candidate = `${row}${c}`;
      if (!isTaken(candidate)) {
        newlyPicked.push(candidate);
      } else {
        break;
      }
    }

    // 2. Try extending in the opposite direction within the same block
    if (newlyPicked.length < needed) {
      for (let c = clickedCol - 1; c >= blockStartCol && newlyPicked.length < needed; c--) {
        const candidate = `${row}${c}`;
        if (!isTaken(candidate)) {
          newlyPicked.unshift(candidate);
        } else {
          break;
        }
      }
    }

    // 3. If user requested more seats than available in this block (e.g. 6..10 seats),
    //    continue picking nearest available seats across the same row
    if (newlyPicked.length < needed) {
      for (let offset = 1; offset <= totalCols && newlyPicked.length < needed; offset++) {
        const rightCol = clickedCol + offset;
        if (rightCol <= totalCols) {
          const rightCand = `${row}${rightCol}`;
          if (!isTaken(rightCand)) newlyPicked.push(rightCand);
        }
        if (newlyPicked.length >= needed) break;
        const leftCol = clickedCol - offset;
        if (leftCol >= 1) {
          const leftCand = `${row}${leftCol}`;
          if (!isTaken(leftCand)) newlyPicked.unshift(leftCand);
        }
      }
    }

    // 4. Fallback across adjacent rows in the same tier if the entire row was nearly full
    if (newlyPicked.length < needed && tier?.rows) {
      for (const altRow of tier.rows) {
        if (altRow === row) continue;
        for (let c = 1; c <= totalCols && newlyPicked.length < needed; c++) {
          const cand = `${altRow}${c}`;
          if (!isTaken(cand)) newlyPicked.push(cand);
        }
      }
    }

    return [...baseSeats, ...newlyPicked];
  };

  /* ─── Auto-pick Bestseller Seats when Bestseller Checkbox is checked ─── */
  const pickBestsellerSeats = (targetQty, currentOccupied) => {
    const preferredRows = ['E', 'F', 'G', 'D', 'C', 'H'];
    for (const r of preferredRows) {
      for (let c = 6; c <= 12; c++) {
        const candidate = `${r}${c}`;
        if (!currentOccupied.includes(candidate)) {
          return buildConsecutiveSelection(candidate, targetQty, currentOccupied, []);
        }
      }
    }
    return buildConsecutiveSelection('E7', targetQty, currentOccupied, []);
  };

  /* ─── BookMyShow Smart Consecutive Seat Selection on Click ─── */
  const handleSeatClick = (seatId) => {
    if (occupiedSeats.includes(seatId)) return;

    // If clicking an already selected seat, toggle it off
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats((prev) => prev.filter((s) => s !== seatId));
      return;
    }

    // If user has 0 seats or already has full ticketQty selected, start a fresh selection of ticketQty
    const startingFresh = selectedSeats.length === 0 || selectedSeats.length >= ticketQty;
    const baseSeats = startingFresh ? [] : [...selectedSeats];
    const nextSelection = buildConsecutiveSelection(seatId, ticketQty, occupiedSeats, baseSeats);
    setSelectedSeats(nextSelection);
  };

  /* ─── Confirm "How many seats?" Modal ─── */
  const handleConfirmQtyModal = () => {
    setIsQtyModalOpen(false);
    if (bestsellerChecked) {
      setSelectedSeats(pickBestsellerSeats(ticketQty, occupiedSeats));
    } else if (selectedSeats.length > 0) {
      // Resize current selection to match the newly chosen ticketQty
      setSelectedSeats(buildConsecutiveSelection(selectedSeats[0], ticketQty, occupiedSeats, []));
    }
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
        language: activeShow?.language || 'English',
        format: activeShow?.format || '2D',
        theatre: {
          id: theatre?.id || 'moviemax-gulshan-noida',
          name: theatre?.name || 'MovieMax Laserplex: Gulshan One 29 Mall, Noida',
          address: theatre?.address || 'Sector 129, Noida',
          screen: activeShow?.screen || 'AUDI 01',
        },
        showDate: bookingDate,
        showTime: activeShow?.time || '03:45 PM',
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
        language: activeShow?.language || 'English',
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
        language: activeShow?.language || 'English',
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

  const dObj = new Date(bookingDate);
  const formattedBookingDate = `${dObj.toLocaleDateString('en-US', { weekday: 'short' })}, ${dObj.getDate()} ${dObj.toLocaleDateString('en-US', { month: 'long' })}, ${dObj.getFullYear()}`;

  const displayQty = hoveredQty || ticketQty;
  const modalTiers = activeShow?.tiers?.length ? activeShow.tiers : SEAT_TIERS;
  const filteredFoodMenu = foodCategory === 'All'
    ? FOOD_MENU
    : FOOD_MENU.filter((f) => f.category === foodCategory);

  return (
    <div className={styles.bookingPage}>
      {/* ═══════ 1. BOOKMYSHOW "HOW MANY SEATS?" MODAL ═══════ */}
      {isQtyModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsQtyModalOpen(false)}>
          <div
            className={styles.qtyModal}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="How many seats?"
          >
            <div className={styles.qtyHeader}>
              <h3 className={styles.qtyTitle}>How many seats?</h3>
            </div>

            <div className={styles.vehicleGraphic}>
              <VehicleIllustration count={displayQty} />
            </div>

            <div className={styles.qtyPillsWrap}>
              <div className={styles.qtyPills}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                  const isHighlighted = displayQty === num;
                  return (
                    <button
                      key={num}
                      type="button"
                      id={`qty-pill-${num}`}
                      className={`${styles.qtyPill} ${isHighlighted ? styles.qtyPillActive : ''}`}
                      onMouseEnter={() => setHoveredQty(num)}
                      onMouseLeave={() => setHoveredQty(null)}
                      onFocus={() => setHoveredQty(num)}
                      onBlur={() => setHoveredQty(null)}
                      onClick={() => setTicketQty(num)}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={styles.qtyDivider} />

            <div className={styles.qtyCategories}>
              {modalTiers.map((tier) => (
                <div key={tier.tier || tier.label} className={styles.qtyCat}>
                  <span className={styles.qtyCatName}>{tier.label}</span>
                  <span className={styles.qtyCatPrice}>₹{tier.price}</span>
                  <span className={styles.qtyCatStatus}>{tier.status || 'AVAILABLE'}</span>
                </div>
              ))}
            </div>

            <div
              className={styles.bestsellerBanner}
              onClick={() => setBestsellerChecked((prev) => !prev)}
              role="checkbox"
              aria-checked={bestsellerChecked}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  setBestsellerChecked((prev) => !prev);
                }
              }}
            >
              <div className={styles.bestsellerInner}>
                <span>Book the </span>
                <span className={styles.bestsellerIconWrap}>
                  <svg width="17" height="16" aria-hidden="true">
                    <use
                      href={`/seat-layout-icons.svg#${bestsellerChecked ? 'icon-best-seat' : 'icon-bestseller'}`}
                      xlinkHref={`/seat-layout-icons.svg#${bestsellerChecked ? 'icon-best-seat' : 'icon-bestseller'}`}
                    />
                  </svg>
                </span>
                <span> <b>Bestseller Seats</b> in this cinema at no extra cost!</span>
              </div>
            </div>

            <div className={styles.qtySubmitWrap}>
              <button
                type="button"
                className={styles.qtySubmit}
                id="select-seats-confirm-btn"
                onClick={handleConfirmQtyModal}
              >
                Select Seats
              </button>
            </div>
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

      {/* ═══════ 4 & 5. STICKY HEADER STACK (White Top Bar + Showtime Strip) ═══════ */}
      <div className={styles.headerStack}>
        <header className={styles.topBar}>
          <div className={styles.topBarInner}>
            <div className={styles.topBarLeft}>
              <button
                type="button"
                className={styles.backBtnArrow}
                onClick={() =>
                  step === 'checkout'
                    ? setStep('seats')
                    : navigate(`/movie/${movie._id}/buytickets?lang=${encodeURIComponent(activeShow?.language || 'English')}`)
                }
                aria-label="Go back"
              >
                <svg width="20" height="20" aria-hidden="true">
                  <use
                    href="/common-icons.svg#icon-chevron-any-color"
                    xlinkHref="/common-icons.svg#icon-chevron-any-color"
                  />
                </svg>
              </button>
              <div className={styles.movieMeta}>
                <div className={styles.movieNameRow}>
                  <h1 className={styles.movieName}>
                    {movie.title} - {activeShow?.language || 'English'}
                  </h1>
                </div>
                <p className={styles.movieSubheader}>
                  {theatre?.name} | {formattedBookingDate} | {activeShow?.time}
                </p>
              </div>
            </div>

            <div className={styles.topBarRight}>
              <span className={styles.a11yBadge} title="Wheelchair accessible cinema">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="9.5" stroke="#333333" strokeWidth="1.5" />
                  <circle cx="12" cy="7" r="1.4" fill="#333333" />
                  <path
                    d="M8.5 10.5H15.5M12 10.5V14.5M12 14.5L9.8 18M12 14.5L14.2 18"
                    stroke="#333333"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <button
                type="button"
                id="open-qty-modal-btn"
                className={styles.ticketQtyEdit}
                onClick={() => setIsQtyModalOpen(true)}
              >
                <svg width="14" height="14" aria-hidden="true">
                  <use
                    href="/seat-layout-icons.svg#icon-red-edit"
                    xlinkHref="/seat-layout-icons.svg#icon-red-edit"
                  />
                </svg>
                <span>{ticketQty} {ticketQty === 1 ? 'Ticket' : 'Tickets'}</span>
              </button>
            </div>
          </div>
        </header>

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
            </div>
          </div>
        )}
      </div>

      {/* ═══════ 6A. STEP 1: AUDITORIUM SEAT MAP VIEW (Exact BookMyShow Layout) ═══════ */}
      {step === 'seats' && (
        <div className={styles.auditoriumContainer}>
          <div className={styles.seatCanvas}>
            <div
              className={styles.seatGridZoomWrap}
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
            >
              {SEAT_TIERS.map((tier) => {
                const descBlocks = getDescendingBlocksForTier(tier);
                return (
                  <div key={tier.tier} className={styles.tierBlock}>
                    <div className={styles.tierRowLayout}>
                      {/* Left Row Letter Strip (.fIuTG / .hDNuHK) */}
                      <div className={styles.rowLetterColumn}>
                        <div className={styles.rowLetterHeaderSpacer} />
                        <div className={styles.rowLetterStrip}>
                          {tier.rows.map((row) => (
                            <span key={row} className={styles.rowLetter}>
                              {row}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Right Seat Grid + Tier Price Header */}
                      <div className={styles.tierSeatsColumn}>
                        <div className={styles.tierDividerHeader}>
                          ₹{tier.price} {tier.label}
                        </div>

                        {tier.rows.map((row) => (
                          <div
                            key={row}
                            className={`${styles.seatRow} ${
                              tier.isRecliner ? styles.seatRowLeft : ''
                            }`}
                          >
                            <div
                              className={`${styles.rowBlocksWrap} ${
                                tier.isRecliner ? styles.rowBlocksWrapLeft : ''
                              }`}
                            >
                              {descBlocks.map((blk, bIdx) => (
                                <div key={bIdx} className={styles.seatBlockGroup}>
                                  {blk.cols.map((col) => {
                                    const seatId = `${row}${col}`;
                                    const isSelected = selectedSeats.includes(seatId);
                                    const isOccupied = occupiedSeats.includes(seatId);
                                    const isBestseller =
                                      !isOccupied && !isSelected && isBestsellerSeat(seatId);
                                    return (
                                      <button
                                        key={seatId}
                                        id={`seat-${seatId}`}
                                        type="button"
                                        disabled={isOccupied}
                                        title={`${tier.label}${isBestseller ? ' (Bestseller)' : ''} Seat ${seatId} — ₹${tier.price}`}
                                        className={`${styles.seatBtn} ${
                                          isBestseller ? styles.seatBestseller : ''
                                        } ${isSelected ? styles.seatSelected : ''} ${
                                          isOccupied ? styles.seatSold : ''
                                        }`}
                                        onClick={() => handleSeatClick(seatId)}
                                      >
                                        {String(col).padStart(2, '0')}
                                      </button>
                                    );
                                  })}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Official BookMyShow 3D Screen Illustration at the Bottom of the Auditorium */}
              <div className={styles.screenContainer}>
                <svg viewBox="0 0 360 44" className={styles.screenSvg} aria-hidden="true">
                  <defs>
                    <linearGradient id="bmsScreenGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#cce4ff" stopOpacity="0.95" />
                      <stop offset="100%" stopColor="#e8f3ff" stopOpacity="0.35" />
                    </linearGradient>
                  </defs>
                  <polygon
                    points="36,8 324,8 348,32 12,32"
                    fill="url(#bmsScreenGrad)"
                    stroke="#9ec5fe"
                    strokeWidth="1.5"
                  />
                  <line x1="36" y1="8" x2="324" y2="8" stroke="#6ea8fe" strokeWidth="3" />
                </svg>
                <p className={styles.screenCaption}>All eyes this way please</p>
              </div>
            </div>
          </div>

          {/* ── Right-Side Floating Auditorium Minimap (Matches bms_seat_map_real_1.png) ── */}
          <div className={styles.minimapWidget} aria-hidden="true">
            <div className={styles.minimapInner}>
              <div className={styles.minimapViewportBox} />
              {SEAT_TIERS.map((tier) => (
                <div key={tier.tier} className={styles.minimapTier}>
                  <div className={styles.minimapTierLabel}>₹{tier.price} {tier.label}</div>
                  {tier.rows.map((r) => (
                    <div
                      key={r}
                      className={`${styles.minimapRow} ${
                        tier.isRecliner ? styles.minimapRowLeft : ''
                      }`}
                    >
                      {Array.from({ length: getTotalColsForTier(tier) }, (_, idx) => (
                        <span key={idx} className={styles.minimapDot} />
                      ))}
                    </div>
                  ))}
                </div>
              ))}
              <div className={styles.minimapScreenBar} />
            </div>
          </div>

          {/* ── Right-Side Floating Zoom Controls + Blue Tooltip ── */}
          <div
            className={`${styles.zoomControlsWrap} ${
              selectedSeats.length > 0 ? styles.zoomControlsWithPay : ''
            }`}
          >
            {showZoomTip && (
              <div className={styles.zoomTooltip} onClick={() => setShowZoomTip(false)}>
                <span>The layout can be zoomed in/out</span>
                <span className={styles.zoomTooltipArrow} />
              </div>
            )}
            <div className={styles.zoomButtonsBox}>
              <button
                type="button"
                className={styles.zoomBtn}
                aria-label="Zoom in"
                onClick={() => {
                  setZoomLevel((z) => Math.min(1.25, +(z + 0.1).toFixed(2)));
                  setShowZoomTip(false);
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666666" strokeWidth="1.8">
                  <circle cx="11" cy="11" r="7" />
                  <line x1="16.5" y1="16.5" x2="21" y2="21" strokeLinecap="round" />
                  <line x1="11" y1="8" x2="11" y2="14" strokeLinecap="round" />
                  <line x1="8" y1="11" x2="14" y2="11" strokeLinecap="round" />
                </svg>
              </button>
              <button
                type="button"
                className={styles.zoomBtn}
                aria-label="Zoom out"
                onClick={() => {
                  setZoomLevel((z) => Math.max(0.85, +(z - 0.1).toFixed(2)));
                  setShowZoomTip(false);
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999999" strokeWidth="1.8">
                  <circle cx="11" cy="11" r="7" />
                  <line x1="16.5" y1="16.5" x2="21" y2="21" strokeLinecap="round" />
                  <line x1="8" y1="11" x2="14" y2="11" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          {/* ── 3-Tier Fixed Bottom Footer (Legend + Bank Offer Strip + Pay ₹ CTA) ── */}
          <div className={styles.bottomStickyBar}>
            {/* Tier 1: Seat Legend Row */}
            <div className={styles.legendRow}>
              <div className={styles.seatLegend}>
                <div className={styles.legendEntry}>
                  <span className={`${styles.legendBox} ${styles.legendAvailable}`} />
                  <span>Available</span>
                </div>
                <div className={styles.legendEntry}>
                  <span className={`${styles.legendBox} ${styles.legendSold}`} />
                  <span>Sold</span>
                </div>
                <div className={styles.legendEntry}>
                  <svg width="17" height="16" aria-hidden="true">
                    <use
                      href="/seat-layout-icons.svg#icon-bestseller"
                      xlinkHref="/seat-layout-icons.svg#icon-bestseller"
                    />
                  </svg>
                  <span>Bestseller</span>
                  <svg width="12" height="12" aria-hidden="true">
                    <use
                      href="/common-icons.svg#icon-info-any-color"
                      xlinkHref="/common-icons.svg#icon-info-any-color"
                    />
                  </svg>
                </div>
                <div className={styles.legendEntry}>
                  <span className={`${styles.legendBox} ${styles.legendSelected}`} />
                  <span>Selected</span>
                </div>
              </div>
            </div>

            {/* Tier 2: Bank Offer Strip */}
            <div className={styles.offerBannerStrip}>
              <div className={styles.offerBannerContent}>
                <span className={styles.offerBankBadge} aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="#1b4e8c" />
                    <path d="M8 12h8M12 7v10" stroke="#e53935" strokeWidth="2.4" strokeLinecap="round" />
                  </svg>
                </span>
                <span className={styles.offerBannerText}>
                  Enjoy B1G1 Ticket Free!* with Bandhan Bank Legacy Debit Cards
                </span>
                <span className={styles.offerBannerCount}>1/3</span>
              </div>
              <div className={styles.offerDotsRow} aria-hidden="true">
                <span className={`${styles.offerDot} ${styles.offerDotActive}`} />
                <span className={styles.offerDot} />
                <span className={styles.offerDot} />
              </div>
            </div>

            {/* Tier 3: Pay ₹ CTA Bar (Shown when seats are selected) */}
            {selectedSeats.length > 0 && (
              <div className={styles.payBarRow}>
                <button
                  type="button"
                  id="pay-button"
                  className={styles.bmsPayCta}
                  onClick={() => setStep('checkout')}
                >
                  Pay ₹ {ticketsAmount}
                </button>
              </div>
            )}
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
