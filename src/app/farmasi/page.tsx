import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getUserSession, logoutUser } from '../pasien/actions';
import { redirect } from 'next/navigation';
import { serahkanObat } from './actions';

export const dynamic = 'force-dynamic';

export default async function FarmasiDashboard() {
  const session = await getUserSession();
  if (!session || session.role !== 'APOTEKER') {
    redirect('/login');
  }

  // Ambil resep obat yang masih menunggu
  const reseps = await prisma.resep.findMany({
    where: { status: 'MENUNGGU' },
    include: {
      rekamMedis: {
        include: {
          antrean: {
            include: { pasien: true, poliklinik: true }
          }
        }
      }
    },
    orderBy: { id: 'asc' }
  });

  return (
    <div className="dashboard-layout">
        <aside className="sidebar">
            <div className="sidebar-title">RS Tentara P. Siantar<br/><span style={{ fontSize: "14px", fontWeight: "400", color: "#c8e6c9" }}>Portal Farmasi</span></div>
            <ul className="sidebar-menu">
                <li><Link href="/farmasi" className="active">Antrean Resep</Link></li>
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
                <h2>Dashboard Apotek (Farmasi)</h2>
                <div style={{ fontWeight: "500" }}>{new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })}</div>
            </div>

            <div className="card">
                <h3>Daftar Resep Menunggu</h3>
                
                {reseps.length > 0 ? (
                <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
                    {reseps.map((row) => (
                    <div key={row.id} style={{ border: "1px solid var(--border-color)", padding: "15px", borderRadius: "8px", background: "#f8f9fa" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div style={{ flex: 1, paddingRight: "20px" }}>
                                <h4 style={{ margin: "0 0 5px 0", color: "var(--primary-color)" }}>Resep #{row.id}</h4>
                                <div style={{ fontSize: "14px", color: "#666", marginBottom: "10px" }}>
                                    Pasien: <strong>{row.rekamMedis.antrean.pasien.namaLengkap}</strong> | No Antrean: {String(row.rekamMedis.antrean.noAntrean).padStart(3,'0')} ({row.rekamMedis.antrean.poliklinik.namaPoli})
                                </div>
                                <div style={{ padding: "10px", background: "#fff", border: "1px solid #e0e0e0", borderRadius: "4px", minHeight: "60px", whiteSpace: "pre-wrap", fontWeight: "500" }}>
                                    {row.rincianObat}
                                </div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                <form action={serahkanObat.bind(null, row.id)} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                    <div>
                                        <label style={{ fontSize: "12px", color: "#666", display: "block", marginBottom: "4px" }}>Total Biaya Obat (Rp)</label>
                                        <input type="number" name="biayaObat" className="form-control" placeholder="Contoh: 50000" required style={{ width: "100%" }} />
                                    </div>
                                    <button type="submit" className="btn btn-primary" style={{ padding: "10px 15px", fontSize: "14px", width: "100%" }}>
                                        Serahkan Obat ✓
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                    ))}
                </div>
                ) : (
                <div className="alert alert-success mt-4">Tidak ada antrean resep yang menunggu saat ini!</div>
                )}
            </div>
        </main>
    </div>
  );
}
