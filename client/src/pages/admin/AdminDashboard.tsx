import React, { useEffect, useId, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Trash2,
  Edit3,
  Film,
  Ticket,
  IndianRupee,
  CalendarClock,
  Search,
  RefreshCw,
} from 'lucide-react';
import api from '../../api/axios';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchMoviesStart, fetchMoviesSuccess, fetchMoviesFailure } from '../../redux/movieSlice';
import { showToast } from '../../redux/locationSlice';
import { createPosterFallback } from '../../utils/moviebookData';
import ConfirmDialog from '../../components/ConfirmDialog';
import { AdminStats, getApiErrorMessage, Movie, ShowTime } from '../../types';
import styles from '../../styles/AdminDashboard.module.css';

interface PendingDeleteTarget {
  kind: 'movie' | 'showtime';
  id: string;
  label: string;
}

const cssVarStyle = (vars: Record<string, string>): React.CSSProperties =>
  vars as React.CSSProperties;

const getShowtimeMovieTitle = (movieId: ShowTime['movieId']): string =>
  typeof movieId === 'object' && movieId !== null ? movieId.title || '' : '';

const AdminDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { movies } = useAppSelector((state) => state.movie);
  const captionId = useId();

  const [activeTab, setActiveTab] = useState<'catalog' | 'showtimes' | 'bookings'>('catalog');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showtimes, setShowtimes] = useState<ShowTime[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalMovies: 0,
    totalUsers: 0,
    totalShowtimes: 0,
    totalBookings: 0,
    confirmedBookings: 0,
    cancelledBookings: 0,
    totalSeatsSold: 0,
    totalRevenue: 0,
    categoryBreakdown: {},
    recentBookings: [],
  });
  const [refreshing, setRefreshing] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<PendingDeleteTarget | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadDashboard = async () => {
      dispatch(fetchMoviesStart());
      try {
        const [moviesRes, showtimesRes, statsRes] = await Promise.all([
          api.get<Movie[]>('/movie'),
          api.get<ShowTime[]>('/showtimes').catch(() => ({ data: [] as ShowTime[] })),
          api.get<AdminStats | null>('/admin/stats').catch(() => ({ data: null })),
        ]);
        if (!isMounted) return;
        const movieList = Array.isArray(moviesRes.data) ? moviesRes.data : [];
        dispatch(fetchMoviesSuccess(movieList));
        setShowtimes(Array.isArray(showtimesRes.data) ? showtimesRes.data : []);
        if (statsRes.data) {
          setStats(statsRes.data);
        }
      } catch (err: unknown) {
        if (isMounted) {
          dispatch(fetchMoviesFailure(getApiErrorMessage(err, 'Failed to load dashboard')));
        }
      }
    };
    void loadDashboard();
    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const [moviesRes, showtimesRes, statsRes] = await Promise.all([
        api.get<Movie[]>('/movie'),
        api.get<ShowTime[]>('/showtimes').catch(() => ({ data: [] as ShowTime[] })),
        api.get<AdminStats | null>('/admin/stats').catch(() => ({ data: null })),
      ]);
      dispatch(fetchMoviesSuccess(Array.isArray(moviesRes.data) ? moviesRes.data : []));
      setShowtimes(Array.isArray(showtimesRes.data) ? showtimesRes.data : []);
      if (statsRes.data) setStats(statsRes.data);
      dispatch(showToast({ message: 'Dashboard analytics refreshed.', type: 'success' }));
    } catch {
      dispatch(showToast({ message: 'Unable to refresh dashboard data.', type: 'error' }));
    } finally {
      setRefreshing(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    const target = pendingDelete;
    try {
      if (target.kind === 'movie') {
        await api.delete(`/movie/${target.id}`);
        const res = await api.get<Movie[]>('/movie');
        dispatch(fetchMoviesSuccess(Array.isArray(res.data) ? res.data : []));
        dispatch(showToast({ message: `"${target.label}" removed from catalog.`, type: 'success' }));
      } else if (target.kind === 'showtime') {
        await api.delete(`/showtimes/${target.id}`);
        setShowtimes((prev) => prev.filter((st) => st._id !== target.id));
        dispatch(showToast({ message: 'Showtime slot deleted.', type: 'success' }));
      }
      const statsRes = await api.get<AdminStats | null>('/admin/stats').catch(() => ({ data: null }));
      if (statsRes.data) setStats(statsRes.data);
    } catch (err: unknown) {
      dispatch(
        showToast({
          message: getApiErrorMessage(err, 'Delete operation failed.'),
          type: 'error',
        })
      );
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  };

  const filteredCatalog = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return movies.filter((m) => {
      const matchesCat = categoryFilter === 'All' || (m.type || 'Movie') === categoryFilter;
      const matchesQuery =
        !q ||
        m.title?.toLowerCase().includes(q) ||
        m.genre?.toLowerCase().includes(q) ||
        (m.languages || []).some((l) => l.toLowerCase().includes(q));
      return matchesCat && matchesQuery;
    });
  }, [movies, searchTerm, categoryFilter]);

  const filteredShowtimes = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return showtimes;
    return showtimes.filter((st) => {
      const title = getShowtimeMovieTitle(st.movieId);
      return (
        title.toLowerCase().includes(q) ||
        st.theatre?.toLowerCase().includes(q) ||
        st.format?.toLowerCase().includes(q) ||
        st.startAt?.toLowerCase().includes(q)
      );
    });
  }, [showtimes, searchTerm]);

  const filteredBookings = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const list = stats.recentBookings || [];
    if (!q) return list;
    return list.filter(
      (b) =>
        b.bookingId?.toLowerCase().includes(q) ||
        b.movieTitle?.toLowerCase().includes(q) ||
        b.customerName?.toLowerCase().includes(q) ||
        b.theatreName?.toLowerCase().includes(q)
    );
  }, [stats.recentBookings, searchTerm]);

  const categoryEntries = Object.entries(stats.categoryBreakdown || {});

  return (
    <div className={`container ${styles.dashboardPage}`}>
      <div className={styles.topBar}>
        <div>
          <p className={styles.eyebrow}>MovieBook Administration</p>
          <h1 className={styles.pageTitle}>Admin Control Center</h1>
          <p className={styles.pageSubtitle}>
            Manage titles, multiplex showtimes, and real-time M-Ticket reservations
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.iconRefreshBtn}
            onClick={handleRefresh}
            disabled={refreshing}
            aria-label="Refresh analytics"
            title="Refresh analytics"
          >
            <RefreshCw size={16} className={refreshing ? styles.spinIcon : ''} />
          </button>
          <Link to="/admin/add-showtime" className={styles.secondaryActionBtn}>
            <CalendarClock size={16} /> Schedule Showtime
          </Link>
          <Link to="/admin/add-movie" className={styles.primaryActionBtn}>
            <Plus size={17} /> Add New Title
          </Link>
        </div>
      </div>

      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div>
            <p className={styles.kpiLabel}>Gross Ticket Revenue</p>
            <p className={styles.kpiValue}>₹{(stats.totalRevenue || 0).toLocaleString('en-IN')}</p>
            <p className={styles.kpiMeta}>{stats.totalSeatsSold || 0} seats sold across confirmed orders</p>
          </div>
          <div className={`${styles.kpiIconBox} ${styles.kpiGreen}`}>
            <IndianRupee size={20} />
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div>
            <p className={styles.kpiLabel}>Confirmed M-Tickets</p>
            <p className={styles.kpiValue}>{stats.confirmedBookings || 0}</p>
            <p className={styles.kpiMeta}>
              {stats.totalBookings || 0} total orders • {stats.cancelledBookings || 0} cancelled
            </p>
          </div>
          <div className={`${styles.kpiIconBox} ${styles.kpiPink}`}>
            <Ticket size={20} />
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div>
            <p className={styles.kpiLabel}>Entertainment Catalog</p>
            <p className={styles.kpiValue}>{movies.length || stats.totalMovies}</p>
            <p className={styles.kpiMeta}>Movies, Streams, Events, Plays &amp; Sports</p>
          </div>
          <div className={`${styles.kpiIconBox} ${styles.kpiBlue}`}>
            <Film size={20} />
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div>
            <p className={styles.kpiLabel}>Active Showtimes</p>
            <p className={styles.kpiValue}>{showtimes.length || stats.totalShowtimes}</p>
            <p className={styles.kpiMeta}>{stats.totalUsers || 0} registered customer accounts</p>
          </div>
          <div className={`${styles.kpiIconBox} ${styles.kpiAmber}`}>
            <CalendarClock size={20} />
          </div>
        </div>
      </div>

      {categoryEntries.length > 0 && (
        <div className={styles.categoryStrip}>
          {categoryEntries.map(([cat, count]) => (
            <span key={cat} className={styles.categoryChip}>
              {cat === 'Activity' ? 'Activities' : `${cat}s`} <strong>{count}</strong>
            </span>
          ))}
        </div>
      )}

      <div className={styles.controlsCard}>
        <div className={styles.tabsRow} role="tablist" aria-label="Admin management sections">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'catalog'}
            className={`${styles.tabBtn} ${activeTab === 'catalog' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('catalog')}
          >
            Catalog <span className={styles.tabCount}>{movies.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'showtimes'}
            className={`${styles.tabBtn} ${activeTab === 'showtimes' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('showtimes')}
          >
            Showtimes <span className={styles.tabCount}>{showtimes.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'bookings'}
            className={`${styles.tabBtn} ${activeTab === 'bookings' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            Recent Orders <span className={styles.tabCount}>{stats.recentBookings?.length || 0}</span>
          </button>
        </div>

        <div className={styles.filtersRow}>
          <div className={styles.searchInputWrap}>
            <Search size={15} className={styles.searchInputIcon} />
            <input
              id="admin-table-search"
              name="searchTerm"
              type="search"
              className={styles.searchInput}
              placeholder={
                activeTab === 'catalog'
                  ? 'Search title, genre, language...'
                  : activeTab === 'showtimes'
                    ? 'Search movie, cinema, format...'
                    : 'Search booking ID, user, movie...'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Filter table rows"
            />
          </div>

          {activeTab === 'catalog' && (
            <select
              id="admin-category-filter"
              name="categoryFilter"
              className={styles.categorySelect}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter by entertainment category"
            >
              <option value="All">All Categories</option>
              <option value="Movie">Movie</option>
              <option value="Stream">Stream</option>
              <option value="Event">Event</option>
              <option value="Play">Play</option>
              <option value="Sport">Sport</option>
              <option value="Activity">Activity</option>
            </select>
          )}
        </div>
      </div>

      <div tabIndex={0} role="region" aria-labelledby={captionId} className={styles.tableWrapper}>
        {activeTab === 'catalog' && (
          <table
            className={styles.dataTable}
            style={cssVarStyle({
              '--label-2': '"Category"',
              '--label-3': '"Genre"',
              '--label-4': '"Languages"',
              '--label-5': '"Rating"',
              '--label-6': '"Actions"',
            })}
          >
            <caption id={captionId} className={styles.srOnly}>
              Entertainment catalog titles and actions
            </caption>
            <thead>
              <tr>
                <th scope="col">Title</th>
                <th scope="col">Category</th>
                <th scope="col">Genre</th>
                <th scope="col">Languages</th>
                <th scope="col">Rating</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCatalog.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.emptyTableState}>
                    No matching catalog titles found.
                  </td>
                </tr>
              ) : (
                filteredCatalog.map((movie) => (
                  <tr key={movie._id}>
                    <th scope="row">
                      <div className={styles.titleCell}>
                        <img
                          src={movie.posterImage || createPosterFallback(movie.title, movie.genre)}
                          alt={movie.title}
                          className={styles.miniPoster}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = createPosterFallback(movie.title, movie.genre);
                          }}
                        />
                        <div className={styles.titleTextWrap}>
                          <Link to={`/movie/${movie._id}`} className={styles.titlePrimary}>
                            {movie.title}
                          </Link>
                          <span className={styles.titleSub}>
                            {movie.certification || 'UA'} • {movie.duration || '2h 15m'}
                          </span>
                        </div>
                      </div>
                    </th>
                    <td>
                      <span className={`${styles.badge} ${styles.badgeType}`}>
                        {movie.type || 'Movie'}
                      </span>
                    </td>
                    <td>{movie.genre}</td>
                    <td>{(movie.languages || ['Hindi', 'English']).slice(0, 3).join(', ')}</td>
                    <td>
                      <span className={styles.scoreChip}>★ {movie.rating}/10</span>
                    </td>
                    <td>
                      <div className={styles.rowActions}>
                        <Link
                          to={`/admin/edit-movie/${movie._id}`}
                          className={styles.editIconBtn}
                          aria-label={`Edit ${movie.title}`}
                          title="Edit title"
                        >
                          <Edit3 size={15} />
                        </Link>
                        <button
                          type="button"
                          className={styles.deleteIconBtn}
                          aria-label={`Delete ${movie.title}`}
                          title="Delete title"
                          onClick={() =>
                            setPendingDelete({
                              kind: 'movie',
                              id: movie._id,
                              label: movie.title,
                            })
                          }
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'showtimes' && (
          <table
            className={styles.dataTable}
            style={cssVarStyle({
              '--label-2': '"Cinema & Screen"',
              '--label-3': '"Format"',
              '--label-4': '"Show Slot"',
              '--label-5': '"Base Price"',
              '--label-6': '"Actions"',
            })}
          >
            <caption id={captionId} className={styles.srOnly}>
              Scheduled cinema showtimes
            </caption>
            <thead>
              <tr>
                <th scope="col">Movie Title</th>
                <th scope="col">Cinema &amp; Screen</th>
                <th scope="col">Format</th>
                <th scope="col">Show Slot</th>
                <th scope="col">Base Price</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredShowtimes.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.emptyTableState}>
                    No scheduled showtimes match your filter.
                  </td>
                </tr>
              ) : (
                filteredShowtimes.slice(0, 80).map((st) => {
                  const movieName = getShowtimeMovieTitle(st.movieId) || 'Catalog Title';
                  return (
                    <tr key={st._id}>
                      <th scope="row">{movieName}</th>
                      <td>
                        <div className={styles.titleTextWrap}>
                          <span>{st.theatre || 'PVR: Logix City Centre Mall, Noida'}</span>
                          <span className={styles.titleSub}>{st.screen || 'AUDI 01'}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`${styles.badge} ${styles.badgeType}`}>
                          {st.format || '2D'}
                        </span>
                      </td>
                      <td>{st.startAt}</td>
                      <td>₹{st.price || 290}</td>
                      <td>
                        <button
                          type="button"
                          className={styles.deleteIconBtn}
                          aria-label={`Delete ${movieName} ${st.startAt} showtime`}
                          onClick={() =>
                            setPendingDelete({
                              kind: 'showtime',
                              id: st._id,
                              label: `${movieName} (${st.startAt})`,
                            })
                          }
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'bookings' && (
          <table
            className={styles.dataTable}
            style={cssVarStyle({
              '--label-2': '"Customer"',
              '--label-3': '"Title & Venue"',
              '--label-4': '"Show & Seats"',
              '--label-5': '"Amount"',
              '--label-6': '"Status"',
            })}
          >
            <caption id={captionId} className={styles.srOnly}>
              Recent customer M-Ticket reservations
            </caption>
            <thead>
              <tr>
                <th scope="col">Booking ID</th>
                <th scope="col">Customer</th>
                <th scope="col">Title &amp; Venue</th>
                <th scope="col">Show &amp; Seats</th>
                <th scope="col">Amount</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.emptyTableState}>
                    No recent orders yet. Book a ticket to see real-time telemetry here!
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b._id}>
                    <th scope="row">{b.bookingId}</th>
                    <td>
                      <div className={styles.titleTextWrap}>
                        <span>{b.customerName}</span>
                        {b.customerEmail && (
                          <span className={styles.titleSub}>{b.customerEmail}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className={styles.titleTextWrap}>
                        <span className={styles.titlePrimary}>{b.movieTitle}</span>
                        <span className={styles.titleSub}>{b.theatreName}</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.titleTextWrap}>
                        <span>
                          {b.showDate} • {b.showTime}
                        </span>
                        <span className={styles.titleSub}>
                          Seats: {(b.seats || []).join(', ')}
                        </span>
                      </div>
                    </td>
                    <td>
                      <strong>₹{b.total}</strong>
                    </td>
                    <td>
                      <span
                        className={`${styles.badge} ${
                          b.status === 'CANCELLED' ? styles.badgeCancelled : styles.badgeConfirmed
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        title={pendingDelete?.kind === 'movie' ? 'Delete catalog title?' : 'Delete showtime slot?'}
        description={
          pendingDelete
            ? `Are you sure you want to permanently remove "${pendingDelete.label}"? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete Permanently"
        cancelLabel="Cancel"
        variant="danger"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
};

export default AdminDashboard;
