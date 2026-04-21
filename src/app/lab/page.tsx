import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getUserSession, logoutUser } from '../pasien/actions';
import { redirect } from 'next/navigation';
import { simpanHasilLab } from './actions';

export const dynamic = 'force-dynamic';

export default async function LabDashboard() {
  const session = await getUserSession();
  
  if (!session || session.role !== 'LAB') {
    redirect('/login');
  }

  // Ambil antrean Lab yang masih menunggu
  const labRequests = await prisma.lab.findMany({
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
            <div className="sidebar-title">RS Tentara P. Siantar<br/><span style={{ fontSize: "14px", fontWeight: "400", color: "#c8e6c9" }}>Portal Laboratorium</span></div>
            <ul className="sidebar-menu">
                <li><Link href="/lab" className="active">Antrean Tes Medis</Link></li>
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
                <h2>Dashboard Laboratorium</h2>
                <div style={{ fontWeight: "500" }}>{new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })}</div>
            </div>

            <div className="card">
                <h3>Permintaan Tes Laboratorium</h3>
                
                {labRequests.length > 0 ? (
                <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
                    {labRequests.map((row) => (
                    <div key={row.id} style={{ border: "1px solid var(--border-color)", padding: "15px", borderRadius: "8px", background: "#f8f9fa", display: "flex", flexDirection: "column", gap: "10px" }}>
                        
                        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed #ccc", paddingBottom: "10px" }}>
                            <div>
                                <h4 style={{ margin: "0 0 5px 0", color: "var(--primary-color)" }}>No. Rujukan Lab #{row.id}</h4>
                                <div style={{ fontSize: "14px", color: "#666" }}>
                                    Pasien: <strong>{row.rekamMedis.antrean.pasien.namaLengkap}</strong> | No Antrean: {String(row.rekamMedis.antrean.noAntrean).padStart(3,'0')} ({row.rekamMedis.antrean.poliklinik.namaPoli})
                                </div>
                            </div>
                        </div>

                        <div>
                            <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>Instruksi Pemeriksaan Dokter:</div>
                            <div style={{ padding: "10px", background: "#fff", border: "1px solid #e0e0e0", borderRadius: "4px", minHeight: "50px", whiteSpace: "pre-wrap", fontWeight: "600" }}>
                                {row.jenisTes}
                            </div>
                        </div>

                        <form action={simpanHasilLab.bind(null, row.id)} style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
                            <div>
                                <label style={{ fontSize: "12px", color: "#666", display: "block", marginBottom: "4px" }}>Input Hasil Test Laboratorium</label>
                                <textarea name="hasilLab" className="form-control" rows={3} placeholder="Ketik hasil yang didapat dari darah/urin/rontgen pasien..." required style={{ width: "100%" }}></textarea>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <button type="submit" className="btn btn-primary" style={{ padding: "10px 15px", fontSize: "14px" }}>
                                    Simpan Hasil &amp; Selesai ✓
                                </button>
                            </div>
                        </form>
                    </div>
                    ))}
                </div>
                ) : (
                <div className="alert alert-success mt-4">Puji Tuhan, tidak ada antrean sampel lab hari ini!</div>
                )}
            </div>
        </main>
    </div>
  );
}
