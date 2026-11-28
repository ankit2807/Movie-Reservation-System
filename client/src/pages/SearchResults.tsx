import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Star,
  Search,
  TrendingUp,
  Clock,
  X,
  Filter,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import api from '../api/axios';
import { createPosterFallback } from '../utils/moviebookData';
import type { Movie } from '../types';
import styles from '../styles/SearchResults.module.css';

interface ActiveSearchFilters {
  genres: string[];
  languages: string[];
  type: string;
}

interface FilterSectionConfig {
  title: string;
  key: 'genres' | 'languages';
  defaultOpen?: boolean;
  items: string[];
}

interface FilterPanelProps {
  filters: FilterSectionConfig[];
  activeFilters: ActiveSearchFilters;
  onToggle: (key: 'genres' | 'languages', item: string) => void;
  onClear: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, activeFilters, onToggle, onClear }) => {
  const hasActive =
    activeFilters.genres.length > 0 ||
    activeFilters.languages.length > 0 ||
    Boolean(activeFilters.type);

  return (
    <aside className={styles.filterSidebar}>
      <div className={styles.filterSidebarHeader}>
        <h3>
          <Filter size={16} /> Filters
        </h3>
        {hasActive && (
          <button type="button" className={styles.clearAllBtn} onClick={onClear}>
            Clear All
          </button>
        )}
      </div>
      {filters.map((section) => (
        <FilterSection
          key={section.title}
          section={section}
          activeFilters={activeFilters}
          onToggle={onToggle}
        />
      ))}
    </aside>
  );
};

interface FilterSectionProps {
  section: FilterSectionConfig;
  activeFilters: ActiveSearchFilters;
  onToggle: (key: 'genres' | 'languages', item: string) => void;
}

