import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Star, Share2, Play, ChevronRight, ChevronLeft, ThumbsUp, ThumbsDown,
  X, Check, ExternalLink, Copy
} from 'lucide-react';
import { setAuthModalOpen } from '../redux/authSlice';
import api from '../api/axios';
import {
  createPosterFallback,
  createAvatarFallback,
  getTrailersForMovie,
  MOVIEBOOK_OFFERS,
  DEFAULT_BMS_REVIEWS,
} from '../utils/moviebookData';
import styles from '../styles/MovieDetails.module.css';

const REVIEW_HASHTAGS = [
  { tag: '#Wellmade', count: 274 },
  { tag: '#GreatActing', count: 252 },
  { tag: '#Rocking', count: 228 },
  { tag: '#SuperDirection', count: 220 },
  { tag: '#WowMusic', count: 184 },
  { tag: '#Blockbuster', count: 158 },
  { tag: '#AwesomeStory', count: 151 },
  { tag: '#Inspiring', count: 113 },
];

const STREET_FIGHTER_CAST = [
  {
    name: 'Noah Centineo',
    role: 'Actor',
    image: 'https://assets-in.bmscdn.com/iedb/artist/images/website/poster/large/noah-centineo-2004274-11-11-2019-01-01-40.jpg',
  },
  {
    name: 'Callina Liang',
    role: 'Actor',
    image: 'https://assets-in.bmscdn.com/iedb/artist/images/website/poster/large/callina-liang-2054117-1768300197.jpg',
  },
  {
    name: 'Andrew Koji',
    role: 'Actor',
    image: 'https://assets-in.bmscdn.com/iedb/artist/images/website/poster/large/andrew-koji-2014466-23-09-2021-11-35-16.jpg',
  },
  {
    name: 'Vidyut Jammwal',
    role: 'Actor',
    image: 'https://assets-in.bmscdn.com/iedb/artist/images/website/poster/large/vidyut-jamwal-30657-24-03-2017-13-55-31.jpg',
  },
  {
    name: 'Jason Momoa',
    role: 'Actor',
    image: 'https://assets-in.bmscdn.com/iedb/artist/images/website/poster/large/jason-momoa-25617-24-03-2017-17-39-52.jpg',
  },
];

const STREET_FIGHTER_CREW = [
  {
    name: 'Kitao Sakurai',
    role: 'Director',
    image: 'https://assets-in.bmscdn.com/iedb/artist/images/website/poster/large/kitao-sakurai-2009823-1768299674.jpg',
  },
  {
    name: 'Mary Parent',
    role: 'Producer',
    image: 'https://assets-in.bmscdn.com/iedb/artist/images/website/poster/large/mary-parent-1052739-07-05-2019-02-00-32.jpg',
  },
];

