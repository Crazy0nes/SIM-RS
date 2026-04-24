import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getUserSession } from '@/app/pasien/actions';
import { redirect } from 'next/navigation';
import { simpanRekamMedis } from '../actions';
import ConfirmSubmitButton from '../ConfirmSubmitButton';
import DashboardShell from '@/components/DashboardShell';

export default async function RMEDetailPage({ params }: { params: Promise<{ antreanId: string }> }) {
  const resolvedParams = await params;
  const antreanIdStr = resolvedParams.antreanId;

  if (!antreanIdStr || isNaN(parseInt(antreanIdStr))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center max-w-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-2">ID Antrean Tidak Valid</h2>
          <p className="text-sm text-gray-500">Parameter ID antrean tidak valid.</p>
        </div>
      </div>
    );
  }

  const antreanId = parseInt(antreanIdStr);
  const session = await getUserSession();

  if (!session || session.role !== 'DOKTER') {
    redirect('/login');
  }

  try {
    const dokter = await prisma.dokter.findUnique({
      where: { userId: session.id },
      include: { poliklinik: true }
    });

    const antrean = await prisma.antrean.findUnique({
      where: { id: antreanId },
      include: { pasien: true, poliklinik: true }
    });

    if (!antrean) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center max-w-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-2">Antrean Tidak Ditemukan</h2>
            <p className="text-sm text-gray-500">Data antrean tidak ditemukan di database.</p>
          </div>
        </div>
      );
    }

    if (antrean.status === 'SELESAI') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-8 text-center max-w-sm">
            <h2 className="text-lg font-bold text-orange-800 mb-2">EMR Sudah Diselesaikan</h2>
            <p className="text-sm text-orange-600 mb-4">Antrean pasien ini sudah diselesaikan.</p>
            <Link href="/dokter" className="inline-block px-4 py-2 bg-orange-600 text-white text-sm font-semibold rounded-xl hover:bg-orange-500 transition-colors">
              Kembali ke Dashboard
            </Link>
          </div>
        </div>
      );
    }

    const rekamMedis = await prisma.rekamMedis.findUnique({ where: { antreanId } });

    return (
      <DashboardShell role="DOKTER" poliName={dokter?.poliklinik.namaPoli}>
        <div className="hidden lg:block p-6">
          {/* Back link */}
          <div className="mb-4">
            <Link href="/dokter" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <path d="M15 19l-7-7 7-7"/>
              </svg>
              Kembali ke Daftar Antrean
            </Link>
          </div>

          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Rekam Medis Elektronik (RME)</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {antrean.poliklinik.namaPoli} — {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })}
              </p>
            </div>
          </div>

          {/* Patient Info Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Info Pasien</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-xl px-4 py-3">
                <div className="text-xs text-gray-400 mb-1">Nama Lengkap</div>
                <div className="font-semibold text-gray-800">{antrean.pasien.namaLengkap}</div>
              </div>
              <div className="bg-gray-50 rounded-xl px-4 py-3">
                <div className="text-xs text-gray-400 mb-1">NIK</div>
                <div className="font-semibold text-gray-800">{antrean.pasien.nik}</div>
              </div>
              <div className="bg-green-50 rounded-xl px-4 py-3">
                <div className="text-xs text-green-600 mb-1">No. Antrean</div>
                <div className="font-bold text-green-700 text-lg">{String(antrean.noAntrean).padStart(3, '0')}</div>
              </div>
            </div>
          </div>

          {/* SOAP Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-5">Form Assessment SOAP</h3>

            {rekamMedis && (
              <div className="mb-5 flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Data EMR sudah ada. Edit dan perbarui sesuai kebutuhan.
              </div>
            )}

            <form id="rmeForm" action={simpanRekamMedis} className="space-y-5">
              <input type="hidden" name="antreanId" value={antrean.id} />

              {/* Subjective */}
              <div className="bg-gray-50 rounded-xl p-5 space-y-4">
                <h4 className="font-semibold text-green-700 flex items-center gap-2">
                  <span className="w-6 h-6 bg-green-700 text-white rounded-full flex items-center justify-center text-xs font-bold">S</span>
                  Subjective (Subjektif)
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Keluhan Utama *</label>
                    <textarea name="keluhanUtama" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none" rows={3} required placeholder="Contoh: Pasien mengeluhkan pusing..." defaultValue={rekamMedis?.keluhanUtama || ''} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Riwayat Penyakit *</label>
                    <textarea name="riwayatPenyakit" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none" rows={2} required placeholder="Contoh: Hipertensi, Asma..." defaultValue={rekamMedis?.riwayatPenyakit || ''} />
                  </div>
                </div>
              </div>

              {/* Objective */}
              <div className="bg-gray-50 rounded-xl p-5 space-y-4">
                <h4 className="font-semibold text-green-700 flex items-center gap-2">
                  <span className="w-6 h-6 bg-green-700 text-white rounded-full flex items-center justify-center text-xs font-bold">O</span>
                  Objective (Tanda Vital)
                </h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { name: 'tekananDarah', label: 'Tekanan Darah (mmHg)', placeholder: '120/80', value: rekamMedis?.tekananDarah },
                    { name: 'suhuTubuh', label: 'Suhu Tubuh (°C)', placeholder: '36.5', value: rekamMedis?.suhuTubuh },
                    { name: 'beratBadan', label: 'Berat Badan (kg)', placeholder: '65.0', value: rekamMedis?.beratBadan },
                    { name: 'tinggiBadan', label: 'Tinggi Badan (cm)', placeholder: '170.0', value: rekamMedis?.tinggiBadan },
                  ].map(field => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{field.label} *</label>
                      <input type="number" name={field.name} step="0.1"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                        required placeholder={field.placeholder}
                        defaultValue={field.value ?? ''} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Assessment */}
              <div className="bg-gray-50 rounded-xl p-5 space-y-4">
                <h4 className="font-semibold text-green-700 flex items-center gap-2">
                  <span className="w-6 h-6 bg-green-700 text-white rounded-full flex items-center justify-center text-xs font-bold">A</span>
                  Assessment (Diagnosa)
                </h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Diagnosa Medis *</label>
                  <textarea name="diagnosa" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none" rows={2} required placeholder="Contoh: R51 - Headache (ICD-10)" defaultValue={rekamMedis?.diagnosa || ''} />
                </div>
              </div>

              {/* Plan */}
              <div className="bg-gray-50 rounded-xl p-5 space-y-4">
                <h4 className="font-semibold text-green-700 flex items-center gap-2">
                  <span className="w-6 h-6 bg-green-700 text-white rounded-full flex items-center justify-center text-xs font-bold">P</span>
                  Plan (Perencanaan / Edukasi / Rujukan)
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Catatan Tambahan & Edukasi Pasien *</label>
                    <textarea name="catatanTambahan" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none" rows={3} required placeholder="Contoh: Istirahat yang cukup..." defaultValue={rekamMedis?.catatanTambahan || ''} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Resep Obat <span className="text-xs font-normal text-gray-400">(Opsional)</span></label>
                    <textarea name="rincianObat" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none" rows={3} placeholder="Format bebas..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Permintaan Tes Lab <span className="text-xs font-normal text-gray-400">(Opsional)</span></label>
                    <textarea name="permintaanLab" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none" rows={2} placeholder="Ketik jenis tes..." />
                  </div>
                </div>
              </div>

              <ConfirmSubmitButton formId="rmeForm" />
            </form>
          </div>
        </div>

        {/* Mobile */}
        <div className="lg:hidden flex items-center justify-center min-h-screen bg-gray-50 p-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center max-w-sm">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth={2} className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">Formulir EMR</h2>
            <p className="text-sm text-gray-500 mb-4">Untuk mengisi formulir EMR, silakan gunakan perangkat dengan layar lebih besar.</p>
            <Link href="/dokter" className="inline-block w-full py-2.5 bg-green-700 text-white font-semibold text-sm rounded-xl hover:bg-green-600 transition-colors">
              Kembali ke Dashboard
            </Link>
          </div>
        </div>
      </DashboardShell>
    );
  } catch (error) {
    console.error('EMR Page Error:', error);
    let errorMessage = 'Terjadi kesalahan server saat memuat halaman EMR.';
    if (error instanceof Error) {
      if (error.message.includes('connect')) errorMessage = 'Gagal terhubung ke database.';
      else if (error.message.includes('relation')) errorMessage = 'Error struktur database.';
      else if (error.message.includes('timeout')) errorMessage = 'Timeout koneksi database.';
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center max-w-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-sm text-gray-500 mb-4">{errorMessage}</p>
          <Link href="/dokter" className="inline-block px-4 py-2 bg-green-700 text-white text-sm font-semibold rounded-xl hover:bg-green-600 transition-colors">
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    );
  }
}