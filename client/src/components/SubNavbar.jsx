import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/SubNavbar.module.css';

const SubNavbar = () => {
    return (
        <div className={styles.subNavbar}>
            <div className={`container ${styles.container}`}>
                <div className={styles.left}>
                    <Link to="/movies">Movies</Link>
                    <Link to="/stream">Stream</Link>
                    <Link to="/events">Events</Link>
                    <Link to="/plays">Plays</Link>
                    <Link to="/sports">Sports</Link>
                    <Link to="/activities">Activities</Link>
                </div>
                <div className={styles.right}>
                    <Link to="/list-your-show">ListYourShow</Link>
                    <Link to="/corporates">Corporates</Link>
                    <Link to="/offers">Offers</Link>
                    <Link to="/gift-cards">Gift Cards</Link>
                </div>
            </div>
        </div>
    );
};

export default SubNavbar;
