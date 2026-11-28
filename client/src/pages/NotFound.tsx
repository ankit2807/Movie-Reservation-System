import React from 'react';
import { Link } from 'react-router-dom';
import { Film, ArrowLeft, Search } from 'lucide-react';

const NotFound: React.FC = () => (
  <main
    className="container"
    style={{
      minHeight: '65vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 16px',
    }}
  >
    <div
      style={{
        maxWidth: '500px',
        width: '100%',
        background: '#ffffff',
        borderRadius: '16px',
        padding: '40px 32px',
        textAlign: 'center',
        border: '1px solid #e2e8f0',
        boxShadow: '0 8px 28px rgba(15, 23, 42, 0.06)',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '16px',
          background: '#fff0f3',
          color: '#f84464',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '18px',
        }}
      >
        <Film size={32} />
      </div>
      <p
        style={{
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '1.2px',
          color: '#f84464',
          textTransform: 'uppercase',
          marginBottom: '6px',
        }}
      >
        404 • Screen Not Found
      </p>
      <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>
        Looks like the reel ended here
      </h1>
      <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6, marginBottom: '26px' }}>
        The page or showtime link you followed may have moved or expired. Explore movies, concerts,
        sports, and plays now playing in your city.
      </p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link
          to="/"
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', borderRadius: '8px' }}
        >
          <ArrowLeft size={16} /> Explore Movies
        </Link>
        <Link
          to="/search"
          className="btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            background: '#ffffff',
            color: '#334155',
          }}
        >
          <Search size={16} /> Search Catalog
        </Link>
      </div>
    </div>
  </main>
);

export default NotFound;
