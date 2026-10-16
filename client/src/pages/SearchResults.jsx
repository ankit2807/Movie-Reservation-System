import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Star, Search, TrendingUp, Clock, X, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../api/axios';
import styles from '../styles/SearchResults.module.css';

/* ─── Filter Sidebar ─── */
const FilterPanel = ({ filters, activeFilters, onToggle, onClear }) => {
    return (
        <aside className={styles.filterSidebar}>
            <div className={styles.filterSidebarHeader}>
                <h3><Filter size={16} /> Filters</h3>
                {Object.values(activeFilters).some(arr => arr.length > 0) && (
                    <button className={styles.clearAllBtn} onClick={onClear}>Clear All</button>
                )}
            </div>
            {filters.map(section => (
                <FilterSection key={section.title} section={section} activeFilters={activeFilters} onToggle={onToggle} />
            ))}
        </aside>
    );
};

const FilterSection = ({ section, activeFilters, onToggle }) => {
    const [isOpen, setIsOpen] = useState(section.defaultOpen ?? true);
    const selected = activeFilters[section.key] || [];

    return (
        <div className={styles.filterSection}>
            <div className={styles.filterSectionHeader} onClick={() => setIsOpen(!isOpen)}>
                <span>{section.title}</span>
                {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </div>
            {isOpen && (
                <div className={styles.filterTags}>
                    {section.items.map(item => (
                        <button
                            key={item}
                            className={`${styles.filterTag} ${selected.includes(item) ? styles.filterTagActive : ''}`}
                            onClick={() => onToggle(section.key, item)}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

import { createPosterFallback } from '../utils/bookmyshowData';

/* ─── Result Card ─── */
const ResultCard = ({ movie }) => (
    <Link to={`/movie/${movie._id}`} className={styles.resultCard} id={`result-card-${movie._id}`}>
        <div className={styles.resultPoster}>
            <img
                src={movie.posterImage || createPosterFallback(movie.title, movie.genre)}
                alt={movie.title}
                loading="lazy"
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = createPosterFallback(movie.title, movie.genre);
                }}
            />
            <div className={styles.resultRating}>
                <Star size={12} fill="#f84464" stroke="#f84464" />
                <span>{movie.rating || '8.7'}/10</span>
            </div>
        </div>
        <div className={styles.resultInfo}>
            <h3 className={styles.resultTitle}>{movie.title}</h3>
            <p className={styles.resultGenre}>{movie.genre}</p>
        </div>
    </Link>
);

/* ═══════════════════════════════════════
   ─── Search Results Page ───
   ═══════════════════════════════════════ */
const SearchResults = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchInput, setSearchInput] = useState(query);
    const [recentSearches, setRecentSearches] = useState(() => {
        try { return JSON.parse(localStorage.getItem('recentSearches') || '[]'); } catch { return []; }
    });
    const [activeFilters, setActiveFilters] = useState({ genres: [], languages: [], type: '' });
    const debounceRef = useRef(null);

    const trendingSearches = ['Pushpa 2', 'Chhaava', 'Kantara', 'War 2', 'Coldplay', 'Stree 2', 'Kalki 2898 AD', 'IPL'];

    const filterConfig = [
        { title: 'Genres', key: 'genres', defaultOpen: true, items: ['Action', 'Drama', 'Comedy', 'Thriller', 'Horror', 'Sci-Fi', 'Musical', 'Concert', 'Cricket'] },
        { title: 'Languages', key: 'languages', defaultOpen: false, items: ['Hindi', 'English', 'Telugu', 'Tamil', 'Kannada', 'Malayalam'] },
    ];

    const fetchResults = useCallback(async (q) => {
        if (!q || q.trim().length === 0) {
            setResults([]);
            return;
        }
        setLoading(true);
        try {
            const res = await api.get('/movie/search', { params: { q } });
            setResults(res.data);
        } catch (err) {
            console.error('Search failed:', err);
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Save to recent searches
    const saveRecent = useCallback((q) => {
        if (!q.trim()) return;
        setRecentSearches(prev => {
            const updated = [q, ...prev.filter(s => s !== q)].slice(0, 8);
            localStorage.setItem('recentSearches', JSON.stringify(updated));
            return updated;
        });
    }, []);

    // Fetch on mount / URL change
    useEffect(() => {
        if (query) {
            fetchResults(query);
            saveRecent(query);
            setSearchInput(query);
        }
    }, [query, fetchResults, saveRecent]);

    // Debounced search on typing
    const handleInputChange = (e) => {
        const val = e.target.value;
        setSearchInput(val);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            if (val.trim()) {
                setSearchParams({ q: val });
            } else {
                setSearchParams({});
                setResults([]);
            }
        }, 400);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (searchInput.trim()) {
            setSearchParams({ q: searchInput });
        }
    };

    const handleTrendingClick = (term) => {
        setSearchInput(term);
        setSearchParams({ q: term });
    };

    const clearRecent = () => {
        setRecentSearches([]);
        localStorage.removeItem('recentSearches');
    };

    const toggleFilter = (key, item) => {
        setActiveFilters(prev => {
            const arr = prev[key] || [];
            const updated = arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item];
            return { ...prev, [key]: updated };
        });
    };

    const clearAllFilters = () => {
        setActiveFilters({ genres: [], languages: [] });
    };

    // Apply client-side filters
    const filteredResults = results.filter(movie => {
        const matchGenre = activeFilters.genres.length === 0 || activeFilters.genres.some(g => movie.genre?.toLowerCase().includes(g.toLowerCase()));
        const matchLang = activeFilters.languages.length === 0 || (movie.languages && activeFilters.languages.some(l => movie.languages.some(ml => ml.toLowerCase().includes(l.toLowerCase()))));
        return matchGenre && matchLang;
    });

    const hasQuery = query.trim().length > 0;

    return (
        <div className={styles.searchPage}>
            {/* Search Header */}
            <div className={styles.searchHeader}>
                <div className="container">
                    <form onSubmit={handleSubmit} className={styles.searchForm}>
                        <Search size={22} className={styles.searchFormIcon} />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={handleInputChange}
                            placeholder="Search for Movies, Events, Plays, Sports and Activities"
                            className={styles.searchFormInput}
                            autoFocus
                            id="search-input"
                        />
                        {searchInput && (
                            <button type="button" className={styles.clearInputBtn} onClick={() => { setSearchInput(''); setSearchParams({}); setResults([]); }}>
                                <X size={18} />
                            </button>
                        )}
                    </form>
                </div>
            </div>

            <div className="container">
                {/* No query — show trending & recent */}
                {!hasQuery && (
                    <div className={styles.suggestionsPanel}>
                        {/* Trending Searches */}
                        <div className={styles.suggestionSection}>
                            <h3 className={styles.suggestionTitle}>
                                <TrendingUp size={18} /> Trending Searches
                            </h3>
                            <div className={styles.suggestionChips}>
                                {trendingSearches.map(term => (
                                    <button key={term} className={styles.suggestionChip} onClick={() => handleTrendingClick(term)}>
                                        {term}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Recent Searches */}
                        {recentSearches.length > 0 && (
                            <div className={styles.suggestionSection}>
                                <div className={styles.suggestionTitleRow}>
                                    <h3 className={styles.suggestionTitle}>
                                        <Clock size={18} /> Recent Searches
                                    </h3>
                                    <button className={styles.clearRecentBtn} onClick={clearRecent}>Clear</button>
                                </div>
                                <div className={styles.suggestionChips}>
                                    {recentSearches.map(term => (
                                        <button key={term} className={styles.suggestionChip} onClick={() => handleTrendingClick(term)}>
                                            {term}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* With query — show results */}
                {hasQuery && (
                    <div className={styles.resultsLayout}>
                        <FilterPanel filters={filterConfig} activeFilters={activeFilters} onToggle={toggleFilter} onClear={clearAllFilters} />

                        <div className={styles.resultsMain}>
                            <div className={styles.resultsHeader}>
                                <h2>Search results for "{query}"</h2>
                                <span className={styles.resultCount}>{filteredResults.length} results found</span>
                            </div>

                            {/* Quick filter pills */}
                            <div className={styles.quickPills}>
                                {['Movies', 'Events', 'Plays', 'Sports'].map(cat => (
                                    <button key={cat} className={styles.quickPill}>{cat}</button>
                                ))}
                            </div>

                            {loading && (
                                <div className={styles.loadingState}>
                                    <div className={styles.spinner} />
                                    <p>Searching...</p>
                                </div>
                            )}

                            {!loading && filteredResults.length === 0 && (
                                <div className={styles.emptyState}>
                                    <div className={styles.emptyIcon}>🔍</div>
                                    <h3>No results found</h3>
                                    <p>Try adjusting your search or filters to find what you're looking for.</p>
                                </div>
                            )}

                            {!loading && filteredResults.length > 0 && (
                                <div className={styles.resultsGrid}>
                                    {filteredResults.map(movie => (
                                        <ResultCard key={movie._id} movie={movie} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchResults;
