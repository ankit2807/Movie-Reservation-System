import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from '../styles/SubNavbar.module.css';

// Exact BookMyShow sub-navigation: categories on the left, utility links on the right
const LEFT_LINKS = [
    { label: 'Movies', path: '/movies' },
    { label: 'Stream', path: '/stream' },
    { label: 'Events', path: '/events' },
    { label: 'Plays', path: '/plays' },
    { label: 'Sports', path: '/sports' },
    { label: 'Activities', path: '/activities' },
];

const RIGHT_LINKS = [
    { label: 'ListYourShow', path: '/list-your-show' },
    { label: 'Corporates', path: '/corporates' },
    { label: 'Offers', path: '/offers' },
    { label: 'Gift Cards', path: '/gift-cards' },
];

const SubNavbar = () => (
    <nav className={styles.subNavbar} aria-label="Categories">
        <div className={`container ${styles.container}`}>
            <div className={styles.left}>
                {LEFT_LINKS.map((link) => (
                    <NavLink
                        key={link.label}
                        to={link.path}
                        className={({ isActive }) =>
                            `${styles.leftLink} ${isActive ? styles.linkActive : ''}`
                        }
                    >
                        {link.label}
                    </NavLink>
                ))}
            </div>
            <div className={styles.right}>
                {RIGHT_LINKS.map((link) => (
                    <NavLink
                        key={link.label}
                        to={link.path}
                        className={({ isActive }) =>
                            `${styles.rightLink} ${isActive ? styles.linkActive : ''}`
                        }
                    >
                        {link.label}
                    </NavLink>
                ))}
            </div>
        </div>
    </nav>
);

export default SubNavbar;
