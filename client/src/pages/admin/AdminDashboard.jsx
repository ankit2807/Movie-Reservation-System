import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { fetchMoviesStart, fetchMoviesSuccess } from '../../redux/movieSlice';
import { Trash2, Plus } from 'lucide-react';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { movies } = useSelector((state) => state.movie);

  useEffect(() => {
    const getMovies = async () => {
      dispatch(fetchMoviesStart());
      const res = await api.get('/movie');
      dispatch(fetchMoviesSuccess(res.data));
    };
    getMovies();
  }, [dispatch]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this movie?')) {
      try {
        await api.delete(`/movie/${id}`);
        // Refresh list
        const res = await api.get('/movie');
        dispatch(fetchMoviesSuccess(res.data));
      } catch (err) {
        alert('Failed to delete movie');
      }
    }
  };

  return (
    <div className="container" style={{paddingTop: '32px'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
        <h1>Admin Dashboard</h1>
        <div style={{display: 'flex', gap: '12px'}}>
            <Link to="/admin/add-movie" className="btn btn-primary" style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                <Plus size={18} /> Add Movie
            </Link>
            <Link to="/admin/add-showtime" className="btn" style={{border: '1px solid #ccc'}}>
                Add Showtime
            </Link>
        </div>
      </div>

      <table style={{width: '100%', borderCollapse: 'collapse', background: 'white', border: '1px solid #eee'}}>
        <thead>
          <tr style={{background: '#f5f5f5', textAlign: 'left'}}>
            <th style={{padding: '12px'}}>Title</th>
            <th style={{padding: '12px'}}>Genre</th>
            <th style={{padding: '12px'}}>Rating</th>
            <th style={{padding: '12px'}}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {movies.map(movie => (
            <tr key={movie._id} style={{borderBottom: '1px solid #eee'}}>
              <td style={{padding: '12px'}}>{movie.title}</td>
              <td style={{padding: '12px'}}>{movie.genre}</td>
              <td style={{padding: '12px'}}>{movie.rating}</td>
              <td style={{padding: '12px'}}>
                <button onClick={() => handleDelete(movie._id)} style={{color: 'red', background: 'none'}}>
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
