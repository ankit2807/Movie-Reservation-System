import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, Clock, Star, User as UserIcon, Send } from 'lucide-react';
import api from '../api/axios';
import { fetchMovieDetailsSuccess } from '../redux/movieSlice';
import styles from '../styles/MovieDetails.module.css';

const MovieDetails = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { movieDetails } = useSelector((state) => state.movie);
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const [showtimes, setShowtimes] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [reviewSubmitting, setReviewSubmitting] = useState(false);

    const fetchReviews = async () => {
        try {
            const res = await api.get(`/reviews/${id}`);
            setReviews(res.data.data);
        } catch (err) {
            console.log("Error fetching reviews", err);
        }
    };

    useEffect(() => {
        const getData = async () => {
            try {
                const [movieRes, showtimeRes] = await Promise.all([
                    api.get(`/movie/find/${id}`),
                    api.get('/showtimes')
                ]);

                dispatch(fetchMovieDetailsSuccess(movieRes.data));

                const relevantShowtimes = showtimeRes.data.filter(st =>
                    (st.movieId && st.movieId._id === id) || st.movieId === id
                );
                setShowtimes(relevantShowtimes);
                fetchReviews();
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        getData();
    }, [id, dispatch]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) return alert("Please login to review");
        setReviewSubmitting(true);
        try {
            await api.post('/reviews', {
                movieId: id,
                rating: newReview.rating,
                comment: newReview.comment
            });
            setNewReview({ rating: 5, comment: '' });
            fetchReviews(); // Refresh reviews
            alert("Review added!");
        } catch (err) {
            alert(err.response?.data?.message || "Failed to add review");
        } finally {
            setReviewSubmitting(false);
        }
    };

    if (loading || !movieDetails) return <div className="container" style={{ paddingTop: '20px' }}>Loading...</div>;

    return (
        <div className={styles.detailsPage}>
            <div className={styles.bannerWrapper} style={{
                backgroundImage: `url(${movieDetails.posterImage})`
            }}>
                <div className={styles.bannerOverlay}>
                    <div className={`container ${styles.bannerContent}`}>
                        <div className={styles.posterContainer}>
                            <img src={movieDetails.posterImage} alt={movieDetails.title} />
                            <div className={styles.status}>In Cinemas</div>
                        </div>

                        <div className={styles.info}>
                            <h1>{movieDetails.title}</h1>

                            <div className={styles.ratingBox}>
                                <div className={styles.ratingLeft}>
                                    <Star size={24} fill="#f84464" stroke="#f84464" />
                                    <span className={styles.ratingScore}>{movieDetails.rating || 'N/A'}/10</span>
                                    <span className={styles.votes}>({reviews.length}K+ Votes)</span>
                                </div>
                                <button className={styles.rateBtn}>Rate now</button>
                            </div>

                            <div className={styles.tagPills}>
                                <span>2D</span>
                                <span>{movieDetails.languages ? movieDetails.languages.join(", ") : "English"}</span>
                            </div>

                            <div className={styles.meta}>
                                {movieDetails.duration} • {movieDetails.genre} • {movieDetails.certification} • {new Date(movieDetails.releaseDate).toLocaleDateString()}
                            </div>

                            <button className={styles.bookBtn}>
                                Book tickets
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className={`container ${styles.contentBody}`}>
                <div className={styles.mainColumn}>
                    <div className={styles.section}>
                        <h2>About the movie</h2>
                        <p className={styles.description}>{movieDetails.description}</p>
                    </div>

                    <div className={styles.section}>
                        <h2>Top offers for you</h2>
                        <div className={styles.offersGrid}>
                            <div className={styles.offerCard}>
                                <div className={styles.offerIcon}>%</div>
                                <div>
                                    <h4>YES Private Debit Card Offer</h4>
                                    <p>Tap to view details</p>
                                </div>
                            </div>
                            <div className={styles.offerCard}>
                                <div className={styles.offerIcon}>%</div>
                                <div>
                                    <h4>Buy 1 get 1 movie ticket free</h4>
                                    <p>Tap to view details</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cast Section */}
                    {movieDetails.cast && movieDetails.cast.length > 0 && (
                        <div className={styles.section}>
                            <h2>Cast</h2>
                            <div className={styles.castGrid}>
                                {movieDetails.cast.map((actor, idx) => (
                                    <div key={idx} className={styles.castCard}>
                                        <div className={styles.castImage}>
                                            {actor.image ? <img src={actor.image} alt={actor.name} /> : <UserIcon size={40} />}
                                        </div>
                                        <h4>{actor.name}</h4>
                                        <p>as {actor.role}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Crew Section (Mocked for UI matching) */}
                    <div className={styles.section}>
                        <h2>Crew</h2>
                        <div className={styles.castGrid}>
                            <div className={styles.castCard}>
                                <div className={styles.castImage}>
                                    <UserIcon size={40} />
                                </div>
                                <h4>Director Name</h4>
                                <p>Director</p>
                            </div>
                            <div className={styles.castCard}>
                                <div className={styles.castImage}>
                                    <UserIcon size={40} />
                                </div>
                                <h4>Producer Name</h4>
                                <p>Producer</p>
                            </div>
                        </div>
                    </div>

                    <hr className={styles.divider} />

                    {/* Reviews Section */}
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2>Top reviews</h2>
                            <span className={styles.totalReviews}>{reviews.length}K reviews ›</span>
                        </div>

                        <div className={styles.reviewTags}>
                            <span>#GreatActing {Math.floor(Math.random() * 1000)}</span>
                            <span>#SuperDirection {Math.floor(Math.random() * 1000)}</span>
                            <span>#Blockbuster {Math.floor(Math.random() * 1000)}</span>
                        </div>

                        <div className={styles.reviewsListHorizontal}>
                            {reviews.length === 0 ? <p>No reviews yet.</p> : (
                                reviews.map(review => (
                                    <div key={review._id} className={styles.reviewCard}>
                                        <div className={styles.reviewCardHeader}>
                                            <div className={styles.reviewerInfo}>
                                                <UserIcon size={24} className={styles.userAvatar} />
                                                <span>{review.user?.name || 'User'}</span>
                                            </div>
                                            <div className={styles.reviewRatingStar}>
                                                ★ {review.rating}/5
                                            </div>
                                        </div>
                                        <p className={styles.reviewText}>{review.comment}</p>
                                        <div className={styles.reviewFooter}>
                                            <span>24 Days ago</span>
                                        </div>
                                    </div>
                                ))
                            )}
                            {/* Add Review Form if logged in */}
                            {isAuthenticated && (
                                <div className={styles.reviewCard} style={{ justifyContent: 'center', alignItems: 'center', minWidth: '300px' }}>
                                    <h3>Add your review</h3>
                                    <form onSubmit={handleReviewSubmit} className={styles.reviewForm}>
                                        <select
                                            value={newReview.rating}
                                            onChange={e => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                                            className={styles.ratingSelect}
                                        >
                                            {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} Star</option>)}
                                        </select>
                                        <input
                                            type="text"
                                            placeholder="Write a review..."
                                            value={newReview.comment}
                                            onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                                            style={{ width: '100%', marginBottom: '8px' }}
                                            required
                                        />
                                        <button type="submit" disabled={reviewSubmitting}>Submit</button>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h2>You might also like</h2>
                        <div className={styles.showtimeGrid}>
                            {/* Placeholder for similar movies */}
                            <Link to="/" className={styles.recommendationCard}>
                                <div className={styles.recImage} style={{ background: '#333', height: '150px', borderRadius: '4px' }}></div>
                                <h4>Similar Movie 1</h4>
                            </Link>
                            <Link to="/" className={styles.recommendationCard}>
                                <div className={styles.recImage} style={{ background: '#333', height: '150px', borderRadius: '4px' }}></div>
                                <h4>Similar Movie 2</h4>
                            </Link>
                        </div>
                    </div>


                    <hr className={styles.divider} />

                    <div className={styles.section}>
                        <h2>Available Showtimes</h2>
                        <div className={styles.showtimeGrid}>
                            {showtimes.length === 0 ? (
                                <p>No showtimes scheduled.</p>
                            ) : (
                                showtimes.map((st) => (
                                    <Link to={`/booking/${st._id}`} key={st._id} className={styles.showtimeCard}>
                                        <div className={styles.showtimeHeader}>
                                            <Calendar size={14} />
                                            <span>{st.startDate ? new Date(st.startDate).toLocaleDateString() : 'Date'}</span>
                                        </div>
                                        <div className={styles.showtimeTime}>
                                            <Clock size={16} color="#4fb643" />
                                            <strong style={{ color: '#4fb643' }}>{st.startAt}</strong>
                                        </div>
                                        <div className={styles.showtimeType}>
                                            4K Dolby Atmos
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MovieDetails;
