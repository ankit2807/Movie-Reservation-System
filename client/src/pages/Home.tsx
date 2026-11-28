import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Link, useNavigate, useSearchParams, useParams } from 'react-router-dom';
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Star,
  Play,
  Mic,
  Music,
  Palette,
  Theater,
  Baby,
  Trophy,
  Compass,
  FerrisWheel,
  MapPin,
  Tag,
  Gift,
  Building2,
  Megaphone,
  X,
  Copy,
  Check,
  type LucideIcon,
} from 'lucide-react';
import api from '../api/axios';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import type { AppDispatch } from '../redux/store';
import { fetchMoviesStart, fetchMoviesSuccess, fetchMoviesFailure } from '../redux/movieSlice';
import { setCity, showToast } from '../redux/locationSlice';
import { createPosterFallback, getTheatresForCity } from '../utils/moviebookData';
import { getApiErrorMessage, Movie, MovieCategory } from '../types';
import styles from '../styles/Home.module.css';

type FilterBucket = 'Languages' | 'Genres' | 'Format' | 'Categories';
type HomePageMode = 'offers' | 'gift-cards' | 'list-your-show' | 'corporates';

interface ActiveHomeFilters {
  Languages: string[];
  Genres: string[];
  Format: string[];
  Categories: string[];
}

interface ExperienceItem extends Movie {
  dateText?: string;
  venue?: string;
  priceText?: string;
}

interface FilterSectionProps {
  title: string;
  items: string[];
  selectedItems: string[];
  onSelect: (item: string) => void;
  isOpenDefault?: boolean;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  items,
  selectedItems,
  onSelect,
  isOpenDefault = false,
}) => {
  const [isOpen, setIsOpen] = useState(isOpenDefault);

  return (
    <div className={styles.filterGroup}>
      <div className={styles.filterHeader} onClick={() => setIsOpen(!isOpen)}>
        <div className={styles.filterTitle}>
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          <span>{title}</span>
        </div>
        <span
          className={styles.clearBtn}
          onClick={(e) => {
            e.stopPropagation();
            items.forEach((item) => {
              if (selectedItems.includes(item)) onSelect(item);
            });
          }}
        >
          Clear
        </span>
      </div>
      {isOpen && (
        <div className={styles.tags}>
          {items.map((item) => (
            <button
              type="button"
              key={item}
              className={`${styles.tag} ${selectedItems.includes(item) ? styles.activeTag : ''}`}
              onClick={() => onSelect(item)}
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

interface HeroCarouselProps {
  movies: Movie[];
  currentCity: string;
}

const HeroCarousel: React.FC<HeroCarouselProps> = ({ movies, currentCity }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const slides = useMemo(() => {
    const list = movies.slice(0, 6);
    return list.map((m, idx) => ({
      id: m._id,
      title: m.title,
      genre: (m.genre || 'Action, Adventure').replace(/,\s*/g, '/'),
      rating: m.rating || '9.1',
      votes: m.votes || '142.5K',
      duration: m.duration || '2h 25m',
      certification: m.certification || 'UA16+',
      format: m.format || '2D, IMAX 2D, 4DX',
      tagline:
        m.tagline ||
        (idx === 0
          ? `Book your IMAX & 4DX tickets now in ${currentCity || 'Noida'}`
          : 'Experience the biggest blockbuster on the giant screen'),
      poster: m.posterImage || createPosterFallback(m.title, m.genre),
      backdrop: m.backdropImage || m.posterImage || createPosterFallback(m.title, m.genre),
      badge: idx === 0 ? 'IN CINEMAS NOW' : idx === 1 ? 'BLOCKBUSTER' : 'BOOKING OPEN',
    }));
  }, [movies, currentCity]);

  const startAutoplay = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (slides.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
  }, [slides.length]);

  useEffect(() => {
    startAutoplay();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startAutoplay]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    startAutoplay();
  };

  if (slides.length === 0) return null;

  return (
    <div className={styles.bmsBannerStrip} id="hero-carousel">
      <div className={styles.bmsBannerViewport}>
        <div
          className={styles.bmsBannerTrack}
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, idx) => (
            <div key={slide.id} className={styles.bmsBannerSlide}>
              <div className={`container ${styles.bmsBannerCardWrap}`}>
                <Link to={`/movie/${slide.id}`} className={styles.bmsBannerCard}>
                  <div
                    className={styles.bmsBannerBg}
                    style={{ backgroundImage: `url(${slide.backdrop})` }}
                  />
                  <div className={styles.bmsBannerOverlay} />

                  <div className={styles.bmsBannerContent}>
                    <div className={styles.bmsBannerLeft}>
                      <div className={styles.bmsPromoTags}>
                        <span className={styles.bmsLiveTag}>{slide.badge}</span>
                        <span className={styles.bmsFormatTag}>
                          {slide.format.split(',').slice(0, 3).join(' • ')}
                        </span>
                      </div>
                      <h2 className={styles.bmsBannerTitle}>{slide.title}</h2>
                      <p className={styles.bmsBannerTagline}>{slide.tagline}</p>

                      <div className={styles.bmsBannerMeta}>
                        <span className={styles.bmsStarChip}>
                          <Star size={13} fill="#f84464" color="#f84464" /> {slide.rating}/10 (
                          {slide.votes} Votes)
                        </span>
                        <span>•</span>
                        <span>{slide.certification}</span>
                        <span>•</span>
                        <span>{slide.genre}</span>
                      </div>

                      <span className={styles.bmsBannerCta}>Book Now</span>
                    </div>

                    <div className={styles.bmsBannerRight}>
                      <img
                        src={slide.poster}
                        alt={slide.title}
                        width={172}
                        height={252}
                        fetchPriority={idx === 0 ? 'high' : 'low'}
                        loading={idx === 0 ? undefined : 'lazy'}
                        className={styles.bmsBannerPoster}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = createPosterFallback(slide.title, slide.genre);
                        }}
                      />
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          className={`${styles.bannerEdgeArrow} ${styles.bannerEdgeLeft}`}
          onClick={() => goToSlide((currentSlide - 1 + slides.length) % slides.length)}
          aria-label="Previous banner"
        >
          <ChevronLeft size={24} />
        </button>

        <button
          type="button"
          className={`${styles.bannerEdgeArrow} ${styles.bannerEdgeRight}`}
          onClick={() => goToSlide((currentSlide + 1) % slides.length)}
          aria-label="Next banner"
        >
          <ChevronRight size={24} />
        </button>

        <div className={styles.bannerDots}>
          {slides.map((s, idx) => (
            <button
              type="button"
              key={s.id}
              className={`${styles.bannerDot} ${idx === currentSlide ? styles.bannerDotActive : ''}`}
              onClick={() => goToSlide(idx)}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const ScrollSection: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 12);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 12);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    el?.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el?.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [children]);

  const scrollByPage = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 1160, behavior: 'smooth' });
  };

  return (
    <div className={styles.scrollContainer}>
      {canScrollLeft && (
        <button
          type="button"
          className={`${styles.scrollArrow} ${styles.scrollLeft}`}
          onClick={() => scrollByPage(-1)}
          aria-label="Scroll left"
        >
          <ChevronLeft size={22} />
        </button>
      )}
      <div className={styles.scrollTrack} ref={scrollRef}>
        {children}
      </div>
      {canScrollRight && (
        <button
          type="button"
          className={`${styles.scrollArrow} ${styles.scrollRight}`}
          onClick={() => scrollByPage(1)}
          aria-label="Scroll right"
        >
          <ChevronRight size={22} />
        </button>
      )}
    </div>
  );
};

const MovieCard: React.FC<{ movie: Movie; showPromoted?: boolean }> = ({
  movie,
  showPromoted = false,
}) => {
  const formattedGenre = (movie.genre || 'Action, Drama').replace(/,\s*/g, '/');
  return (
    <Link to={`/movie/${movie._id}`} className={styles.movieCard} id={`movie-card-${movie._id}`}>
      <div className={styles.posterWrapper}>
        {showPromoted && <span className={styles.promotedTag}>PROMOTED</span>}
        <img
          src={movie.posterImage || createPosterFallback(movie.title, movie.genre)}
          alt={movie.title}
          className={styles.poster}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = createPosterFallback(movie.title, movie.genre);
          }}
          loading="lazy"
        />
        <div className={styles.ratingOverlay}>
          <Star size={15} fill="#f84464" stroke="#f84464" />
          <span className={styles.ratingValue}>
            {movie.rating ? `${movie.rating}/10` : '9.0/10'}
          </span>
          <span className={styles.ratingVotes}>{movie.votes || '128.5K'} Votes</span>
        </div>
      </div>
      <div className={styles.movieMeta}>
        <h3 className={styles.movieTitle}>{movie.title}</h3>
        <p className={styles.movieGenre}>{formattedGenre}</p>
      </div>
    </Link>
  );
};

