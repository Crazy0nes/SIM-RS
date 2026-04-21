import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getUserSession, logoutUser } from '../../pasien/actions';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function RiwayatEMR() {
  const session = await getUserSession();

  if (!session || session.role !== 'DOKTER') {
    redirect('/login');
  }

  const dokter = await prisma.dokter.findUnique({
    where: { userId: session.id },
    include: { poliklinik: true }
  });

  if (!dokter) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>Akun Anda belum dipetakan sebagai Dokter di database. Hubungi Manajemen.</div>;
  }

  // Ambil semua rekam medis dari antrean di poliklinik dokter ini
  const rekamMedisList = await prisma.rekamMedis.findMany({
    where: {
      antrean: {
        poliklinikId: dokter.poliklinikId
      }
    },
    include: {
      antrean: {
        include: {
          pasien: true
        }
      }
    },
    orderBy: {
      antrean: {
        tanggal: 'desc'
      }
    }
  });

  return (
    <div className="dashboard-layout">
        <aside className="sidebar">
            <div className="sidebar-title">RS Tentara P. Siantar<br/><span style={{ fontSize: "14px", fontWeight: "400", color: "#c8e6c9" }}>Portal Dokter</span></div>
            <ul className="sidebar-menu">
                <li><Link href="/dokter">Daftar Antrean</Link></li>
                <li><Link href="/dokter/riwayat-emr" className="active">Riwayat EMR</Link></li>
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
                <h2>Riwayat Rekam Medis Elektronik - {dokter.poliklinik.namaPoli}</h2>
                <div style={{ fontWeight: "500" }}>{new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })}</div>
            </div>

            <div className="card">
                <h3>Riwayat EMR Pasien</h3>

                {rekamMedisList.length > 0 ? (
                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
                    <thead>
                        <tr>
                            <th style={{ padding: "12px", borderBottom: "1px solid var(--border-color)", textAlign: "left", background: "var(--primary-bg)", color: "var(--primary-color)" }}>Tanggal</th>
                            <th style={{ padding: "12px", borderBottom: "1px solid var(--border-color)", textAlign: "left", background: "var(--primary-bg)", color: "var(--primary-color)" }}>No Antrean</th>
                            <th style={{ padding: "12px", borderBottom: "1px solid var(--border-color)", textAlign: "left", background: "var(--primary-bg)", color: "var(--primary-color)" }}>Nama Pasien</th>
                            <th style={{ padding: "12px", borderBottom: "1px solid var(--border-color)", textAlign: "left", background: "var(--primary-bg)", color: "var(--primary-color)" }}>Diagnosa</th>
                            <th style={{ padding: "12px", borderBottom: "1px solid var(--border-color)", textAlign: "left", background: "var(--primary-bg)", color: "var(--primary-color)" }}>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rekamMedisList.map((rm) => (
                        <tr key={rm.id}>
                            <td style={{ padding: "12px", borderBottom: "1px solid var(--border-color)", textAlign: "left" }}>
                                {rm.antrean.tanggal.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </td>
                            <td style={{ padding: "12px", borderBottom: "1px solid var(--border-color)", textAlign: "left" }}>
                                <strong>{String(rm.antrean.noAntrean).padStart(3, '0')}</strong>
                            </td>
                            <td style={{ padding: "12px", borderBottom: "1px solid var(--border-color)", textAlign: "left" }}>
                                {rm.antrean.pasien.namaLengkap}
                            </td>
                            <td style={{ padding: "12px", borderBottom: "1px solid var(--border-color)", textAlign: "left" }}>
                                {rm.diagnosa}
                            </td>
                            <td style={{ padding: "12px", borderBottom: "1px solid var(--border-color)", textAlign: "left" }}>
                                <Link href={`/dokter/rme/${rm.antreanId}`} className="btn btn-outline" style={{ padding:"6px 12px", fontSize:"14px", textDecoration:"none", display:"inline-block" }}>
                                    Lihat Detail
                                </Link>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>
                ) : (
                <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Belum ada riwayat EMR untuk poliklinik ini.
                </p>
                )}
            </div>
        </main>
    </div>
  );
}