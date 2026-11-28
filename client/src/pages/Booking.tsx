import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Utensils,
  ShieldCheck,
  Tag,
  Smartphone,
  CreditCard,
  Wallet,
  Building2,
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { setAuthModalOpen } from '../redux/authSlice';
import { showToast } from '../redux/locationSlice';
import api from '../api/axios';
import StripePaymentForm from '../components/StripePaymentForm';
import {
  SEAT_TIERS,
  getTierForSeat,
  getTotalColsForTier,
  getTheatresForCity,
  buildShowKey,
  generateBaselineOccupiedSeats,
  FOOD_MENU,
  createPosterFallback,
} from '../utils/moviebookData';
import {
  FoodMenuItem,
  getApiErrorMessage,
  Movie,
  PaymentConfig,
  Reservation,
  SeatTier,
  ShowTime,
  Theatre,
  TheatreShow,
} from '../types';
import styles from '../styles/Booking.module.css';

interface FoodCartLine extends FoodMenuItem {
  qty: number;
}

interface ConfirmedBookingSnapshot {
  id: string;
  movieTitle?: string;
  posterImage?: string;
  certification: string;
  language: string;
  format: string;
  theatreName?: string;
  screen: string;
  date: string;
  time?: string;
  seats: string[];
  tierSummary: string;
  food: FoodCartLine[];
  total: number;
  email: string;
}

interface BookingLocationState {
  movie?: Movie;
  theatre?: Theatre;
  show?: TheatreShow;
  date?: string;
}

interface PaymentConfigState extends PaymentConfig {
  loaded: boolean;
}

interface CreateIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
}

const getLocalIsoToday = (): string => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const parseIsoLocalDate = (isoStr: string): Date => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoStr)) {
    return new Date(`${isoStr}T00:00:00`);
  }
  const d = new Date(isoStr);
  return Number.isNaN(d.getTime()) ? new Date() : d;
};

const VehicleIllustration: React.FC<{ count: number }> = ({ count }) => {
  const safeCount = Math.min(10, Math.max(1, Number(count) || 2));
  return (
    <svg className={styles.vehicleSvg} aria-hidden="true">
      <use href={`/seat-selector-icons.svg#icon-vehicle-${safeCount}`} />
    </svg>
  );
};

const ConfirmationModal: React.FC<{
  booking: ConfirmedBookingSnapshot;
  onClose: () => void;
}> = ({ booking, onClose }) => (
  <div className={styles.modalOverlay} onClick={onClose}>
    <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
      <div className={styles.confirmHeaderBadge}>
        <CheckCircle size={44} color="#1ea83c" />
        <div>
          <h2>Booking Confirmed!</h2>
          <p className={styles.confirmSubtitle}>
            Your M-Ticket has been sent to {booking.email || 'your account'}
          </p>
        </div>
      </div>

      <div className={styles.mTicketCard}>
        <div className={styles.mTicketTop}>
          <img
            src={booking.posterImage || createPosterFallback(booking.movieTitle)}
            alt={booking.movieTitle || 'Movie poster'}
            className={styles.mTicketPoster}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = createPosterFallback(booking.movieTitle);
            }}
          />
          <div className={styles.mTicketMeta}>
            <h3>{booking.movieTitle}</h3>
            <p className={styles.mTicketSub}>
              {booking.certification || 'UA'} • {booking.language || 'Hindi'},{' '}
              {booking.format || '2D'}
            </p>
            <p className={styles.mTicketVenue}>{booking.theatreName}</p>
            <p className={styles.mTicketDateTime}>
              {booking.date} | {booking.time}
            </p>
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
              <span className={styles.mTicketLabel}>
                {booking.seats.length} Ticket{booking.seats.length > 1 ? 's' : ''} (
                {booking.tierSummary})
              </span>
              <strong className={styles.mTicketSeats}>{booking.seats.join(', ')}</strong>
            </div>
            {booking.food && booking.food.length > 0 && (
              <div className={styles.mTicketStat}>
                <span className={styles.mTicketLabel}>Food &amp; Beverage</span>
                <span>{booking.food.map((f) => `${f.qty}x ${f.name}`).join(', ')}</span>
              </div>
            )}
            <div className={styles.mTicketStatRow}>
              <span>
                BOOKING ID: <strong>{booking.id}</strong>
              </span>
              <span className={styles.mTicketPaid}>Paid ₹{booking.total}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.confirmActions}>
        <Link to="/bookings" className={styles.viewBookingsBtn}>
          View in My Bookings
        </Link>
        <button type="button" className={styles.closeConfirmBtn} onClick={onClose}>
          Back to Home
        </button>
      </div>
    </div>
  </div>
);

