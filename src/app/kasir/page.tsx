import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getUserSession, logoutUser } from '../pasien/actions';
import { redirect } from 'next/navigation';
import { prosesPembayaran } from './actions';

export const dynamic = 'force-dynamic';

export default async function KasirDashboard() {
  const session = await getUserSession();
  if (!session || session.role !== 'KASIR') {
    redirect('/login');
  }

  // Ambil Tagihan yang masih MUNGGU DIBAYAR
  const tagihanList = await prisma.tagihan.findMany({
    where: { status: 'BELUM_DIBAYAR' },
    include: {
      antrean: {
        include: { pasien: true, poliklinik: true }
      },
      items: true
    },
    orderBy: { id: 'asc' }
  });

  return (
    <div className="dashboard-layout">
        <aside className="sidebar">
            <div className="sidebar-title">RS Tentara P. Siantar<br/><span style={{ fontSize: "14px", fontWeight: "400", color: "#c8e6c9" }}>Portal Kasir</span></div>
            <ul className="sidebar-menu">
                <li><Link href="/kasir" className="active">Tagihan Aktif</Link></li>
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
                <h2>Dashboard Pembayaran (Kasir)</h2>
                <div style={{ fontWeight: "500" }}>{new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })}</div>
            </div>

            <div className="card">
                <h3>Daftar Pasien Menunggu Pembayaran</h3>
                
                {tagihanList.length > 0 ? (
                <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
                    {tagihanList.map((tagihan) => (
                    <div key={tagihan.id} style={{ border: "1px solid var(--border-color)", padding: "15px", borderRadius: "8px", background: "#f8f9fa", display: "flex", flexDirection: "column", gap: "15px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px dashed #ccc", paddingBottom: "15px" }}>
                            <div>
                                <h4 style={{ margin: "0 0 5px 0", color: "var(--primary-color)" }}>INVOICE #{tagihan.id}</h4>
                                <div style={{ fontSize: "14px", color: "#666" }}>
                                    Pasien: <strong>{tagihan.antrean.pasien.namaLengkap}</strong> | NIK: {tagihan.antrean.pasien.nik} 
                                </div>
                                <div style={{ fontSize: "14px", color: "#666" }}>
                                    Kunjungan: {tagihan.antrean.poliklinik.namaPoli} (Tgl: {new Date(tagihan.antrean.tanggal).toLocaleDateString('id-ID')})
                                </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>Total Keseluruhan</div>
                                <div style={{ fontSize: "24px", fontWeight: "700", color: "#e65100" }}>
                                    Rp {Number(tagihan.totalBiaya).toLocaleString('id-ID')}
                                </div>
                            </div>
                        </div>

                        <div>
                            <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px", color: "#444" }}>Rincian Tagihan:</div>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                                <tbody>
                                    {tagihan.items.map((item) => (
                                    <tr key={item.id}>
                                        <td style={{ padding: "8px 0", borderBottom: "1px solid #eee", width: "70%" }}>{item.namaItem}</td>
                                        <td style={{ padding: "8px 0", borderBottom: "1px solid #eee", width: "10%", textAlign: "center" }}>x{item.jumlah}</td>
                                        <td style={{ padding: "8px 0", borderBottom: "1px solid #eee", width: "20%", textAlign: "right" }}>Rp {Number(item.subTotal).toLocaleString('id-ID')}</td>
                                    </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                            <Link href={`/kasir/kuitansi/${tagihan.id}`} className="btn btn-outline" style={{ display: "inline-block", padding: "10px 15px", fontSize: "14px", textDecoration: "none" }} target="_blank">
                                Cetak Kuitansi Sementara (PDF)
                            </Link>
                            <form action={prosesPembayaran.bind(null, tagihan.id)}>
                                <button type="submit" className="btn btn-primary" style={{ padding: "10px 15px", fontSize: "14px" }}>
                                    Proses Lunas
                                </button>
                            </form>
                        </div>
                    </div>
                    ))}
                </div>
                ) : (
                <div className="alert alert-success mt-4">Seluruh tagihan pasien hari ini sudah lunas!</div>
                )}
            </div>
        </main>
    </div>
  );
}
