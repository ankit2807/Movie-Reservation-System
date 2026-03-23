import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Linkedin } from 'lucide-react';
import styles from '../styles/Footer.module.css';

const Footer = () => {
    const movieGenres = [
        'Drama Online Movies', 'Thriller Online Movies', 'Action Online Movies',
        'Comedy Online Movies', 'Crime Online Movies', 'Adventure Online Movies',
        'Horror Online Movies', 'Sci-Fi Online Movies', 'Romantic Online Movies',
        'Mystery Online Movies'
    ];

    const miscLinks = [
        { label: 'Upcoming Movies', to: '/movies' },
        { label: 'Movies in Cinemas', to: '/movies' },
        { label: 'Live Events', to: '/events' },
        { label: 'Theatre Plays', to: '/plays' },
        { label: 'Sports Events', to: '/sports' },
        { label: 'Activities', to: '/activities' },
        { label: 'Stream', to: '/stream' },
    ];

    const exclusives = [
        { label: 'Gift Cards', to: '/gift-cards' },
        { label: 'List My Show', to: '/list-your-show' },
        { label: 'Offers', to: '/offers' },
        { label: 'Stream', to: '/stream' },
    ];

    const helpLinks = [
        { label: 'About Us', to: '#' },
        { label: 'Contact Us', to: '#' },
        { label: 'Press Release', to: '#' },
        { label: 'FAQs', to: '#' },
        { label: 'Terms and Conditions', to: '#' },
        { label: 'Privacy Policy', to: '#' },
    ];

    const socialLinks = [
        { icon: <Facebook size={20} />, href: '#', label: 'Facebook' },
        { icon: <Twitter size={20} />, href: '#', label: 'Twitter' },
        { icon: <Instagram size={20} />, href: '#', label: 'Instagram' },
        { icon: <Youtube size={20} />, href: '#', label: 'YouTube' },
        { icon: <Linkedin size={20} />, href: '#', label: 'LinkedIn' },
    ];

    return (
        <footer className={styles.footer}>
            <div className={styles.footerContent}>
                {/* Genre Links */}
                <div className={styles.linkRow}>
                    {movieGenres.map((genre, i) => (
                        <React.Fragment key={genre}>
                            <Link to="/movies" className={styles.footerLink}>{genre}</Link>
                            {i < movieGenres.length - 1 && <span className={styles.separator}>|</span>}
                        </React.Fragment>
                    ))}
                </div>

                {/* MISC Section */}
                <div className={styles.section}>
                    <h4 className={styles.sectionLabel}>MISC</h4>
                    <div className={styles.linkRow}>
                        {miscLinks.map((link, i) => (
                            <React.Fragment key={link.label}>
                                <Link to={link.to} className={styles.footerLink}>{link.label}</Link>
                                {i < miscLinks.length - 1 && <span className={styles.separator}>|</span>}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* MOVIEBOOK EXCLUSIVES */}
                <div className={styles.section}>
                    <h4 className={styles.sectionLabel}>MOVIEBOOK EXCLUSIVES</h4>
                    <div className={styles.linkRow}>
                        {exclusives.map((link, i) => (
                            <React.Fragment key={link.label}>
                                <Link to={link.to} className={styles.footerLink}>{link.label}</Link>
                                {i < exclusives.length - 1 && <span className={styles.separator}>|</span>}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* HELP */}
                <div className={styles.section}>
                    <h4 className={styles.sectionLabel}>HELP</h4>
                    <div className={styles.linkRow}>
                        {helpLinks.map((link, i) => (
                            <React.Fragment key={link.label}>
                                <Link to={link.to} className={styles.footerLink}>{link.label}</Link>
                                {i < helpLinks.length - 1 && <span className={styles.separator}>|</span>}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Divider + Logo */}
                <div className={styles.brandSection}>
                    <div className={styles.dividerLine} />
                    <div className={styles.brandLogo}>
                        <span className={styles.brandBook}>Movie</span>
                        <span className={styles.brandMy}>Book</span>
                    </div>
                    <div className={styles.dividerLine} />
                </div>

                {/* Social Icons */}
                <div className={styles.socialRow}>
                    {socialLinks.map(social => (
                        <a
                            key={social.label}
                            href={social.href}
                            className={styles.socialIcon}
                            aria-label={social.label}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {social.icon}
                        </a>
                    ))}
                </div>

                {/* Copyright */}
                <div className={styles.copyright}>
                    <p>Copyright 2026 © MovieBook Entertainment Pvt. Ltd. All Rights Reserved.</p>
                    <p className={styles.copyrightSub}>
                        The content and images used on this site are copyright protected and copyrights vest with the respective owners.
                        The usage of the content and images on this website is intended to promote the works
                        and no endorsement of the artist shall be implied. Unauthorized use is prohibited and punishable by law.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