const MovieDetails = ({ initialMultimedia = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { currentCity } = useSelector((state) => state.location);

  const [movie, setMovie] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Interactive MovieBook states
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [isLangFormatModalOpen, setIsLangFormatModalOpen] = useState(false);
  const [isTrailerModalOpen, setIsTrailerModalOpen] = useState(
    initialMultimedia || location.pathname.endsWith('/multimedia')
  );
  const [playingVideoId, setPlayingVideoId] = useState(null);
  const [selectedTrailerLang, setSelectedTrailerLang] = useState('All');
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [activeHashtag, setActiveHashtag] = useState(null);
  const [helpfulVotes, setHelpfulVotes] = useState({});
  const [expandedReviews, setExpandedReviews] = useState({});
  const [copiedShare, setCopiedShare] = useState(false);

  // Review form state
  const [reviewRating, setReviewRating] = useState(10);
  const [reviewComment, setReviewComment] = useState('');
  const [selectedTags, setSelectedTags] = useState(['#Blockbuster', '#SuperDirection']);
  const [submittingReview, setSubmittingReview] = useState(false);

  const offersScrollRef = useRef(null);
  const castScrollRef = useRef(null);
  const crewScrollRef = useRef(null);
  const hashtagScrollRef = useRef(null);
  const reviewsScrollRef = useRef(null);
  const recScrollRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      setShowStickyHeader(window.scrollY > 420);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setIsTrailerModalOpen(initialMultimedia || location.pathname.endsWith('/multimedia'));
  }, [initialMultimedia, location.pathname]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const [movieRes, allMoviesRes] = await Promise.all([
          api.get(`/movie/find/${id}`),
          api.get('/movie').catch(() => ({ data: [] })),
        ]);

        const movieData = movieRes.data;
        setMovie(movieData);

        const allList = Array.isArray(allMoviesRes.data) ? allMoviesRes.data : [];
        const recs = allList
          .filter((m) => m._id !== movieData._id && m.type === (movieData.type || 'Movie'))
          .slice(0, 10);
        setRecommended(recs);

        try {
          const revRes = await api.get(`/reviews/${movieData._id}`);
          setReviews(Array.isArray(revRes.data) ? revRes.data : []);
        } catch {
          setReviews([]);
        }
      } catch (err) {
        console.error('Error loading movie details:', err);
        setError('Unable to load movie details.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const isStreetFighter = movie?.title?.toLowerCase() === 'street fighter';

  const movieTrailers = useMemo(() => getTrailersForMovie(movie), [movie]);

  const trailerLanguages = useMemo(() => {
    const set = new Set(movieTrailers.map((t) => t.language || 'English'));
    return Array.from(set);
  }, [movieTrailers]);

  const visibleTrailers = useMemo(() => {
    if (selectedTrailerLang === 'All' || !trailerLanguages.includes(selectedTrailerLang)) {
      return movieTrailers;
    }
    return movieTrailers.filter((t) => t.language === selectedTrailerLang);
  }, [movieTrailers, selectedTrailerLang, trailerLanguages]);

  const handleOpenTrailer = () => {
    setPlayingVideoId(null);
    setIsTrailerModalOpen(true);
  };

  const handleCloseTrailer = () => {
    setPlayingVideoId(null);
    setIsTrailerModalOpen(false);
    if (location.pathname.endsWith('/multimedia')) {
      navigate(`/movie/${movie?._id || id}`);
    }
  };

  const formats = useMemo(() => {
    if (isStreetFighter) {
      return ['2D', 'MX4D', 'ICE', '2D SCREEN X', '4DX', 'IMAX 2D'];
    }
    if (!movie?.format) return ['2D', 'IMAX 2D', '4DX'];
    const cleaned = movie.format
      .split(',')
      .map((f) => f.trim())
      .filter((f) => f && f.toLowerCase() !== 'dolby atmos' && f.toLowerCase() !== 'dolby cinema 2d')
      .map((f) => (f.toLowerCase() === 'screenx' ? '2D SCREEN X' : f));
    return cleaned.length > 0 ? cleaned : ['2D', 'IMAX 2D', '4DX'];
  }, [movie, isStreetFighter]);

  const languages = useMemo(() => {
    if (isStreetFighter) {
      return ['English', 'Hindi'];
    }
    if (Array.isArray(movie?.languages) && movie.languages.length > 0) {
      return movie.languages.slice(0, 3);
    }
    return ['English', 'Hindi'];
  }, [movie, isStreetFighter]);

  const getFormatsForLanguage = (lang, langIdx) => {
    const upperFormats = formats.map((f) => f.toUpperCase());
    if (
      isStreetFighter ||
      (upperFormats.some((f) => f.includes('SCREEN')) && upperFormats.includes('ICE'))
    ) {
      if (lang.toLowerCase() === 'english' || langIdx === 0) {
        return ['2D', 'IMAX 2D', '4DX', 'ICE', '2D SCREEN X'];
      }
      return ['2D', '4DX'];
    }
    if (langIdx > 0 && formats.length > 2) {
      const dubbedFormats = formats.filter((f) => ['2D', '3D', '4DX'].includes(f.toUpperCase()));
      return dubbedFormats.length > 0 ? dubbedFormats : formats.slice(0, 2);
    }
    return formats;
  };

  const handleBookTicketsClick = () => {
    setIsLangFormatModalOpen(true);
  };

  const handleSelectLanguageAndFormat = (lang, fmt) => {
    setIsLangFormatModalOpen(false);
    navigate(`/movie/${movie._id}/buytickets?lang=${encodeURIComponent(lang)}&format=${encodeURIComponent(fmt)}`);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href).catch(() => {});
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2200);
  };

  const handleOpenRateModal = () => {
    if (!isAuthenticated) {
      dispatch(setAuthModalOpen(true));
      return;
    }
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    setSubmittingReview(true);
    try {
      const fullText = `${selectedTags.join(' ')} — ${reviewComment.trim()}`;
      const res = await api.post('/reviews', {
        movieId: movie._id,
        rating: reviewRating,
        comment: fullText,
      });
      setReviews((prev) => [res.data, ...prev]);
      setReviewComment('');
      setIsReviewModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const scrollRow = (ref, dir, distance = 460) => {
    if (!ref.current) return;
    ref.current.scrollBy({ left: dir * distance, behavior: 'smooth' });
  };

  const displayReviews = useMemo(() => {
    const merged = [...reviews, ...DEFAULT_BMS_REVIEWS];
    if (!activeHashtag) return merged;
    return merged.filter(
      (r) =>
        (r.hashtags || '').toLowerCase().includes(activeHashtag.toLowerCase()) ||
        (r.comment || '').toLowerCase().includes(activeHashtag.toLowerCase())
    );
  }, [reviews, activeHashtag]);

  if (loading) {
    return (
      <div className={styles.stateWrapper}>
        <div className={styles.spinner} />
        <p>Loading movie details...</p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className={styles.stateWrapper}>
        <h3>{error || 'Movie not found'}</h3>
        <button className={styles.primaryBtn} onClick={() => navigate('/')}>Back to Home</button>
      </div>
    );
  }

  const releaseDateFormatted = movie.releaseDate
    ? new Date(movie.releaseDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '16 Oct, 2026';

  const heroPosterUrl = isStreetFighter
    ? 'https://assets-in.bmscdn.com/iedb/movies/images/mobile/thumbnail/xlarge/street-fighter-et00481645-1784792998.jpg'
    : movie.posterImage || createPosterFallback(movie.title);

  const heroBackdropUrl = isStreetFighter
    ? 'https://assets-in.bmscdn.com/iedb/movies/images/mobile/listing/xxlarge/street-fighter-et00481645-1784792998.jpg'
    : movie.backdropImage || movie.posterImage;

  const castList = isStreetFighter
    ? STREET_FIGHTER_CAST
    : Array.isArray(movie.cast) && movie.cast.length > 0
    ? movie.cast
    : STREET_FIGHTER_CAST;

  const crewList = isStreetFighter
    ? STREET_FIGHTER_CREW
    : Array.isArray(movie.crew) && movie.crew.length > 0
    ? movie.crew
    : STREET_FIGHTER_CREW;

  const genreDisplay = isStreetFighter
    ? 'Action, Adventure, Comedy, Thriller'
    : movie.genre || 'Action, Adventure';

  return (
    <div className={styles.movieDetailsPage}>
      {/* ═══════ 1. STICKY TOP MOVIE HEADER ON SCROLL (Exact MovieBook Scroll Bar) ═══════ */}
      {showStickyHeader && (
        <div className={styles.stickyScrollBar}>
          <div className={`container ${styles.stickyBarInner}`}>
            <h2 className={styles.stickyMovieTitle}>{movie.title}</h2>
            <button
              type="button"
              className={styles.stickyBookBtn}
              onClick={handleBookTicketsClick}
            >
              Book tickets
            </button>
          </div>
        </div>
      )}

      {/* ═══════ 2. DARK HERO BANNER (Exact MovieBook Layout) ═══════ */}
      <section
        className={styles.heroBanner}
        style={{
          backgroundImage: `linear-gradient(90deg, #1A1A1A 24.97%, #1A1A1A 38.3%, rgba(26, 26, 26, 0.04) 97.47%, #1A1A1A 100%), url(${heroBackdropUrl})`,
        }}
      >
        <div className={`container ${styles.heroContainer}`}>
          {/* Left: Movie Poster Card with "Trailers (2)" + "In cinemas" */}
          <div
            className={styles.posterCard}
            onClick={handleOpenTrailer}
            role="button"
            tabIndex={0}
            aria-label={`Watch trailers for ${movie.title}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') handleOpenTrailer();
            }}
          >
            <div className={styles.posterImgBox}>
              <img
                src={heroPosterUrl}
                alt={movie.title}
                className={styles.posterImg}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = createPosterFallback(movie.title);
                }}
              />
              <button
                type="button"
                id="watch-trailer-btn"
                className={styles.trailerOverlayPill}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenTrailer();
                }}
              >
                <Play size={12} fill="#ffffff" color="#ffffff" />
                <span>Trailers ({movieTrailers.length})</span>
              </button>
            </div>
            <div className={styles.inCinemasStrip}>In cinemas</div>
          </div>

          {/* Center: Movie Title, Rating Box, Meta, Format/Language Pills, Book Tickets CTA */}
          <div className={styles.heroInfoCol}>
            <h1 className={styles.heroTitle}>{movie.title}</h1>

            {/* Rating Box */}
            <div className={styles.ratingBox}>
              <div className={styles.ratingBoxLeft}>
                <Star size={22} fill="#f84464" color="#f84464" />
                <span className={styles.ratingValue}>{movie.rating}/10</span>
                <span className={styles.votesText}>({movie.votes || '1.5K+'} Votes)</span>
                <ChevronRight size={16} color="#cccccc" />
              </div>
              <button
                type="button"
                className={styles.rateNowBtn}
                onClick={handleOpenRateModal}
              >
                Rate now
              </button>
            </div>

            {/* Dot-Separated Metadata Line */}
            <div className={styles.metaBulletLine}>
              <span>{movie.duration || '1h 59m'}</span>
              <span className={styles.dot}>•</span>
              <span>{genreDisplay}</span>
              <span className={styles.dot}>•</span>
              <span>{movie.certification || 'UA16+'}</span>
              <span className={styles.dot}>•</span>
              <span>{releaseDateFormatted}</span>
            </div>

            {/* Format & Language Pills (Clickable like MovieBook) */}
            <div className={styles.tagsStack}>
              <div className={styles.tagPill}>
                {formats.map((fmt, idx) => (
                  <React.Fragment key={fmt}>
                    <button
                      type="button"
                      className={styles.tagLinkBtn}
                      onClick={() => handleSelectLanguageAndFormat(languages[0], fmt)}
                    >
                      {fmt}
                    </button>
                    {idx < formats.length - 1 && <span>,&nbsp;</span>}
                  </React.Fragment>
                ))}
              </div>

              <div className={styles.tagPill}>
                {languages.map((lang, idx) => (
                  <React.Fragment key={lang}>
                    <button
                      type="button"
                      className={styles.tagLinkBtn}
                      onClick={() => handleSelectLanguageAndFormat(lang, 'All')}
                    >
                      {lang}
                    </button>
                    {idx < languages.length - 1 && <span>,&nbsp;</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Red Book Tickets CTA Button */}
            <div className={styles.heroCtaWrap}>
              <button
                type="button"
                id="book-tickets-btn"
                className={styles.bookTicketsBtn}
                onClick={handleBookTicketsClick}
              >
                Book tickets
              </button>
            </div>
          </div>

          {/* Top-Right Share Button */}
          <button
            type="button"
            className={styles.shareBtn}
            onClick={handleShare}
          >
            {copiedShare ? <Check size={18} color="#1ea83c" /> : <Share2 size={18} />}
            <span>{copiedShare ? 'Copied' : 'Share'}</span>
          </button>
        </div>
      </section>

      {/* ═══════ 3. MAIN CONTENT SECTIONS (Exact MovieBook Left-Aligned Column) ═══════ */}
      <div className="container">
        <div className={styles.mainContentColumn}>
          {/* ── SECTION 1: About the movie ── */}
          <section className={styles.pageSection}>
            <h2 className={styles.sectionHeading}>About the movie</h2>
            <p className={styles.aboutDescription}>{movie.description}</p>
          </section>

          {/* ── SECTION 2: Top offers for you (Exact MovieBook Dashed Yellow Cards) ── */}
          <section className={styles.pageSection}>
            <h2 className={styles.sectionHeading}>Top offers for you</h2>
            <div className={styles.carouselRelativeWrap}>
              <div className={styles.offersCarousel} ref={offersScrollRef}>
                {MOVIEBOOK_OFFERS.map((offer) => (
                  <button
                    key={offer.id}
                    type="button"
                    className={styles.offerCard}
                    onClick={() => {
                      setSelectedOffer(offer);
                      setCopiedCode(false);
                    }}
                  >
                    <div className={styles.offerLogoWrap}>
                      <img
                        src={offer.logo}
                        alt="offer"
                        className={styles.offerLogoImg}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                    <div className={styles.offerText}>
                      <h4>{offer.shortTitle}</h4>
                      <p>{offer.subtitle}</p>
                    </div>
                  </button>
                ))}
              </div>
              <button
                type="button"
                className={styles.floatingRightArrow}
                onClick={() => scrollRow(offersScrollRef, 1, 380)}
                aria-label="More offers"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </section>

          {/* ── SECTION 3: Cast (120x120 Rounded-Square Portraits) ── */}
          <section className={styles.pageSection}>
            <h2 className={styles.sectionHeading}>Cast</h2>
            <div className={styles.carouselRelativeWrap}>
              <div className={styles.peopleCarousel} ref={castScrollRef}>
                {castList.map((actor, idx) => (
                  <div key={`${actor.name}-${idx}`} className={styles.personCard}>
                    <div className={styles.personAvatarWrap}>
                      <img
                        src={actor.image || createAvatarFallback(actor.name, idx)}
                        alt={actor.name}
                        className={styles.personAvatar}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = createAvatarFallback(actor.name, idx);
                        }}
                      />
                    </div>
                    <h4 className={styles.personName}>{actor.name}</h4>
                    <p className={styles.personRole}>{actor.role || 'Actor'}</p>
                  </div>
                ))}
              </div>
              {castList.length > 5 && (
                <button
                  type="button"
                  className={styles.floatingRightArrow}
                  onClick={() => scrollRow(castScrollRef, 1, 360)}
                  aria-label="Scroll cast"
                >
                  <ChevronRight size={20} />
                </button>
              )}
            </div>
          </section>

          {/* ── SECTION 4: Crew (120x120 Rounded-Square Portraits) ── */}
          <section className={styles.pageSection}>
            <h2 className={styles.sectionHeading}>Crew</h2>
            <div className={styles.carouselRelativeWrap}>
              <div className={styles.peopleCarousel} ref={crewScrollRef}>
                {crewList.map((member, idx) => (
                  <div key={`${member.name}-${idx}`} className={styles.personCard}>
                    <div className={styles.personAvatarWrap}>
                      <img
                        src={member.image || createAvatarFallback(member.name, idx + 4)}
                        alt={member.name}
                        className={styles.personAvatar}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = createAvatarFallback(member.name, idx + 4);
                        }}
                      />
                    </div>
                    <h4 className={styles.personName}>{member.name}</h4>
                    <p className={styles.personRole}>{member.role || 'Crew'}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── SECTION 5: Top reviews (Exact MovieBook Hashtag Strip + Review Cards Carousel) ── */}
          <section className={styles.pageSection}>
            <div className={styles.reviewsHeaderRow}>
              <div>
                <h2 className={styles.sectionHeading} style={{ marginBottom: '6px' }}>Top reviews</h2>
                <p className={styles.reviewsSubSummary}>
                  Summary of {687 + reviews.length} reviews.
                </p>
              </div>
              <button
                type="button"
                className={styles.reviewsCountLink}
                onClick={handleOpenRateModal}
              >
                <span>{687 + reviews.length} reviews</span>
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Hashtag Sentiment Pills */}
            <div className={styles.carouselRelativeWrap}>
              <div className={styles.hashtagStrip} ref={hashtagScrollRef}>
                {REVIEW_HASHTAGS.map((h) => {
                  const isActive = activeHashtag === h.tag;
                  return (
                    <button
                      key={h.tag}
                      type="button"
                      className={`${styles.hashtagPill} ${isActive ? styles.hashtagPillActive : ''}`}
                      onClick={() => setActiveHashtag(isActive ? null : h.tag)}
                    >
                      <span className={styles.hashtagText}>{h.tag}</span>
                      <span className={styles.hashtagCount}>{h.count}</span>
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                className={`${styles.floatingRightArrow} ${styles.floatingArrowSmall}`}
                onClick={() => scrollRow(hashtagScrollRef, 1, 300)}
                aria-label="More hashtags"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Review Cards Horizontal Carousel */}
            <div className={styles.carouselRelativeWrap}>
              <div className={styles.reviewsCarousel} ref={reviewsScrollRef}>
                {displayReviews.map((rev, idx) => {
                  const reviewerName = rev.user?.name || 'User';
                  const reviewId = rev._id || `rev-${idx}`;
                  const baseLikes = typeof rev.likes === 'number' ? rev.likes : 24 + idx * 11;
                  const likes = (helpfulVotes[reviewId] || 0) + baseLikes;
                  const isExpanded = !!expandedReviews[reviewId];
                  const dateFormatted =
                    rev.timeAgo ||
                    (rev.createdAt
                      ? new Date(rev.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '1 Day ago');

                  const headlineTags =
                    rev.hashtags ||
                    `${activeHashtag || REVIEW_HASHTAGS[idx % REVIEW_HASHTAGS.length].tag} ${
                      REVIEW_HASHTAGS[(idx + 1) % REVIEW_HASHTAGS.length].tag
                    }`;

                  const commentText = rev.comment || '';
                  const needsTruncate = commentText.length > 140 && !isExpanded;
                  const shownText = needsTruncate
                    ? `${commentText.slice(0, 140)} `
                    : commentText;

                  return (
                    <div key={reviewId} className={styles.reviewCard}>
                      <div>
                        <div className={styles.reviewCardTop}>
                          <div className={styles.reviewerMeta}>
                            <img
                              src="https://in.bmscdn.com/in/synopsis-new/noimguser.jpg"
                              alt={reviewerName}
                              className={styles.reviewerAvatarImg}
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                            <div>
                              <div className={styles.reviewerName}>{reviewerName}</div>
                              <div className={styles.verifiedTag}>
                                <span>Booked on</span>
                                <span className={styles.bmsLogoInline}>
                                  book<span className={styles.bmsMyBadge}>my</span>show
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className={styles.reviewStarScore}>
                            <Star size={17} fill="#f84464" color="#f84464" />
                            <span>{rev.rating}/10</span>
                          </div>
                        </div>

                        <div className={styles.reviewHashtagLine}>{headlineTags}</div>

                        <p className={styles.reviewBodyText}>
                          {shownText}
                          {needsTruncate && (
                            <button
                              type="button"
                              className={styles.moreLinkBtn}
                              onClick={() =>
                                setExpandedReviews((p) => ({ ...p, [reviewId]: true }))
                              }
                            >
                              ...more
                            </button>
                          )}
                        </p>
                      </div>

                      <div className={styles.reviewCardBottom}>
                        <div className={styles.helpfulBtns}>
                          <button
                            type="button"
                            className={styles.thumbBtn}
                            onClick={() =>
                              setHelpfulVotes((p) => ({
                                ...p,
                                [reviewId]: (p[reviewId] || 0) + 1,
                              }))
                            }
                          >
                            <ThumbsUp size={15} />
                            <span>{likes}</span>
                          </button>
                          <button type="button" className={styles.thumbBtn} aria-label="Dislike">
                            <ThumbsDown size={15} />
                          </button>
                        </div>

                        <div className={styles.reviewBottomRight}>
                          <span className={styles.reviewDateLabel}>{dateFormatted}</span>
                          <button
                            type="button"
                            className={styles.reviewShareBtn}
                            onClick={handleShare}
                            aria-label="Share review"
                          >
                            <Share2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                type="button"
                className={styles.floatingRightArrow}
                onClick={() => scrollRow(reviewsScrollRef, 1, 450)}
                aria-label="Next review"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </section>

          {/* ── SECTION 6: You might also like ── */}
          {recommended.length > 0 && (
            <section className={styles.pageSection} style={{ borderBottom: 'none' }}>
              <div className={styles.sectionHeaderRow}>
                <h2 className={styles.sectionHeading}>You might also like</h2>
                <Link to="/movies" className={styles.viewAllLink}>
                  <span>View All</span>
                  <ChevronRight size={15} />
                </Link>
              </div>

              <div className={styles.carouselRelativeWrap}>
                <div className={styles.recCarousel} ref={recScrollRef}>
                  {recommended.map((rec) => (
                    <Link
                      key={rec._id}
                      to={`/movie/${rec._id}`}
                      className={styles.recCard}
                    >
                      <div className={styles.recPosterWrap}>
                        <img
                          src={rec.posterImage || createPosterFallback(rec.title)}
                          alt={rec.title}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = createPosterFallback(rec.title);
                          }}
                        />
                        <div className={styles.recRatingBar}>
                          <Star size={13} fill="#f84464" color="#f84464" />
                          <span>{rec.rating}/10</span>
                          <span className={styles.recVotes}>{rec.votes || '84.2K+'} votes</span>
                        </div>
                      </div>
                      <h4 className={styles.recTitle}>{rec.title}</h4>
                    </Link>
                  ))}
                </div>
                <button
                  type="button"
                  className={styles.floatingRightArrow}
                  onClick={() => scrollRow(recScrollRef, 1, 420)}
                  aria-label="More movies"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </section>
          )}

          {/* Report Content Link */}
          <div className={styles.reportContentRow}>
            <button
              type="button"
              className={styles.reportContentLink}
              onClick={() => alert('Thank you. Your report has been submitted to our moderation team.')}
            >
              Report content &rarr;
            </button>
          </div>
        </div>

        {/* Breadcrumb Strip */}
        <div className={styles.breadcrumbFooter}>
          <Link to="/">Online tickets</Link>
          <span>&rarr;</span>
          <Link to="/movies">Movie tickets</Link>
          <span>&rarr;</span>
          <Link to="/movies">Latest Movies</Link>
          <span>&rarr;</span>
          <strong>{movie.title}</strong>
        </div>
      </div>

      {/* ═══════ 4. MOVIEBOOK "SELECT LANGUAGE AND FORMAT" MODAL ═══════ */}
      {isLangFormatModalOpen && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setIsLangFormatModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Select language and format"
        >
          <div
            className={styles.langFormatModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.lfModalHeader}>
              <div>
                <p className={styles.lfMovieSub}>{movie.title}</p>
                <h3 className={styles.lfTitle}>Select language and format</h3>
              </div>
              <button
                type="button"
                className={styles.lfCloseBtn}
                onClick={() => setIsLangFormatModalOpen(false)}
                aria-label="Close modal"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M11.657 0L6 5.657 0.343 0 0 0.343 5.657 6 0 11.657 0.343 12 6 6.343 11.657 12 12 11.657 6.343 6 12 0.343z" />
                </svg>
              </button>
            </div>

            <div className={styles.lfModalBody}>
              {languages.map((lang, langIdx) => {
                const langFormats = getFormatsForLanguage(lang, langIdx);
                return (
                  <div key={lang} className={styles.lfLangGroup}>
                    <div className={styles.lfLangBand}>{lang.toUpperCase()}</div>
                    <div className={styles.lfFormatsGrid}>
                      {langFormats.map((fmt) => (
                        <button
                          key={`${lang}-${fmt}`}
                          type="button"
                          className={styles.lfFormatPill}
                          onClick={() => handleSelectLanguageAndFormat(lang, fmt)}
                        >
                          {fmt}
                        </button>
                      ))}
                      {langFormats.length > 1 && (
                        <button
                          key={`${lang}-select-all`}
                          type="button"
                          className={styles.lfFormatPill}
                          onClick={() => handleSelectLanguageAndFormat(lang, 'All')}
                        >
                          Select all
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══════ 5. MOVIEBOOK "VIDEOS FOR {MOVIE}" YOUTUBE TRAILER VIEW / MODAL ═══════ */}
      {isTrailerModalOpen && (
        <div
          className={styles.multimediaBackdrop}
          onClick={handleCloseTrailer}
          role="dialog"
          aria-modal="true"
          aria-label={`Videos for ${movie.title}`}
        >
          <div
            className={styles.multimediaContainer}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header: "Videos for Street Fighter" */}
            <div className={styles.multimediaHeader}>
              <div className={styles.multimediaHeaderLeft}>
                <span className={styles.videosForLabel}>Videos for</span>
                <button
                  type="button"
                  className={styles.videosMovieTitleBtn}
                  onClick={handleCloseTrailer}
                >
                  {movie.title}
                </button>
              </div>
              <div className={styles.multimediaHeaderRight}>
                <button
                  type="button"
                  className={styles.multimediaCloseBtn}
                  onClick={handleCloseTrailer}
                  aria-label="Close trailers"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Language Filter Pills Bar */}
            <div className={styles.multimediaLangBar}>
              {trailerLanguages.map((lang) => {
                const isActive =
                  selectedTrailerLang === lang ||
                  (selectedTrailerLang === 'All' && lang === trailerLanguages[0]);
                return (
                  <button
                    key={lang}
                    type="button"
                    className={`${styles.multimediaLangPill} ${
                      isActive ? styles.multimediaLangPillActive : ''
                    }`}
                    onClick={() => setSelectedTrailerLang(lang)}
                  >
                    {lang}
                  </button>
                );
              })}
            </div>

            {/* Video List Section */}
            <div className={styles.multimediaVideoSection}>
              <h5 className={styles.multimediaLangHeading}>
                {(selectedTrailerLang === 'All'
                  ? trailerLanguages[0] || 'English'
                  : selectedTrailerLang
                ).toUpperCase()}
              </h5>

              {visibleTrailers.map((trailer) => {
                const isPlaying = playingVideoId === trailer.videoId;
                return (
                  <div key={trailer.videoId} className={styles.multimediaVideoCard}>
                    {isPlaying ? (
                      <div className={styles.youtubeIframeWrap}>
                        <iframe
                          width="100%"
                          height="405"
                          src={`https://www.youtube.com/embed/${trailer.videoId}?autoplay=1&enablejsapi=1&modestbranding=1&playsinline=1&fs=1&rel=0`}
                          title={trailer.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          referrerPolicy="strict-origin-when-cross-origin"
                          allowFullScreen
                          className={styles.youtubeIframe}
                        />
                      </div>
                    ) : (
                      <div
                        className={styles.youtubeThumbWrap}
                        role="button"
                        tabIndex={0}
                        aria-label={`Play ${trailer.title}`}
                        onClick={() => setPlayingVideoId(trailer.videoId)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setPlayingVideoId(trailer.videoId);
                          }
                        }}
                      >
                        <img
                          src={`https://img.youtube.com/vi/${trailer.videoId}/0.jpg`}
                          alt={trailer.title}
                          className={styles.youtubeThumbImg}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://img.youtube.com/vi/${trailer.videoId}/hqdefault.jpg`;
                          }}
                        />
                        <div className={styles.bmsPlayCircleBtn} aria-hidden="true">
                          <svg width="48" height="48" viewBox="0 0 48 48">
                            <circle cx="24" cy="24" r="24" fill="rgba(0, 0, 0, 0.6)" />
                            <path d="M19 15.5v17l14-8.5z" fill="#ffffff" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className={styles.multimediaBreadcrumb}>
              <Link to="/" onClick={handleCloseTrailer}>Home</Link>
              <span>›</span>
              <Link to="/movies" onClick={handleCloseTrailer}>Movie Trailers</Link>
              <span>›</span>
              <span>{movie.title}</span>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ 6. OFFER DETAILS MODAL ═══════ */}
      {selectedOffer && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setSelectedOffer(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className={styles.offerModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.lfModalHeader}>
              <div>
                <p className={styles.lfMovieSub}>Movie Book Exclusive Offer</p>
                <h3 className={styles.lfTitle}>{selectedOffer.title}</h3>
              </div>
              <button
                type="button"
                className={styles.lfCloseBtn}
                onClick={() => setSelectedOffer(null)}
                aria-label="Close offer details"
              >
                <X size={18} />
              </button>
            </div>
            <div className={styles.offerModalBody}>
              <p className={styles.offerModalDesc}>{selectedOffer.description}</p>
              <div className={styles.offerCodeBox}>
                <div>
                  <span className={styles.offerCodeLabel}>PROMO CODE</span>
                  <strong className={styles.offerCodeValue}>{selectedOffer.code}</strong>
                </div>
                <button
                  type="button"
                  className={styles.copyCodeBtn}
                  onClick={() => {
                    navigator.clipboard?.writeText(selectedOffer.code).catch(() => {});
                    setCopiedCode(true);
                  }}
                >
                  {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>
              <h5 className={styles.offerTermsHeading}>Terms & Conditions</h5>
              <ul className={styles.offerTermsList}>
                {selectedOffer.terms.map((t, idx) => (
                  <li key={idx}>{t}</li>
                ))}
              </ul>
              <button
                type="button"
                className={styles.submitReviewBtn}
                onClick={() => {
                  setSelectedOffer(null);
                  handleBookTicketsClick();
                }}
              >
                Book Tickets & Apply Offer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ 7. RATE & REVIEW MODAL ═══════ */}
      {isReviewModalOpen && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setIsReviewModalOpen(false)}
        >
          <div
            className={styles.reviewModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.lfModalHeader}>
              <div>
                <p className={styles.lfMovieSub}>How was the movie?</p>
                <h3 className={styles.lfTitle}>Rate {movie.title}</h3>
              </div>
              <button
                type="button"
                className={styles.lfCloseBtn}
                onClick={() => setIsReviewModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className={styles.reviewForm}>
              <div className={styles.ratingSliderWrap}>
                <div className={styles.ratingBigDisplay}>
                  <Star size={28} fill="#f84464" color="#f84464" />
                  <span>{reviewRating}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  className={styles.ratingRange}
                />
              </div>

              <div className={styles.tagSelectLabel}>What did you like best?</div>
              <div className={styles.modalHashtags}>
                {REVIEW_HASHTAGS.map((h) => {
                  const picked = selectedTags.includes(h.tag);
                  return (
                    <button
                      key={h.tag}
                      type="button"
                      className={`${styles.modalTagChip} ${picked ? styles.modalTagChipActive : ''}`}
                      onClick={() =>
                        setSelectedTags((prev) =>
                          picked ? prev.filter((t) => t !== h.tag) : [...prev, h.tag]
                        )
                      }
                    >
                      {h.tag}
                    </button>
                  );
                })}
              </div>

              <textarea
                rows={4}
                placeholder="Express your thoughts about the direction, acting, music, and story..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                required
                className={styles.reviewTextarea}
              />

              <button
                type="submit"
                disabled={submittingReview}
                className={styles.submitReviewBtn}
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetails;
