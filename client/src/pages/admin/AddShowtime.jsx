import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import styles from '../../styles/Auth.module.css';

const AddShowtime = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [formData, setFormData] = useState({
    movieId: '',
    theatre: 'PVR: Logix City Centre Mall, Noida',
    screen: 'AUDI 01',
    format: 'IMAX 2D',
    price: 320,
    startAt: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await api.get('/movie');
        setMovies(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to fetch movies:', err);
      }
    };
    fetchMovies();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/showtimes', {
        ...formData,
        price: Number(formData.price) || 250,
      });
      alert('Showtime added successfully');
      navigate('/admin/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding showtime');
    }
  };

  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <div className={styles.authBox} style={{ maxWidth: '520px', margin: '0 auto' }}>
        <h2>Add Showtime</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="st-movie">Select Movie</label>
            <select
              id="st-movie"
              name="movieId"
              value={formData.movieId}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '10px' }}
            >
              <option value="">-- Select Movie --</option>
              {movies.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="st-theatre">Theatre</label>
            <input
              id="st-theatre"
              name="theatre"
              value={formData.theatre}
              onChange={handleChange}
              required
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div className={styles.inputGroup}>
              <label htmlFor="st-screen">Screen</label>
              <input id="st-screen" name="screen" value={formData.screen} onChange={handleChange} required />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="st-format">Format</label>
              <input id="st-format" name="format" value={formData.format} onChange={handleChange} required />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="st-price">Base Price (₹)</label>
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
          <div className={styles.inputGroup}>
            <label htmlFor="st-time">Start Time (e.g. 07:30 PM)</label>
            <input
              id="st-time"
              name="startAt"
              placeholder="07:30 PM"
              value={formData.startAt}
              onChange={handleChange}
              required
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className={styles.inputGroup}>
              <label htmlFor="st-start-date">Start Date</label>
              <input
                id="st-start-date"
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="st-end-date">End Date</label>
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

          <button type="submit" className="btn btn-primary">
            Save Showtime
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddShowtime;