const Booking: React.FC = () => {
  const { showtimeId } = useParams<{ showtimeId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { currentCity } = useAppSelector((state) => state.location);

  const navState = (location.state || {}) as BookingLocationState;
  const passedMovie = navState.movie || null;
  const passedTheatre = navState.theatre || null;
  const passedShow = navState.show || null;
  const passedDate = navState.date || null;
  const urlMovieId = searchParams.get('movieId');
  const urlTheatreId = searchParams.get('theatreId');
  const urlTheatreName = searchParams.get('theatreName');
  const urlDate = searchParams.get('date');
  const urlTime = searchParams.get('time');
  const urlFormat = searchParams.get('format');
  const urlScreen = searchParams.get('screen');
  const urlLang = searchParams.get('lang');

  const bookingDate = urlDate || passedDate || getLocalIsoToday();

  const [movie, setMovie] = useState<Movie | null>(passedMovie);
  const [theatre, setTheatre] = useState<Theatre | null>(passedTheatre);
  const [activeShow, setActiveShow] = useState<TheatreShow | null>(passedShow);
  const [loading, setLoading] = useState(!passedMovie);
  const [error, setError] = useState<string | null>(null);

  const [ticketQty, setTicketQty] = useState(2);
  const [hoveredQty, setHoveredQty] = useState<number | null>(null);
  const [bestsellerChecked, setBestsellerChecked] = useState(false);
  const [isQtyModalOpen, setIsQtyModalOpen] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [occupiedSeats, setOccupiedSeats] = useState<string[]>([]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showZoomTip, setShowZoomTip] = useState(true);

  const [step, setStep] = useState<'seats' | 'checkout'>('seats');
  const [foodCart, setFoodCart] = useState<Record<string, number>>({});
  const [foodCategory, setFoodCategory] = useState('All');
  const [feeExpanded, setFeeExpanded] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const userContactKey = `${user?.email || ''}|${user?.phone || ''}`;
  const [prevContactKey, setPrevContactKey] = useState(userContactKey);
  if (prevContactKey !== userContactKey) {
    setPrevContactKey(userContactKey);
    if (user?.email) setContactEmail(user.email);
    if (user?.phone) setContactPhone(user.phone);
  }

  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState<ConfirmedBookingSnapshot | null>(null);

  const [paymentConfig, setPaymentConfig] = useState<PaymentConfigState>({
    stripeEnabled: false,
    publishableKey: null,
    currency: 'inr',
    mode: 'demo',
    loaded: false,
  });
  const [stripeClientSecret, setStripeClientSecret] = useState('');
  const [stripeIntentLoading, setStripeIntentLoading] = useState(false);
  const [stripeIntentError, setStripeIntentError] = useState('');

  useEffect(() => {
    let isMounted = true;
    api
      .get<PaymentConfig>('/payments/config')
      .then((res) => {
        if (isMounted && res.data) {
          setPaymentConfig({
            stripeEnabled: Boolean(res.data.stripeEnabled),
            publishableKey: res.data.publishableKey || null,
            currency: res.data.currency || 'inr',
            mode: res.data.mode || 'demo',
            loaded: true,
          });
        }
      })
      .catch(() => {
        if (isMounted) {
          setPaymentConfig((prev) => ({ ...prev, loaded: true }));
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const resolveContext = async () => {
      try {
        setLoading(true);
        setError(null);

        let targetMovie: Movie | null = passedMovie;
        let extractedMovieId = urlMovieId;
        let extractedTheatreId = urlTheatreId;
        let extractedSlotIdx = 0;

        if (showtimeId && showtimeId.startsWith('bms__')) {
          const parts = showtimeId.split('__');
          extractedMovieId = extractedMovieId || parts[1] || null;
          extractedTheatreId = extractedTheatreId || parts[2] || null;
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
            const res = await api.get<Movie>(`/movie/find/${extractedMovieId}`).catch(() => null);
            targetMovie = res?.data || null;
          } else if (showtimeId && /^[0-9a-fA-F]{24}$/.test(showtimeId)) {
            const stRes = await api
              .get<ShowTime>(`/showtimes/find/${showtimeId}`)
              .catch(() => null);
            if (stRes?.data?.movieId && typeof stRes.data.movieId === 'object') {
              targetMovie = stRes.data.movieId;
            }
          }
          if (!targetMovie) {
            const listRes = await api.get<Movie[]>('/movie').catch(() => null);
            targetMovie = listRes?.data?.[0] || null;
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
          passedTheatre ||
          cityTheatres[0];

        setTheatre(foundTheatre);

        const matchingShow =
          foundTheatre.shows.find((s) => s.time === urlTime) ||
          foundTheatre.shows[extractedSlotIdx] ||
          passedShow ||
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

    void resolveContext();
  }, [
    showtimeId,
    currentCity,
    passedMovie,
    passedTheatre,
    passedShow,
    urlMovieId,
    urlTheatreId,
    urlTheatreName,
    urlTime,
    urlFormat,
    urlScreen,
    urlLang,
  ]);

  const currentShowKey = useMemo(() => {
    if (!movie || !theatre || !activeShow) return '';
    return buildShowKey(movie._id, theatre.id, bookingDate, activeShow.time);
  }, [movie, theatre, activeShow, bookingDate]);

  const [prevShowKey, setPrevShowKey] = useState(currentShowKey);
  if (prevShowKey !== currentShowKey) {
    setPrevShowKey(currentShowKey);
    setSelectedSeats([]);
  }

  useEffect(() => {
    if (!currentShowKey) return undefined;
    let isMounted = true;

    const loadOccupiedSeats = async () => {
      const baseline = generateBaselineOccupiedSeats(currentShowKey);
      let localSaved: string[];
      try {
        localSaved = JSON.parse(localStorage.getItem(`occupied-${currentShowKey}`) || '[]') as string[];
      } catch {
        localSaved = [];
      }

      try {
        const res = await api.get<string[]>('/movieReservation/occupied', {
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

    void loadOccupiedSeats();
    return () => {
      isMounted = false;
    };
  }, [currentShowKey]);

  const handleSwitchShowtime = (slot: TheatreShow) => {
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

  const isBestsellerSeat = (seatId: string): boolean => {
    if (!seatId) return false;
    const row = seatId[0];
    const col = parseInt(seatId.slice(1), 10);
    if (row === 'C') return col >= 4 && col <= 7;
    if (row === 'D') return (col >= 12 && col <= 14) || (col >= 4 && col <= 7);
    if (['E', 'F', 'G', 'H'].includes(row)) return col >= 4 && col <= 12;
    return false;
  };

  const getDescendingBlocksForTier = (tier: SeatTier) => {
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

  const getBlockBoundsForSeat = (seatId: string) => {
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

  const buildConsecutiveSelection = (
    startSeatId: string,
    targetQty: number,
    currentOccupied: string[],
    existingBase: string[] = []
  ): string[] => {
    const row = startSeatId[0];
    const clickedCol = parseInt(startSeatId.slice(1), 10);
    const { tier, blockStartCol, blockEndCol, totalCols } = getBlockBoundsForSeat(startSeatId);

    const baseSeats = [...existingBase];
    const needed = Math.max(0, targetQty - baseSeats.length);
    const newlyPicked: string[] = [];

    const isTaken = (id: string) =>
      currentOccupied.includes(id) || baseSeats.includes(id) || newlyPicked.includes(id);

    for (let c = clickedCol; c <= blockEndCol && newlyPicked.length < needed; c++) {
      const candidate = `${row}${c}`;
      if (!isTaken(candidate)) {
        newlyPicked.push(candidate);
      } else {
        break;
      }
    }

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

  const pickBestsellerSeats = (targetQty: number, currentOccupied: string[]): string[] => {
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

  const handleSeatClick = (seatId: string) => {
    if (occupiedSeats.includes(seatId)) return;

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats((prev) => prev.filter((s) => s !== seatId));
      return;
    }

    const startingFresh = selectedSeats.length === 0 || selectedSeats.length >= ticketQty;
    const baseSeats = startingFresh ? [] : [...selectedSeats];
    const nextSelection = buildConsecutiveSelection(seatId, ticketQty, occupiedSeats, baseSeats);
    setSelectedSeats(nextSelection);
  };

  const handleConfirmQtyModal = () => {
    setIsQtyModalOpen(false);
    if (bestsellerChecked) {
      setSelectedSeats(pickBestsellerSeats(ticketQty, occupiedSeats));
    } else if (selectedSeats.length > 0) {
      setSelectedSeats(buildConsecutiveSelection(selectedSeats[0], ticketQty, occupiedSeats, []));
    }
  };

  const updateFoodQty = (itemId: string, delta: number) => {
    setFoodCart((prev) => {
      const nextQty = Math.max(0, (prev[itemId] || 0) + delta);
      const updated = { ...prev };
      if (nextQty === 0) delete updated[itemId];
      else updated[itemId] = nextQty;
      return updated;
    });
  };

  const foodLineItems = useMemo<FoodCartLine[]>(() => {
    return Object.entries(foodCart)
      .map(([id, qty]) => {
        const item = FOOD_MENU.find((f) => f.id === id);
        return item && qty > 0 ? { ...item, qty } : null;
      })
      .filter((entry): entry is FoodCartLine => entry !== null);
  }, [foodCart]);

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

  const grandTotal = Math.max(
    0,
    Math.round((ticketsAmount + convenienceFeeTotal + foodAmount - discountAmount) * 100) / 100
  );

  const intentSignature = useMemo(
    () =>
      JSON.stringify({
        showKey: currentShowKey,
        seats: selectedSeats,
        food: foodLineItems.map((f) => `${f.id}:${f.qty}`),
        promo: appliedPromo || '',
      }),
    [currentShowKey, selectedSeats, foodLineItems, appliedPromo]
  );

  useEffect(() => {
    if (
      step !== 'checkout' ||
      !paymentConfig.stripeEnabled ||
      !isAuthenticated ||
      selectedSeats.length === 0 ||
      !currentShowKey
    ) {
      return undefined;
    }

    let isActive = true;
    const timer = setTimeout(async () => {
      setStripeIntentLoading(true);
      setStripeIntentError('');
      try {
        const res = await api.post<CreateIntentResponse>('/payments/create-payment-intent', {
          showKey: currentShowKey,
          movieTitle: movie?.title,
          theatre: {
            id: theatre?.id || 'moviemax-gulshan-noida',
            name: theatre?.name || 'MovieMax Laserplex: Gulshan One 29 Mall, Noida',
            address: theatre?.address || 'Sector 129, Noida',
            screen: activeShow?.screen || 'AUDI 01',
          },
          showDate: bookingDate,
          showTime: activeShow?.time || '03:45 PM',
          seatDetails,
          food: foodLineItems.map((f) => ({ id: f.id, qty: f.qty })),
          promoCode: appliedPromo || undefined,
          contact: { email: contactEmail || user?.email || '' },
        });
        if (isActive && res.data?.clientSecret) {
          setStripeClientSecret(res.data.clientSecret);
        }
      } catch (err: unknown) {
        if (!isActive) return;
        const msg = getApiErrorMessage(err, 'Unable to prepare Stripe payment session.');
        setStripeIntentError(msg);
        setStripeClientSecret('');
      } finally {
        if (isActive) setStripeIntentLoading(false);
      }
    }, 350);

    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [
    step,
    paymentConfig.stripeEnabled,
    isAuthenticated,
    intentSignature,
    selectedSeats.length,
    currentShowKey,
    movie?.title,
    theatre?.id,
    theatre?.name,
    theatre?.address,
    activeShow?.screen,
    activeShow?.time,
    bookingDate,
    seatDetails,
    foodLineItems,
    appliedPromo,
    contactEmail,
    user?.email,
  ]);

  const handleApplyPromo = (codeToApply: string) => {
    const clean = (codeToApply || promoCode).trim().toUpperCase();
    if (['FIRSTSHOW', 'PAYTM150', 'RUPAY25'].includes(clean)) {
      setAppliedPromo(clean);
      setPromoCode(clean);
      dispatch(showToast({ message: `Promo code ${clean} applied!`, type: 'success' }));
    } else {
      dispatch(
        showToast({
          message: 'Try valid MovieBook promo codes: FIRSTSHOW, PAYTM150, or RUPAY25',
          type: 'info',
        })
      );
    }
  };

  const handleConfirmPayment = async (verifiedPaymentIntentId: string | null = null) => {
    if (!isAuthenticated) {
      dispatch(setAuthModalOpen(true));
      return;
    }
    if (selectedSeats.length === 0) return;

    setIsProcessing(true);
    setCheckoutError('');

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
        promoCode: appliedPromo || undefined,
        paymentMethod: verifiedPaymentIntentId ? 'STRIPE' : paymentMethod,
        ...(verifiedPaymentIntentId ? { paymentIntentId: verifiedPaymentIntentId } : {}),
        contact: {
          email: contactEmail,
          phone: contactPhone,
        },
      };

      let savedRecord: Reservation | null = null;
      try {
        const res = await api.post<Reservation>('/movieReservation', payload);
        savedRecord = res.data;
      } catch (apiErr: unknown) {
        const axiosErr = apiErr as {
          response?: { status?: number; data?: { message?: string; takenSeats?: string[] } };
        };
        const status = axiosErr.response?.status;
        if (status === 401) {
          dispatch(setAuthModalOpen(true));
          dispatch(
            showToast({
              message: 'Your session expired. Please sign in again to complete your booking.',
              type: 'error',
            })
          );
          return;
        }
        if (status === 409) {
          const taken = axiosErr.response?.data?.takenSeats || [];
          if (taken.length > 0) {
            setOccupiedSeats((prev) => Array.from(new Set([...prev, ...taken])));
            setSelectedSeats((prev) => prev.filter((s) => !taken.includes(s)));
          }
          dispatch(
            showToast({
              message:
                axiosErr.response?.data?.message ||
                'Selected seats were just taken. Please pick other seats.',
              type: 'error',
            })
          );
          setStep('seats');
          return;
        }
        const errMsg = getApiErrorMessage(
          apiErr,
          'Unable to confirm booking right now. Please try again.'
        );
        setCheckoutError(errMsg);
        dispatch(showToast({ message: errMsg, type: 'error' }));
        return;
      }

      const bookingId =
        savedRecord?.bookingId || 'MB' + Date.now().toString(36).toUpperCase().slice(-7);
      const authoritativeTotal =
        typeof savedRecord?.amounts?.total === 'number' ? savedRecord.amounts.total : grandTotal;

      const nextOccupied = Array.from(new Set([...occupiedSeats, ...selectedSeats]));
      setOccupiedSeats(nextOccupied);
      localStorage.setItem(`occupied-${currentShowKey}`, JSON.stringify(nextOccupied));

      const tierNames = Array.from(new Set(seatDetails.map((s) => s.tier))).join(', ');
      const formattedDateStr = parseIsoLocalDate(bookingDate).toLocaleDateString('en-IN', {
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
        total: authoritativeTotal,
        email: contactEmail || user?.email || 'your account',
      });

      dispatch(showToast({ message: `M-Ticket ${bookingId} confirmed!`, type: 'success' }));
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
        <button type="button" className={styles.goBackBtn} onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  const dObj = parseIsoLocalDate(bookingDate);
  const formattedBookingDate = `${dObj.toLocaleDateString('en-US', { weekday: 'short' })}, ${dObj.getDate()} ${dObj.toLocaleDateString('en-US', { month: 'long' })}, ${dObj.getFullYear()}`;

  const displayQty = hoveredQty || ticketQty;
  const modalTiers = activeShow?.tiers?.length
    ? activeShow.tiers
    : SEAT_TIERS.map((t) => ({ label: t.label, price: t.price, status: 'AVAILABLE' }));
  const filteredFoodMenu =
    foodCategory === 'All' ? FOOD_MENU : FOOD_MENU.filter((f) => f.category === foodCategory);

  return (
    <div className={styles.bookingPage}>
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
                <div key={tier.label} className={styles.qtyCat}>
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
                      href={`/seat-layout-icons.svg#${
                        bestsellerChecked ? 'icon-best-seat' : 'icon-bestseller'
                      }`}
                    />
                  </svg>
                </span>
                <span>
                  {' '}
                  <b>Bestseller Seats</b> in this cinema at no extra cost!
                </span>
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

      {isProcessing && (
        <div className={styles.paymentOverlay}>
          <div className={styles.paymentModal}>
            <Loader2 className={styles.processingSpinner} size={48} />
            <h3>Confirming Your Seats...</h3>
            <p>Please do not close or refresh this window</p>
          </div>
        </div>
      )}

      {confirmedBooking && (
        <ConfirmationModal
          booking={confirmedBooking}
          onClose={() => {
            setConfirmedBooking(null);
            navigate('/');
          }}
        />
      )}

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
                    : navigate(
                        `/movie/${movie._id}/buytickets?lang=${encodeURIComponent(
                          activeShow?.language || 'English'
                        )}`
                      )
                }
                aria-label="Go back"
              >
                <svg width="20" height="20" aria-hidden="true">
                  <use href="/common-icons.svg#icon-chevron-any-color" />
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
                  <use href="/seat-layout-icons.svg#icon-red-edit" />
                </svg>
                <span>
                  {ticketQty} {ticketQty === 1 ? 'Ticket' : 'Tickets'}
                </span>
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
                      className={`${styles.timeSlotPill} ${
                        isActive ? styles.timeSlotPillActive : ''
                      }`}
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

      {step === 'seats' && (
        <div className={styles.auditoriumContainer}>
          <div
            className={styles.seatCanvas}
            tabIndex={0}
            role="region"
            aria-label="Auditorium seat map — scroll horizontally to view all seats"
          >
            <div
              className={styles.seatGridZoomWrap}
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
            >
              {SEAT_TIERS.map((tier) => {
                const descBlocks = getDescendingBlocksForTier(tier);
                return (
                  <div key={tier.tier} className={styles.tierBlock}>
                    <div className={styles.tierRowLayout}>
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
                                        title={`${tier.label}${
                                          isBestseller ? ' (Bestseller)' : ''
                                        } Seat ${seatId} — ₹${tier.price}`}
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

          <div className={styles.minimapWidget} aria-hidden="true">
            <div className={styles.minimapInner}>
              <div className={styles.minimapViewportBox} />
              {SEAT_TIERS.map((tier) => (
                <div key={tier.tier} className={styles.minimapTier}>
                  <div className={styles.minimapTierLabel}>
                    ₹{tier.price} {tier.label}
                  </div>
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

          <div className={styles.bottomStickyBar}>
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
                    <use href="/seat-layout-icons.svg#icon-bestseller" />
                  </svg>
                  <span>Bestseller</span>
                  <svg width="12" height="12" aria-hidden="true">
                    <use href="/common-icons.svg#icon-info-any-color" />
                  </svg>
                </div>
                <div className={styles.legendEntry}>
                  <span className={`${styles.legendBox} ${styles.legendSelected}`} />
                  <span>Selected</span>
                </div>
              </div>
            </div>

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

      {step === 'checkout' && (
        <div className={`container ${styles.checkoutLayout}`}>
          <div className={styles.fnbColumn}>
            <div className={styles.fnbCard}>
              <div className={styles.fnbHeader}>
                <div>
                  <h2 className={styles.fnbTitle}>
                    Grab a <span className={styles.fnbHighlight}>bite!</span>
                  </h2>
                  <p className={styles.fnbSubtitle}>
                    Prebook Your Meal and Save More! Delivered right to your seat.
                  </p>
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
                              <button type="button" onClick={() => updateFoodQty(item.id, -1)}>
                                −
                              </button>
                              <span>{qty}</span>
                              <button type="button" onClick={() => updateFoodQty(item.id, 1)}>
                                +
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={styles.fnbCard}>
              <h3 className={styles.checkoutSubHeading}>
                Share Your Contact Details (For M-Ticket)
              </h3>
              <div className={styles.contactGrid}>
                <div className={styles.contactField}>
                  <label htmlFor="checkout-email">Email Address</label>
                  <input
                    id="checkout-email"
                    name="contactEmail"
                    type="email"
                    autoComplete="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="yourname@email.com"
                  />
                </div>
                <div className={styles.contactField}>
                  <label htmlFor="checkout-phone">Mobile Number</label>
                  <input
                    id="checkout-phone"
                    name="contactPhone"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>

              <h3 className={styles.checkoutSubHeading} style={{ marginTop: '20px' }}>
                {paymentConfig.stripeEnabled
                  ? 'Pay Securely with Stripe'
                  : 'Preferred Payment Option'}
              </h3>

              {paymentConfig.stripeEnabled ? (
                !isAuthenticated ? (
                  <div className={styles.stripeSignInPrompt}>
                    <p>
                      Sign in to initialize secure Stripe card, Apple Pay, Google Pay, or UPI
                      checkout.
                    </p>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => dispatch(setAuthModalOpen(true))}
                    >
                      Sign In to Pay with Stripe
                    </button>
                  </div>
                ) : stripeIntentError ? (
                  <div role="alert" className={styles.stripeErrorBanner}>
                    {stripeIntentError}
                  </div>
                ) : (
                  <StripePaymentForm
                    clientSecret={stripeIntentLoading ? '' : stripeClientSecret}
                    publishableKey={paymentConfig.publishableKey}
                    amount={grandTotal}
                    mode={paymentConfig.mode}
                    customerEmail={contactEmail || user?.email}
                    isSubmittingBooking={isProcessing}
                    onPaymentSucceeded={(piId) => handleConfirmPayment(piId)}
                    onPaymentError={(msg) => setCheckoutError(msg)}
                  />
                )
              ) : (
                <>
                  <div className={styles.stripeReadyNotice}>
                    <ShieldCheck size={16} color="#635bff" style={{ flexShrink: 0 }} />
                    <span>
                      <strong>Stripe Payment Gateway Integrated:</strong> Add{' '}
                      <code>STRIPE_SECRET_KEY</code> &amp; <code>STRIPE_PUBLISHABLE_KEY</code> in{' '}
                      <code>.env</code> for live/test Stripe card checkout. Running instant demo
                      checkout below.
                    </span>
                  </div>
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
                          className={`${styles.pmOption} ${
                            paymentMethod === pm.id ? styles.pmOptionActive : ''
                          }`}
                          onClick={() => setPaymentMethod(pm.id)}
                        >
                          <Icon size={16} />
                          <span>{pm.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          <aside className={styles.summarySidebar}>
            <div className={styles.receiptCard}>
              <span className={styles.cutoutLeft} />
              <span className={styles.cutoutRight} />

              <h3 className={styles.receiptHeader}>BOOKING SUMMARY</h3>

              <div className={styles.receiptShowMeta}>
                <strong>
                  {movie.title} ({movie.certification || 'UA'})
                </strong>
                <span>
                  {activeShow?.language || 'Hindi'}, {activeShow?.format}
                </span>
                <span>
                  {theatre?.name} ({activeShow?.screen || 'AUDI 01'})
                </span>
                <span>
                  {formattedBookingDate} • {activeShow?.time}
                </span>
              </div>

              <div className={styles.receiptLine}>
                <div>
                  <span className={styles.receiptMainItem}>
                    {seatDetails[0]?.tier || 'PRIME'} - {selectedSeats.join(', ')}
                  </span>
                  <span className={styles.receiptSubCount}>
                    ({selectedSeats.length} {selectedSeats.length === 1 ? 'Ticket' : 'Tickets'})
                  </span>
                </div>
                <span className={styles.receiptValue}>Rs. {ticketsAmount.toFixed(2)}</span>
              </div>

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

              {foodLineItems.length > 0 && (
                <div className={styles.receiptFoodSection}>
                  <div className={styles.receiptFoodHeader}>
                    <span>Food &amp; Beverage</span>
                    <span>Rs. {foodAmount.toFixed(2)}</span>
                  </div>
                  {foodLineItems.map((f) => (
                    <div key={f.id} className={styles.receiptFoodLine}>
                      <span>
                        {f.qty} × {f.name}
                      </span>
                      <span>Rs. {(f.qty * f.price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className={styles.promoBox}>
                <div className={styles.promoInputRow}>
                  <Tag size={14} color="#f84464" />
                  <input
                    id="checkout-promo-code"
                    name="promoCode"
                    type="text"
                    aria-label="Promo code"
                    placeholder="Have a Promo Code? (e.g. FIRSTSHOW)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                  <button type="button" onClick={() => handleApplyPromo(promoCode)}>
                    Apply
                  </button>
                </div>
                <div className={styles.promoQuickChips}>
                  {['FIRSTSHOW', 'PAYTM150', 'RUPAY25'].map((code) => (
                    <button
                      key={code}
                      type="button"
                      className={`${styles.promoChip} ${
                        appliedPromo === code ? styles.promoChipActive : ''
                      }`}
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

              <div className={styles.payableBanner}>
                <span>Amount Payable</span>
                <strong>Rs. {grandTotal.toFixed(2)}</strong>
              </div>

              {checkoutError && (
                <div
                  role="alert"
                  style={{
                    marginBottom: '12px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#b91c1c',
                    fontSize: '12.5px',
                    fontWeight: 500,
                  }}
                >
                  {checkoutError}
                </div>
              )}

              <button
                type="button"
                id="confirm-payment-btn"
                className={styles.proceedPayBtn}
                disabled={isProcessing}
                onClick={() => {
                  if (paymentConfig.stripeEnabled) {
                    const stripeBtn = document.getElementById('stripe-pay-submit-btn');
                    if (stripeBtn) {
                      stripeBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      stripeBtn.click();
                    } else if (!isAuthenticated) {
                      dispatch(setAuthModalOpen(true));
                    }
                  } else {
                    void handleConfirmPayment();
                  }
                }}
              >
                <span>TOTAL: Rs. {grandTotal.toFixed(2)}</span>
                <span>{paymentConfig.stripeEnabled ? 'Pay via Stripe' : 'Proceed'}</span>
              </button>

              <p className={styles.cancellationNote}>
                <ShieldCheck size={14} /> By proceeding, I express my consent to complete this
                transaction.
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default Booking;
