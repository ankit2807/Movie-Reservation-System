import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Target } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setCity, CITY_DATA } from '../redux/locationSlice';
import styles from '../styles/LocationModal.module.css';

// Sub-regions for major cities
const SUB_REGIONS = {
    'Mumbai': ['Mumbai', 'Navi Mumbai', 'Thane', 'Mumbai South', 'Mumbai Central', 'Mumbai West'],
    'Delhi-NCR': ['Delhi', 'Gurugram', 'Noida', 'Faridabad', 'Ghaziabad', 'Greater Noida'],
    'Bengaluru': ['Bengaluru', 'Bengaluru Central', 'Bengaluru East', 'Bengaluru South', 'Whitefield'],
    'Hyderabad': ['Hyderabad', 'Secunderabad', 'Cyberabad', 'Gachibowli'],
    'Pune': ['Pune', 'Pimpri-Chinchwad', 'Hinjewadi', 'Kothrud'],
    'Chennai': ['Chennai', 'Chennai South', 'Anna Nagar', 'T. Nagar'],
    'Kolkata': ['Kolkata', 'Salt Lake', 'Howrah', 'New Town'],
};

const LocationModal = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const { hasSelectedCity } = useSelector((state) => state.location);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDetecting, setIsDetecting] = useState(false);
    const [showAllCities, setShowAllCities] = useState(false);
    const [hoveredCity, setHoveredCity] = useState(null);
    const hoverTimeoutRef = useRef(null);
    
    const [internalIsOpen, setInternalIsOpen] = useState(false);

    const handleMouseEnterCity = (cityName) => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        setHoveredCity(cityName);
    };

    const handleMouseLeaveCity = () => {
        hoverTimeoutRef.current = setTimeout(() => {
            setHoveredCity(null);
        }, 300); // Increased delay to 300ms for smoother user experience
    };

    const handleMouseEnterSubBar = () => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };

    // Auto open on first visit
    useEffect(() => {
        if (!hasSelectedCity && !isOpen && !internalIsOpen) {
            setTimeout(() => setInternalIsOpen(true), 500);
        }
    }, [hasSelectedCity, isOpen, internalIsOpen]);

    const modalOpen = isOpen || (!hasSelectedCity && internalIsOpen);
    
    const inputRef = useRef(null);
    const modalRef = useRef(null);

    // Focus input on open
    useEffect(() => {
        if (modalOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
        if (modalOpen) {
            setSearchTerm('');
            setShowAllCities(false);
            setHoveredCity(null);
        }
    }, [modalOpen]);

    // Close on escape key
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

    // Close on click outside
    const handleOverlayClick = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target) && hasSelectedCity) {
            if (isOpen) onClose();
            else setInternalIsOpen(false);
        }
    };

    if (!modalOpen) return null;

    const handleCitySelect = (cityName) => {
        dispatch(setCity(cityName));
        if (isOpen) onClose();
        else setInternalIsOpen(false);
    };

    const handleDetectLocation = () => {
        setIsDetecting(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setTimeout(() => {
                        setIsDetecting(false);
                        handleCitySelect("Bengaluru"); 
                    }, 1200);
                },
                (error) => {
                    console.error("Error detecting:", error);
                    setIsDetecting(false);
                    alert("Location access denied or unavailable.");
                },
                { timeout: 10000, enableHighAccuracy: true }
            );
        } else {
            setIsDetecting(false);
            alert("Geolocation not supported");
        }
    };

    const popularCities = CITY_DATA.slice(0, 10);
    
    // Sorted other cities
    const otherCities = [...CITY_DATA.slice(10)].sort((a, b) => a.name.localeCompare(b.name));

    // Filter cities based on search
    const filteredCities = searchTerm
        ? CITY_DATA.filter(city => 
            city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            city.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
            city.aliases.some(alias => alias.toLowerCase().includes(searchTerm.toLowerCase()))
          )
        : [];

    const showSearch = searchTerm.length > 0;

    // Get sub-regions for hovered city
    const activeSubRegions = hoveredCity ? SUB_REGIONS[hoveredCity] : null;

    return (
        <div className={styles.overlay} onClick={handleOverlayClick}>
            <div className={styles.modal} ref={modalRef}>
                
                {/* Search Bar */}
                <div className={styles.searchBox}>
                    <Search className={styles.searchIcon} size={20} strokeWidth={1.5} />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search for your city"
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {(searchTerm || hasSelectedCity) && (
                        <button className={styles.closeBtn} onClick={() => {
                            if (searchTerm) setSearchTerm('');
                            else if (hasSelectedCity) {
                                if (isOpen) onClose();
                                else setInternalIsOpen(false);
                            }
                        }}>
                            <X size={18} strokeWidth={1.5} />
                        </button>
                    )}
                </div>

                {/* Detect Location */}
                {!showSearch && (
                    <button className={styles.detectLocation} onClick={handleDetectLocation} disabled={isDetecting}>
                        {isDetecting ? (
                            <span className={styles.spinner} />
                        ) : (
                            <Target className={styles.detectIcon} size={16} strokeWidth={1.5} />
                        )}
                        <span>{isDetecting ? "Detecting location..." : "Detect my location"}</span>
                    </button>
                )}

                <div className={styles.body}>
                    {/* Popular Cities */}
                    {!showSearch && (
                        <>
                            <div className={styles.sectionTitle}>Popular Cities</div>

                            {/* Sub-location Bar Container — fixed height to prevent layout shift */}
                            <div 
                                className={styles.sublocationBarContainer}
                                onMouseEnter={handleMouseEnterSubBar}
                                onMouseLeave={handleMouseLeaveCity}
                            >
                                {activeSubRegions && (
                                    <div className={styles.sublocationBar}>
                                        {activeSubRegions.map(region => (
                                            <button 
                                                key={region} 
                                                className={styles.sublocationChip}
                                                onClick={() => handleCitySelect(region)}
                                            >
                                                {region}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className={styles.popularGrid}>
                                {popularCities.map(city => (
                                    <div 
                                        key={city.name} 
                                        className={styles.cityCardWrapper}
                                        onMouseEnter={() => handleMouseEnterCity(city.name)}
                                        onMouseLeave={handleMouseLeaveCity}
                                    >
                                        <button className={styles.cityCard} onClick={() => handleCitySelect(city.name)}>
                                            <div className={styles.cityIconWrapper}>
                                                <img 
                                                    src={`https://in.bmscdn.com/m6/images/common-modules/regions/${getIconName(city.name)}${hoveredCity === city.name ? '-selected' : ''}.png`} 
                                                    alt={city.name} 
                                                    className={styles.cityIcon} 
                                                />
                                            </div>
                                            <span className={styles.cityName}>{city.name}</span>
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {!showAllCities ? (
                                <button className={styles.viewAllBtn} onClick={() => setShowAllCities(true)}>
                                    View All Cities
                                </button>
                            ) : null}
                        </>
                    )}

                    {/* Search Results */}
                    {showSearch && (
                        <div className={styles.searchResults}>
                            {filteredCities.length > 0 ? (
                                filteredCities.map(city => (
                                    <button key={city.name} className={styles.searchResultItem} onClick={() => handleCitySelect(city.name)}>
                                        <div className={styles.searchResultCity}>{city.name}</div>
                                        <div className={styles.searchResultState}>{city.state}</div>
                                    </button>
                                ))
                            ) : (
                                <div className={styles.noResults}>
                                    No cities found for "{searchTerm}"
                                </div>
                            )}
                        </div>
                    )}

                    {/* All Cities */}
                    {showAllCities && !showSearch && (
                        <>
                            <div className={styles.sectionTitle}>Other Cities</div>
                            <div className={styles.otherCitiesGrid}>
                                {otherCities.map(city => (
                                    <button key={city.name} className={styles.otherCityItem} onClick={() => handleCitySelect(city.name)}>
                                        {city.name}
                                    </button>
                                ))}
                            </div>
                            <button className={styles.viewAllBtn} onClick={() => setShowAllCities(false)}>
                                Hide all cities
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

// Map popular names to icon path
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
        'Kochi': 'koch'
    };
    return map[name] || 'mumbai';
}

export default LocationModal;
