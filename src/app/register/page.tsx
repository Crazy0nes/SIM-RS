'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerPasien } from './actions';

export default function Register() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    // Mencegah Next.js / Vercel mendeteksi payload file berukuran besar yang bisa membuat server crash HTTP 413.
    // Karena sebagai MVP kita hanya mengoleksi namanya saja, kita pisahkan nama filenya:
    const ktpFile = formData.get('dokumen_ktp') as File;
    const bpjsFile = formData.get('dokumen_bpjs') as File;

    if (ktpFile && ktpFile.name) {
      formData.set('ktp_name', ktpFile.name);
    }
    if (bpjsFile && bpjsFile.name) {
      formData.set('bpjs_name', bpjsFile.name);
    }

    // Cabut file gambar aslinya yang bisa mencapai bermega-mega byte dari payload pengiriman form
    formData.delete('dokumen_ktp');
    formData.delete('dokumen_bpjs');

    try {
      const result = await registerPasien(null, formData);
      
      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        setSuccess(result.message || 'Pendaftaran Berhasil!');
        setTimeout(() => router.push('/login'), 2000);
      }
    } catch (err) {
      setError('Gagal menghubungi server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80') no-repeat center center/cover", minHeight: '100vh' }}>
      <div className="auth-wrapper" style={{ background: "rgba(46,125,50,0.3)", backdropFilter: "blur(5px)", padding: "2rem 0" }}>
        <div className="auth-card animate-fade-in glass" style={{ maxWidth: '600px', padding: '2rem' }}>
          <h1 className="auth-title">Daftar Pasien Baru</h1>
          <p className="auth-subtitle">Daftarkan diri Anda untuk pelayanan online terpadu</p>
          
          {error && <div className="alert alert-danger">{error}</div>}
          {success && (
            <div className="alert alert-success">
              {success} <br/>
              <Link href="/login" style={{ textDecoration: 'underline' }}>Login di sini</Link>
            </div>
          )}

          {!success && (
            <form onSubmit={handleRegister}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="username">Username Aplikasi <span style={{color:'red'}}>*</span></label>
                  <input type="text" id="username" name="username" className="form-control" required />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="password">Password <span style={{color:'red'}}>*</span></label>
                  <input type="password" id="password" name="password" className="form-control" required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="nama_lengkap">Nama Lengkap (Sesuai KTP) <span style={{color:'red'}}>*</span></label>
                <input type="text" id="nama_lengkap" name="nama_lengkap" className="form-control" required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="nik">Nomor NIK <span style={{color:'red'}}>*</span></label>
                  <input type="number" id="nik" name="nik" className="form-control" required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="no_bpjs">Nomor BPJS (Opsional)</label>
                  <input type="number" id="no_bpjs" name="no_bpjs" className="form-control" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="dokumen_ktp">Upload KTP <span style={{color:'red'}}>*</span></label>
                  <input type="file" id="dokumen_ktp" name="dokumen_ktp" className="form-control" required accept="image/*,application/pdf" />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="dokumen_bpjs">Upload BPJS</label>
                  <input type="file" id="dokumen_bpjs" name="dokumen_bpjs" className="form-control" accept="image/*,application/pdf" />
                </div>
              </div>
              
              <button type="submit" className="btn btn-primary btn-block my-4" disabled={loading}>
                {loading ? 'Memproses...' : 'Daftar Sekarang'}
              </button>
            </form>
          )}
          
          {!success && (
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
              Sudah punya akun? <Link href="/login" style={{ color: "var(--primary-color)", fontWeight: "600", textDecoration: "none" }}>Login di sini</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
