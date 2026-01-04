import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import styles from '../../styles/Auth.module.css';

const AddShowtime = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [formData, setFormData] = useState({
    movieId: '',
    startAt: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    // Fetch movies for dropdown
    const fetchMovies = async () => {
        const res = await api.get('/movie');
        setMovies(res.data);
    };
    fetchMovies();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/showtimes', formData);
      alert('Showtime Added');
      navigate('/admin/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding showtime');
    }
  };

  return (
    <div className="container" style={{padding: '40px 0'}}>
      <div className={styles.authBox} style={{maxWidth: '500px', margin: '0 auto'}}>
        <h2>Add Showtime</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label>Select Movie</label>
            <select name="movieId" onChange={handleChange} required style={{width: '100%', padding: '10px'}}>
                <option value="">-- Select Movie --</option>
                {movies.map(m => (
                    <option key={m._id} value={m._id}>{m.title}</option>
                ))}
            </select>
          </div>
          <div className={styles.inputGroup}>
            <label>Start Time (HH:MM)</label>
            <input name="startAt" placeholder="18:00" onChange={handleChange} required />
          </div>
          <div className={styles.inputGroup}>
            <label>Start Date</label>
            <input type="date" name="startDate" onChange={handleChange} required />
          </div>
          <div className={styles.inputGroup}>
            <label>End Date</label>
            <input type="date" name="endDate" onChange={handleChange} required />
          </div>
          
          <button type="submit" className="btn btn-primary">Save Showtime</button>
        </form>
      </div>
    </div>
  );
};

export default AddShowtime;
