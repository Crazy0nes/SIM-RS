import { prisma } from '@/lib/prisma';
import { getUserSession } from '../pasien/actions';
import { redirect } from 'next/navigation';
import { serahkanObat } from './actions';
import DashboardShell from '@/components/DashboardShell';

export const dynamic = 'force-dynamic';

export default async function FarmasiDashboard() {
  const session = await getUserSession();
  if (!session || session.role !== 'APOTEKER') {
    redirect('/login');
  }

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

  const today = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' });

  return (
    <DashboardShell role="APOTEKER">
      {/* Desktop */}
      <div className="hidden lg:block p-6">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Farmasi</h1>
            <p className="text-sm text-gray-500 mt-0.5">{today}</p>
          </div>
          <span className="px-3 py-1.5 bg-purple-50 border border-purple-100 text-purple-700 text-xs font-semibold rounded-full">
            {reseps.length} Resep Menunggu
          </span>
        </div>

        {reseps.length > 0 ? (
          <div className="space-y-4">
            {reseps.map((row) => (
              <div key={row.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex flex-col lg:flex-row gap-5">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">Resep #{row.id}</span>
                      <span className="text-xs text-gray-400">|</span>
                      <span className="text-xs text-gray-500">{row.rekamMedis.antrean.poliklinik.namaPoli}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{row.rekamMedis.antrean.pasien.namaLengkap}</p>
                    <p className="text-xs text-gray-400 mb-3">
                      No Antrean: <span className="font-bold text-green-700">{String(row.rekamMedis.antrean.noAntrean).padStart(3, '0')}</span>
                      {' · '}NIK: {row.rekamMedis.antrean.pasien.nik}
                    </p>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Rincian Obat</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{row.rincianObat}</p>
                    </div>
                  </div>

                  <div className="lg:w-56 flex flex-col gap-3">
                    <form action={serahkanObat.bind(null, row.id)} className="flex flex-col gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Total Biaya Obat (Rp)</label>
                        <input
                          type="number"
                          name="biayaObat"
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                          placeholder="Contoh: 50000"
                          required
                        />
                      </div>
                      <button type="submit"
                        className="w-full py-2.5 bg-green-700 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                        </svg>
                        Serahkan Obat
                      </button>
                    </form>
                  </div>
                </div>
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
            <h3 className="text-base font-bold text-gray-800 mb-1">Tidak Ada Antrean Resep</h3>
            <p className="text-sm text-gray-400">Semua resep sudah diserahkan.</p>
          </div>
        )}
      </div>

      {/* Mobile */}
      <div className="lg:hidden">
        <div className="bg-green-700 text-white px-4 py-4 sticky top-0 z-10 shadow-md">
          <h1 className="text-base font-bold">Dashboard Farmasi</h1>
          <p className="text-xs text-green-300 mt-0.5">{today}</p>
        </div>

        <div className="p-4 pb-24">
          {reseps.length > 0 ? (
            <div className="space-y-3">
              {reseps.map((row) => (
                <div key={row.id} className="bg-white rounded-xl border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                      Resep #{row.id}
                    </span>
                    <span className="font-bold text-green-700 text-sm">
                      #{String(row.rekamMedis.antrean.noAntrean).padStart(3, '0')}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{row.rekamMedis.antrean.pasien.namaLengkap}</p>
                  <p className="text-xs text-gray-400 mb-3">{row.rekamMedis.antrean.poliklinik.namaPoli}</p>
                  <p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-2 mb-3 whitespace-pre-wrap">{row.rincianObat}</p>
                  <form action={serahkanObat.bind(null, row.id)} className="flex flex-col gap-2">
                    <input
                      type="number"
                      name="biayaObat"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      placeholder="Biaya obat (Rp)"
                      required
                    />
                    <button type="submit"
                      className="w-full py-2 bg-green-700 text-white text-sm font-semibold rounded-lg">
                      Serahkan Obat
                    </button>
                  </form>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400 text-sm">
              Tidak ada antrean resep.
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
