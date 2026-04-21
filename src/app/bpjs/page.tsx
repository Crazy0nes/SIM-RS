import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getUserSession, logoutUser } from '../pasien/actions';
import { redirect } from 'next/navigation';
import { setujuiKlaim } from './actions';

export const dynamic = 'force-dynamic';

export default async function BPJSDashboard() {
  const session = await getUserSession();
  
  if (!session || session.role !== 'BPJS') {
    redirect('/login');
  }

  const klaimList = await prisma.klaimBpjs.findMany({
    where: { status: 'MENUNGGU' },
    include: {
      tagihan: {
        include: {
          antrean: {
            include: { pasien: true, poliklinik: true }
          },
          items: true
        }
      }
    },
    orderBy: { id: 'asc' }
  });

  return (
    <div className="dashboard-layout">
        <aside className="sidebar">
            <div className="sidebar-title">RS Tentara P. Siantar<br/><span style={{ fontSize: "14px", fontWeight: "400", color: "#c8e6c9" }}>Portal Asuransi / JKN</span></div>
            <ul className="sidebar-menu">
                <li><Link href="/bpjs" className="active">Verifikasi Klaim JKN</Link></li>
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
                <h2>Verifikator BPJS / Asuransi</h2>
                <div style={{ fontWeight: "500" }}>{new Date().toLocaleDateString('id-ID')}</div>
            </div>

            <div className="card">
                <h3>Permohonan Klaim Kesehatan (SEP)</h3>
                
                {klaimList.length > 0 ? (
                <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
                    {klaimList.map((row) => (
                    <div key={row.id} style={{ border: "1px solid var(--border-color)", padding: "15px", borderRadius: "8px", background: "#f8f9fa", display: "flex", flexDirection: "column", gap: "10px" }}>
                        
                        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed #ccc", paddingBottom: "10px" }}>
                            <div>
                                <h4 style={{ margin: "0 0 5px 0", color: "#1976d2" }}>Ref Klaim #{row.id} (INV-{row.tagihan.id})</h4>
                                <div style={{ fontSize: "14px", color: "#666" }}>
                                    Pasien: <strong>{row.tagihan.antrean.pasien.namaLengkap}</strong> | No BPJS: <strong style={{ color: "green" }}>{row.tagihan.antrean.pasien.noBpjs}</strong>
                                </div>
                                <div style={{ fontSize: "14px", color: "#666" }}>
                                    Poliklinik: {row.tagihan.antrean.poliklinik.namaPoli}
                                </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: "12px", color: "#666" }}>Nilai Klaim:</div>
                                <div style={{ fontSize: "20px", fontWeight: "bold", color: "#e65100" }}>
                                    Rp {Number(row.tagihan.totalBiaya).toLocaleString('id-ID')}
                                </div>
                            </div>
                        </div>

                        <div>
                            <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>Rincian Tagihan Ekstrak:</div>
                            <table style={{ width: "100%", fontSize: "12px", borderCollapse: "collapse" }}>
                                <tbody>
                                    {row.tagihan.items.map(it => (
                                        <tr key={it.id}>
                                            <td style={{ padding: "4px 0", borderBottom: "1px solid #eee" }}>- {it.namaItem}</td>
                                            <td style={{ padding: "4px 0", borderBottom: "1px solid #eee", textAlign: "right" }}>Rp {Number(it.subTotal).toLocaleString('id-ID')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
                            <form action={setujuiKlaim.bind(null, row.id)}>
                                <button type="submit" className="btn btn-primary" style={{ padding: "8px 15px", fontSize: "14px", background: "#2e7d32", borderColor: "#2e7d32" }}>
                                    ✓ Validasi &amp; Setujui Klaim JKN
                                </button>
                            </form>
                        </div>
                    </div>
                    ))}
                </div>
                ) : (
                <div className="alert alert-success mt-4">Belum ada pengajuan klaim BPJS yang perlu divaidasi.</div>
                )}
            </div>
        </main>
    </div>
  );
}
