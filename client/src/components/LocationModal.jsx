import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { setCity, CITY_DATA } from '../redux/locationSlice';
import styles from '../styles/LocationModal.module.css';

// Exact MovieBook sub-regions shown on hover for metropolitan hubs
const SUB_REGIONS = {
    'Mumbai': [
        { label: 'Mumbai', value: 'Mumbai' },
        { label: 'Navi Mumbai', value: 'Navi Mumbai' },
        { label: 'Thane', value: 'Thane' },
        { label: 'Kalyan', value: 'Kalyan' },
    ],
    'Delhi-NCR': [
        { label: 'Delhi', value: 'Delhi' },
        { label: 'Gurugram (Gurgaon)', value: 'Gurugram' },
        { label: 'Noida', value: 'Noida' },
        { label: 'Ghaziabad', value: 'Ghaziabad' },
        { label: 'Kundli', value: 'Kundli' },
        { label: 'Greater Noida', value: 'Greater Noida' },
        { label: 'Faridabad', value: 'Faridabad' },
        { label: 'Pilkhuwa', value: 'Pilkhuwa' },
    ],
};

// Map popular city names to official MovieBook region icon slugs
function getIconName(name) {
    const map = {
        'Mumbai': 'mumbai',
        'Delhi-NCR': 'ncr',
        'Bengaluru': 'bang',
        'Hyderabad': 'hyd',
        'Chandigarh': 'chd',
        'Ahmedabad': 'ahd',
        'Pune': 'pune',
        'Chennai': 'chen',
        'Kolkata': 'kolk',
        'Kochi': 'koch',
    };
    return map[name] || 'mumbai';
}

// Fallback SVG if bmscdn image is unreachable
const CityLandmarkSvg = ({ active }) => {
    const stroke = '#3b4248';
    const accent = active ? '#40f4eb' : 'none';
    return (
        <svg viewBox="0 0 80 80" className={styles.landmarkSvg}>
            <rect x="16" y="60" width="48" height="4" fill={accent} stroke={stroke} strokeWidth="2" />
            <rect x="22" y="28" width="36" height="32" fill={accent} stroke={stroke} strokeWidth="2" />
            <path d="M32 60 V42 A8 8 0 0 1 48 42 V60" fill="#ffffff" stroke={stroke} strokeWidth="2" />
            <path d="M28 28 Q40 16 52 28" fill={accent} stroke={stroke} strokeWidth="2" />
        </svg>
    );
};

