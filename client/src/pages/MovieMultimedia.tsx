import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { getTrailersForMovie } from '../utils/moviebookData';
import type { Movie, TrailerItem } from '../types';
import styles from '../styles/MovieMultimedia.module.css';

const MovieMultimedia: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    window.scrollTo(0, 0);
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        setPlayingVideoId(null);
        const res = await api.get<Movie>(`/movie/find/${id}`);
        setMovie(res.data);
      } catch (err) {
        console.error('Failed to load trailers:', err);
        setError('Unable to load videos for this movie.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  const trailers = useMemo(() => (movie ? getTrailersForMovie(movie) : []), [movie]);

  const sections = useMemo(() => {
    const map = new Map<string, TrailerItem[]>();
    trailers.forEach((t) => {
      const lang = t.language || 'English';
      if (!map.has(lang)) map.set(lang, []);
      map.get(lang)?.push(t);
    });
    return Array.from(map.entries()).map(([lang, videos]) => ({ lang, videos }));
  }, [trailers]);

  const currentLang = activeLang || sections[0]?.lang;

  const handleLangClick = (lang: string) => {
    setActiveLang(lang);
    const el = sectionRefs.current[lang];
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const playVideo = (videoId: string) => setPlayingVideoId(videoId);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.stateBox}>
          <div className={styles.spinner} />
          <p>Loading videos...</p>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className={styles.page}>
        <div className={styles.stateBox}>
          <p>{error || 'Movie not found'}</p>
          <button type="button" className={styles.backBtn} onClick={() => navigate('/')}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.headerRow}>
          <span className={styles.videosFor}>Videos for</span>
          <Link to={`/movie/${movie._id}`} className={styles.movieTitle}>
            {movie.title}
          </Link>
        </div>

        <div className={styles.langBar}>
          {sections.map(({ lang }) => (
            <button
              key={lang}
              type="button"
              className={`${styles.langPill} ${currentLang === lang ? styles.langPillActive : ''}`}
              onClick={() => handleLangClick(lang)}
            >
              {lang}
            </button>
          ))}
        </div>

        <div className={styles.videoSections}>
          {sections.map(({ lang, videos }) => (
            <section
              key={lang}
              ref={(el) => {
                sectionRefs.current[lang] = el;
              }}
              className={styles.videoSection}
            >
              <h5 className={styles.sectionHeading}>{lang}</h5>

              {videos.map((video) => {
                const isPlaying = playingVideoId === video.videoId;
                return (
                  <div
                    key={video.videoId}
                    id={video.videoId}
                    className={styles.videoCard}
                    role={isPlaying ? undefined : 'button'}
                    tabIndex={isPlaying ? undefined : 0}
                    aria-label={isPlaying ? undefined : 'Play video'}
                    onClick={isPlaying ? undefined : () => playVideo(video.videoId)}
                    onKeyDown={
                      isPlaying
                        ? undefined
                        : (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              playVideo(video.videoId);
                            }
                          }
                    }
                  >
                    {isPlaying ? (
                      <iframe
                        className={styles.videoFrame}
                        src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1&enablejsapi=1&modestbranding=1&playsinline=1&fs=1&rel=0`}
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      />
                    ) : (
                      <>
                        <img
                          src={`https://img.youtube.com/vi/${video.videoId}/0.jpg`}
                          alt={video.title || 'multimedia-trailers'}
                          className={styles.thumb}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`;
                          }}
                        />
                        <span className={styles.playBtn} aria-hidden="true">
                          <svg width="48" height="48" viewBox="0 0 48 48">
                            <circle cx="24" cy="24" r="24" fill="rgba(0, 0, 0, 0.6)" />
                            <path d="M19 15.5v17l14-8.5z" fill="#ffffff" />
                          </svg>
                        </span>
                      </>
                    )}
                  </div>
                );
              })}
            </section>
          ))}
        </div>
      </div>

      <div className={styles.breadcrumb}>
        <Link to="/">Home</Link>
        <span className={styles.crumbSep}>›</span>
        <Link to="/movies">Movie Trailers</Link>
        <span className={styles.crumbSep}>›</span>
        <span>{movie.title}</span>
      </div>
    </div>
  );
};

export default MovieMultimedia;
