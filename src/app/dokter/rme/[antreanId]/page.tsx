import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getUserSession } from '../../../pasien/actions';
import { redirect } from 'next/navigation';
import { simpanRekamMedis } from '../actions';

export default async function RMEDetailPage({ params }: { params: Promise<{ antreanId: string }> }) {
  const resolvedParams = await params;
  const antreanIdStr = resolvedParams.antreanId;
  
  if (!antreanIdStr || isNaN(parseInt(antreanIdStr))) {
    return <div style={{ padding: "2rem", color: "red", textAlign: "center" }}>ID Antrean tidak valid!</div>;
  }
  
  const antreanId = parseInt(antreanIdStr);
  const session = await getUserSession();
  
  if (!session || session.role !== 'DOKTER') {
    redirect('/login');
  }

  try {
    // Quick mitigation: avoid extra DB count checks

    const antrean = await prisma.antrean.findUnique({
      where: { id: antreanId },
      include: {
        pasien: true,
        poliklinik: true
      }
    });

    if (!antrean) {
      return <div style={{ padding: "2rem", color: "red", textAlign: "center" }}>Antrean tidak ditemukan!</div>;
    }

    if (antrean.status === 'SELESAI') {
      return <div style={{ padding: "2rem", color: "orange", textAlign: "center", background: "#fff3e0", borderRadius: "8px" }}>Antrean pasien ini sudah diselesaikan. Halaman ini hanya untuk informasi riwayat.</div>;
    }

    // Ambil data EMR jika sudah ada
    const rekamMedis = await prisma.rekamMedis.findUnique({
      where: { antreanId }
    });

  return (
      <div className="dashboard-layout">
        <aside className="sidebar">
            <div className="sidebar-title">RS Tentara P. Siantar<br/><span style={{ fontSize: "14px", fontWeight: "400", color: "#c8e6c9" }}>Portal Dokter</span></div>
            <ul className="sidebar-menu">
                <li><Link href="/dokter">Kembali ke Antrean</Link></li>
                <li><Link href="/dokter/debug">Debug Info</Link></li>
                <li><Link href="#" className="active">Isi EMR Pasien</Link></li>
            </ul>
        </aside>

        <main className="main-content">
            <div className="topbar">
                <h2>Rekam Medis Elektronik (RME)</h2>
            </div>
            
            <div className="card" style={{ marginBottom: "1rem" }}>
                <h3 style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "10px", marginBottom: "15px" }}>Info Pasien</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                    <div>
                        <div style={{ fontSize: "14px", color: "#666" }}>Nama Lengkap</div>
                        <div style={{ fontWeight: "600", fontSize: "16px" }}>{antrean.pasien.namaLengkap}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: "14px", color: "#666" }}>NIK</div>
                        <div style={{ fontWeight: "600", fontSize: "16px" }}>{antrean.pasien.nik}</div>
                    </div>
                    <div>
                         <div style={{ fontSize: "14px", color: "#666" }}>No Antrean</div>
                         <div style={{ fontWeight: "600", fontSize: "16px" }}>{String(antrean.noAntrean).padStart(3, '0')} - {antrean.poliklinik.namaPoli}</div>
                    </div>
                 </div>
            </div>

            <div className="card">
                <h3 style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "10px", marginBottom: "15px" }}>Form Assessment SOAP</h3>
                {rekamMedis && (
                  <div style={{ marginBottom: "1rem", padding: "12px", background: "#e8f5e9", color: "#1b5e20", borderRadius: "8px", borderLeft: "4px solid #4caf50" }}>
                    ℹ️ Data EMR sudah ada. Edit dan perbarui sesuai kebutuhan.
                  </div>
                )}
                <form action={simpanRekamMedis} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    <input type="hidden" name="antreanId" value={antrean.id} />
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", background: "#f8f9fa", padding: "15px", borderRadius: "8px" }}>
                        <h4 style={{ color: "var(--primary-color)", margin: 0 }}>Subjective (Subjektif)</h4>
                        <div className="form-group">
                            <label>Keluhan Utama *</label>
                            <textarea name="keluhanUtama" className="form-control" rows={3} required placeholder="Contoh: Pasien mengeluhkan pusing sejak 2 hari yang lalu..." defaultValue={rekamMedis?.keluhanUtama || ''}></textarea>
                        </div>
                        <div className="form-group">
                            <label>Riwayat Penyakit *</label>
                            <textarea name="riwayatPenyakit" className="form-control" rows={2} required placeholder="Contoh: Hipertensi, Asma, dsb..." defaultValue={rekamMedis?.riwayatPenyakit || ''}></textarea>
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", background: "#f8f9fa", padding: "15px", borderRadius: "8px" }}>
                        <h4 style={{ color: "var(--primary-color)", margin: 0 }}>Objective (Tanda Vital)</h4>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                            <div className="form-group">
                                <label>Tekanan Darah (mmHg) *</label>
                                <input type="text" name="tekananDarah" className="form-control" required placeholder="Contoh: 120/80" defaultValue={rekamMedis?.tekananDarah || ''} />
                            </div>
                            <div className="form-group">
                                <label>Suhu Tubuh (&deg;C) *</label>
                                <input type="number" step="0.1" name="suhuTubuh" className="form-control" required placeholder="36.5" defaultValue={rekamMedis?.suhuTubuh || ''} />
                            </div>
                            <div className="form-group">
                                <label>Berat Badan (kg) *</label>
                                <input type="number" step="0.1" name="beratBadan" className="form-control" required placeholder="65.0" defaultValue={rekamMedis?.beratBadan || ''} />
                            </div>
                            <div className="form-group">
                                <label>Tinggi Badan (cm) *</label>
                                <input type="number" step="0.1" name="tinggiBadan" className="form-control" required placeholder="170.0" defaultValue={rekamMedis?.tinggiBadan || ''} />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", background: "#f8f9fa", padding: "15px", borderRadius: "8px" }}>
                         <h4 style={{ color: "var(--primary-color)", margin: 0 }}>Assessment (Diagnosa)</h4>
                         <div className="form-group">
                            <label>Diagnosa Medis *</label>
                            <textarea name="diagnosa" className="form-control" rows={2} required placeholder="Contoh: R51 - Headache (ICD-10)" defaultValue={rekamMedis?.diagnosa || ''}></textarea>
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", background: "#f8f9fa", padding: "15px", borderRadius: "8px" }}>
                         <h4 style={{ color: "var(--primary-color)", margin: 0 }}>Plan (Perencanaan / Edukasi / Rujukan)</h4>
                         <div className="form-group">
                            <label>Catatan Tambahan &amp; Edukasi Pasien *</label>
                            <textarea name="catatanTambahan" className="form-control" rows={3} required placeholder="Contoh: Istirahat yang cukup, kurangi makanan asin..." defaultValue={rekamMedis?.catatanTambahan || ''}></textarea>
                        </div>
                        <div className="form-group">
                            <label>Resep Obat (Opsional)</label>
                            <textarea name="rincianObat" className="form-control" rows={3} placeholder="Format bebas. Contoh: Paracetamol 500mg 3x1, Amoxicillin 500mg 3x1... Jika diisi, resep akan langsung diteruskan ke Apotek."></textarea>
                        </div>
                        <div className="form-group">
                            <label>Permintaan Tes Laboratorium (Opsional)</label>
                            <textarea name="permintaanLab" className="form-control" rows={2} placeholder="Ketik jenis tes darah/urin jika anda merujuk pasien ke Lab..."></textarea>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ padding: "12px", fontSize: "16px", marginTop: "1rem" }} onClick={(e) => {
                        if (!confirm('Apakah Anda yakin ingin menyimpan EMR dan menyelesaikan antrean pasien ini?')) {
                            e.preventDefault();
                        }
                    }}>
                        Simpan EMR &amp; Selesaikan Antrean
                    </button>
                    
                </form>
            </div>
        </main>
      </div>
  );
  } catch (error) {
    console.error('EMR Page Error:', error);

    // Different error messages based on error type
    let errorMessage = 'Terjadi kesalahan server saat memuat halaman EMR.';
    let errorDetails = '';

    if (error instanceof Error) {
      if (error.message.includes('connect')) {
        errorMessage = 'Gagal terhubung ke database.';
        errorDetails = 'Periksa koneksi internet dan konfigurasi database.';
      } else if (error.message.includes('relation') || error.message.includes('table')) {
        errorMessage = 'Error struktur database.';
        errorDetails = 'Periksa schema Prisma dan migrasi database.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Timeout koneksi database.';
        errorDetails = 'Database response terlalu lama.';
      } else {
        errorDetails = error.message;
      }
    }

    return (
      <div style={{ padding: "2rem", color: "red", textAlign: "center", background: "#ffebee", borderRadius: "8px", border: "1px solid #f44336" }}>
        <h2>❌ Error Memuat Halaman EMR</h2>
        <p><strong>{errorMessage}</strong></p>
        {errorDetails && <p><small>Detail: {errorDetails}</small></p>}
        <p style={{ marginTop: "1rem" }}>
          <Link href="/dokter/debug" style={{ color: "blue", textDecoration: "underline" }}>
            Akses Halaman Debug
          </Link> | <Link href="/dokter" style={{ color: "blue", textDecoration: "underline" }}>
            Kembali ke Dashboard
          </Link>
        </p>
      </div>
    );
  }
}
