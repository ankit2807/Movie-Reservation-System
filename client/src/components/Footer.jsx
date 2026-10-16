import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Facebook, Twitter, Instagram, Youtube, Linkedin, 
  HelpCircle, Receipt, Mail, Compass 
} from 'lucide-react';
import styles from '../styles/Footer.module.css';

const Footer = () => {
    const { movies } = useSelector((state) => state.movie) || { movies: [] };
    const { currentCity } = useSelector((state) => state.location) || { currentCity: 'Noida' };
    const cityUpper = (currentCity || 'Noida').toUpperCase();

    // Filter movies/events by type
    const moviesInNoida = (movies || []).filter(m => m.type === 'Movie' || !m.type).slice(0, 10);
    const eventsInNoida = (movies || []).filter(m => m.type === 'Event').slice(0, 8);
    const playsInNoida = (movies || []).filter(m => m.type === 'Play').slice(0, 8);
    const sportsInNoida = (movies || []).filter(m => m.type === 'Sport').slice(0, 8);
    const activitiesInNoida = (movies || []).filter(m => m.type === 'Activity').slice(0, 8);

    const fallbackMovies = [
        { title: 'Street Fighter', _id: 'ET00481645' },
        { title: 'Pushpa 2: The Rule', _id: 'pushpa-2' },
        { title: 'Chhaava', _id: 'chhaava' },
        { title: 'Kantara: Chapter 1', _id: 'kantara' },
        { title: 'War 2', _id: 'war-2' },
        { title: 'Stree 2', _id: 'stree-2' },
        { title: 'Sikandar', _id: 'sikandar' }
    ];
    const fallbackEvents = [
        { title: 'Coldplay: Music of the Spheres Tour', _id: 'coldplay' },
        { title: 'Diljit Dosanjh: Dil-Luminati Tour', _id: 'diljit' },
        { title: 'Zakir Khan Live – Tathastu & Beyond', _id: 'zakir-khan' },
        { title: 'Arijit Singh Live in Concert', _id: 'arijit' }
    ];
    const fallbackPlays = [
        { title: 'Mughal-e-Azam: The Musical', _id: 'mughal-e-azam' },
        { title: 'Hamilton – West End & Broadway Tour', _id: 'hamilton' },
        { title: '12 Angry Men – Stage Adaptation', _id: '12-angry-men' }
    ];
    const fallbackActivities = [
        { title: 'Worlds of Wonder (WOW) Amusement & Water Park', _id: 'wow-noida' },
        { title: 'Formula Karting – Pro Go-Karting Experience', _id: 'go-karting' },
        { title: 'The Habitat Late Night Stand-up & Improv Jam', _id: 'habitat' },
        { title: 'Clay & Sip: Wheel Pottery & Art Jamming', _id: 'pottery' }
    ];

    const displayMovies = moviesInNoida.length > 0 ? moviesInNoida : fallbackMovies;
    const displayEvents = eventsInNoida.length > 0 ? eventsInNoida : fallbackEvents;
    const displayPlays = playsInNoida.length > 0 ? playsInNoida : fallbackPlays;
    const displayActivities = activitiesInNoida.length > 0 ? activitiesInNoida : fallbackActivities;

    const movieGenres = [
        'Drama Movies', 'Thriller Movies', 'Action Movies',
        'Comedy Movies', 'Crime Movies', 'Adventure Movies',
        'Horror Movies', 'Sci-Fi Movies', 'Romantic Movies',
        'Historical Movies'
    ];

    const exclusivesLinks = [
        { label: 'Lollapalooza India', to: '/events' },
        { label: 'Superstar', to: '/offers' },
        { label: 'BookAChange', to: '/bookachange' },
        { label: 'Corporate Vouchers', to: '/corporates' },
        { label: 'Gift Cards', to: '/gift-cards' },
        { label: 'List My Show', to: '/list-your-show' },
        { label: 'Offers', to: '/offers' },
        { label: 'Stream', to: '/stream' },
    ];

    const countriesList = ['Indonesia', 'Singapore', 'UAE', 'Sri Lanka', 'West Indies'];

    const helpLinks = [
        { label: 'About Us', to: '/help' },
        { label: 'Contact Us', to: '/contact' },
        { label: 'Current Opening', to: '/help' },
        { label: 'Press Release', to: '/help' },
        { label: 'FAQs', to: '/help' },
        { label: 'Terms and Conditions', to: '/help' },
        { label: 'Privacy Policy', to: '/help' },
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
            {/* List Your Show Banner */}
            <div className={styles.bannerBg}>
                <div className={`${styles.bannerContainer} container`}>
                    <div className={styles.bannerLeft}>
                        <Compass className={styles.bannerIcon} size={28} />
                        <div className={styles.bannerText}>
                            <h4>List your Show</h4>
                            <p>Got a show, event, activity or a great experience? Partner with us & get listed on MovieBook</p>
                        </div>
                    </div>
                    <Link to="/list-your-show" className={styles.bannerBtn}>
                        Contact today!
                    </Link>
                </div>
            </div>

            {/* Support/Feature Icons Row */}
            <div className={styles.supportBg}>
                <div className={`${styles.supportContainer} container`}>
                    <Link to="/help" className={styles.supportItem}>
                        <HelpCircle size={40} strokeWidth={1} />
                        <span>24/7 CUSTOMER CARE</span>
                    </Link>
                    <Link to="/bookings" className={styles.supportItem}>
                        <Receipt size={40} strokeWidth={1} />
                        <span>RESEND BOOKING CONFIRMATION</span>
                    </Link>
                    <Link to="/notifications" className={styles.supportItem}>
                        <Mail size={40} strokeWidth={1} />
                        <span>SUBSCRIBE TO THE NEWSLETTER</span>
                    </Link>
                </div>
            </div>

            <div className={styles.footerContent}>
                {/* Movies now showing */}
                <div className={styles.section}>
                    <h5 className={styles.sectionLabel}>MOVIES NOW SHOWING IN {cityUpper}</h5>
                    <div className={styles.linkRow}>
                        {displayMovies.map((item, idx) => (
                            <React.Fragment key={item._id || idx}>
                                <Link to={String(item._id).length > 8 ? `/movie/${item._id}` : `/movies`} className={styles.footerLink}>
                                    {item.title}
                                </Link>
                                {idx < displayMovies.length - 1 && <span className={styles.separator}>|</span>}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Upcoming Events */}
                <div className={styles.section}>
                    <h5 className={styles.sectionLabel}>UPCOMING EVENTS IN {cityUpper}</h5>
                    <div className={styles.linkRow}>
                        {displayEvents.map((item, idx) => (
                            <React.Fragment key={item._id || idx}>
                                <Link to={String(item._id).length > 15 ? `/movie/${item._id}` : `/events`} className={styles.footerLink}>
                                    {item.title}
                                </Link>
                                {idx < displayEvents.length - 1 && <span className={styles.separator}>|</span>}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Plays */}
                <div className={styles.section}>
                    <h5 className={styles.sectionLabel}>PLAYS IN TOP CITIES ({cityUpper})</h5>
                    <div className={styles.linkRow}>
                        {displayPlays.map((item, idx) => (
                            <React.Fragment key={item._id || idx}>
                                <Link to={String(item._id).length > 15 ? `/movie/${item._id}` : `/plays`} className={styles.footerLink}>
                                    {item.title}
                                </Link>
                                {idx < displayPlays.length - 1 && <span className={styles.separator}>|</span>}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Sports */}
                {sportsInNoida.length > 0 && (
                    <div className={styles.section}>
                        <h5 className={styles.sectionLabel}>SPORTS EVENTS IN {cityUpper}</h5>
                        <div className={styles.linkRow}>
                            {sportsInNoida.map((item, idx) => (
                                <React.Fragment key={item._id || idx}>
                                    <Link to={`/movie/${item._id}`} className={styles.footerLink}>
                                        {item.title}
                                    </Link>
                                    {idx < sportsInNoida.length - 1 && <span className={styles.separator}>|</span>}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                )}

                {/* Activities */}
                <div className={styles.section}>
                    <h5 className={styles.sectionLabel}>ACTIVITIES IN {cityUpper}</h5>
                    <div className={styles.linkRow}>
                        {displayActivities.map((item, idx) => (
                            <React.Fragment key={item._id || idx}>
                                <Link to={String(item._id).length > 15 ? `/movie/${item._id}` : `/activities`} className={styles.footerLink}>
                                    {item.title}
                                </Link>
                                {idx < displayActivities.length - 1 && <span className={styles.separator}>|</span>}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Genre Links */}
                <div className={styles.section}>
                    <h5 className={styles.sectionLabel}>MOVIES BY GENRE</h5>
                    <div className={styles.linkRow}>
                        {movieGenres.map((genre, i) => (
                            <React.Fragment key={genre}>
                                <Link to="/movies" className={styles.footerLink}>{genre}</Link>
                                {i < movieGenres.length - 1 && <span className={styles.separator}>|</span>}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/*COUNTRIES */}
                <div className={styles.section}>
                    <h5 className={styles.sectionLabel}>COUNTRIES</h5>
                    <div className={styles.linkRow}>
                        {countriesList.map((country, i) => (
                            <React.Fragment key={country}>
                                <Link to="/" className={styles.footerLink}>{country}</Link>
                                {i < countriesList.length - 1 && <span className={styles.separator}>|</span>}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* BOOKMYSHOW EXCLUSIVES */}
                <div className={styles.section}>
                    <h5 className={styles.sectionLabel}>BOOKMYSHOW EXCLUSIVES</h5>
                    <div className={styles.linkRow}>
                        {exclusivesLinks.map((link, i) => (
                            <React.Fragment key={link.label}>
                                <Link to={link.to} className={styles.footerLink}>{link.label}</Link>
                                {i < exclusivesLinks.length - 1 && <span className={styles.separator}>|</span>}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* HELP */}
                <div className={styles.section}>
                    <h5 className={styles.sectionLabel}>HELP</h5>
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