const FilterSection: React.FC<FilterSectionProps> = ({ section, activeFilters, onToggle }) => {
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
          {section.items.map((item) => (
            <button
              type="button"
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

const ResultCard: React.FC<{ movie: Movie }> = ({ movie }) => (
  <Link to={`/movie/${movie._id}`} className={styles.resultCard} id={`result-card-${movie._id}`}>
    <div className={styles.resultPoster}>
      <img
        src={movie.posterImage || createPosterFallback(movie.title, movie.genre)}
        alt={movie.title}
        loading="lazy"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = createPosterFallback(movie.title, movie.genre);
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

const QUICK_CATEGORY_PILLS = [
  { label: 'All', value: '' },
  { label: 'Movies', value: 'Movie' },
  { label: 'Stream', value: 'Stream' },
  { label: 'Events', value: 'Event' },
  { label: 'Plays', value: 'Play' },
  { label: 'Sports', value: 'Sport' },
  { label: 'Activities', value: 'Activity' },
];

const SearchResults: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(query);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('recentSearches') || '[]') as string[];
    } catch {
      return [];
    }
  });
  const [activeFilters, setActiveFilters] = useState<ActiveSearchFilters>({
    genres: [],
    languages: [],
    type: '',
  });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const trendingSearches = [
    'Ramayana',
    'Avengers: Doomsday',
    'Hunger Games',
    'King',
    'Dune: Part Three',
    'Godzilla Minus Zero',
    'Coldplay',
    'Operation Mole',
  ];

  const filterConfig: FilterSectionConfig[] = [
    {
      title: 'Genres',
      key: 'genres',
      defaultOpen: true,
      items: [
        'Action',
        'Adventure',
        'Drama',
        'Comedy',
        'Thriller',
        'Sci-Fi',
        'Historical',
        'Musical',
        'Concert',
        'Cricket',
      ],
    },
    {
      title: 'Languages',
      key: 'languages',
      defaultOpen: false,
      items: ['Hindi', 'English', 'Telugu', 'Tamil', 'Kannada', 'Malayalam'],
    },
  ];

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const [prevQuery, setPrevQuery] = useState(query);
  if (prevQuery !== query) {
    setPrevQuery(query);
    setSearchInput(query);
    if (query.trim()) {
      setRecentSearches((prev) => [query, ...prev.filter((s) => s !== query)].slice(0, 8));
    }
  }

  useEffect(() => {
    if (query.trim()) {
      try {
        const prev = JSON.parse(localStorage.getItem('recentSearches') || '[]') as string[];
        const updated = [query, ...prev.filter((s) => s !== query)].slice(0, 8);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
      } catch {
        // ignore storage errors
      }
    }

    if (!query || query.trim().length === 0) {
      return;
    }

    let isMounted = true;
    const loadSearchResults = async () => {
      setLoading(true);
      try {
        const res = await api.get<Movie[]>('/movie/search', { params: { q: query } });
        if (isMounted) setResults(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Search failed:', err);
        if (isMounted) setResults([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void loadSearchResults();
    return () => {
      isMounted = false;
    };
  }, [query]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    }, 350);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput });
    }
  };

  const handleTrendingClick = (term: string) => {
    setSearchInput(term);
    setSearchParams({ q: term });
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const toggleFilter = (key: 'genres' | 'languages', item: string) => {
    setActiveFilters((prev) => {
      const arr = prev[key] || [];
      const updated = arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
      return { ...prev, [key]: updated };
    });
  };

  const clearAllFilters = () => {
    setActiveFilters({ genres: [], languages: [], type: '' });
  };

  const filteredResults = results.filter((movie) => {
    const matchType = !activeFilters.type || (movie.type || 'Movie') === activeFilters.type;
    const matchGenre =
      activeFilters.genres.length === 0 ||
      activeFilters.genres.some((g) => movie.genre?.toLowerCase().includes(g.toLowerCase()));
    const matchLang =
      activeFilters.languages.length === 0 ||
      (movie.languages &&
        activeFilters.languages.some((l) =>
          movie.languages.some((ml) => ml.toLowerCase().includes(l.toLowerCase()))
        ));
    return matchType && matchGenre && matchLang;
  });

  const hasQuery = query.trim().length > 0;

  return (
    <div className={styles.searchPage}>
      <div className={styles.searchHeader}>
        <div className="container">
          <form onSubmit={handleSubmit} className={styles.searchForm}>
            <Search size={22} className={styles.searchFormIcon} />
            <input
              type="search"
              value={searchInput}
              onChange={handleInputChange}
              placeholder="Search for Movies, Events, Plays, Sports and Activities"
              className={styles.searchFormInput}
              enterKeyHint="search"
              autoFocus
              id="search-input"
            />
            {searchInput && (
              <button
                type="button"
                className={styles.clearInputBtn}
                onClick={() => {
                  setSearchInput('');
                  setSearchParams({});
                  setResults([]);
                }}
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </form>
        </div>
      </div>

      <div className="container">
        {!hasQuery && (
          <div className={styles.suggestionsPanel}>
            <div className={styles.suggestionSection}>
              <h3 className={styles.suggestionTitle}>
                <TrendingUp size={18} /> Trending Searches
              </h3>
              <div className={styles.suggestionChips}>
                {trendingSearches.map((term) => (
                  <button
                    type="button"
                    key={term}
                    className={styles.suggestionChip}
                    onClick={() => handleTrendingClick(term)}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {recentSearches.length > 0 && (
              <div className={styles.suggestionSection}>
                <div className={styles.suggestionTitleRow}>
                  <h3 className={styles.suggestionTitle}>
                    <Clock size={18} /> Recent Searches
                  </h3>
                  <button type="button" className={styles.clearRecentBtn} onClick={clearRecent}>
                    Clear
                  </button>
                </div>
                <div className={styles.suggestionChips}>
                  {recentSearches.map((term) => (
                    <button
                      type="button"
                      key={term}
                      className={styles.suggestionChip}
                      onClick={() => handleTrendingClick(term)}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {hasQuery && (
          <div className={styles.resultsLayout}>
            <FilterPanel
              filters={filterConfig}
              activeFilters={activeFilters}
              onToggle={toggleFilter}
              onClear={clearAllFilters}
            />

            <div className={styles.resultsMain}>
              <div className={styles.resultsHeader}>
                <h2>Search results for &ldquo;{query}&rdquo;</h2>
                <span className={styles.resultCount}>{filteredResults.length} results found</span>
              </div>

              <div className={styles.quickPills}>
                {QUICK_CATEGORY_PILLS.map((pill) => (
                  <button
                    type="button"
                    key={pill.label}
                    className={`${styles.quickPill} ${
                      activeFilters.type === pill.value ? styles.filterTagActive : ''
                    }`}
                    onClick={() =>
                      setActiveFilters((prev) => ({
                        ...prev,
                        type: prev.type === pill.value ? '' : pill.value,
                      }))
                    }
                  >
                    {pill.label}
                  </button>
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
                  <p>Try adjusting your search or filters to find what you&apos;re looking for.</p>
                </div>
              )}

              {!loading && filteredResults.length > 0 && (
                <div className={styles.resultsGrid}>
                  {filteredResults.map((movie) => (
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
