import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import api from '../api/axios';
import { fetchMoviesStart, fetchMoviesSuccess, fetchMoviesFailure } from '../redux/movieSlice';
import styles from '../styles/Home.module.css';

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
                        // Clear this specific filter section
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

const Home = ({ type }) => {
    const dispatch = useDispatch();
    const { movies, loading, error, searchQuery } = useSelector((state) => state.movie);
    const { currentCity } = useSelector((state) => state.location);

    // State for active filters
    const [activeFilters, setActiveFilters] = useState({
        Languages: [],
        Genres: [],
        Categories: []
    });

    const toggleFilter = (category, item) => {
        setActiveFilters(prev => {
            const section = prev[category] || [];
            const newSection = section.includes(item)
                ? section.filter(i => i !== item) // Remove if exists
                : [...section, item]; // Add if doesn't
            return { ...prev, [category]: newSection };
        });
    };

    const filteredMovies = movies.filter(movie => {
        // 1. Search Query
        const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            movie.genre.toLowerCase().includes(searchQuery.toLowerCase());

        // 2. Type Filter (Prop)
        const matchesType = type ? movie.type === type : true;

        // 3. Sidebar Filters
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

    if (loading) return <div className="container" style={{ paddingTop: '40px' }}>Loading...</div>;
    if (error) return <div className="container" style={{ paddingTop: '40px' }}>Error: {error}</div>;

    return (
        <div className="container">
            {/* Hero / Banner Carousel Placeholder - Only show on Landing Page (no type) */}
            {!type && (
                <div className={styles.heroBanner}>
                    <img src="https://placehold.co/1200x300/333/fff?text=Movie+Reservation+System" alt="Banner" onError={(e) => e.target.style.display = 'none'} />
                </div>
            )}

            <div className={styles.mainContent}>
                {/* Filters Sidebar */}
                <div className={styles.filters}>
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
                </div>

                {/* Movie Feed */}
                <div className={styles.feed}>
                    <div className={styles.sectionHeader}>
                        <h2>{type ? `${type}s in ${currentCity}` : 'Recommended Movies'}</h2>
                        {!type && <Link to="/movies" className={styles.seeAll}>See All ›</Link>}
                    </div>

                    {/* Quick Filters (Pills) - Only show on specific listing pages */}
                    {type && (
                        <div className={styles.quickFilters}>
                            {["English", "Hindi", "English 7D", "Japanese", "Kannada", "Malayalam"].map(lang => (
                                <button key={lang} className={styles.pill}>{lang}</button>
                            ))}
                        </div>
                    )}

                    {/* Coming Soon Banner - Placeholder */}
                    {type === 'Movie' && (
                        <div className={styles.comingSoonBanner}>
                            <div className={styles.comingSoonContent}>
                                <h3>Coming Soon</h3>
                                <p>Explore Upcoming Movies ›</p>
                            </div>
                        </div>
                    )}

                    <div className={styles.movieGrid}>
                        {filteredMovies.map((movie) => (
                            <Link to={`/movie/${movie._id}`} key={movie._id} className={styles.movieCard}>
                                <div className={styles.posterWrapper}>
                                    <img
                                        src={movie.posterImage || 'https://placehold.co/222x333'}
                                        alt={movie.title}
                                        className={styles.poster}
                                        onError={handleImageError}
                                    />
                                    <div className={styles.ratingBadge}>
                                        ★ {movie.rating || 'N/A'}
                                    </div>
                                </div>
                                <div className={styles.movieInfo}>
                                    <h3>{movie.title}</h3>
                                    <p>{movie.genre}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
