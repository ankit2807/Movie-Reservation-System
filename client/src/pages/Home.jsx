import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Star, ThumbsUp, Play } from 'lucide-react';
import api from '../api/axios';
import { fetchMoviesStart, fetchMoviesSuccess, fetchMoviesFailure } from '../redux/movieSlice';
import styles from '../styles/Home.module.css';

/* ─── Filter Section (used on category pages) ─── */
const FilterSection = ({ title, items, selectedItems, onSelect, isOpenDefault = false }) => {
    const [isOpen, setIsOpen] = useState(isOpenDefault);

    return (
        <div className={styles.filterGroup}>
            <div className={styles.filterHeader} onClick={() => setIsOpen(!isOpen)}>
                <div className={styles.filterTitle}>
                    {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    <span>{title}</span>
                </div>
                {selectedItems.length > 0 && (
                    <span className={styles.clearBtn} onClick={(e) => {
                        e.stopPropagation();
                        items.forEach(item => {
                            if (selectedItems.includes(item)) onSelect(item);
                        });
                    }}>Clear</span>
                )}
            </div>
            {isOpen && (
                <div className={styles.tags}>
                    {items.map(item => (
                        <span
                            key={item}
                            className={`${styles.tag} ${selectedItems.includes(item) ? styles.activeTag : ''}`}
                            onClick={() => onSelect(item)}
                        >
                            {item}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

/* ─── Hero Carousel ─── */
const HeroCarousel = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const intervalRef = useRef(null);

    const slides = [
        {
            gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            title: 'Book Your Favourite Movies',
            subtitle: 'Get tickets for the latest blockbusters',
            accent: '#e94560',
        },
        {
            gradient: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
            title: 'Live Events & Shows',
            subtitle: 'Concerts, comedy, theatre and more',
            accent: '#f7971e',
        },
        {
            gradient: 'linear-gradient(135deg, #200122 0%, #6f0000 100%)',
            title: 'Stream Premieres',
            subtitle: 'Watch exclusive premieres from your couch',
            accent: '#f84464',
        },
    ];

    const startAutoplay = useCallback(() => {
        intervalRef.current = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % slides.length);
        }, 4000);
    }, [slides.length]);

    useEffect(() => {
        startAutoplay();
        return () => clearInterval(intervalRef.current);
    }, [startAutoplay]);

    const goToSlide = (index) => {
        clearInterval(intervalRef.current);
        setCurrentSlide(index);
        startAutoplay();
    };

    const goNext = () => goToSlide((currentSlide + 1) % slides.length);
    const goPrev = () => goToSlide((currentSlide - 1 + slides.length) % slides.length);

    return (
        <div className={styles.heroCarousel}>
            <div className={styles.carouselTrack} style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                {slides.map((slide, i) => (
                    <div key={i} className={styles.carouselSlide} style={{ background: slide.gradient }}>
                        <div className={styles.slideContent}>
                            <h1 style={{ color: slide.accent }}>{slide.title}</h1>
                            <p>{slide.subtitle}</p>
                            <button className={styles.slideBtn} style={{ background: slide.accent }}>
                                Explore Now
                            </button>
                        </div>
                        <div className={styles.slideVisual}>
                            <div className={styles.glowOrb} style={{ background: slide.accent }} />
                        </div>
                    </div>
                ))}
            </div>
            <button className={`${styles.carouselArrow} ${styles.arrowLeft}`} onClick={goPrev}>
                <ChevronLeft size={28} />
            </button>
            <button className={`${styles.carouselArrow} ${styles.arrowRight}`} onClick={goNext}>
                <ChevronRight size={28} />
            </button>
            <div className={styles.carouselDots}>
                {slides.map((_, i) => (
                    <button
                        key={i}
                        className={`${styles.dot} ${i === currentSlide ? styles.activeDot : ''}`}
                        onClick={() => goToSlide(i)}
                    />
                ))}
            </div>
        </div>
    );
};

/* ─── Horizontal Scroll Section ─── */
const ScrollSection = ({ children }) => {
    const scrollRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScroll = () => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 10);
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    };

    useEffect(() => {
        checkScroll();
        const el = scrollRef.current;
        el?.addEventListener('scroll', checkScroll);
        return () => el?.removeEventListener('scroll', checkScroll);
    }, [children]);

    const scroll = (dir) => {
        scrollRef.current?.scrollBy({ left: dir * 300, behavior: 'smooth' });
    };

    return (
        <div className={styles.scrollContainer}>
            {canScrollLeft && (
                <button className={`${styles.scrollArrow} ${styles.scrollLeft}`} onClick={() => scroll(-1)}>
                    <ChevronLeft size={24} />
                </button>
            )}
            <div className={styles.scrollTrack} ref={scrollRef}>
                {children}
            </div>
            {canScrollRight && (
                <button className={`${styles.scrollArrow} ${styles.scrollRight}`} onClick={() => scroll(1)}>
                    <ChevronRight size={24} />
                </button>
            )}
        </div>
    );
};

/* ─── Movie Card ─── */
const MovieCard = ({ movie, handleImageError }) => (
    <Link to={`/movie/${movie._id}`} className={styles.movieCard}>
        <div className={styles.posterWrapper}>
            <img
                src={movie.posterImage || 'https://placehold.co/222x333?text=No+Image'}
                alt={movie.title}
                className={styles.poster}
                onError={handleImageError}
                loading="lazy"
            />
            <div className={styles.ratingOverlay}>
                <div className={styles.ratingContent}>
                    <Star size={14} fill="#f84464" stroke="#f84464" />
                    <span className={styles.ratingValue}>{movie.rating || 'N/A'}/10</span>
                    <span className={styles.ratingVotes}>{movie.votes || '1K+'} Votes</span>
                </div>
            </div>
        </div>
        <div className={styles.movieMeta}>
            <h3 className={styles.movieTitle}>{movie.title}</h3>
            <p className={styles.movieGenre}>{movie.genre}</p>
        </div>
    </Link>
);

/* ─── Event Card ─── */
const EventCard = ({ title, subtitle, gradient, icon }) => (
    <div className={styles.eventCard} style={{ background: gradient }}>
        <div className={styles.eventIcon}>{icon}</div>
        <h4>{title}</h4>
        <p>{subtitle}</p>
    </div>
);

/* ─── Premiere Card ─── */
const PremiereCard = ({ movie, handleImageError }) => (
    <Link to={`/movie/${movie._id}`} className={styles.premiereCard}>
        <div className={styles.premierePoster}>
            <img
                src={movie.posterImage || 'https://placehold.co/222x333?text=No+Image'}
                alt={movie.title}
                className={styles.poster}
                onError={handleImageError}
                loading="lazy"
            />
            <div className={styles.premiereBadge}>PREMIERE</div>
        </div>
        <h4 className={styles.premiereTitle}>{movie.title}</h4>
        <p className={styles.premiereGenre}>{movie.genre}</p>
    </Link>
);

/* ═══════════════════════════════════════
   ─── Main Home Component ───
   ═══════════════════════════════════════ */
const Home = ({ type }) => {
    const dispatch = useDispatch();
    const { movies, loading, error, searchQuery } = useSelector((state) => state.movie);
    const { currentCity } = useSelector((state) => state.location);

    const [activeFilters, setActiveFilters] = useState({
        Languages: [],
        Genres: [],
        Categories: []
    });

    const toggleFilter = (category, item) => {
        setActiveFilters(prev => {
            const section = prev[category] || [];
            const newSection = section.includes(item)
                ? section.filter(i => i !== item)
                : [...section, item];
            return { ...prev, [category]: newSection };
        });
    };

    const filteredMovies = movies.filter(movie => {
        const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            movie.genre.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = type ? movie.type === type : true;
        const matchesGenre = activeFilters.Genres.length === 0 ||
            activeFilters.Genres.some(g => movie.genre.includes(g));
        const matchesLanguage = activeFilters.Languages.length === 0 ||
            (movie.languages && activeFilters.Languages.some(l => movie.languages.includes(l)));
        const matchesCategory = activeFilters.Categories.length === 0 ||
            activeFilters.Categories.some(c => movie.genre.includes(c));
        return matchesSearch && matchesType && matchesGenre && matchesLanguage && matchesCategory;
    });

    useEffect(() => {
        const getMovies = async () => {
            dispatch(fetchMoviesStart());
            try {
                const res = await api.get('/movie');
                dispatch(fetchMoviesSuccess(res.data));
            } catch (err) {
                dispatch(fetchMoviesFailure(err.message));
            }
        };
        getMovies();
    }, [dispatch]);

    const handleImageError = (e) => {
        e.target.src = 'https://placehold.co/222x333?text=No+Image';
    };

    /* ─── Loading & Error States ─── */
    if (loading) return (
        <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <p>Loading amazing content...</p>
        </div>
    );

    if (error) return (
        <div className={styles.errorState}>
            <p>⚠️ Something went wrong: {error}</p>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>Retry</button>
        </div>
    );

    const isLandingPage = !type;

    /* ═══════════════════════════════════════
       ─── LANDING PAGE (no type prop) ───
       ═══════════════════════════════════════ */
    if (isLandingPage) {
        const recommendedMovies = movies.filter(m => m.type === 'Movie' || !m.type).slice(0, 10);
        const premiereMovies = movies.slice(0, 5);
        const eventCategories = [
            { title: 'Live Comedy', subtitle: 'Stand-up & Improv', gradient: 'linear-gradient(135deg, #667eea, #764ba2)', icon: '🎤' },
            { title: 'Music Shows', subtitle: 'Concerts & Festivals', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)', icon: '🎵' },
            { title: 'Workshops', subtitle: 'Learn & Create', gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)', icon: '🎨' },
            { title: 'Theatre', subtitle: 'Plays & Musicals', gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)', icon: '🎭' },
            { title: 'Kids Zone', subtitle: 'Fun for Little Ones', gradient: 'linear-gradient(135deg, #fa709a, #fee140)', icon: '🧸' },
            { title: 'Sports', subtitle: 'Matches & Tournaments', gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)', icon: '⚽' },
        ];

        return (
            <div className={styles.homePage}>
                {/* ── Hero Carousel ── */}
                <HeroCarousel />

                {/* ── Recommended Movies ── */}
                <section className={styles.section}>
                    <div className="container">
                        <div className={styles.sectionHeader}>
                            <h2>Recommended Movies</h2>
                            <Link to="/movies" className={styles.seeAll}>See All ›</Link>
                        </div>
                        <ScrollSection>
                            {recommendedMovies.map(movie => (
                                <MovieCard key={movie._id} movie={movie} handleImageError={handleImageError} />
                            ))}
                        </ScrollSection>
                    </div>
                </section>

                {/* ── Stream Banner ── */}
                <section className={styles.streamBanner}>
                    <div className="container">
                        <div className={styles.streamContent}>
                            <div className={styles.streamInfo}>
                                <span className={styles.streamLabel}>MOVIEBOOK STREAM</span>
                                <h2>Endless Entertainment<br />Anytime. Anywhere.</h2>
                                <p>Watch the latest releases from the comfort of your home</p>
                                <Link to="/stream" className={styles.streamBtn}>
                                    <Play size={16} fill="white" /> Explore Stream
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Best of Live Events ── */}
                <section className={styles.section}>
                    <div className="container">
                        <div className={styles.sectionHeader}>
                            <h2>Best of Live Events</h2>
                            <Link to="/events" className={styles.seeAll}>See All ›</Link>
                        </div>
                        <div className={styles.eventsGrid}>
                            {eventCategories.map((evt, i) => (
                                <EventCard key={i} {...evt} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Premieres ── */}
                <section className={styles.premieresSection}>
                    <div className="container">
                        <div className={styles.sectionHeader}>
                            <div>
                                <span className={styles.premieresLabel}>PREMIERES</span>
                                <h2 className={styles.premieresHeading}>Brand New Releases Every Friday</h2>
                            </div>
                            <Link to="/movies" className={styles.seeAllLight}>See All ›</Link>
                        </div>
                        <ScrollSection>
                            {premiereMovies.map(movie => (
                                <PremiereCard key={movie._id} movie={movie} handleImageError={handleImageError} />
                            ))}
                        </ScrollSection>
                    </div>
                </section>

                {/* ── Trending Near You ── */}
                {movies.length > 5 && (
                    <section className={styles.section}>
                        <div className="container">
                            <div className={styles.sectionHeader}>
                                <h2>Trending in {currentCity}</h2>
                                <Link to="/movies" className={styles.seeAll}>See All ›</Link>
                            </div>
                            <ScrollSection>
                                {movies.slice(3, 13).map(movie => (
                                    <MovieCard key={movie._id} movie={movie} handleImageError={handleImageError} />
                                ))}
                            </ScrollSection>
                        </div>
                    </section>
                )}
            </div>
        );
    }

    /* ═══════════════════════════════════════
       ─── CATEGORY PAGE (with type prop) ───
       ═══════════════════════════════════════ */
    return (
        <div className="container">
            <div className={styles.categoryPage}>
                {/* Filters Sidebar */}
                <aside className={styles.filters}>
                    <h3>Filters</h3>
                    <FilterSection
                        title="Languages"
                        items={["English", "Hindi", "Tamil", "Telugu", "Kannada", "Malayalam"]}
                        selectedItems={activeFilters.Languages}
                        onSelect={(item) => toggleFilter('Languages', item)}
                        isOpenDefault={true}
                    />
                    <FilterSection
                        title="Categories"
                        items={["Theater", "Storytelling", "Improv", "Comedy"]}
                        selectedItems={activeFilters.Categories}
                        onSelect={(item) => toggleFilter('Categories', item)}
                    />
                    <FilterSection
                        title="Genres"
                        items={["Drama", "Action", "Comedy", "Thriller", "Horror"]}
                        selectedItems={activeFilters.Genres}
                        onSelect={(item) => toggleFilter('Genres', item)}
                        isOpenDefault={true}
                    />
                    <button className={styles.browseCinemasBtn}>Browse by Cinemas</button>
                </aside>

                {/* Movie Feed */}
                <div className={styles.feed}>
                    <div className={styles.sectionHeader}>
                        <h2>{type}s in {currentCity}</h2>
                    </div>

                    {/* Quick Filter Pills */}
                    <div className={styles.quickFilters}>
                        {["English", "Hindi", "English 7D", "Japanese", "Kannada", "Malayalam"].map(lang => (
                            <button key={lang} className={styles.pill}>{lang}</button>
                        ))}
                    </div>

                    {/* Coming Soon Banner */}
                    {type === 'Movie' && (
                        <div className={styles.comingSoonBanner}>
                            <div className={styles.comingSoonContent}>
                                <h3>🎬 Coming Soon</h3>
                                <p>Explore Upcoming Movies ›</p>
                            </div>
                        </div>
                    )}

                    <div className={styles.movieGrid}>
                        {filteredMovies.map((movie) => (
                            <MovieCard key={movie._id} movie={movie} handleImageError={handleImageError} />
                        ))}
                    </div>

                    {filteredMovies.length === 0 && (
                        <div className={styles.emptyState}>
                            <p>No {type?.toLowerCase()}s found matching your filters.</p>
                            <button className="btn btn-primary" onClick={() => setActiveFilters({ Languages: [], Genres: [], Categories: [] })}>
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;
