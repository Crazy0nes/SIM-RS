import { prisma } from '@/lib/prisma';
import { getUserSession } from '../pasien/actions';
import { redirect } from 'next/navigation';
import { simpanHasilLab } from './actions';
import DashboardShell from '@/components/DashboardShell';

export const dynamic = 'force-dynamic';

export default async function LabDashboard() {
  const session = await getUserSession();
  if (!session || session.role !== 'LAB') {
    redirect('/login');
  }

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

  const today = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' });

  return (
    <DashboardShell role="LAB">
      {/* Desktop */}
      <div className="hidden lg:block p-6">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Laboratorium</h1>
            <p className="text-sm text-gray-500 mt-0.5">{today}</p>
          </div>
          <span className="px-3 py-1.5 bg-cyan-50 border border-cyan-100 text-cyan-700 text-xs font-semibold rounded-full">
            {labRequests.length} Permintaan
          </span>
        </div>

        {labRequests.length > 0 ? (
          <div className="space-y-4">
            {labRequests.map((row) => (
              <div key={row.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex flex-col lg:flex-row gap-4 justify-between items-start pb-4 border-b border-dashed border-gray-200">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-full">Lab #{row.id}</span>
                      <span className="text-xs text-gray-400">|</span>
                      <span className="text-xs text-gray-500">{row.rekamMedis.antrean.poliklinik.namaPoli}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{row.rekamMedis.antrean.pasien.namaLengkap}</p>
                    <p className="text-xs text-gray-400">
                      NIK: {row.rekamMedis.antrean.pasien.nik} ·{' '}
                      No Antrean: <span className="font-bold text-green-700">{String(row.rekamMedis.antrean.noAntrean).padStart(3, '0')}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-4 mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Instruksi Dokter</p>
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <p className="text-sm text-blue-800 whitespace-pre-wrap font-medium">{row.jenisTes}</p>
                  </div>
                </div>

                <form action={simpanHasilLab.bind(null, row.id)} className="flex flex-col gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Input Hasil Tes Laboratorium
                    </label>
                    <textarea
                      name="hasilLab"
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none transition-all"
                      rows={3}
                      placeholder="Ketik hasil yang didapat dari darah/urin/rontgen pasien..."
                      required
                    />
                  </div>
                  <div className="flex justify-end">
                    <button type="submit"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-700 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-colors">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                      </svg>
                      Simpan Hasil & Selesaikan
                    </button>
                  </div>
                </form>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth={1.5} className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1">Tidak Ada Antrean Lab</h3>
            <p className="text-sm text-gray-400">Tidak ada sampel laboratorium yang perlu diproses.</p>
          </div>
        )}
      </div>

      {/* Mobile */}
      <div className="lg:hidden">
        <div className="bg-green-700 text-white px-4 py-4 sticky top-0 z-10 shadow-md">
          <h1 className="text-base font-bold">Dashboard Laboratorium</h1>
          <p className="text-xs text-green-300 mt-0.5">{today}</p>
        </div>

        <div className="p-4 pb-24">
          {labRequests.length > 0 ? (
            <div className="space-y-3">
              {labRequests.map((row) => (
                <div key={row.id} className="bg-white rounded-xl border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-full">Lab #{row.id}</span>
                    <span className="font-bold text-green-700">#{String(row.rekamMedis.antrean.noAntrean).padStart(3, '0')}</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{row.rekamMedis.antrean.pasien.namaLengkap}</p>
                  <p className="text-xs text-gray-400 mb-3">{row.rekamMedis.antrean.poliklinik.namaPoli}</p>
                  <p className="text-xs text-blue-700 bg-blue-50 rounded-lg p-2 mb-3 whitespace-pre-wrap">{row.jenisTes}</p>
                  <form action={simpanHasilLab.bind(null, row.id)} className="flex flex-col gap-2">
                    <textarea
                      name="hasilLab"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
                      rows={3}
                      placeholder="Input hasil lab..."
                      required
                    />
                    <button type="submit" className="w-full py-2 bg-green-700 text-white text-sm font-semibold rounded-lg">
                      Simpan Hasil
                    </button>
                  </form>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400 text-sm">
              Tidak ada antrean laboratorium.
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
