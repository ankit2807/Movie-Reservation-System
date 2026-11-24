import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import styles from '../../styles/Auth.module.css';

const AddMovie = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '2h 25m',
    genre: '',
    rating: '8.5',
    type: 'Movie',
    releaseDate: '',
    certification: 'UA',
    format: '2D, IMAX 2D, 4DX',
    languages: 'Hindi, English',
    posterImage: '',
    backdropImage: '',
  });

  const [castMember, setCastMember] = useState({ name: '', role: '', image: '' });
  const [castList, setCastList] = useState([]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const addCast = () => {
    if (!castMember.name.trim()) {
      alert('Cast member name is required');
      return;
    }
    setCastList((prev) => [...prev, { ...castMember, name: castMember.name.trim() }]);
    setCastMember({ name: '', role: '', image: '' });
  };

  const removeCast = (index) => {
    setCastList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const languagesArray = formData.languages
        .split(',')
        .map((l) => l.trim())
        .filter(Boolean);

      await api.post('/movie', {
        ...formData,
        languages: languagesArray.length > 0 ? languagesArray : ['Hindi', 'English'],
        cast: castList,
      });
      alert('Title added successfully');
      navigate('/admin/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding movie');
    }
  };

  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <div className={styles.authBox} style={{ maxWidth: '640px', margin: '0 auto' }}>
        <h2>Add New Title</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="add-title">Title</label>
            <input id="add-title" name="title" value={formData.title} onChange={handleChange} required />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="add-description">Description</label>
            <textarea
              id="add-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #e0e0e0' }}
              rows={3}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className={styles.inputGroup}>
              <label htmlFor="add-duration">Duration</label>
              <input
                id="add-duration"
                name="duration"
                placeholder="2h 30m"
                value={formData.duration}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="add-genre">Genre</label>
              <input
                id="add-genre"
                name="genre"
                placeholder="Action, Adventure, Sci-Fi"
                value={formData.genre}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div className={styles.inputGroup}>
              <label htmlFor="add-rating">Audience Rating (1–10)</label>
              <input
                id="add-rating"
                type="number"
                step="0.1"
                min="1"
                max="10"
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="add-cert">Certification</label>
              <select
                id="add-cert"
                name="certification"
                value={formData.certification}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px' }}
              >
                <option value="U">U</option>
                <option value="UA">UA</option>
                <option value="UA13+">UA13+</option>
                <option value="UA16+">UA16+</option>
                <option value="A">A</option>
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="add-release">Release Date</label>
              <input
                id="add-release"
                type="date"
                name="releaseDate"
                value={formData.releaseDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className={styles.inputGroup}>
              <label htmlFor="add-type">Category</label>
              <select
                id="add-type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px' }}
              >
                <option value="Movie">Movie</option>
                <option value="Stream">Stream</option>
                <option value="Event">Event</option>
                <option value="Play">Play</option>
                <option value="Sport">Sport</option>
                <option value="Activity">Activity</option>
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="add-languages">Languages (comma-separated)</label>
              <input
                id="add-languages"
                name="languages"
                value={formData.languages}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="add-format">Formats</label>
            <input id="add-format" name="format" value={formData.format} onChange={handleChange} />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="add-poster">Poster Image URL</label>
            <input id="add-poster" name="posterImage" value={formData.posterImage} onChange={handleChange} />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="add-backdrop">Backdrop Image URL (Optional)</label>
            <input id="add-backdrop" name="backdropImage" value={formData.backdropImage} onChange={handleChange} />
          </div>

          <div className={styles.inputGroup} style={{ background: '#f9f9f9', padding: '16px', borderRadius: '4px' }}>
            <label>Cast</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
              <input
                placeholder="Name"
                value={castMember.name}
                onChange={(e) => setCastMember({ ...castMember, name: e.target.value })}
              />
              <input
                placeholder="Role"
                value={castMember.role}
                onChange={(e) => setCastMember({ ...castMember, role: e.target.value })}
              />
            </div>
            <input
              placeholder="Image URL (Optional)"
              value={castMember.image}
              onChange={(e) => setCastMember({ ...castMember, image: e.target.value })}
              style={{ width: '100%', marginBottom: '8px' }}
            />
            <button type="button" onClick={addCast} className="btn" style={{ background: '#333', color: 'white' }}>
              + Add Cast Member
            </button>

            <div style={{ marginTop: '16px' }}>
              {castList.map((c, i) => (
                <div
                  key={`${c.name}-${i}`}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    borderBottom: '1px solid #ddd',
                    padding: '4px 0',
                  }}
                >
                  <span>{c.name} ({c.role || 'Actor'})</span>
                  <button
                    type="button"
                    onClick={() => removeCast(i)}
                    style={{ color: '#dc2626', background: 'none', cursor: 'pointer' }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary">
            Save Title
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddMovie;