const ExperienceCard: React.FC<{
  item: ExperienceItem;
  city?: string;
  badgeText?: string | null;
}> = ({ item, city = 'Noida', badgeText }) => {
  const dateLabel =
    item.dateText ||
    (item.releaseDate
      ? new Date(item.releaseDate).toLocaleDateString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        })
      : 'Sat, 24 Oct');

  const venueLabel =
    item.venue ||
    (item.type === 'Play'
      ? 'Kamani Auditorium: Delhi-NCR'
      : item.type === 'Sport'
        ? `Buddh International Circuit: ${city}`
        : item.type === 'Activity'
          ? `Entertainment City, Sector 38A: ${city}`
          : `DLF Mall of India, Sector 18: ${city}`);

  const categorySub = (item.genre || 'Concerts').split(',')[0].trim();
  const priceLabel = item.priceText || '₹ 499 onwards';

  return (
    <Link to={`/movie/${item._id}`} className={styles.movieCard}>
      <div className={styles.posterWrapper}>
        {badgeText && <span className={styles.promotedTag}>{badgeText}</span>}
        <img
          src={item.posterImage || createPosterFallback(item.title, item.genre)}
          alt={item.title}
          className={styles.poster}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = createPosterFallback(item.title, item.genre);
          }}
          loading="lazy"
        />
        <div className={styles.dateStripOverlay}>
          <span>{dateLabel}</span>
        </div>
      </div>
      <div className={styles.movieMeta}>
        <h3 className={styles.movieTitle}>{item.title}</h3>
        <p className={styles.eventVenueText}>{venueLabel}</p>
        <p className={styles.eventCategoryText}>{categorySub}</p>
        <p className={styles.eventPriceText}>{priceLabel}</p>
      </div>
    </Link>
  );
};

interface LiveEventSquareTileProps {
  title: string;
  countText: string;
  gradient: string;
  accentColor: string;
  icon: LucideIcon;
  to: string;
}

const LiveEventSquareTile: React.FC<LiveEventSquareTileProps> = ({
  title,
  countText,
  gradient,
  accentColor,
  icon,
  to,
}) => (
  <Link to={to} className={styles.liveEventSquare} style={{ background: gradient }}>
    <div className={styles.squarePatternCircle} style={{ background: accentColor }} />
    <div className={styles.squareTopText}>
      <h3>{title}</h3>
      <span>{countText}</span>
    </div>
    <div className={styles.squareBottomIcon}>
      {React.createElement(icon, { size: 58, strokeWidth: 1.5 })}
    </div>
  </Link>
);

const PremiereCard: React.FC<{ movie: Movie }> = ({ movie }) => {
  const primaryLang =
    Array.isArray(movie.languages) && movie.languages.length > 0 ? movie.languages[0] : 'English';

  return (
    <Link to={`/movie/${movie._id}`} className={styles.premiereCard}>
      <div className={styles.premierePoster}>
        <img
          src={movie.posterImage || createPosterFallback(movie.title, movie.genre)}
          alt={movie.title}
          className={styles.poster}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = createPosterFallback(movie.title, movie.genre);
          }}
          loading="lazy"
        />
        <div className={styles.premiereBottomTag}>PREMIERE</div>
      </div>
      <h4 className={styles.premiereTitle}>{movie.title}</h4>
      <p className={styles.premiereLang}>{primaryLang}</p>
    </Link>
  );
};

interface SpecialHubViewProps {
  pageMode: HomePageMode;
  activeCity: string;
  dispatch: AppDispatch;
}

