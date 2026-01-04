import React, { useState } from 'react';
import { Search, MapPin, X } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setCity } from '../redux/locationSlice';
import styles from '../styles/LocationModal.module.css';

const POPULAR_CITIES = [
    { name: 'Mumbai', icon: 'https://in.bmscdn.com/m6/images/common-modules/regions/mumbai.png' },
    { name: 'Delhi-NCR', icon: 'https://in.bmscdn.com/m6/images/common-modules/regions/ncr.png' },
    { name: 'Bengaluru', icon: 'https://in.bmscdn.com/m6/images/common-modules/regions/bang.png' },
    { name: 'Hyderabad', icon: 'https://in.bmscdn.com/m6/images/common-modules/regions/hyd.png' },
    { name: 'Chandigarh', icon: 'https://in.bmscdn.com/m6/images/common-modules/regions/chd.png' },
    { name: 'Ahmedabad', icon: 'https://in.bmscdn.com/m6/images/common-modules/regions/ahd.png' },
    { name: 'Pune', icon: 'https://in.bmscdn.com/m6/images/common-modules/regions/pune.png' },
    { name: 'Chennai', icon: 'https://in.bmscdn.com/m6/images/common-modules/regions/chen.png' },
    { name: 'Kolkata', icon: 'https://in.bmscdn.com/m6/images/common-modules/regions/kolk.png' },
    { name: 'Kochi', icon: 'https://in.bmscdn.com/m6/images/common-modules/regions/koch.png' }
];

const OTHER_CITIES = [
    "Agra", "Amritsar", "Bhopal", "Bhubaneswar", "Coimbatore", "Goa", "Guwahati", "Indore", "Jaipur", "Kanpur", "Lucknow", "Ludhiana", "Madurai", "Nagpur", "Patna", "Raipur", "Rajkot", "Surat", "Thiruvananthapuram", "Vadodara", "Varanasi", "Vijayawada", "Visakhapatnam"
];

const LocationModal = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const [searchTerm, setSearchTerm] = useState('');
    const [isDetecting, setIsDetecting] = useState(false);
    const [showAllCities, setShowAllCities] = useState(false);

    if (!isOpen) return null;

    const handleCitySelect = (cityName) => {
        dispatch(setCity(cityName));
        onClose();
    };
    
    const handleDetectLocation = () => {
        setIsDetecting(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setTimeout(() => {
                        setIsDetecting(false);
                        handleCitySelect("New Delhi"); 
                    }, 1000);
                },
                (error) => {
                    console.error("Error detecting location: ", error);
                    setIsDetecting(false);
                    let errorMessage = "Unable to retrieve your location";
                    if (error.code === 1) {
                        errorMessage = "Location access denied. Please enable permissions.";
                    } else if (error.code === 2) {
                        errorMessage = "Location information is unavailable.";
                    } else if (error.code === 3) {
                        errorMessage = "Location request timed out.";
                    }
                    alert(errorMessage);
                    // Fallback to default
                    handleCitySelect("New Delhi");
                },
                { timeout: 10000, enableHighAccuracy: true }
            );
        } else {
            setIsDetecting(false);
            alert("Geolocation is not supported by this browser.");
            handleCitySelect("New Delhi");
        }
    };

    const filteredCities = OTHER_CITIES.filter(city => 
        city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                {/* Header ... */}
                <div className={styles.header}>
                    <Search className={styles.searchIcon} size={18} />
                    <input 
                        type="text" 
                        placeholder="Search for your city" 
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                    <X className={styles.closeIcon} size={24} onClick={onClose} />
                </div>

                <div className={styles.body}>
                    {!searchTerm && (
                        <>
                            <div className={styles.detectLocation} onClick={handleDetectLocation}>
                                {/* ... detect icon ... */}
                                <div className={styles.detectIconWrapper}>
                                    {isDetecting ? (
                                        <span className={styles.spinner}></span>
                                    ) : (
                                        <MapPin className={styles.detectIcon} size={16} />
                                    )}
                                </div>
                                <span>{isDetecting ? "Detecting..." : "Detect my location"}</span>
                            </div>

                            {!showAllCities && (
                                <>
                                    <div className={styles.sectionTitle}>Popular Cities</div>
                                    <div className={styles.popularGrid}>
                                        {POPULAR_CITIES.map(city => (
                                            <div key={city.name} className={styles.popularCityItem} onClick={() => handleCitySelect(city.name)}>
                                                <img src={city.icon} alt={city.name} className={styles.cityIcon} />
                                                <span>{city.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className={styles.viewAllBtn} onClick={() => setShowAllCities(true)}>
                                        View All Cities
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    {/* Show Other Cities only if searching OR View All is clicked */}
                    {(searchTerm || showAllCities) && (
                        <>
                             {showAllCities && !searchTerm && (
                                <div className={styles.viewAllBtn} onClick={() => setShowAllCities(false)} style={{marginBottom: '16px'}}>
                                    Back to Popular Cities
                                </div>
                             )}
                            <div className={styles.sectionTitle}>{searchTerm ? 'Search Results' : 'Other Cities'}</div>
                            <div className={styles.otherCitiesList}>
                                {filteredCities.map(city => (
                                    <div key={city} className={styles.otherCityItem} onClick={() => handleCitySelect(city)}>
                                        {city}
                                    </div>
                                ))}
                                {filteredCities.length === 0 && <div style={{textAlign:'center', width:'100%', color:'#888'}}>No cities found</div>}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LocationModal;
