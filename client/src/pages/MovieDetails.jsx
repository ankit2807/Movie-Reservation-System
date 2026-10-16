import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Star, Share2, Play, ChevronRight, ChevronLeft, ThumbsUp, ThumbsDown,
  Tag, X, MessageSquarePlus, Check
} from 'lucide-react';
import { setAuthModalOpen } from '../redux/authSlice';
import api from '../api/axios';
import { createPosterFallback, createAvatarFallback } from '../utils/bookmyshowData';
import styles from '../styles/MovieDetails.module.css';

const REVIEW_HASHTAGS = [
  { tag: '#SuperDirection', count: 842 },
  { tag: '#Blockbuster', count: 790 },
  { tag: '#GreatActing', count: 654 },
  { tag: '#WowMusic', count: 512 },
  { tag: '#Unbelievable', count: 430 },
  { tag: '#ActionPacked', count: 389 },
];

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { currentCity } = useSelector((state) => state.location);

  const [movie, setMovie] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Interactive BookMyShow states
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [isLangFormatModalOpen, setIsLangFormatModalOpen] = useState(false);
  const [isTrailerModalOpen, setIsTrailerModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [activeHashtag, setActiveHashtag] = useState(null);
  const [helpfulVotes, setHelpfulVotes] = useState({});
  const [copiedShare, setCopiedShare] = useState(false);

  // Review form state
  const [reviewRating, setReviewRating] = useState(10);
  const [reviewComment, setReviewComment] = useState('');
  const [selectedTags, setSelectedTags] = useState(['#Blockbuster', '#SuperDirection']);
  const [submittingReview, setSubmittingReview] = useState(false);

  const castScrollRef = useRef(null);
  const crewScrollRef = useRef(null);
  const recScrollRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      setShowStickyHeader(window.scrollY > 440);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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

  const formats = useMemo(() => {
    if (!movie?.format) return ['2D', 'IMAX 2D', '4DX'];
    return movie.format.split(',').map((f) => f.trim()).filter(Boolean);
  }, [movie]);

  const languages = useMemo(() => {
    if (Array.isArray(movie?.languages) && movie.languages.length > 0) {
      return movie.languages;
    }
    return ['English', 'Hindi'];
  }, [movie]);

  const handleBookTicketsClick = () => {
    // If multiple languages or formats exist, show BookMyShow's "Select language and format" modal
    if (languages.length > 1 || formats.length > 1) {
      setIsLangFormatModalOpen(true);
    } else {
      navigate(`/movie/${movie._id}/buytickets?lang=${encodeURIComponent(languages[0])}&format=${encodeURIComponent(formats[0])}`);
    }
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

  const scrollRow = (ref, dir) => {
    if (!ref.current) return;
    ref.current.scrollBy({ left: dir * 480, behavior: 'smooth' });
  };

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

  const castList =
    Array.isArray(movie.cast) && movie.cast.length > 0
      ? movie.cast
      : [
          { name: 'Noah Centineo', role: 'as Ken Masters' },
          { name: 'Andrew Koji', role: 'as Ryu' },
          { name: 'Callina Liang', role: 'as Chun-Li' },
          { name: 'Jason Momoa', role: 'as Blanka' },
          { name: 'Vidyut Jammwal', role: 'as Dhalsim' },
        ];

  const crewList =
    Array.isArray(movie.crew) && movie.crew.length > 0
      ? movie.crew
      : [
          { name: 'Kitao Sakurai', role: 'Director' },
          { name: 'Dalan Musson', role: 'Writer' },
          { name: 'Mary Parent', role: 'Producer' },
          { name: 'A. R. Rahman', role: 'Music Director' },
        ];

  return (
    <div className={styles.movieDetailsPage}>
      {/* ═══════ 1. STICKY TOP MOVIE HEADER ON SCROLL (Exact BookMyShow Feature) ═══════ */}
      {showStickyHeader && (
        <div className={styles.stickyScrollBar}>
          <div className={`container ${styles.stickyBarInner}`}>
            <div className={styles.stickyBarLeft}>
              <h2 className={styles.stickyMovieTitle}>{movie.title}</h2>
              <div className={styles.stickyRatingMeta}>
                <Star size={15} fill="#f84464" color="#f84464" />
                <strong>{movie.rating}/10</strong>
                <span>({movie.votes || '98.4K'} Votes)</span>
              </div>
            </div>
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

      {/* ═══════ 2. DARK HERO BANNER (Exact BookMyShow Layout) ═══════ */}
      <section
        className={styles.heroBanner}
        style={{
          backgroundImage: `linear-gradient(90deg, #1A1A1A 24.97%, #1A1A1A 38.3%, rgba(26, 26, 26, 0.04) 97.47%, #1A1A1A 100%), url(${
            movie.backdropImage || movie.posterImage
          })`,
        }}
      >
        <div className={`container ${styles.heroContainer}`}>
          {/* Left: Movie Poster Card with "Trailers (2)" + "In cinemas" */}
          <div className={styles.posterCard}>
            <div className={styles.posterImgBox}>
              <img
                src={movie.posterImage || createPosterFallback(movie.title)}
                alt={movie.title}
                className={styles.posterImg}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = createPosterFallback(movie.title);
                }}
              />
              <button
                type="button"
                className={styles.trailerOverlayPill}
                onClick={() => setIsTrailerModalOpen(true)}
              >
                <Play size={13} fill="#ffffff" />
                <span>Trailers (2)</span>
              </button>
            </div>
            <div className={styles.inCinemasStrip}>In cinemas</div>
          </div>

          {/* Center: Movie Title, Rating Box, Format/Language Pills, Meta, Book Tickets CTA */}
          <div className={styles.heroInfoCol}>
            <h1 className={styles.heroTitle}>{movie.title}</h1>

            {/* Rating Box */}
            <div className={styles.ratingBox}>
              <div className={styles.ratingBoxLeft}>
                <Star size={22} fill="#f84464" color="#f84464" />
                <span className={styles.ratingValue}>{movie.rating}/10</span>
                <span className={styles.votesText}>({movie.votes || '98.4K'} Votes)</span>
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

            {/* Format & Language Pills (Clickable like BookMyShow) */}
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
                    {idx < formats.length - 1 && <span>, </span>}
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
                    {idx < languages.length - 1 && <span>, </span>}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Dot-Separated Metadata Line */}
            <div className={styles.metaBulletLine}>
              <span>{movie.duration || '2h 18m'}</span>
              <span className={styles.dot}>•</span>
              <span>{movie.genre}</span>
              <span className={styles.dot}>•</span>
              <span>{movie.certification || 'UA16+'}</span>
              <span className={styles.dot}>•</span>
              <span>{releaseDateFormatted}</span>
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

      {/* ═══════ 3. MAIN CONTENT SECTIONS (Exact BookMyShow Left-Aligned Column) ═══════ */}
      <div className="container">
        <div className={styles.mainContentColumn}>
          {/* ── SECTION 1: About the movie ── */}
          <section className={styles.pageSection}>
            <h2 className={styles.sectionHeading}>About the movie</h2>
            <p className={styles.aboutDescription}>{movie.description}</p>
          </section>

          {/* ── SECTION 2: Top offers for you ── */}
          <section className={styles.pageSection}>
            <h2 className={styles.sectionHeading}>Top offers for you</h2>
            <div className={styles.offersGrid}>
              <div className={styles.offerCard}>
                <div className={styles.offerIconBox}>
                  <Tag size={18} color="#f84464" />
                </div>
                <div className={styles.offerText}>
                  <h4>YES Private Debit Card Offer</h4>
                  <p>Tap to view details • Use code FIRSTSHOW at checkout</p>
                </div>
              </div>

              <div className={styles.offerCard}>
                <div className={styles.offerIconBox}>
                  <Tag size={18} color="#f84464" />
                </div>
                <div className={styles.offerText}>
                  <h4>Buy 1 Get 1 Free Movie Ticket*</h4>
                  <p>Tap to view details • Valid on RuPay & Paytm Cards</p>
                </div>
              </div>
            </div>
          </section>

          {/* ── SECTION 3: Cast (Circular Portraits with Character Names) ── */}
          <section className={styles.pageSection}>
            <div className={styles.sectionHeaderRow}>
              <h2 className={styles.sectionHeading}>Cast</h2>
              {castList.length > 5 && (
                <div className={styles.carouselNavBtns}>
                  <button type="button" onClick={() => scrollRow(castScrollRef, -1)} aria-label="Scroll left">
                    <ChevronLeft size={18} />
                  </button>
                  <button type="button" onClick={() => scrollRow(castScrollRef, 1)} aria-label="Scroll right">
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>

            <div className={styles.peopleCarousel} ref={castScrollRef}>
              {castList.map((actor, idx) => {
                const roleLabel = actor.role?.startsWith('as ')
                  ? actor.role
                  : actor.role && actor.role !== 'Actor'
                  ? `as ${actor.role}`
                  : 'Actor';

                return (
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
                    <p className={styles.personRole}>{roleLabel}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── SECTION 4: Crew (Circular Portraits with Crew Roles) ── */}
          <section className={styles.pageSection}>
            <div className={styles.sectionHeaderRow}>
              <h2 className={styles.sectionHeading}>Crew</h2>
              {crewList.length > 5 && (
                <div className={styles.carouselNavBtns}>
                  <button type="button" onClick={() => scrollRow(crewScrollRef, -1)} aria-label="Scroll left">
                    <ChevronLeft size={18} />
                  </button>
                  <button type="button" onClick={() => scrollRow(crewScrollRef, 1)} aria-label="Scroll right">
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>

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
          </section>

          {/* ── SECTION 5: Top reviews (Hashtag Summary Pills + Review Cards) ── */}
          <section className={styles.pageSection}>
            <div className={styles.reviewsHeaderRow}>
              <div>
                <h2 className={styles.sectionHeading} style={{ marginBottom: '4px' }}>Top reviews</h2>
                <p className={styles.reviewsSubSummary}>
                  Summary of {(reviews.length || 4) * 355} reviews.
                </p>
              </div>
              <div className={styles.reviewsRightActions}>
                <button
                  type="button"
                  className={styles.writeReviewBtn}
                  onClick={handleOpenRateModal}
                >
                  <MessageSquarePlus size={15} />
                  <span>Write your review</span>
                </button>
              </div>
            </div>

            {/* Hashtag Sentiment Pills */}
            <div className={styles.hashtagStrip}>
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

            {/* Review Cards Grid */}
            <div className={styles.reviewsCarousel}>
              {reviews.map((rev, idx) => {
                const reviewerName = rev.user?.name || 'Verified Viewer';
                const reviewId = rev._id || `rev-${idx}`;
                const likes = (helpfulVotes[reviewId] || 0) + 24 + idx * 11;
                const dateFormatted = rev.createdAt
                  ? new Date(rev.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : '2 Days ago';

                return (
                  <div key={reviewId} className={styles.reviewCard}>
                    <div className={styles.reviewCardTop}>
                      <div className={styles.reviewerMeta}>
                        <div className={styles.reviewerAvatar}>
                          {reviewerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className={styles.reviewerName}>{reviewerName}</div>
                          <div className={styles.verifiedTag}>
                            Booked on <span className={styles.bmsInline}>book<strong>my</strong>show</span>
                          </div>
                        </div>
                      </div>

                      <div className={styles.reviewStarScore}>
                        <Star size={15} fill="#f84464" color="#f84464" />
                        <span>{rev.rating}/10</span>
                      </div>
                    </div>

                    <div className={styles.reviewHashtagLine}>
                      {activeHashtag || REVIEW_HASHTAGS[idx % REVIEW_HASHTAGS.length].tag}{' '}
                      {REVIEW_HASHTAGS[(idx + 1) % REVIEW_HASHTAGS.length].tag}
                    </div>

                    <p className={styles.reviewBodyText}>{rev.comment}</p>

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
                          <ThumbsUp size={14} />
                          <span>{likes}</span>
                        </button>
                        <button type="button" className={styles.thumbBtn} aria-label="Dislike">
                          <ThumbsDown size={14} />
                        </button>
                      </div>

                      <span className={styles.reviewDateLabel}>{dateFormatted}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── SECTION 6: You might also like ── */}
          {recommended.length > 0 && (
            <section className={styles.pageSection} style={{ borderBottom: 'none' }}>
              <div className={styles.sectionHeaderRow}>
                <h2 className={styles.sectionHeading}>You might also like</h2>
                <div className={styles.recHeaderRight}>
                  <Link to="/movies" className={styles.viewAllLink}>
                    View All <ChevronRight size={15} />
                  </Link>
                  <div className={styles.carouselNavBtns}>
                    <button type="button" onClick={() => scrollRow(recScrollRef, -1)} aria-label="Scroll left">
                      <ChevronLeft size={18} />
                    </button>
                    <button type="button" onClick={() => scrollRow(recScrollRef, 1)} aria-label="Scroll right">
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>

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
                        <span className={styles.recVotes}>{rec.votes || '84.2K'} Votes</span>
                      </div>
                    </div>
                    <h4 className={styles.recTitle}>{rec.title}</h4>
                    <p className={styles.recGenre}>{rec.genre}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Breadcrumb Strip */}
        <div className={styles.breadcrumbFooter}>
          <Link to="/">Home</Link>
          <span>→</span>
          <Link to="/movies">Movies</Link>
          <span>→</span>
          <span>{currentCity || 'Noida'}</span>
          <span>→</span>
          <strong>{movie.title}</strong>
        </div>
      </div>

      {/* ═══════ 4. BOOKMYSHOW "SELECT LANGUAGE AND FORMAT" MODAL ═══════ */}
      {isLangFormatModalOpen && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setIsLangFormatModalOpen(false)}
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
                <X size={20} />
              </button>
            </div>

            <div className={styles.lfModalBody}>
              {languages.map((lang) => (
                <div key={lang} className={styles.lfLangGroup}>
                  <div className={styles.lfLangBand}>{lang.toUpperCase()}</div>
                  <div className={styles.lfFormatsGrid}>
                    {formats.map((fmt) => (
                      <button
                        key={`${lang}-${fmt}`}
                        type="button"
                        className={styles.lfFormatPill}
                        onClick={() => handleSelectLanguageAndFormat(lang, fmt)}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════ 5. TRAILER VIDEO MODAL ═══════ */}
      {isTrailerModalOpen && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setIsTrailerModalOpen(false)}
        >
          <div
            className={styles.trailerModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.trailerModalHeader}>
              <h3>{movie.title} — Official Trailer</h3>
              <button type="button" onClick={() => setIsTrailerModalOpen(false)}>
                <X size={22} color="#fff" />
              </button>
            </div>
            <div className={styles.trailerVideoBox}>
              <img
                src={movie.backdropImage || movie.posterImage || createPosterFallback(movie.title)}
                alt={movie.title}
                className={styles.trailerPreviewBg}
              />
              <div className={styles.trailerOverlayContent}>
                <div className={styles.trailerPulseCircle}>
                  <Play size={34} fill="#ffffff" color="#ffffff" />
                </div>
                <h4>{movie.title} ({movie.certification || 'UA16+'})</h4>
                <p>{movie.tagline || 'Now playing in IMAX, 4DX & Dolby Atmos cinemas near you'}</p>
                <button
                  type="button"
                  className={styles.bookFromTrailerBtn}
                  onClick={() => {
                    setIsTrailerModalOpen(false);
                    handleBookTicketsClick();
                  }}
                >
                  Book Tickets Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ 6. RATE & REVIEW MODAL ═══════ */}
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
