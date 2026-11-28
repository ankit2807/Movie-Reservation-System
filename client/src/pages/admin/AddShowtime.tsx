import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CalendarClock } from 'lucide-react';
import api from '../../api/axios';
import { useAppDispatch } from '../../redux/hooks';
import { showToast } from '../../redux/locationSlice';
import { getApiErrorMessage, Movie } from '../../types';
import styles from '../../styles/AdminDashboard.module.css';

const getTodayIso = (): string => new Date().toISOString().split('T')[0];
const getFutureIso = (days = 14): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const POPULAR_VENUES = [
  'PVR: Logix City Centre Mall, Noida',
  'INOX: DLF Mall of India, Sector 18, Noida',
  'Cinépolis: Grand Venice Mall, Greater Noida',
  'PVR Director’s Cut: Ambience Mall, Vasant Kunj',
  'PVR ICON: Phoenix Palladium, Lower Parel, Mumbai',
  'INOX Megaplex: Mall of Asia, Bengaluru',
];

const AddShowtime: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    movieId: '',
    theatre: POPULAR_VENUES[0],
    screen: 'AUDI 01',
    format: 'IMAX 2D',
    price: 320,
    startAt: '07:30 PM',
    startDate: getTodayIso(),
    endDate: getFutureIso(14),
  });

  useEffect(() => {
    let isMounted = true;
    api
      .get<Movie[]>('/movie')
      .then((res) => {
        if (isMounted) {
          setMovies(Array.isArray(res.data) ? res.data : []);
        }
      })
      .catch(() => {
        if (isMounted) {
          dispatch(showToast({ message: 'Unable to load catalog list.', type: 'error' }));
        }
      });
    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/showtimes', {
        ...formData,
        price: Number(formData.price) || 290,
      });
      dispatch(showToast({ message: 'Showtime slot scheduled successfully!', type: 'success' }));
      navigate('/admin/dashboard');
    } catch (err: unknown) {
      dispatch(
        showToast({
          message: getApiErrorMessage(err, 'Error scheduling showtime.'),
          type: 'error',
        })
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`container ${styles.formPage}`}>
      <div className={styles.formCard} style={{ maxWidth: '640px' }}>
        <div className={styles.formTopRow}>
          <div>
            <p className={styles.eyebrow}>Cinema Operations</p>
            <h1 className={styles.pageTitle} style={{ fontSize: '22px' }}>
              Schedule Multiplex Showtime
            </h1>
          </div>
          <Link to="/admin/dashboard" className={styles.backLink}>
            <ArrowLeft size={15} /> Back to Dashboard
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.fieldGroup}>
            <label htmlFor="st-movie">Select Catalog Title *</label>
            <select
              id="st-movie"
              name="movieId"
              value={formData.movieId}
              onChange={handleChange}
              required
            >
              <option value="">-- Choose a Movie or Event --</option>
              {movies.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.title} ({m.type || 'Movie'})
                </option>
              ))}
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="st-theatre">Multiplex / Venue *</label>
            <input
              id="st-theatre"
              name="theatre"
              list="venue-presets"
              value={formData.theatre}
              onChange={handleChange}
              required
            />
            <datalist id="venue-presets">
              {POPULAR_VENUES.map((v) => (
                <option key={v} value={v} />
              ))}
            </datalist>
          </div>

          <div className={styles.formGridThree}>
            <div className={styles.fieldGroup}>
              <label htmlFor="st-screen">Auditorium / Screen *</label>
              <input
                id="st-screen"
                name="screen"
                value={formData.screen}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="st-format">Projection Format *</label>
              <select id="st-format" name="format" value={formData.format} onChange={handleChange}>
                <option value="2D">2D</option>
                <option value="3D">3D</option>
                <option value="IMAX 2D">IMAX 2D</option>
                <option value="IMAX 3D">IMAX 3D</option>
                <option value="4DX">4DX</option>
                <option value="ICE">ICE</option>
              </select>
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="st-price">Base Ticket Price (₹) *</label>
              <input
                id="st-price"
                type="number"
                min="50"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles.formGridThree}>
            <div className={styles.fieldGroup}>
              <label htmlFor="st-time">Show Start Time *</label>
              <input
                id="st-time"
                name="startAt"
                placeholder="07:30 PM"
                value={formData.startAt}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="st-start-date">Window Start Date *</label>
              <input
                id="st-start-date"
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="st-end-date">Window End Date *</label>
              <input
                id="st-end-date"
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <Link to="/admin/dashboard" className={styles.secondaryActionBtn}>
              Cancel
            </Link>
            <button type="submit" disabled={saving} className={styles.primaryActionBtn}>
              <CalendarClock size={16} />
              {saving ? 'Scheduling...' : 'Save Showtime'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddShowtime;
