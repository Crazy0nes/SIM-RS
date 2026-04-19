import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

function PasienDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/pasien/dashboard.php');
      if (response.data.status === 'success') {
        setData(response.data.data);
      } else {
        navigate('/');
      }
    } catch (err) {
      if (err.response?.status === 403) navigate('/');
      else setError('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAmbilAntrean = async () => {
    try {
      const response = await api.post('/pasien/dashboard.php', { action: 'ambil_antrean' });
      if (response.data.status === 'success') {
        fetchDashboardData();
      } else {
        alert(response.data.message);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengambil antrean');
    }
  };

  const handleLogout = () => {
    // Implement logout endpoint or just clear session and navigate
    api.get('/auth/logout.php').finally(() => navigate('/'));
  };

  if (loading) return <div className="dashboard-layout"><div className="main-content">Loading...</div></div>;

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-title">RS Tentara P. Siantar</div>
        <ul className="sidebar-menu">
            <li><Link to="/pasien" className="active">Pusat Layanan</Link></li>
            <li><Link to="#">Daftar Tagihan</Link></li>
            <li><Link to="#">Paparan Survey</Link></li>
            <li style={{ marginTop: 'auto' }}><button onClick={handleLogout} style={{ background: 'rgba(255,0,0,0.2)', color: '#ffdddd', width: '100%', textAlign: 'left', padding: '0.75rem 1rem', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>Logout Keluar</button></li>
        </ul>
      </aside>

      <main className="main-content">
        <div className="topbar">
            <h2>Selamat Datang, {data?.nama}</h2>
            <div style={{ fontWeight: "500" }}>{new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div className="card" style={{ textAlign: "center", padding: "40px 20px" }}>
                <h3>Nomor Antrean Anda Hari Ini</h3>
                {data?.antrean_hari_ini ? (
                    <>
                        <div style={{ fontSize: "5rem", fontWeight: "700", color: "var(--primary-color)", margin: "20px 0", border: "4px dashed var(--border-color)", display: "inline-block", padding: "10px 40px", borderRadius: "20px" }}>
                            {String(data.antrean_hari_ini.no_antrean).padStart(3, '0')}
                        </div>
                        <p>Status: <strong style={{ color: "var(--primary-color)", textTransform: "uppercase" }}>{data.antrean_hari_ini.status}</strong></p>
                        <p style={{ color: "var(--text-muted)", marginTop: "10px" }}>Silakan menunggu di ruang tunggu poli.</p>
                    </>
                ) : (
                    <>
                        <div style={{ fontSize: "5rem", fontWeight: "700", color: "var(--primary-color)", margin: "20px 0", border: "4px dashed var(--border-color)", display: "inline-block", padding: "10px 40px", borderRadius: "20px" }}>
                            --
                        </div>
                        <p>Anda belum mengambil tiket antrean hari ini.</p>
                        <button onClick={handleAmbilAntrean} className="btn btn-primary mt-4">Cetak Tiket Antrean</button>
                    </>
                )}
            </div>

            <div className="card">
                <h3>Informasi Pasien</h3>
                <hr style={{ border: 0, borderTop: "1px solid var(--border-color)", margin: "15px 0" }} />
                <p><strong>Nama Lengkap:</strong> {data?.nama}</p>
                <p><strong>ID Pasien:</strong> PSN-{String(data?.id_pasien).padStart(4, '0')}</p>
                
                <h3 style={{ marginTop: "30px" }}>Notifikasi</h3>
                <div className="alert alert-success mt-4">
                    Belum ada notifikasi baru untuk Anda hari ini.
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}

export default PasienDashboard;