const SpecialHubView: React.FC<SpecialHubViewProps> = ({ pageMode, activeCity, dispatch }) => {
  const [copiedCode, setCopiedCode] = useState('');
  const [giftAmount, setGiftAmount] = useState(1000);
  const [giftTheme, setGiftTheme] = useState('Blockbuster Night Out');
  const [giftRecipient, setGiftRecipient] = useState('');
  const [giftEmail, setGiftEmail] = useState('');
  const [giftMessage, setGiftMessage] = useState('Enjoy a movie night & popcorn on me!');

  const [partnerForm, setPartnerForm] = useState({
    orgName: '',
    contactEmail: '',
    category: pageMode === 'corporates' ? 'Bulk Employee Movie Vouchers' : 'Live Music / Comedy Event',
    notes: '',
  });

  const handleCopyPromo = (code: string) => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopiedCode(code);
    dispatch(
      showToast({
        message: `Promo code ${code} copied! Apply it at ticket checkout.`,
        type: 'success',
      })
    );
    setTimeout(() => setCopiedCode(''), 2500);
  };

  const handleGiftSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const generatedPin = `MBGC-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${giftAmount}`;
    dispatch(
      showToast({
        message: `₹${giftAmount} E-Gift Card (${generatedPin}) sent to ${giftEmail || 'recipient'}!`,
        type: 'success',
      })
    );
    setGiftRecipient('');
    setGiftEmail('');
  };

  const handlePartnerSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(
      showToast({
        message: `Request received for ${partnerForm.orgName || 'your organization'}! Our ${activeCity} desk will reply within 24 hours.`,
        type: 'success',
      })
    );
    setPartnerForm((prev) => ({ ...prev, orgName: '', contactEmail: '', notes: '' }));
  };

  const promoDeals = [
    {
      code: 'FIRSTSHOW',
      badge: 'BANK & NEW USER',
      title: '15% Instant Discount (Up to ₹150)',
      desc: 'Valid on all Movie, IMAX 2D, and 4DX ticket bookings across India.',
    },
    {
      code: 'PAYTM150',
      badge: 'UPI CASHBACK',
      title: 'Flat ₹150 Off on Orders ₹300+',
      desc: 'Applicable on cinema tickets and stadium/event passes paid via UPI.',
    },
    {
      code: 'RUPAY25',
      badge: 'CARD + F&B COMBO',
      title: '20% Off Tickets + Grab a Bite Combos',
      desc: 'Save up to ₹120 when bundling Caramel Popcorn, Nachos, or Beverages.',
    },
  ];

  const featureCards: Array<{
    icon: LucideIcon;
    title: string;
    sub: string;
    cta: string;
    to: string;
  }> = [
    {
      icon: Tag,
      title: 'YES Private & ICICI Sapphiro Offers',
      sub: 'Use code FIRSTSHOW at checkout — Up to ₹150 instant off on movie tickets',
      cta: 'Browse Movies',
      to: '/movies',
    },
    {
      icon: Gift,
      title: 'Instant Digital Gift Cards',
      sub: 'Send personalized entertainment vouchers valid across 4,500+ screens',
      cta: 'Configure Gift Card',
      to: '/gift-cards',
    },
    {
      icon: Megaphone,
      title: 'Live Concerts, Stand-up & Stadium Events',
      sub: `Explore concerts, comedy tours, plays & sports in ${activeCity}`,
      cta: 'Explore Events',
      to: '/events',
    },
    {
      icon: Building2,
      title: `Multiplex Cinemas in ${activeCity}`,
      sub: `PVR Superplex, INOX Megaplex & Cinépolis IMAX screens in ${activeCity}`,
      cta: 'Explore Cinemas',
      to: '/movies',
    },
  ];

  return (
    <div className={styles.specialOptionPage}>
      <div className="container">
        <div className={styles.specialBannerCard}>
          <div className={styles.specialBannerText}>
            <span className={styles.specialTag}>
              MOVIEBOOK {pageMode.replace(/-/g, ' ').toUpperCase()}
            </span>
            <h1>
              {pageMode === 'offers' && `Verified Bank, UPI & Cinema Offers in ${activeCity}`}
              {pageMode === 'gift-cards' && 'MovieBook Instant Digital E-Gift Cards'}
              {pageMode === 'list-your-show' && 'Host Your Show, Concert, Play & Customer Help Desk'}
              {pageMode === 'corporates' && 'Corporate Entertainment Vouchers & Bulk Bookings'}
            </h1>
            <p>
              {pageMode === 'offers' &&
                'Copy any active coupon code below and apply it during checkout for server-verified instant savings.'}
              {pageMode === 'gift-cards' &&
                'Customize an instant E-Gift Card redeemable across movies, concerts, stand-up comedy, plays, and sports.'}
              {pageMode === 'list-your-show' &&
                'Partner with MovieBook across 4,500+ screens and live arenas, or browse instant ticketing FAQs below.'}
              {pageMode === 'corporates' &&
                'Delight teams and clients with branded MovieBook voucher codes for blockbusters and live events.'}
            </p>
          </div>
        </div>

        {pageMode === 'offers' && (
          <div className={styles.hubCouponGrid}>
            {promoDeals.map((deal) => (
              <div key={deal.code} className={styles.hubCouponCard}>
                <span className={styles.hubCouponBadge}>{deal.badge}</span>
                <h3>{deal.title}</h3>
                <p>{deal.desc}</p>
                <div className={styles.hubCouponFooter}>
                  <code className={styles.hubPromoCode}>{deal.code}</code>
                  <button
                    type="button"
                    className={styles.hubCopyBtn}
                    onClick={() => handleCopyPromo(deal.code)}
                  >
                    {copiedCode === deal.code ? <Check size={14} /> : <Copy size={14} />}
                    {copiedCode === deal.code ? 'Copied' : 'Copy Code'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {pageMode === 'gift-cards' && (
          <div className={styles.hubSplitGrid}>
            <div className={styles.giftPreviewCard}>
              <div className={styles.giftPreviewTop}>
                <span className={styles.giftBrandBadge}>moviebook E-GIFT</span>
                <span className={styles.giftAmountDisplay}>
                  ₹{giftAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <h3 className={styles.giftPreviewTheme}>{giftTheme}</h3>
              <p className={styles.giftPreviewMsg}>
                &ldquo;{giftMessage || 'Enjoy the show!'}&rdquo;
              </p>
              <div className={styles.giftPreviewFooter}>
                <span>For: {giftRecipient || 'Your Favourite Movie Buff'}</span>
                <span>Valid 12 Months • All Cities</span>
              </div>
            </div>

            <form className={styles.hubInteractiveForm} onSubmit={handleGiftSubmit}>
              <h3>Configure Instant E-Gift Card</h3>
              <div className={styles.hubDenomRow}>
                {[500, 1000, 2000, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    className={`${styles.hubDenomPill} ${
                      giftAmount === amt ? styles.hubDenomActive : ''
                    }`}
                    onClick={() => setGiftAmount(amt)}
                  >
                    ₹{amt.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
              <div className={styles.hubField}>
                <label htmlFor="gc-theme">Occasion Theme</label>
                <select
                  id="gc-theme"
                  value={giftTheme}
                  onChange={(e) => setGiftTheme(e.target.value)}
                >
                  <option value="Blockbuster Night Out">Blockbuster Night Out</option>
                  <option value="Happy Birthday Special">Happy Birthday Special</option>
                  <option value="Anniversary Premiere">Anniversary Premiere</option>
                  <option value="Festive Celebration">Festive Celebration</option>
                </select>
              </div>
              <div className={styles.hubFieldRow}>
                <div className={styles.hubField}>
                  <label htmlFor="gc-name">Recipient Name *</label>
                  <input
                    id="gc-name"
                    required
                    placeholder="Aditi Rao"
                    value={giftRecipient}
                    onChange={(e) => setGiftRecipient(e.target.value)}
                  />
                </div>
                <div className={styles.hubField}>
                  <label htmlFor="gc-email">Recipient Email *</label>
                  <input
                    id="gc-email"
                    type="email"
                    required
                    placeholder="aditi@example.com"
                    value={giftEmail}
                    onChange={(e) => setGiftEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className={styles.hubField}>
                <label htmlFor="gc-msg">Personal Note</label>
                <input
                  id="gc-msg"
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px' }}
              >
                Send ₹{giftAmount.toLocaleString('en-IN')} Gift Card Instantly
              </button>
            </form>
          </div>
        )}

        {(pageMode === 'list-your-show' || pageMode === 'corporates') && (
          <div className={styles.hubSplitGrid}>
            <form className={styles.hubInteractiveForm} onSubmit={handlePartnerSubmit}>
              <h3>
                {pageMode === 'corporates'
                  ? 'Request Corporate Voucher Quote'
                  : `Partner / Support Inquiry (${activeCity})`}
              </h3>
              <div className={styles.hubField}>
                <label htmlFor="partner-org">Organization / Organizer Name *</label>
                <input
                  id="partner-org"
                  required
                  placeholder="Horizon Live Productions"
                  value={partnerForm.orgName}
                  onChange={(e) => setPartnerForm({ ...partnerForm, orgName: e.target.value })}
                />
              </div>
              <div className={styles.hubFieldRow}>
                <div className={styles.hubField}>
                  <label htmlFor="partner-email">Work Email *</label>
                  <input
                    id="partner-email"
                    type="email"
                    required
                    placeholder="events@company.com"
                    value={partnerForm.contactEmail}
                    onChange={(e) =>
                      setPartnerForm({ ...partnerForm, contactEmail: e.target.value })
                    }
                  />
                </div>
                <div className={styles.hubField}>
                  <label htmlFor="partner-cat">Category</label>
                  <select
                    id="partner-cat"
                    value={partnerForm.category}
                    onChange={(e) => setPartnerForm({ ...partnerForm, category: e.target.value })}
                  >
                    <option value="Live Music / Comedy Event">Live Music / Comedy Event</option>
                    <option value="Theatre / Stage Play">Theatre / Stage Play</option>
                    <option value="Sports / Arena Tournament">Sports / Arena Tournament</option>
                    <option value="Bulk Employee Movie Vouchers">
                      Bulk Employee Movie Vouchers
                    </option>
                    <option value="Customer Booking Assistance">Customer Booking Assistance</option>
                  </select>
                </div>
              </div>
              <div className={styles.hubField}>
                <label htmlFor="partner-notes">Venue / Expected Attendance / Notes</label>
                <textarea
                  id="partner-notes"
                  rows={3}
                  placeholder={`Share venue details in ${activeCity}, expected dates, or ticket query...`}
                  value={partnerForm.notes}
                  onChange={(e) => setPartnerForm({ ...partnerForm, notes: e.target.value })}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px' }}
              >
                Submit Inquiry
              </button>
            </form>

            <div className={styles.hubFaqStack}>
              <h3>Frequently Asked Questions</h3>
              <details className={styles.faqItem} open>
                <summary>How does M-Ticket QR cinema entry work?</summary>
                <p>
                  Every confirmed booking generates an instant QR M-Ticket under My Bookings. Simply
                  scan the QR code at the multiplex gate and F&amp;B counter — no paper printout
                  required.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>What is the ticket cancellation &amp; refund cutoff?</summary>
                <p>
                  Confirmed tickets can be cancelled directly from My Bookings up to 20 minutes prior
                  to showtime. Base ticket and F&amp;B amounts are refunded to your original payment
                  method.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>Which promo codes can I use during checkout?</summary>
                <p>
                  Enter FIRSTSHOW (15% off up to ₹150), PAYTM150 (flat ₹150 off on ₹300+), or RUPAY25
                  (20% off tickets + snacks) in the checkout summary panel.
                </p>
              </details>
            </div>
          </div>
        )}

        <div className={styles.specialCardsGrid} style={{ marginTop: '24px' }}>
          {featureCards.map((card, i) => (
            <Link key={i} to={card.to} className={styles.specialFeatureCard}>
              <div className={styles.specialIconWrap}>
                {React.createElement(card.icon, { size: 24, color: '#f84464' })}
              </div>
              <div>
                <h3>{card.title}</h3>
                <p>{card.sub}</p>
                <span className={styles.specialCardLink}>{card.cta} ›</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

interface HomeProps {
  type?: MovieCategory;
  pageMode?: HomePageMode;
}

const Home: React.FC<HomeProps> = ({ type, pageMode }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { city: urlCityParam } = useParams<{ city?: string }>();
  const [searchParams] = useSearchParams();
  const { movies, loading, error, searchQuery } = useAppSelector((state) => state.movie);
  const { currentCity } = useAppSelector((state) => state.location);

  const [isCinemasModalOpen, setIsCinemasModalOpen] = useState(false);

  useEffect(() => {
    if (urlCityParam) {
      const currentSlug = (currentCity || '').toLowerCase().replace(/\s+/g, '-');
      const paramSlug = urlCityParam.toLowerCase().replace(/\s+/g, '-');
      if (currentSlug !== paramSlug) {
        const formattedCity =
          paramSlug === 'delhi-ncr'
            ? 'Delhi-NCR'
            : urlCityParam
                .split('-')
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                .join(' ');
        dispatch(setCity(formattedCity));
      }
    }
  }, [urlCityParam, currentCity, dispatch]);

  const activeCity = currentCity || 'Noida';
  const urlFilter = searchParams.get('filter') || '';
  const filterSyncKey = `${type || ''}|${urlFilter}`;

  const buildFiltersFromParam = (filterParam: string): ActiveHomeFilters => {
    const empty: ActiveHomeFilters = { Languages: [], Genres: [], Format: [], Categories: [] };
    if (!filterParam) return empty;
    const languagesList = [
      'English',
      'Hindi',
      'Tamil',
      'Telugu',
      'Kannada',
      'Malayalam',
      'Bengali',
      'Marathi',
    ];
    const formatList = ['2D', '3D', 'IMAX 2D', 'IMAX 3D', '4DX', '4DX 3D', 'MX4D 3D'];
    if (languagesList.includes(filterParam)) {
      return { ...empty, Languages: [filterParam] };
    }
    if (formatList.includes(filterParam)) {
      return { ...empty, Format: [filterParam] };
    }
    return { ...empty, Genres: [filterParam] };
  };

  const [prevFilterKey, setPrevFilterKey] = useState(filterSyncKey);
  const [activeFilters, setActiveFilters] = useState<ActiveHomeFilters>(() =>
    buildFiltersFromParam(urlFilter)
  );

  if (prevFilterKey !== filterSyncKey) {
    setPrevFilterKey(filterSyncKey);
    setActiveFilters(buildFiltersFromParam(urlFilter));
  }

  const toggleFilter = (category: FilterBucket, item: string) => {
    setActiveFilters((prev) => {
      const section = prev[category] || [];
      const newSection = section.includes(item)
        ? section.filter((i) => i !== item)
        : [...section, item];
      return { ...prev, [category]: newSection };
    });
  };

  useEffect(() => {
    const getMovies = async () => {
      dispatch(fetchMoviesStart());
      try {
        const res = await api.get<Movie[]>('/movie', { params: { city: activeCity } });
        dispatch(fetchMoviesSuccess(res.data));
      } catch (err: unknown) {
        dispatch(fetchMoviesFailure(getApiErrorMessage(err, 'Unable to load catalog')));
      }
    };
    void getMovies();
  }, [dispatch, activeCity]);

  useEffect(() => {
    if (searchQuery && searchQuery.trim().length > 0) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  }, [searchQuery, navigate]);

  const filteredMovies = useMemo(() => {
    return movies.filter((movie) => {
      const matchesType = type ? movie.type === type : true;
      const matchesGenre =
        activeFilters.Genres.length === 0 ||
        activeFilters.Genres.some(
          (g) =>
            movie.genre?.toLowerCase().includes(g.toLowerCase()) ||
            movie.format?.toLowerCase().includes(g.toLowerCase())
        );
      const matchesLanguage =
        activeFilters.Languages.length === 0 ||
        (movie.languages &&
          activeFilters.Languages.some((l) =>
            movie.languages.some((ml) => ml.toLowerCase() === l.toLowerCase())
          ));
      const matchesFormat =
        activeFilters.Format.length === 0 ||
        activeFilters.Format.some((f) => movie.format?.toLowerCase().includes(f.toLowerCase()));
      const matchesCategory =
        activeFilters.Categories.length === 0 ||
        activeFilters.Categories.some((c) => movie.genre?.toLowerCase().includes(c.toLowerCase()));
      return matchesType && matchesGenre && matchesLanguage && matchesFormat && matchesCategory;
    });
  }, [movies, type, activeFilters]);

  const cityCinemas = useMemo(
    () => getTheatresForCity(activeCity, movies[0] || {}),
    [activeCity, movies]
  );

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner} />
        <p>Loading Movie Book {activeCity}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorState}>
        <p>Something went wrong: {error}</p>
        <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  if (pageMode) {
    return <SpecialHubView pageMode={pageMode} activeCity={activeCity} dispatch={dispatch} />;
  }

  const isLandingPage = !type;

  if (isLandingPage) {
    const cinemaMovies = movies.filter((m) => m.type === 'Movie' || !m.type);
    const streamMovies = movies.filter((m) => m.type === 'Stream');
    const eventItems = movies.filter((m) => m.type === 'Event');
    const playItems = movies.filter((m) => m.type === 'Play');
    const sportItems = movies.filter((m) => m.type === 'Sport');
    const activityItems = movies.filter((m) => m.type === 'Activity');

    const recommendedMovies = cinemaMovies.slice(0, 10);
    const premiereMovies = (streamMovies.length > 0 ? streamMovies : cinemaMovies.slice(0, 6)).slice(
      0,
      8
    );

    const formatCardDate = (releaseDate: string | undefined, fallback: string): string =>
      releaseDate
        ? new Date(releaseDate).toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
          })
        : fallback;

    const musicStudioItems: ExperienceItem[] = [
      ...eventItems.filter(
        (e) => e.genre?.toLowerCase().includes('music') || e.genre?.toLowerCase().includes('concert')
      ),
      ...eventItems,
    ]
      .filter((v, i, a) => a.findIndex((t) => t._id === v._id) === i)
      .map((item, idx) => ({
        ...item,
        dateText: formatCardDate(
          item.releaseDate,
          ['Sat, 5 Dec', 'Sun, 29 Nov', 'Sat, 12 Dec', 'Mon, 28 Dec', 'Sun, 6 Dec'][idx % 5]
        ),
        venue: [
          'JLN Stadium: Delhi-NCR',
          `Expocentre Arena: ${activeCity}`,
          'Indira Gandhi Arena: Delhi-NCR',
          'Backyard Sports Club: Gurugram',
          `DLF Mall of India: ${activeCity}`,
        ][idx % 5],
        priceText: [
          '₹ 2,500 onwards',
          '₹ 1,999 onwards',
          '₹ 1,499 onwards',
          '₹ 1,299 onwards',
          '₹ 999 onwards',
        ][idx % 5],
      }));

    const outdoorEventItems: ExperienceItem[] = [...activityItems, ...sportItems, ...eventItems]
      .slice(0, 8)
      .map((item, idx) => ({
        ...item,
        dateText: formatCardDate(
          item.releaseDate,
          ['Sat, 28 Nov onwards', 'Sun, 29 Nov', 'Wed, 2 Dec', 'Sun, 6 Dec', 'Tue, 8 Dec'][idx % 5]
        ),
        venue: [
          `Entertainment City, Sector 38A: ${activeCity}`,
          `Gardens Galleria Mall: ${activeCity}`,
          `Buddh International Circuit: Greater ${activeCity}`,
          `Worlds of Wonder: ${activeCity}`,
          'JLN Stadium Grounds: NCR',
        ][idx % 5],
        priceText: [
          '₹ 999 onwards',
          '₹ 699 onwards',
          '₹ 1,499 onwards',
          '₹ 799 onwards',
          '₹ 499 onwards',
        ][idx % 5],
      }));

    const laughterTherapyItems: ExperienceItem[] = [
      ...eventItems.filter(
        (e) =>
          e.genre?.toLowerCase().includes('comedy') || e.genre?.toLowerCase().includes('stand-up')
      ),
      ...activityItems.filter(
        (a) =>
          a.genre?.toLowerCase().includes('comedy') || a.genre?.toLowerCase().includes('improv')
      ),
      ...eventItems,
    ]
      .filter((v, i, a) => a.findIndex((t) => t._id === v._id) === i)
      .map((item, idx) => ({
        ...item,
        dateText: formatCardDate(
          item.releaseDate,
          ['Sat, 28 Nov', 'Sun, 6 Dec', 'Fri, 27 Nov', 'Sat, 5 Dec', 'Sat, 12 Dec'][idx % 5]
        ),
        venue: [
          `The Laugh Store: DLF Mall of India, ${activeCity}`,
          `Hideout Comedy Club: Sector 18, ${activeCity}`,
          'Kedarnath Sahni Auditorium: Delhi-NCR',
          `Logix City Centre Amphitheatre: ${activeCity}`,
          'Siri Fort Auditorium: Delhi-NCR',
        ][idx % 5],
        priceText: [
          '₹ 799 onwards',
          '₹ 599 onwards',
          '₹ 499 onwards',
          '₹ 999 onwards',
          '₹ 699 onwards',
        ][idx % 5],
      }));

    const popularEventsList: ExperienceItem[] = [...eventItems, ...activityItems]
      .slice(0, 8)
      .map((item, idx) => ({
        ...item,
        dateText: formatCardDate(
          item.releaseDate,
          ['Sat, 28 Nov', 'Sun, 29 Nov', 'Sat, 5 Dec', 'Sun, 6 Dec'][idx % 4]
        ),
        venue: `Multiple Venues: ${activeCity} / NCR`,
        priceText: '₹ 599 onwards',
      }));

    const latestPlaysList: ExperienceItem[] = (
      playItems.length > 0 ? playItems : cinemaMovies.slice(0, 5)
    ).map((item, idx) => ({
      ...item,
      dateText: formatCardDate(
        item.releaseDate,
        ['Sun, 29 Nov', 'Fri, 4 Dec', 'Fri, 11 Dec', 'Sat, 19 Dec'][idx % 4]
      ),
      venue: [
        'Kamani Auditorium: Delhi-NCR',
        'Shri Ram Centre: Mandi House',
        'Stein Auditorium, India Habitat Centre',
        `Expocentre Stage: Sector 62, ${activeCity}`,
      ][idx % 4],
      priceText: ['₹ 500 onwards', '₹ 750 onwards', '₹ 1,200 onwards', '₹ 400 onwards'][idx % 4],
    }));

    const topSportsList: ExperienceItem[] = (
      sportItems.length > 0 ? sportItems : cinemaMovies.slice(0, 5)
    ).map((item, idx) => ({
      ...item,
      dateText: formatCardDate(
        item.releaseDate,
        ['Wed, 2 Dec', 'Mon, 14 Dec', 'Tue, 8 Dec', 'Sun, 6 Dec'][idx % 4]
      ),
      venue: [
        'Arun Jaitley Stadium: Delhi-NCR',
        `Buddh International Circuit: Greater ${activeCity}`,
        `Shaheed Vijay Singh Pathik Sports Complex: ${activeCity}`,
        'JLN Indoor Stadium: Delhi-NCR',
      ][idx % 4],
      priceText: ['₹ 800 onwards', '₹ 1,500 onwards', '₹ 499 onwards', '₹ 999 onwards'][idx % 4],
    }));

    const funActivitiesList: ExperienceItem[] = (
      activityItems.length > 0 ? activityItems : cinemaMovies.slice(0, 5)
    ).map((item, idx) => ({
      ...item,
      dateText: 'Today, Tomorrow & Weekend',
      venue: [
        `Sector 38A, Entertainment City: ${activeCity}`,
        `DLF Mall of India, Sector 18: ${activeCity}`,
        `Gardens Galleria Mall: ${activeCity}`,
        `Logix City Centre Mall: ${activeCity}`,
      ][idx % 4],
      priceText: ['₹ 999 onwards', '₹ 499 onwards', '₹ 699 onwards', '₹ 750 onwards'][idx % 4],
    }));

    const liveEventCategories: LiveEventSquareTileProps[] = [
      {
        title: 'COMEDY SHOWS',
        countText: '150+ Events',
        gradient: 'linear-gradient(135deg, #ff5f6d 0%, #ffc371 100%)',
        accentColor: 'rgba(255,255,255,0.2)',
        icon: Mic,
        to: '/events?filter=Comedy%20Shows',
      },
      {
        title: 'AMUSEMENT PARK',
        countText: '15+ Events',
        gradient: 'linear-gradient(135deg, #00b4db 0%, #0083b0 100%)',
        accentColor: 'rgba(255,255,255,0.2)',
        icon: FerrisWheel,
        to: '/activities?filter=Amusement%20Parks',
      },
      {
        title: 'THEATRE SHOWS',
        countText: '45+ Events',
        gradient: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
        accentColor: 'rgba(255,255,255,0.2)',
        icon: Theater,
        to: '/plays',
      },
      {
        title: 'KIDS',
        countText: '25+ Events',
        gradient: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
        accentColor: 'rgba(255,255,255,0.22)',
        icon: Baby,
        to: '/activities',
      },
      {
        title: 'ADVENTURE & FUN',
        countText: '40+ Events',
        gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        accentColor: 'rgba(255,255,255,0.2)',
        icon: Compass,
        to: '/activities?filter=Adventure',
      },
      {
        title: 'MUSIC SHOWS',
        countText: '65+ Events',
        gradient: 'linear-gradient(135deg, #ec008c 0%, #fc6767 100%)',
        accentColor: 'rgba(255,255,255,0.2)',
        icon: Music,
        to: '/events?filter=Music%20Shows',
      },
      {
        title: 'ART & CRAFTS',
        countText: '30+ Events',
        gradient: 'linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%)',
        accentColor: 'rgba(255,255,255,0.2)',
        icon: Palette,
        to: '/activities',
      },
      {
        title: 'SPORTS & GAMING',
        countText: '35+ Events',
        gradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        accentColor: 'rgba(255,255,255,0.2)',
        icon: Trophy,
        to: '/sports',
      },
    ];

    const trendingSearches = [
      { item: cinemaMovies[0], categoryLabel: 'Movies' },
      { item: cinemaMovies[1], categoryLabel: 'Movies' },
      { item: eventItems[0], categoryLabel: 'Events' },
      { item: cinemaMovies[2], categoryLabel: 'Movies' },
      { item: cinemaMovies[3], categoryLabel: 'Movies' },
      { item: sportItems[0], categoryLabel: 'Sports' },
      { item: eventItems[1], categoryLabel: 'Events' },
      { item: cinemaMovies[4], categoryLabel: 'Movies' },
      { item: activityItems[0], categoryLabel: 'Activities' },
      { item: playItems[0], categoryLabel: 'Plays' },
    ].filter((entry): entry is { item: Movie; categoryLabel: string } => Boolean(entry.item));

    return (
      <div className={styles.homePage}>
        <HeroCarousel movies={cinemaMovies} currentCity={activeCity} />

        <section className={styles.section} id="recommended-section">
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2>Recommended Movies</h2>
              <Link to="/movies" className={styles.seeAll}>
                See All ›
              </Link>
            </div>
            <ScrollSection>
              {recommendedMovies.map((movie, idx) => (
                <MovieCard key={movie._id} movie={movie} showPromoted={idx < 2} />
              ))}
            </ScrollSection>
          </div>
        </section>

        <section className={styles.streamStripSection} id="stream-banner">
          <div className="container">
            <Link to="/stream" className={styles.bmsStreamStrip}>
              <div className={styles.streamStripLeft}>
                <div className={styles.streamLogoPill}>
                  <Play size={16} fill="#ffffff" color="#ffffff" />
                  <span>STREAM</span>
                </div>
                <div className={styles.streamDividerPipe} />
                <p className={styles.streamStripTagline}>
                  Endless Entertainment Anytime. Anywhere!
                </p>
              </div>
              <span className={styles.streamStripCta}>Explore Stream ›</span>
            </Link>
          </div>
        </section>

        <section className={styles.section} id="events-section">
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2>The Best Of Live Events</h2>
            </div>
            <ScrollSection>
              {liveEventCategories.map((cat, idx) => (
                <LiveEventSquareTile key={idx} {...cat} />
              ))}
            </ScrollSection>
          </div>
        </section>

        <section className={styles.premieresSection} id="premieres-section">
          <div className="container">
            <div className={styles.premiereTopBanner}>
              <div className={styles.premierePlayCircle}>
                <Play size={22} fill="#ffffff" color="#ffffff" />
              </div>
              <div>
                <h3 className={styles.premiereTopBrand}>PREMIERE</h3>
                <p className={styles.premiereTopSub}>Watch new movies at home, every Friday</p>
              </div>
            </div>

            <div className={styles.sectionHeader} style={{ marginBottom: '16px' }}>
              <div>
                <h2 className={styles.premieresHeading}>Premieres</h2>
                <p className={styles.premieresSubHeading}>Brand new releases every Friday</p>
              </div>
              <Link to="/stream" className={styles.seeAllRed}>
                See All ›
              </Link>
            </div>

            <ScrollSection>
              {premiereMovies.map((movie) => (
                <PremiereCard key={movie._id} movie={movie} />
              ))}
            </ScrollSection>
          </div>
        </section>

        <section className={styles.section} id="music-studio-section">
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2>Your Music Studio</h2>
              <Link to="/events?filter=Music%20Shows" className={styles.seeAll}>
                See All ›
              </Link>
            </div>
            <ScrollSection>
              {musicStudioItems.map((item, idx) => (
                <ExperienceCard
                  key={`music-${item._id}-${idx}`}
                  item={item}
                  city={activeCity}
                  badgeText={idx === 0 ? 'PROMOTED' : null}
                />
              ))}
            </ScrollSection>
          </div>
        </section>

        <section className={styles.section} id="outdoor-events-section">
          <div className="container">
            <div className={styles.sectionHeader}>
              <div className={styles.headingWithBadge}>
                <h2>Outdoor Events</h2>
                <span className={styles.newRedBadge}>NEW</span>
              </div>
              <Link to="/events" className={styles.seeAll}>
                See All ›
              </Link>
            </div>
            <ScrollSection>
              {outdoorEventItems.map((item, idx) => (
                <ExperienceCard key={`outdoor-${item._id}-${idx}`} item={item} city={activeCity} />
              ))}
            </ScrollSection>
          </div>
        </section>

        <section className={styles.section} id="laughter-section">
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2>Laughter Therapy</h2>
              <Link to="/events?filter=Comedy%20Shows" className={styles.seeAll}>
                See All ›
              </Link>
            </div>
            <ScrollSection>
              {laughterTherapyItems.map((item, idx) => (
                <ExperienceCard key={`laugh-${item._id}-${idx}`} item={item} city={activeCity} />
              ))}
            </ScrollSection>
          </div>
        </section>

        <section className={styles.section} id="popular-events-section">
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2>Popular Events</h2>
              <Link to="/events" className={styles.seeAll}>
                See All ›
              </Link>
            </div>
            <ScrollSection>
              {popularEventsList.map((item, idx) => (
                <ExperienceCard key={`pop-${item._id}-${idx}`} item={item} city={activeCity} />
              ))}
            </ScrollSection>
          </div>
        </section>

        <section className={styles.section} id="latest-plays-section">
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2>The Latest Plays</h2>
              <Link to="/plays" className={styles.seeAll}>
                See All ›
              </Link>
            </div>
            <ScrollSection>
              {latestPlaysList.map((item, idx) => (
                <ExperienceCard key={`play-${item._id}-${idx}`} item={item} city={activeCity} />
              ))}
            </ScrollSection>
          </div>
        </section>

        <section className={styles.section} id="sports-section">
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2>Top Games &amp; Sport Events</h2>
              <Link to="/sports" className={styles.seeAll}>
                See All ›
              </Link>
            </div>
            <ScrollSection>
              {topSportsList.map((item, idx) => (
                <ExperienceCard key={`sport-${item._id}-${idx}`} item={item} city={activeCity} />
              ))}
            </ScrollSection>
          </div>
        </section>

        <section className={styles.section} id="activities-section">
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2>Explore Fun Activities</h2>
              <Link to="/activities" className={styles.seeAll}>
                See All ›
              </Link>
            </div>
            <ScrollSection>
              {funActivitiesList.map((item, idx) => (
                <ExperienceCard key={`act-${item._id}-${idx}`} item={item} city={activeCity} />
              ))}
            </ScrollSection>
          </div>
        </section>

        <section className={styles.section} id="trending-searches-section">
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2>Trending Searches Right Now</h2>
            </div>
            <div className={styles.trendingSearchesGrid}>
              {trendingSearches.map(({ item, categoryLabel }, idx) => (
                <Link
                  key={`trend-${item._id}-${idx}`}
                  to={`/movie/${item._id}`}
                  className={styles.trendingSearchCard}
                >
                  <span className={styles.trendingSearchTitle}>{item.title}</span>
                  <span className={styles.trendingSearchCategory}>{categoryLabel}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <div className={styles.homeBreadcrumbStrip}>
          <div className="container">
            <Link to="/">Home</Link>
            <span>→</span>
            <strong>{activeCity}</strong>
          </div>
        </div>
      </div>
    );
  }

  const typePluralMap: Record<MovieCategory, string> = {
    Movie: 'Movies',
    Stream: 'Stream Premieres',
    Event: 'Events',
    Play: 'Plays',
    Sport: 'Sports',
    Activity: 'Activities',
  };

  return (
    <div className={styles.homePage}>
      <HeroCarousel
        movies={filteredMovies.length > 0 ? filteredMovies : movies}
        currentCity={activeCity}
      />

      <div className="container">
        <div className={styles.categoryPage}>
          <aside className={styles.filters}>
            <h3 className={styles.filtersHeading}>Filters</h3>

            <FilterSection
              title="Languages"
              items={['Hindi', 'English', 'Telugu', 'Tamil', 'Kannada', 'Malayalam', 'Marathi']}
              selectedItems={activeFilters.Languages}
              onSelect={(item) => toggleFilter('Languages', item)}
              isOpenDefault={true}
            />

            <FilterSection
              title="Genres"
              items={[
                'Action',
                'Adventure',
                'Comedy',
                'Drama',
                'Thriller',
                'Sci-Fi',
                'Historical',
                'Musical',
              ]}
              selectedItems={activeFilters.Genres}
              onSelect={(item) => toggleFilter('Genres', item)}
              isOpenDefault={false}
            />

            <FilterSection
              title="Format"
              items={['2D', 'IMAX 2D', '4DX', 'MX4D', 'ICE', 'Dolby Atmos', '4K UHD']}
              selectedItems={activeFilters.Format}
              onSelect={(item) => toggleFilter('Format', item)}
              isOpenDefault={false}
            />

            {type !== 'Movie' && (
              <FilterSection
                title="Categories"
                items={[
                  'Comedy Shows',
                  'Music Shows',
                  'Concert',
                  'Theater',
                  'Cricket',
                  'Football',
                  'Amusement Parks',
                  'Adventure',
                ]}
                selectedItems={activeFilters.Categories}
                onSelect={(item) => toggleFilter('Categories', item)}
                isOpenDefault={true}
              />
            )}

            <button
              type="button"
              className={styles.browseCinemasBtn}
              onClick={() => setIsCinemasModalOpen(true)}
            >
              Browse by Cinemas
            </button>
          </aside>

          <div className={styles.feed}>
            <div className={styles.sectionHeader}>
              <h2>
                {typePluralMap[type] || 'Movies'} in {activeCity}
              </h2>
            </div>

            <div className={styles.quickFilters}>
              {(type === 'Movie'
                ? ['Hindi', 'English', 'Telugu', 'Tamil', 'Kannada', 'Malayalam', 'IMAX 2D', '4DX']
                : ['Comedy', 'Concert', 'Theater', 'Cricket', 'Adventure', 'Hindi', 'English']
              ).map((chip) => {
                const isLang = [
                  'Hindi',
                  'English',
                  'Telugu',
                  'Tamil',
                  'Kannada',
                  'Malayalam',
                ].includes(chip);
                const isFmt = ['IMAX 2D', '4DX'].includes(chip);
                const bucket: FilterBucket = isLang ? 'Languages' : isFmt ? 'Format' : 'Genres';
                const isActive = activeFilters[bucket]?.includes(chip);

                return (
                  <button
                    type="button"
                    key={chip}
                    className={`${styles.pill} ${isActive ? styles.pillActive : ''}`}
                    onClick={() => toggleFilter(bucket, chip)}
                  >
                    {chip}
                  </button>
                );
              })}
            </div>

            {type === 'Movie' && (
              <div className={styles.comingSoonStrip} onClick={() => navigate('/stream')}>
                <span className={styles.comingSoonTitle}>Coming Soon</span>
                <span className={styles.comingSoonLink}>Explore Upcoming Movies ›</span>
              </div>
            )}

            <div className={styles.movieGrid}>
              {filteredMovies.map((item) =>
                item.type === 'Movie' || !item.type ? (
                  <MovieCard key={item._id} movie={item} />
                ) : (
                  <ExperienceCard key={item._id} item={item} city={activeCity} />
                )
              )}
            </div>

            {filteredMovies.length === 0 && (
              <div className={styles.emptyState}>
                <h3>No matches found in {activeCity}</h3>
                <p>Try clearing one or more filters to see all available titles.</p>
                <button
                  type="button"
                  className={styles.resetFiltersBtn}
                  onClick={() =>
                    setActiveFilters({ Languages: [], Genres: [], Format: [], Categories: [] })
                  }
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isCinemasModalOpen && (
        <div className={styles.modalBackdrop} onClick={() => setIsCinemasModalOpen(false)}>
          <div className={styles.cinemasModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.cinemasModalHeader}>
              <h3>Cinemas in {activeCity}</h3>
              <button
                type="button"
                aria-label="Close cinemas modal"
                onClick={() => setIsCinemasModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className={styles.cinemasList}>
              {cityCinemas.map((c) => (
                <div
                  key={c.id}
                  className={styles.cinemaListItem}
                  onClick={() => {
                    setIsCinemasModalOpen(false);
                    if (movies[0]?._id) {
                      navigate(`/movie/${movies[0]._id}/buytickets`);
                    }
                  }}
                >
                  <MapPin size={18} color="#f84464" />
                  <div>
                    <h4>{c.name}</h4>
                    <p>{c.address}</p>
                  </div>
                  <ChevronRight size={18} color="#999" style={{ marginLeft: 'auto' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
