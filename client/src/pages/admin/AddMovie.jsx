import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import styles from '../../styles/Auth.module.css';

const AddMovie = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    genre: '',
    rating: 'PG-13',
    type: 'Movie',
    releaseDate: '',
    certification: 'U/A',
    posterImage: ''
  });

  const [castMember, setCastMember] = useState({ name: '', role: '', image: '' });
  const [castList, setCastList] = useState([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addCast = () => {
      if (!castMember.name) return alert("Name required");
      setCastList([...castList, castMember]);
      setCastMember({ name: '', role: '', image: '' });
  };

  const removeCast = (index) => {
      setCastList(castList.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/movie', {
          ...formData,
          cast: castList
      });
      alert('Movie Added');
      navigate('/admin/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding movie');
    }
  };

  return (
    <div className="container" style={{padding: '40px 0'}}>
      <div className={styles.authBox} style={{maxWidth: '600px', margin: '0 auto'}}>
        <h2>Add New Movie</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label>Title</label>
            <input name="title" onChange={handleChange} required />
          </div>
          <div className={styles.inputGroup}>
            <label>Description</label>
            <textarea name="description" onChange={handleChange} required style={{width: '100%', padding: '8px', border: '1px solid #e0e0e0'}} rows={3} />
          </div>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
            <div className={styles.inputGroup}>
                <label>Duration (HH:MM)</label>
                <input name="duration" placeholder="02:30" onChange={handleChange} required />
            </div>
            <div className={styles.inputGroup}>
                <label>Genre</label>
                <input name="genre" onChange={handleChange} required />
            </div>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
            <div className={styles.inputGroup}>
                <label>Rating</label>
                <select name="rating" onChange={handleChange} style={{width: '100%', padding: '10px'}}>
                    <option value="G">G</option>
                    <option value="PG">PG</option>
                    <option value="PG-13">PG-13</option>
                    <option value="R">R</option>
                    <option value="NC-17">NC-17</option>
                </select>
            </div>
            <div className={styles.inputGroup}>
                <label>Release Date</label>
                <input type="date" name="releaseDate" onChange={handleChange} required />
            </div>
          </div>
          <div className={styles.inputGroup}>
            <label>Type</label>
            <select name="type" onChange={handleChange} style={{width: '100%', padding: '10px'}}>
                <option value="Movie">Movie</option>
                <option value="Event">Event</option>
                <option value="Play">Play</option>
                <option value="Sport">Sport</option>
                <option value="Activity">Activity</option>
                <option value="Stream">Stream</option>
            </select>
          </div>
          <div className={styles.inputGroup}>
            <label>Poster Image URL</label>
            <input name="posterImage" onChange={handleChange} />
          </div>
          <div className={styles.inputGroup}>
            <label>Certification</label>
            <input name="certification" onChange={handleChange} required />
          </div>

          <div className={styles.inputGroup} style={{background: '#f9f9f9', padding: '16px', borderRadius: '4px'}}>
              <label>Cast & Crew</label>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px'}}>
                  <input placeholder="Name" value={castMember.name} onChange={e => setCastMember({...castMember, name: e.target.value})} />
                  <input placeholder="Role" value={castMember.role} onChange={e => setCastMember({...castMember, role: e.target.value})} />
              </div>
              <input placeholder="Image URL (Optional)" value={castMember.image} onChange={e => setCastMember({...castMember, image: e.target.value})} style={{width: '100%', marginBottom: '8px'}} />
              <button type="button" onClick={addCast} className="btn" style={{background: '#333', color: 'white'}}>+ Add Cast Member</button>
              
              <div style={{marginTop: '16px'}}>
                  {castList.map((c, i) => (
                      <div key={i} style={{display: 'flex', justifyContent: 'space-between', fontSize: '12px', borderBottom: '1px solid #ddd', padding: '4px 0'}}>
                          <span>{c.name} ({c.role})</span>
                          <span onClick={() => removeCast(i)} style={{color: 'red', cursor: 'pointer'}}>Remove</span>
                      </div>
                  ))}
              </div>
          </div>
          
          <button type="submit" className="btn btn-primary">Save Movie</button>
        </form>
      </div>
    </div>
  );
};

export default AddMovie;
