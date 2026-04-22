'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginUser } from './actions';

export default function Login() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await loginUser(null, formData);
      
      if (result.error) {
        setError(result.error);
      } else if (result.success && result.redirectUrl) {
        router.push(result.redirectUrl);
      }
    } catch (err) {
      setError('Gagal menghubungi server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80') no-repeat center center/cover", minHeight: '100vh' }}>
      <div className="auth-wrapper" style={{ background: "rgba(46,125,50,0.3)", backdropFilter: "blur(5px)" }}>
        <div className="auth-card animate-fade-in glass" style={{ maxWidth: 420 }}>
          <div className="auth-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          </div>
          <h1 className="auth-title">RS Tentara P. Siantar</h1>
          <p className="auth-subtitle">Portal Informasi Pelayanan & Manajemen Terpadu</p>
          
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" htmlFor="username">Username</label>
              <input 
                type="text" 
                id="username" 
                name="username"
                className="form-control" 
                required 
                placeholder="Masukkan username"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input 
                type="password" 
                id="password" 
                name="password"
                className="form-control" 
                required 
                placeholder="Masukkan password"
              />
            </div>
            
            <button type="submit" className="btn btn-primary btn-block mb-4" disabled={loading}>
              {loading ? 'Memproses...' : 'Masuk / Login'}
            </button>
          </form>
          
          <div style={{ display: 'flex', gap: 12, flexDirection: 'column', marginTop: 8 }}>
            <Link href="/register" className="btn btn-outline btn-block" style={{ padding: '12px', textDecoration: 'none' }}>Pendaftaran Pasien</Link>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: 0 }}>
              Belum punya akun? <br />
              <Link href="/register" style={{ color: "var(--primary-color)", fontWeight: "600", textDecoration: "none" }}>
                Daftar sebagai Pasien Baru
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
