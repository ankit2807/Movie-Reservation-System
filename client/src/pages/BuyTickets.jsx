import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ChevronLeft, ChevronRight, Heart, Info, Smartphone, Utensils,
  Search, X, MapPin, ShieldCheck
} from 'lucide-react';
import api from '../api/axios';
import { getTheatresForCity } from '../utils/bookmyshowData';
import styles from '../styles/BuyTickets.module.css';

const generateDates = () => {
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const list = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    list.push({
      id: i,
      day: days[d.getDay()],
      date: String(d.getDate()).padStart(2, '0'),
      month: months[d.getMonth()],
      iso: d.toISOString().split('T')[0],
    });
  }
  return list;
};

const parseHour24 = (timeStr = '') => {
  const m = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!m) return 14;
  let hr = parseInt(m[1], 10);
  const ampm = m[3].toUpperCase();
  if (ampm === 'PM' && hr !== 12) hr += 12;
  if (ampm === 'AM' && hr === 12) hr = 0;
  return hr;
};

const BuyTickets = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentCity } = useSelector((state) => state.location);

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const dates = useMemo(() => generateDates(), []);
  const initialDateIso = searchParams.get('date');
  const initialDateIdx = useMemo(() => {
    const idx = dates.findIndex((d) => d.iso === initialDateIso);
    return idx >= 0 ? idx : 0;
  }, [dates, initialDateIso]);

  const [selectedDateIdx, setSelectedDateIdx] = useState(initialDateIdx);
  const [selectedLang, setSelectedLang] = useState(searchParams.get('lang') || '');
  const [selectedFormat, setSelectedFormat] = useState(searchParams.get('format') || 'All');
  const [priceFilter, setPriceFilter] = useState('All');
  const [timeFilter, setTimeFilter] = useState('All');
  const [cinemaQuery, setCinemaQuery] = useState('');
  const [favoriteTheatres, setFavoriteTheatres] = useState({});
  const [infoModalTheatre, setInfoModalTheatre] = useState(null);

  useEffect(() => {
    const loadMovie = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/movie/find/${id}`);
        const data = res.data;
        setMovie(data);
        if (!selectedLang) {
          setSelectedLang(data.languages?.[0] || 'English');
        }
      } catch (err) {
        console.error('Failed to fetch movie for BuyTickets:', err);
        setError('Unable to load showtimes for this movie.');
      } finally {
        setLoading(false);
      }
    };
    loadMovie();
  }, [id]);

  const activeDate = dates[selectedDateIdx] || dates[0];
  const theatres = useMemo(
    () => getTheatresForCity(currentCity || 'Noida', movie || {}),
    [currentCity, movie]
  );

  const formatList = useMemo(() => {
    if (!movie?.format) return ['2D', 'IMAX 2D', '4DX'];
    return movie.format.split(',').map((f) => f.trim()).filter(Boolean);
  }, [movie]);

  const languageFormatCombos = useMemo(() => {
    const langs = movie?.languages?.length ? movie.languages : ['English', 'Hindi'];
    const combos = [{ label: `${selectedLang || langs[0]} - All Formats`, lang: selectedLang || langs[0], format: 'All' }];
    langs.forEach((l) => {
      formatList.forEach((f) => {
        combos.push({ label: `${l} - ${f}`, lang: l, format: f });
      });
    });
    return combos;
  }, [movie, formatList, selectedLang]);

  const filteredTheatres = useMemo(() => {
    return theatres
      .filter((t) => {
        if (!cinemaQuery.trim()) return true;
        const q = cinemaQuery.toLowerCase();
        return t.name.toLowerCase().includes(q) || t.address.toLowerCase().includes(q);
      })
      .map((t) => {
        const shows = t.shows.filter((s) => {
          if (selectedFormat !== 'All') {
            const normSel = selectedFormat.toUpperCase();
            const normShow = s.format.toUpperCase();
            if (!normShow.includes(normSel) && !normSel.includes(normShow)) return false;
          }
          if (priceFilter === '0-200' && s.price > 200) return false;
          if (priceFilter === '201-350' && (s.price < 201 || s.price > 350)) return false;
          if (priceFilter === '351+' && s.price < 351) return false;

          const hr = parseHour24(s.time);
          if (timeFilter === 'Morning' && hr >= 12) return false;
          if (timeFilter === 'Afternoon' && (hr < 12 || hr >= 16)) return false;
          if (timeFilter === 'Evening' && (hr < 16 || hr >= 19)) return false;
          if (timeFilter === 'Night' && hr < 19) return false;
          return true;
        });
        return { ...t, shows };
      })
      .filter((t) => t.shows.length > 0);
  }, [theatres, cinemaQuery, selectedFormat, priceFilter, timeFilter]);

  const handleSelectShowtime = (theatre, show) => {
    const query = new URLSearchParams({
      movieId: movie._id,
      theatreId: theatre.id,
      theatreName: theatre.name,
      date: activeDate.iso,
      time: show.time,
      format: show.format,
      screen: show.screen,
      lang: selectedLang || show.language || 'English',
    }).toString();

    navigate(`/booking/${show._id}?${query}`, {
      state: {
        movie,
        theatre,
        show: {
          ...show,
          language: selectedLang || show.language || 'English',
        },
        date: activeDate.iso,
      },
    });
  };

  if (loading) {
    return (
      <div className={styles.stateBox}>
        <div className={styles.spinner} />
        <p>Loading cinemas and showtimes...</p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className={styles.stateBox}>
        <h3>{error || 'Movie not found'}</h3>
        <button className={styles.backBtn} onClick={() => navigate('/')}>Back to Home</button>
      </div>
    );
  }

  const genres = (movie.genre || 'Action, Adventure').split(',').map((g) => g.trim()).filter(Boolean);

  return (
    <div className={styles.buyTicketsPage}>
      {/* ═══════ 1. TOP MOVIE TITLE & GENRE HEADER (Exact BookMyShow /buytickets Header) ═══════ */}
      <div className={styles.movieHeaderSection}>
        <div className="container">
          <Link to={`/movie/${movie._id}`} className={styles.movieTitleLink}>
            {movie.title} - ({selectedLang || movie.languages?.[0] || 'English'})
          </Link>

          <div className={styles.certAndGenreRow}>
            <span className={styles.certCircle}>{movie.certification || 'UA16+'}</span>
            {genres.map((g) => (
              <span key={g} className={styles.genrePill}>{g.toUpperCase()}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════ 2. STICKY DATE STRIP & FILTER CONTROLS BAR ═══════ */}
      <div className={styles.stickyControlsBar}>
        <div className={`container ${styles.controlsInner}`}>
          {/* 7-Day Date Strip */}
          <div className={styles.dateStrip}>
            <button
              type="button"
              className={styles.dateNavArrow}
              onClick={() => setSelectedDateIdx((p) => Math.max(0, p - 1))}
              disabled={selectedDateIdx === 0}
              aria-label="Previous day"
            >
              <ChevronLeft size={18} />
            </button>

            <div className={styles.datePillsRow}>
              {dates.map((d, idx) => {
                const isSelected = idx === selectedDateIdx;
                return (
                  <button
                    key={d.iso}
                    type="button"
                    className={`${styles.datePill} ${isSelected ? styles.datePillActive : ''}`}
                    onClick={() => {
                      setSelectedDateIdx(idx);
                      setSearchParams({
                        lang: selectedLang,
                        format: selectedFormat,
                        date: d.iso,
                      });
                    }}
                  >
                    <span className={styles.dateDay}>{d.day}</span>
                    <span className={styles.dateNum}>{d.date}</span>
                    <span className={styles.dateMonth}>{d.month}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className={styles.dateNavArrow}
              onClick={() => setSelectedDateIdx((p) => Math.min(dates.length - 1, p + 1))}
              disabled={selectedDateIdx === dates.length - 1}
              aria-label="Next day"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Right Filter Dropdowns (Exact BookMyShow Filter Strip) */}
          <div className={styles.filterGroup}>
            <div className={styles.filterCell}>
              <select
                value={`${selectedLang}|${selectedFormat}`}
                onChange={(e) => {
                  const [l, f] = e.target.value.split('|');
                  setSelectedLang(l);
                  setSelectedFormat(f);
                }}
                aria-label="Select Language and Format"
              >
                {languageFormatCombos.map((c, idx) => (
                  <option key={idx} value={`${c.lang}|${c.format}`}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterCell}>
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                aria-label="Filter Price Range"
              >
                <option value="All">Filter Price Range</option>
                <option value="0-200">Rs. 0 - Rs. 200</option>
                <option value="201-350">Rs. 201 - Rs. 350</option>
                <option value="351+">Rs. 351 - Rs. 600</option>
              </select>
            </div>

            <div className={styles.filterCell}>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                aria-label="Filter Show Timings"
              >
                <option value="All">Filter Show Timings</option>
                <option value="Morning">Morning (12:00 - 11:59 AM)</option>
                <option value="Afternoon">Afternoon (12:00 - 3:59 PM)</option>
                <option value="Evening">Evening (4:00 - 6:59 PM)</option>
                <option value="Night">Night (7:00 - 11:59 PM)</option>
              </select>
            </div>

            <div className={styles.searchCinemaBox}>
              <Search size={15} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search for cinema"
                value={cinemaQuery}
                onChange={(e) => setCinemaQuery(e.target.value)}
              />
              {cinemaQuery && (
                <button type="button" onClick={() => setCinemaQuery('')} className={styles.clearBtn}>
                  <X size={13} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ 3. MAIN SHOWTIMES CONTAINER ═══════ */}
      <div className={`container ${styles.theatresContainer}`}>
        <div className={styles.theatresBoard}>
          {/* Subtitle & Availability Legend Strip */}
          <div className={styles.legendBar}>
            <div className={styles.legendLeft}>
              <span className={styles.lanTag}>LAN</span>
              <span>indicates subtitle language, if subtitles are available</span>
            </div>
            <div className={styles.legendRight}>
              <span className={styles.legendItem}>
                <span className={`${styles.statusDot} ${styles.dotAvailable}`} /> AVAILABLE
              </span>
              <span className={styles.legendItem}>
                <span className={`${styles.statusDot} ${styles.dotFilling}`} /> FAST FILLING
              </span>
              <span className={styles.legendItem}>
                <span className={styles.lanBadgeSmall}>LAN</span> SUBTITLES LANGUAGE
              </span>
            </div>
          </div>

          {/* Cinema Rows */}
          {filteredTheatres.length === 0 ? (
            <div className={styles.emptyVenues}>
              <p>No cinemas match your active filters.</p>
              <button
                type="button"
                className={styles.resetBtn}
                onClick={() => {
                  setSelectedFormat('All');
                  setPriceFilter('All');
                  setTimeFilter('All');
                  setCinemaQuery('');
                }}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            filteredTheatres.map((theatre) => (
              <div key={theatre.id} className={styles.cinemaRow}>
                {/* Left Column: Cinema Info */}
                <div className={styles.cinemaLeft}>
                  <button
                    type="button"
                    className={`${styles.favBtn} ${favoriteTheatres[theatre.id] ? styles.favActive : ''}`}
                    onClick={() =>
                      setFavoriteTheatres((p) => ({ ...p, [theatre.id]: !p[theatre.id] }))
                    }
                    aria-label="Favorite cinema"
                  >
                    <Heart size={16} fill={favoriteTheatres[theatre.id] ? '#f84464' : 'none'} />
                  </button>

                  <div className={styles.cinemaDetails}>
                    <div className={styles.cinemaTitleRow}>
                      <h3 className={styles.cinemaName}>{theatre.name}</h3>
                      <button
                        type="button"
                        className={styles.infoTrigger}
                        onClick={() => setInfoModalTheatre(theatre)}
                      >
                        <Info size={13} />
                        <span>INFO</span>
                      </button>
                    </div>

                    <div className={styles.facilityBadges}>
                      <span className={styles.mTicketLabel}>
                        <Smartphone size={13} /> M-Ticket
                      </span>
                      <span className={styles.fnbLabel}>
                        <Utensils size={13} /> Food & Beverage
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Showtime Pills + Hover Price Tooltips */}
                <div className={styles.cinemaRight}>
                  <div className={styles.showtimesGrid}>
                    {theatre.shows.map((show) => {
                      const isFastFilling =
                        show.status === 'FAST_FILLING' || show.status === 'ALMOST_FULL';
                      return (
                        <div key={show._id} className={styles.showPillWrapper}>
                          {/* Hover Price Tooltip */}
                          <div className={styles.priceTooltip}>
                            {show.tiers.map((t) => (
                              <div key={t.label} className={styles.tooltipCol}>
                                <span className={styles.tooltipPrice}>Rs. {t.price}.00</span>
                                <span className={styles.tooltipTier}>{t.label}</span>
                                <span
                                  className={`${styles.tooltipStatus} ${
                                    t.status === 'AVAILABLE' ? styles.textGreen : styles.textOrange
                                  }`}
                                >
                                  {t.status}
                                </span>
                              </div>
                            ))}
                          </div>

                          <button
                            type="button"
                            className={`${styles.showPillBtn} ${
                              isFastFilling ? styles.showPillFastFilling : ''
                            }`}
                            onClick={() => handleSelectShowtime(theatre, show)}
                          >
                            <span className={styles.showTimeText}>{show.time}</span>
                            <span className={styles.showFormatSub}>{show.format}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <div className={styles.cancelPolicyLine}>
                    <span className={styles.goldDot} />
                    <span>
                      {theatre.cancellable ? 'Cancellation available' : 'Non-cancellable'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Breadcrumb Note */}
        <div className={styles.breadcrumbBar}>
          <Link to="/">Home</Link>
          <span>→</span>
          <Link to="/movies">Movies in {currentCity || 'Noida'}</Link>
          <span>→</span>
          <Link to={`/movie/${movie._id}`}>{movie.title}</Link>
          <span>→</span>
          <span>Showtimes</span>
        </div>
      </div>

      {/* Cinema Info Modal */}
      {infoModalTheatre && (
        <div className={styles.modalBackdrop} onClick={() => setInfoModalTheatre(null)}>
          <div className={styles.infoModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.infoModalHeader}>
              <h3>{infoModalTheatre.name}</h3>
              <button type="button" onClick={() => setInfoModalTheatre(null)}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.infoModalBody}>
              <p className={styles.infoAddress}>
                <MapPin size={16} color="#f84464" />
                <span>{infoModalTheatre.address}</span>
              </p>
              <h4>Available Facilities</h4>
              <div className={styles.infoFacilityTags}>
                {(infoModalTheatre.facilities || ['Dolby Atmos', 'M-Ticket', 'F&B', 'Parking']).map(
                  (f) => (
                    <span key={f} className={styles.infoFacilityChip}>
                      <ShieldCheck size={14} color="#1ea83c" /> {f}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyTickets;
