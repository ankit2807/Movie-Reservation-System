import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/SubNavbar.module.css';

// Sub-categories for dropdown menus
const NAV_DROPDOWNS = {
    Movies: {
        columns: [
            {
                title: 'Languages',
                items: ['Hindi', 'English', 'Telugu', 'Tamil', 'Kannada', 'Malayalam', 'Bengali', 'Marathi']
            },
            {
                title: 'Genres',
                items: ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Thriller', 'Sci-Fi', 'Animation']
            },
            {
                title: 'Format',
                items: ['2D', '3D', 'IMAX 2D', 'IMAX 3D', '4DX', '4DX 3D', 'MX4D 3D']
            }
        ]
    },
    Events: {
        columns: [
            {
                title: 'Category',
                items: ['Comedy Shows', 'Music Shows', 'Workshops', 'Kids', 'Meetups', 'Festivals', 'Exhibitions']
            },
            {
                title: 'Popular',
                items: ['Stand-up Comedy', 'Live Music', 'DJ Nights', 'Food Festivals', 'Art & Craft']
            }
        ]
    },
    Plays: {
        columns: [
            {
                title: 'Category',
                items: ['Drama', 'Comedy', 'Musical', 'Classic', 'Kids Theatre', 'Experimental']
            },
            {
                title: 'Language',
                items: ['Hindi', 'English', 'Marathi', 'Gujarati', 'Bengali', 'Tamil']
            }
        ]
    },
    Sports: {
        columns: [
            {
                title: 'Category',
                items: ['Cricket', 'Football', 'Badminton', 'Tennis', 'Kabaddi', 'Hockey', 'Racing']
            },
            {
                title: 'Format',
                items: ['Live Matches', 'Tournaments', 'Fan Zones', 'Sports Meetups']
            }
        ]
    },
    Activities: {
        columns: [
            {
                title: 'Category',
                items: ['Adventure', 'Amusement Parks', 'Water Parks', 'Trekking', 'Cycling', 'Camping']
            },
            {
                title: 'Popular',
                items: ['Go-Karting', 'Paintball', 'Escape Rooms', 'Bowling', 'Rock Climbing']
            }
        ]
    }
};

const SubNavbar = () => {
    const [activeDropdown, setActiveDropdown] = useState(null);
    const timeoutRef = useRef(null);

    const handleMouseEnter = (label) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setActiveDropdown(label);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setActiveDropdown(null);
        }, 150);
    };

    const leftLinks = [
        { label: 'Movies', path: '/movies' },
        { label: 'Stream', path: '/stream' },
        { label: 'Events', path: '/events' },
        { label: 'Plays', path: '/plays' },
        { label: 'Sports', path: '/sports' },
        { label: 'Activities', path: '/activities' },
    ];

    const rightLinks = [
        { label: 'ListYourShow', path: '/list-your-show' },
        { label: 'Corporates', path: '/corporates' },
        { label: 'Offers', path: '/offers' },
        { label: 'Gift Cards', path: '/gift-cards' },
    ];

    return (
        <div className={styles.subNavbar}>
            <div className={`container ${styles.container}`}>
                <div className={styles.left}>
                    {leftLinks.map(link => {
                        const hasDropdown = NAV_DROPDOWNS[link.label];
                        return (
                            <div
                                key={link.label}
                                className={styles.navItemWrapper}
                                onMouseEnter={() => hasDropdown && handleMouseEnter(link.label)}
                                onMouseLeave={handleMouseLeave}
                            >
                                <Link
                                    to={link.path}
                                    className={`${styles.navLink} ${activeDropdown === link.label ? styles.navLinkActive : ''}`}
                                >
                                    {link.label}
                                </Link>

                                {/* Dropdown Mega Menu */}
                                {hasDropdown && activeDropdown === link.label && (
                                    <div
                                        className={styles.megaMenu}
                                        onMouseEnter={() => handleMouseEnter(link.label)}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        <div className={styles.megaMenuInner}>
                                            {NAV_DROPDOWNS[link.label].columns.map((col, idx) => (
                                                <div key={idx} className={styles.megaMenuColumn}>
                                                    <div className={styles.megaMenuTitle}>{col.title}</div>
                                                    <ul className={styles.megaMenuList}>
                                                        {col.items.map(item => (
                                                            <li key={item}>
                                                                <Link
                                                                    to={`${link.path}?filter=${encodeURIComponent(item)}`}
                                                                    className={styles.megaMenuItem}
                                                                    onClick={() => setActiveDropdown(null)}
                                                                >
                                                                    {item}
                                                                </Link>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                <div className={styles.right}>
                    {rightLinks.map(link => (
                        <Link key={link.label} to={link.path} className={styles.navLink}>
                            {link.label}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SubNavbar;
