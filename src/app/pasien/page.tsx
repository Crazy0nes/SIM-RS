import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getUserSession, logoutUser } from './actions';
import { redirect } from 'next/navigation';
import AmbilAntreanButton from './AmbilAntreanButton';

export const dynamic = 'force-dynamic';

export default async function PasienDashboard() {
  const session = await getUserSession();
  
  if (!session || session.role !== 'PASIEN') {
    redirect('/login');
  }

  const dateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());
  const todayUTC = new Date(dateStr + 'T00:00:00.000Z');

  // Tarik data detail pasien beserta antrean hari ini
  const pasien = await prisma.pasien.findUnique({
    where: { userId: session.id },
    include: {
      antreans: {
        where: { tanggal: { gte: todayUTC } },
        orderBy: [ { tanggal: 'asc' }, { id: 'asc' } ],
        take: 1
      }
    }
  });

  const poliklinikList = await prisma.poliklinik.findMany({
    orderBy: { namaPoli: 'asc' }
  });

  const antreanHariIni = pasien?.antreans[0];

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-title">RS Tentara P. Siantar</div>
        <ul className="sidebar-menu">
            <li><Link href="/pasien" className="active">Pusat Layanan</Link></li>
            <li><Link href="#">Daftar Tagihan</Link></li>
            <li><Link href="#">Paparan Survey</Link></li>
            <li style={{ marginTop: 'auto' }}>
              <form action={logoutUser}>
                <button type="submit" style={{ background: 'rgba(255,0,0,0.2)', color: '#ffdddd', width: '100%', textAlign: 'left', padding: '0.75rem 1rem', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                  Logout Keluar
                </button>
              </form>
            </li>
        </ul>
      </aside>

      <main className="main-content">
        <div className="topbar">
            <h2>Selamat Datang, {pasien?.namaLengkap || session.username}</h2>
            <div style={{ fontWeight: "500" }}>{new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })}</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div className="card" style={{ textAlign: "center", padding: "40px 20px" }}>
                <h3>Nomor Antrean Anda Hari Ini</h3>
                {antreanHariIni ? (
                    <>
                        <div style={{ fontSize: "5rem", fontWeight: "700", color: "var(--primary-color)", margin: "20px 0", border: "4px dashed var(--border-color)", display: "inline-block", padding: "10px 40px", borderRadius: "20px" }}>
                            {String(antreanHariIni.noAntrean).padStart(3, '0')}
                        </div>
                        <p>Status: <strong style={{ color: "var(--primary-color)", textTransform: "uppercase" }}>{antreanHariIni.status}</strong></p>
                        <p>Jadwal: <strong>{new Date(antreanHariIni.tanggal).toLocaleDateString('id-ID', {day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta'})}</strong></p>
                        <p style={{ color: "var(--text-muted)", marginTop: "10px" }}>Silakan menunggu di bagian {antreanHariIni.poliklinikId ? 'Poli' : 'Poliklinik'}.</p>
                    </>
                ) : (
                    <>
                        <div style={{ fontSize: "5rem", fontWeight: "700", color: "var(--primary-color)", margin: "20px 0", border: "4px dashed var(--border-color)", display: "inline-block", padding: "10px 40px", borderRadius: "20px" }}>
                            --
                        </div>
                        <p>Anda belum mengambil tiket antrean hari ini.</p>
                        {pasien ? (
                           <AmbilAntreanButton poliklinikList={poliklinikList} />
                        ) : (
                           <p style={{ color: 'red' }}>Anda belum melengkapi form pendaftaran pasien.</p>
                        )}
                        
                    </>
                )}
            </div>

            <div className="card">
                <h3>Informasi Pasien</h3>
                <hr style={{ border: 0, borderTop: "1px solid var(--border-color)", margin: "15px 0" }} />
                <p><strong>Nama Lengkap:</strong> {pasien?.namaLengkap || 'Belum diisi'}</p>
                <p><strong>ID Pasien:</strong> PSN-{String(pasien?.id || 0).padStart(4, '0')}</p>
                <p><strong>NIK:</strong> {pasien?.nik || '-'}</p>
                
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