const LocationModal = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { currentCity, hasSelectedCity } = useSelector((state) => state.location);

    const [searchTerm, setSearchTerm] = useState('');
    const [isDetecting, setIsDetecting] = useState(false);
    const [showAllCities, setShowAllCities] = useState(false);
    const [hoveredCity, setHoveredCity] = useState(null);
    const [failedImages, setFailedImages] = useState({});
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const hoverTimeoutRef = useRef(null);

    const [internalIsOpen, setInternalIsOpen] = useState(false);

    const handleMouseEnterCity = (cityName) => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        setHoveredCity(cityName);
    };

    const handleMouseLeaveCity = () => {
        hoverTimeoutRef.current = setTimeout(() => {
            setHoveredCity(null);
        }, 200);
    };

    const handleMouseEnterSubBar = () => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };

    // Auto open on first visit if no city selected
    useEffect(() => {
        if (!hasSelectedCity && !isOpen && !internalIsOpen) {
            const t = setTimeout(() => setInternalIsOpen(true), 400);
            return () => clearTimeout(t);
        }
    }, [hasSelectedCity, isOpen, internalIsOpen]);

    const modalOpen = isOpen || (!hasSelectedCity && internalIsOpen);

    const inputRef = useRef(null);
    const modalRef = useRef(null);

    // Reset state and focus input when modal opens
    useEffect(() => {
        if (modalOpen) {
            setSearchTerm('');
            setShowAllCities(false);
            setHighlightedIndex(0);
            setHoveredCity(null);
            setTimeout(() => inputRef.current?.focus(), 60);
        }
    }, [modalOpen]);

    // Close on Escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && hasSelectedCity) {
                if (isOpen) onClose();
                else setInternalIsOpen(false);
            }
        };
        if (modalOpen) document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [modalOpen, isOpen, hasSelectedCity, onClose]);

    // Close on backdrop click
    const handleOverlayClick = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target) && hasSelectedCity) {
            if (isOpen) onClose();
            else setInternalIsOpen(false);
        }
    };

    if (!modalOpen) return null;

    const closeModal = () => {
        if (isOpen) onClose();
        else setInternalIsOpen(false);
    };

    const handleCitySelect = (cityName) => {
        dispatch(setCity(cityName));
        closeModal();
        if (location.pathname.startsWith('/explore/home/')) {
            const slug = cityName.toLowerCase().replace(/\s+/g, '-');
            navigate(`/explore/home/${slug}`, { replace: true });
        }
    };

    const handleDetectLocation = () => {
        setIsDetecting(true);
        const finishDetection = (detectedCity = 'Noida') => {
            setTimeout(() => {
                setIsDetecting(false);
                handleCitySelect(detectedCity);
            }, 600);
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    let detected = 'Noida';
                    if (latitude >= 18.8 && latitude <= 19.3 && longitude >= 72.7 && longitude <= 73.1) {
                        detected = 'Mumbai';
                    } else if (latitude >= 12.8 && latitude <= 13.2 && longitude >= 77.4 && longitude <= 77.8) {
                        detected = 'Bengaluru';
                    } else if (latitude >= 17.2 && latitude <= 17.6 && longitude >= 78.3 && longitude >= 78.7) {
                        detected = 'Hyderabad';
                    } else if (latitude >= 28.3 && latitude <= 28.9 && longitude >= 76.9 && longitude <= 77.6) {
                        detected = 'Noida';
                    }
                    finishDetection(detected);
                },
                () => finishDetection('Noida'),
                { timeout: 4000, enableHighAccuracy: false }
            );
        } else {
            finishDetection('Noida');
        }
    };

    const popularCities = CITY_DATA.slice(0, 10);
    const otherCities = [...CITY_DATA.slice(10)].sort((a, b) => a.name.localeCompare(b.name));

    const query = searchTerm.trim().toLowerCase();
    const filteredCities = query
        ? CITY_DATA.filter(
              (city) =>
                  city.name.toLowerCase().includes(query) ||
                  city.state.toLowerCase().includes(query) ||
                  city.aliases.some((alias) => alias.toLowerCase().includes(query))
          )
        : [];

    const showSearch = query.length > 0;

    const handleKeyDown = (e) => {
        if (!showSearch || filteredCities.length === 0) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex((prev) => (prev + 1) % filteredCities.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex((prev) => (prev - 1 + filteredCities.length) % filteredCities.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const chosen = filteredCities[highlightedIndex] || filteredCities[0];
            if (chosen) handleCitySelect(chosen.name);
        }
    };

    // Sub-regions shown when hovering over a metro hub (e.g., Delhi-NCR or Mumbai)
    const activeSubRegions = hoveredCity && SUB_REGIONS[hoveredCity] ? SUB_REGIONS[hoveredCity] : null;

    return (
        <div
            className={styles.overlay}
            onClick={handleOverlayClick}
            role="dialog"
            aria-modal="true"
            aria-label="Select your city"
        >
            <div className={styles.modal} ref={modalRef}>
                {/* 1. Top Search Input Box */}
                <div className={styles.topHeader}>
                    <div className={styles.searchInputWrapper}>
                        <Search className={styles.searchIcon} size={15} strokeWidth={2} />
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Search for your city"
                            className={styles.searchInput}
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setHighlightedIndex(0);
                            }}
                            onKeyDown={handleKeyDown}
                            aria-label="Search for your city"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                className={styles.clearSearchBtn}
                                onClick={() => {
                                    setSearchTerm('');
                                    inputRef.current?.focus();
                                }}
                                aria-label="Clear search"
                            >
                                <X size={15} strokeWidth={1.8} />
                            </button>
                        )}
                    </div>

                    {/* Search Autocomplete Dropdown */}
                    {showSearch && (
                        <div className={styles.searchDropdown}>
                            {filteredCities.length > 0 ? (
                                filteredCities.map((city, idx) => (
                                    <button
                                        key={city.name}
                                        type="button"
                                        className={`${styles.searchResultItem} ${
                                            idx === highlightedIndex ? styles.searchResultItemActive : ''
                                        }`}
                                        onMouseEnter={() => setHighlightedIndex(idx)}
                                        onClick={() => handleCitySelect(city.name)}
                                    >
                                        <span className={styles.searchResultCity}>{city.name}</span>
                                        <span className={styles.searchResultState}>{city.state}</span>
                                    </button>
                                ))
                            ) : (
                                <div className={styles.noResults}>
                                    No cities found matching &ldquo;{searchTerm}&rdquo;
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* 2. Detect My Location Row */}
                <div className={styles.detectRow}>
                    <button
                        type="button"
                        className={styles.detectLocationBtn}
                        onClick={handleDetectLocation}
                        disabled={isDetecting}
                    >
                        {isDetecting ? (
                            <span className={styles.spinner} />
                        ) : (
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className={styles.detectTargetSvg}
                            >
                                <circle cx="12" cy="12" r="7" />
                                <circle cx="12" cy="12" r="2" fill="currentColor" />
                                <line x1="12" y1="2" x2="12" y2="5" />
                                <line x1="12" y1="19" x2="12" y2="22" />
                                <line x1="2" y1="12" x2="5" y2="12" />
                                <line x1="19" y1="12" x2="22" y2="12" />
                            </svg>
                        )}
                        <span>{isDetecting ? 'Detecting your location...' : 'Detect my location'}</span>
                    </button>
                </div>

                {/* 3. Popular Cities & Other Cities Body */}
                <div className={styles.body}>
                    <div className={styles.sectionTitle}>Popular Cities</div>

                    <div className={styles.popularGrid}>
                        {popularCities.map((city) => {
                            const isDirectMatch =
                                currentCity?.toLowerCase() === city.name.toLowerCase();
                            const isSubRegionMatch =
                                SUB_REGIONS[city.name]?.some(
                                    (r) =>
                                        r.value.toLowerCase() === currentCity?.toLowerCase() ||
                                        r.label.toLowerCase() === currentCity?.toLowerCase()
                                ) || false;
                            const isActive = isDirectMatch || isSubRegionMatch;
                            const isHovered = hoveredCity === city.name;
                            const showSelectedIcon = isActive || isHovered;
                            const iconKey = `${city.name}-${showSelectedIcon ? 'sel' : 'def'}`;

                            return (
                                <div
                                    key={city.name}
                                    className={styles.cityCardWrapper}
                                    onMouseEnter={() => handleMouseEnterCity(city.name)}
                                    onMouseLeave={handleMouseLeaveCity}
                                >
                                    <button
                                        type="button"
                                        className={styles.cityCard}
                                        onClick={() => handleCitySelect(city.name)}
                                    >
                                        <div className={styles.cityIconWrapper}>
                                            {!failedImages[iconKey] ? (
                                                <img
                                                    src={`https://in.bmscdn.com/m6/images/common-modules/regions/${getIconName(
                                                        city.name
                                                    )}${showSelectedIcon ? '-selected' : ''}.png`}
                                                    alt={city.name}
                                                    className={styles.cityIcon}
                                                    onError={() =>
                                                        setFailedImages((prev) => ({
                                                            ...prev,
                                                            [iconKey]: true,
                                                        }))
                                                    }
                                                />
                                            ) : (
                                                <CityLandmarkSvg active={showSelectedIcon} />
                                            )}
                                        </div>
                                        <span
                                            className={`${styles.cityName} ${
                                                isHovered ? styles.cityNameHovered : ''
                                            }`}
                                        >
                                            {city.name}
                                        </span>
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* Fixed-height bottom slot below Popular Cities (matches MovieBook 1:1 without layout shift) */}
                    {activeSubRegions ? (
                        <div
                            className={styles.bottomActionSlot}
                            onMouseEnter={handleMouseEnterSubBar}
                            onMouseLeave={handleMouseLeaveCity}
                        >
                            <div className={styles.sublocationBar}>
                                {activeSubRegions.map((region) => (
                                    <button
                                        key={region.label}
                                        type="button"
                                        className={styles.sublocationItem}
                                        onClick={() => handleCitySelect(region.value)}
                                    >
                                        {region.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : !showAllCities ? (
                        <div className={styles.bottomActionSlot}>
                            <button
                                type="button"
                                className={styles.viewAllBtn}
                                onClick={() => setShowAllCities(true)}
                            >
                                View All Cities
                            </button>
                        </div>
                    ) : null}

                    {/* Expanded Other Cities Alphabetical 5-Column Directory */}
                    {showAllCities && (
                        <div className={styles.otherCitiesSection}>
                            <div className={styles.sectionTitleOther}>Other Cities</div>
                            <div className={styles.otherCitiesGrid}>
                                {otherCities.map((city) => {
                                    const isSelected =
                                        currentCity?.toLowerCase() === city.name.toLowerCase();
                                    return (
                                        <button
                                            key={city.name}
                                            type="button"
                                            className={`${styles.otherCityItem} ${
                                                isSelected ? styles.otherCityItemActive : ''
                                            }`}
                                            onClick={() => handleCitySelect(city.name)}
                                        >
                                            {city.name}
                                        </button>
                                    );
                                })}
                            </div>
                            <div className={styles.hideAllRow}>
                                <button
                                    type="button"
                                    className={styles.viewAllBtn}
                                    onClick={() => setShowAllCities(false)}
                                >
                                    Hide all cities
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LocationModal;
