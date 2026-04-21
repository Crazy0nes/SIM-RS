import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getUserSession, logoutUser } from '../pasien/actions';
import { redirect } from 'next/navigation';
import PeriksaButton from './PeriksaButton';

export const dynamic = 'force-dynamic';

export default async function DokterDashboard({
  searchParams
}: {
  searchParams: Promise<{ success?: string }>
}) {
  const resolvedParams = await searchParams;
  const session = await getUserSession();
  
  if (!session || session.role !== 'DOKTER') {
    redirect('/login');
  }

  const dateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());
  const todayUTC = new Date(dateStr + 'T00:00:00.000Z');

  const dokter = await prisma.dokter.findUnique({
    where: { userId: session.id },
    include: { poliklinik: true }
  });

  if (!dokter) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>Akun Anda belum dipetakan sebagai Dokter di database. Hubungi Manajemen.</div>;
  }

  const antreans = await prisma.antrean.findMany({
    where: { 
      tanggal: todayUTC,
      poliklinikId: dokter.poliklinikId,
      status: {
        in: ['MENUNGGU', 'DIPERIKSA']
      }
    },
    include: {
      pasien: true
    },
    orderBy: {
      noAntrean: 'asc'
    }
  });

  return (
    <div className="dashboard-layout">
        <aside className="sidebar">
            <div className="sidebar-title">RS Tentara P. Siantar<br/><span style={{ fontSize: "14px", fontWeight: "400", color: "#c8e6c9" }}>Portal Dokter</span></div>
            <ul className="sidebar-menu">
                <li><Link href="/dokter" className="active">Daftar Antrean</Link></li>
                <li><Link href="/dokter/riwayat-emr">Riwayat EMR</Link></li>
                <li style={{ marginTop: "auto" }}>
                  <form action={logoutUser}>
                    <button type="submit" style={{ background: "rgba(255,0,0,0.2)", color: "#ffdddd", width: "100%", textAlign: "left", padding: "0.75rem 1rem", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer" }}>
                        Logout Keluar
                    </button>
                  </form>
                </li>
            </ul>
        </aside>

        <main className="main-content">
            <div className="topbar">
                <h2>Dashboard Antrean Pasien - {dokter.poliklinik.namaPoli}</h2>
                <div style={{ fontWeight: "500" }}>{new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })}</div>
            </div>

            {resolvedParams.success === 'emr_saved' && (
              <div className="alert alert-success" style={{ marginBottom: '1rem', padding: '12px 16px', background: '#e8f5e9', color: '#1b5e20', borderRadius: '8px', borderLeft: '4px solid #4caf50' }}>
                ✓ EMR berhasil disimpan dan antrean pasien telah diselesaikan.
              </div>
            )}

            <div className="card">
                <h3>Daftar Pasien Menunggu Hari Ini</h3>
                
                {antreans.length > 0 ? (
                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
                    <thead>
                        <tr>
                            <th style={{ padding: "12px", borderBottom: "1px solid var(--border-color)", textAlign: "left", background: "var(--primary-bg)", color: "var(--primary-color)" }}>No Antrean</th>
                            <th style={{ padding: "12px", borderBottom: "1px solid var(--border-color)", textAlign: "left", background: "var(--primary-bg)", color: "var(--primary-color)" }}>ID Pasien</th>
                            <th style={{ padding: "12px", borderBottom: "1px solid var(--border-color)", textAlign: "left", background: "var(--primary-bg)", color: "var(--primary-color)" }}>Nama Pasien</th>
                            <th style={{ padding: "12px", borderBottom: "1px solid var(--border-color)", textAlign: "left", background: "var(--primary-bg)", color: "var(--primary-color)" }}>Status</th>
                            <th style={{ padding: "12px", borderBottom: "1px solid var(--border-color)", textAlign: "left", background: "var(--primary-bg)", color: "var(--primary-color)" }}>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {antreans.map((row) => (
                        <tr key={row.id}>
                            <td style={{ padding: "12px", borderBottom: "1px solid var(--border-color)", textAlign: "left" }}><strong>{String(row.noAntrean).padStart(3, '0')}</strong></td>
                            <td style={{ padding: "12px", borderBottom: "1px solid var(--border-color)", textAlign: "left" }}>PSN-{String(row.pasienId).padStart(4, '0')}</td>
                            <td style={{ padding: "12px", borderBottom: "1px solid var(--border-color)", textAlign: "left" }}>{row.pasien.namaLengkap}</td>
                            <td style={{ padding: "12px", borderBottom: "1px solid var(--border-color)", textAlign: "left" }}>
                                <span style={{ display:"inline-block", padding: "4px 10px", borderRadius: "99px", fontSize: "12px", fontWeight:"600",
                                    ...(row.status === 'MENUNGGU' ? { background: "#fff3e0", color: "#e65100" } : { background: "#e8f5e9", color: "#1b5e20" })
                                }}>
                                    {row.status}
                                </span>
                            </td>
                            <td style={{ padding: "12px", borderBottom: "1px solid var(--border-color)", textAlign: "left" }}>
                                {row.status === 'MENUNGGU' ? (
                                    <PeriksaButton antreanId={row.id} />
                                ) : (
                                    <Link href={`/dokter/rme/${row.id}`} className="btn btn-outline" style={{ padding:"6px 12px", fontSize:"14px", textDecoration:"none", display:"inline-block" }}>Lanjut EMR</Link>
                                )}
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>
                ) : (
                <div className="alert alert-success mt-4">Belum ada antrean hari ini!</div>
                )}
            </div>
        </main>
    </div>
  );
}
