import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, Plus } from 'lucide-react';
import api from '../../api/axios';
import { useAppDispatch } from '../../redux/hooks';
import { showToast } from '../../redux/locationSlice';
import { createPosterFallback } from '../../utils/moviebookData';
import { getApiErrorMessage, Movie, PersonCredit } from '../../types';
import styles from '../../styles/AdminDashboard.module.css';

const toIsoDateInput = (raw?: string): string => {
  if (!raw) return new Date().toISOString().split('T')[0];
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
  return d.toISOString().split('T')[0];
};

interface UploadResponse {
  files?: Array<{ url: string }>;
}

const AddMovie: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [loadingMovie, setLoadingMovie] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [uploadingPoster, setUploadingPoster] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    tagline: '',
    description: '',
    duration: '2h 25m',
    genre: '',
    rating: '8.7',
    type: 'Movie',
    releaseDate: new Date().toISOString().split('T')[0],
    certification: 'UA13+',
    format: '2D, IMAX 2D, 4DX',
    languages: 'Hindi, English',
    posterImage: '',
    backdropImage: '',
  });

  const [castMember, setCastMember] = useState({ name: '', role: '', image: '' });
  const [castList, setCastList] = useState<PersonCredit[]>([]);

  const [crewMember, setCrewMember] = useState({ name: '', role: '' });
  const [crewList, setCrewList] = useState<PersonCredit[]>([]);

  useEffect(() => {
    if (!isEditMode) return undefined;
    let isMounted = true;

    api
      .get<Movie>(`/movie/find/${id}`)
      .then((res) => {
        if (!isMounted || !res.data) return;
        const m = res.data;
        setFormData({
          title: m.title || '',
          tagline: m.tagline || '',
          description: m.description || '',
          duration: m.duration || '2h 25m',
          genre: m.genre || '',
          rating: String(m.rating || '8.7'),
          type: m.type || 'Movie',
          releaseDate: toIsoDateInput(m.releaseDate),
          certification: m.certification || 'UA',
          format: m.format || '2D, IMAX 2D',
          languages: Array.isArray(m.languages) ? m.languages.join(', ') : 'Hindi, English',
          posterImage: m.posterImage || '',
          backdropImage: m.backdropImage || '',
        });
        setCastList(Array.isArray(m.cast) ? m.cast : []);
        setCrewList(Array.isArray(m.crew) ? m.crew : []);
      })
      .catch(() => {
        if (isMounted) {
          dispatch(showToast({ message: 'Could not load title for editing.', type: 'error' }));
        }
      })
      .finally(() => {
        if (isMounted) setLoadingMovie(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, isEditMode, dispatch]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPoster(true);
    try {
      const uploadForm = new FormData();
      uploadForm.append('image', file);
      const res = await api.post<UploadResponse>('/upload', uploadForm);
      const uploadedUrl = res.data?.files?.[0]?.url;
      if (uploadedUrl) {
        setFormData((prev) => ({
          ...prev,
          posterImage: uploadedUrl,
          backdropImage: prev.backdropImage || uploadedUrl,
        }));
        dispatch(showToast({ message: 'Poster image uploaded!', type: 'success' }));
      }
    } catch (err: unknown) {
      dispatch(
        showToast({
          message: getApiErrorMessage(err, 'Poster upload failed (max 1MB JPG/PNG/WEBP).'),
          type: 'error',
        })
      );
    } finally {
      setUploadingPoster(false);
      e.target.value = '';
    }
  };

  const addCast = () => {
    if (!castMember.name.trim()) {
      dispatch(showToast({ message: 'Enter a cast member name first.', type: 'info' }));
      return;
    }
    setCastList((prev) => [
      ...prev,
      {
        name: castMember.name.trim(),
        role: castMember.role.trim() || 'Actor',
        image: castMember.image.trim(),
      },
    ]);
    setCastMember({ name: '', role: '', image: '' });
  };

  const addCrew = () => {
    if (!crewMember.name.trim()) {
      dispatch(showToast({ message: 'Enter a crew member name first.', type: 'info' }));
      return;
    }
    setCrewList((prev) => [
      ...prev,
      {
        name: crewMember.name.trim(),
        role: crewMember.role.trim() || 'Director',
      },
    ]);
    setCrewMember({ name: '', role: '' });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    try {
      const languagesArray = formData.languages
        .split(',')
        .map((l) => l.trim())
        .filter(Boolean);

      const payload = {
        ...formData,
        languages: languagesArray.length > 0 ? languagesArray : ['Hindi', 'English'],
        cast: castList,
        crew: crewList,
      };

      if (isEditMode) {
        await api.patch(`/movie/${id}`, payload);
        dispatch(showToast({ message: `"${formData.title}" updated successfully!`, type: 'success' }));
      } else {
        await api.post('/movie', payload);
        dispatch(showToast({ message: `"${formData.title}" added to catalog!`, type: 'success' }));
      }
      navigate('/admin/dashboard');
    } catch (err: unknown) {
      dispatch(
        showToast({
          message: getApiErrorMessage(err, 'Failed to save catalog title.'),
          type: 'error',
        })
      );
    } finally {
      setSaving(false);
    }
  };

  if (loadingMovie) {
    return (
      <div className="container" style={{ padding: '64px 16px', textAlign: 'center', color: '#64748b' }}>
        Loading title details...
      </div>
    );
  }

  return (
    <div className={`container ${styles.formPage}`}>
      <div className={styles.formCard}>
        <div className={styles.formTopRow}>
          <div>
            <p className={styles.eyebrow}>{isEditMode ? 'Edit Catalog Item' : 'New Catalog Item'}</p>
            <h1 className={styles.pageTitle} style={{ fontSize: '22px' }}>
              {isEditMode ? `Edit "${formData.title}"` : 'Publish Entertainment Title'}
            </h1>
          </div>
          <Link to="/admin/dashboard" className={styles.backLink}>
            <ArrowLeft size={15} /> Back to Dashboard
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGridTwo}>
            <div className={styles.fieldGroup}>
              <label htmlFor="add-title">Title *</label>
              <input
                id="add-title"
                name="title"
                placeholder="e.g. Ramayana: Rise of a Legend"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="add-tagline">Promotional Tagline</label>
              <input
                id="add-tagline"
                name="tagline"
                placeholder="Experience it in IMAX & Dolby Atmos"
                value={formData.tagline}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="add-description">Synopsis / Description *</label>
            <textarea
              id="add-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={3}
              placeholder="Write a compelling summary for moviegoers..."
            />
          </div>

          <div className={styles.formGridThree}>
            <div className={styles.fieldGroup}>
              <label htmlFor="add-type">Category</label>
              <select id="add-type" name="type" value={formData.type} onChange={handleChange}>
                <option value="Movie">Movie</option>
                <option value="Stream">Stream</option>
                <option value="Event">Event</option>
                <option value="Play">Play</option>
                <option value="Sport">Sport</option>
                <option value="Activity">Activity</option>
              </select>
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="add-duration">Runtime / Duration *</label>
              <input
                id="add-duration"
                name="duration"
                placeholder="2h 35m"
                value={formData.duration}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="add-genre">Genres *</label>
              <input
                id="add-genre"
                name="genre"
                placeholder="Action, Sci-Fi, Thriller"
                value={formData.genre}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles.formGridThree}>
            <div className={styles.fieldGroup}>
              <label htmlFor="add-rating">Audience Rating (1–10) *</label>
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
            <div className={styles.fieldGroup}>
              <label htmlFor="add-cert">Certification</label>
              <select
                id="add-cert"
                name="certification"
                value={formData.certification}
                onChange={handleChange}
              >
                <option value="U">U</option>
                <option value="UA">UA</option>
                <option value="UA13+">UA13+</option>
                <option value="UA16+">UA16+</option>
                <option value="A">A</option>
              </select>
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="add-release">Release / Event Date *</label>
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

          <div className={styles.formGridTwo}>
            <div className={styles.fieldGroup}>
              <label htmlFor="add-languages">Languages (comma-separated)</label>
              <input
                id="add-languages"
                name="languages"
                value={formData.languages}
                onChange={handleChange}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="add-format">Formats</label>
              <input id="add-format" name="format" value={formData.format} onChange={handleChange} />
            </div>
          </div>

          <div className={styles.posterUploadRow}>
            <div className={styles.posterPreviewBox}>
              {formData.posterImage ? (
                <img
                  src={formData.posterImage}
                  alt="Poster preview"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = createPosterFallback(formData.title || 'Poster');
                  }}
                />
              ) : (
                <span>Poster Preview</span>
              )}
            </div>
            <div style={{ flex: 1, width: '100%' }}>
              <div className={styles.fieldGroup} style={{ marginBottom: '10px' }}>
                <label htmlFor="add-poster">Poster Image URL</label>
                <input
                  id="add-poster"
                  name="posterImage"
                  placeholder="https://... or upload below"
                  value={formData.posterImage}
                  onChange={handleChange}
                />
                <label className={styles.uploadBtnLabel}>
                  <Upload size={14} />
                  <span>
                    {uploadingPoster ? 'Uploading...' : 'Upload Poster File (JPG/PNG/WEBP ≤1MB)'}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePosterUpload}
                    disabled={uploadingPoster}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
              <div className={styles.fieldGroup} style={{ marginBottom: 0 }}>
                <label htmlFor="add-backdrop">Backdrop Banner URL (Optional)</label>
                <input
                  id="add-backdrop"
                  name="backdropImage"
                  placeholder="https://..."
                  value={formData.backdropImage}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className={styles.peopleBuilderBox}>
            <span style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '10px' }}>
              Lead Cast
            </span>
            <div className={styles.formGridThree}>
              <div className={styles.fieldGroup} style={{ marginBottom: '8px' }}>
                <input
                  id="cast-name"
                  name="castName"
                  aria-label="Cast actor name"
                  placeholder="Actor Name"
                  value={castMember.name}
                  onChange={(e) => setCastMember({ ...castMember, name: e.target.value })}
                />
              </div>
              <div className={styles.fieldGroup} style={{ marginBottom: '8px' }}>
                <input
                  id="cast-role"
                  name="castRole"
                  aria-label="Cast character or role"
                  placeholder="Character / Role"
                  value={castMember.role}
                  onChange={(e) => setCastMember({ ...castMember, role: e.target.value })}
                />
              </div>
              <div className={styles.fieldGroup} style={{ marginBottom: '8px' }}>
                <input
                  id="cast-image"
                  name="castImage"
                  aria-label="Cast portrait image URL"
                  placeholder="Portrait URL (Optional)"
                  value={castMember.image}
                  onChange={(e) => setCastMember({ ...castMember, image: e.target.value })}
                />
              </div>
            </div>
            <button type="button" onClick={addCast} className={styles.secondaryActionBtn}>
              <Plus size={14} /> Add Cast Member
            </button>
            {castList.length > 0 && (
              <div className={styles.peopleChipsList}>
                {castList.map((c, idx) => (
                  <span key={`${c.name}-${idx}`} className={styles.personChip}>
                    {c.name} ({c.role || 'Actor'})
                    <button
                      type="button"
                      aria-label={`Remove ${c.name}`}
                      onClick={() => setCastList((prev) => prev.filter((_, i) => i !== idx))}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className={styles.peopleBuilderBox}>
            <span style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '10px' }}>
              Key Crew (Director, Producer, Music)
            </span>
            <div className={styles.formGridTwo}>
              <div className={styles.fieldGroup} style={{ marginBottom: '8px' }}>
                <input
                  id="crew-name"
                  name="crewName"
                  aria-label="Crew member name"
                  placeholder="Crew Name"
                  value={crewMember.name}
                  onChange={(e) => setCrewMember({ ...crewMember, name: e.target.value })}
                />
              </div>
              <div className={styles.fieldGroup} style={{ marginBottom: '8px' }}>
                <input
                  id="crew-role"
                  name="crewRole"
                  aria-label="Crew member role"
                  placeholder="Role (e.g. Director)"
                  value={crewMember.role}
                  onChange={(e) => setCrewMember({ ...crewMember, role: e.target.value })}
                />
              </div>
            </div>
            <button type="button" onClick={addCrew} className={styles.secondaryActionBtn}>
              <Plus size={14} /> Add Crew Member
            </button>
            {crewList.length > 0 && (
              <div className={styles.peopleChipsList}>
                {crewList.map((c, idx) => (
                  <span key={`${c.name}-${idx}`} className={styles.personChip}>
                    {c.name} ({c.role || 'Crew'})
                    <button
                      type="button"
                      aria-label={`Remove ${c.name}`}
                      onClick={() => setCrewList((prev) => prev.filter((_, i) => i !== idx))}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <Link to="/admin/dashboard" className={styles.secondaryActionBtn}>
              Cancel
            </Link>
            <button type="submit" disabled={saving} className={styles.primaryActionBtn}>
              {saving ? 'Saving...' : isEditMode ? 'Update Title' : 'Publish Title'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMovie;
