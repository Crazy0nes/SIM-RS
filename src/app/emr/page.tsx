import { prisma } from '@/lib/prisma';
import { getUserSession } from '../pasien/actions';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';

export const dynamic = 'force-dynamic';

export default async function EMRPage() {
  const session = await getUserSession();
  if (!session || session.role !== 'PASIEN') {
    redirect('/login');
  }

  const pasien = await prisma.pasien.findUnique({ where: { userId: session.id } });
  if (!pasien) redirect('/login');

  const rekamMedisList = await prisma.rekamMedis.findMany({
    where: { antrean: { pasienId: pasien.id } },
    include: {
      antrean: { include: { poliklinik: true } },
      resep: { select: { rincianObat: true } },
    },
    orderBy: { id: 'desc' },
    take: 20,
  });

  return (
    <DashboardShell role="PASIEN">
      {/* Desktop */}
      <div className="hidden lg:block p-6">
        <div className="mb-6 pb-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Rekam Medis Elektronik (RME)</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })}
          </p>
        </div>

        {rekamMedisList.length > 0 ? (
          <div className="space-y-4">
            {rekamMedisList.map((rm) => (
              <div key={rm.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-xs text-green-700 font-semibold uppercase tracking-wider">{rm.antrean.poliklinik.namaPoli}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {new Date(rm.antrean.tanggal).toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta' })}
                    </div>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">SELESAI</span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div className="bg-gray-50 rounded-xl px-4 py-3">
                    <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Subjektif</div>
                    <div className="text-gray-700 leading-relaxed">{rm.keluhanUtama}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl px-4 py-3">
                    <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Objektif</div>
                    <div className="text-gray-700 leading-relaxed">TD: {rm.tekananDarah} | Suhu: {rm.suhuTubuh}°C | BB: {rm.beratBadan}kg | TB: {rm.tinggiBadan}cm</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl px-4 py-3">
                    <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Assessment</div>
                    <div className="text-gray-700 leading-relaxed">{rm.diagnosa}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl px-4 py-3">
                    <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Plan</div>
                    <div className="text-gray-700 leading-relaxed">{rm.catatanTambahan}</div>
                  </div>
                </div>

                {rm.resep.length > 0 && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-4">
                    <div className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">Resep Obat</div>
                    <div className="text-sm text-blue-800 leading-relaxed whitespace-pre-wrap">{rm.resep.map(r => r.rincianObat).join('\n')}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-2xl p-8 text-center text-gray-400">
            <p>Belum ada rekam medis.</p>
          </div>
        )}
      </div>

      {/* Mobile */}
      <div className="lg:hidden p-4">
        <div className="bg-green-700 text-white p-4 rounded-2xl mb-4">
          <div className="text-lg font-bold">Rekam Medis Saya</div>
          <div className="text-xs opacity-75 mt-1">
            {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })}
          </div>
        </div>

        {rekamMedisList.length > 0 ? (
          <div className="space-y-3 pb-20">
            {rekamMedisList.map((rm) => (
              <div key={rm.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-xs text-green-700 font-semibold">{rm.antrean.poliklinik.namaPoli}</div>
                    <div className="text-sm font-medium text-gray-800 mt-1">
                      {new Date(rm.antrean.tanggal).toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta' })}
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">SELESAI</span>
                </div>
                <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Diagnosa</div>
                <div className="text-sm text-gray-700 mb-3">{rm.diagnosa}</div>
                {rm.resep.length > 0 && (
                  <>
                    <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Resep</div>
                    <div className="text-sm text-blue-800 bg-blue-50 rounded-lg px-3 py-2 whitespace-pre-wrap">{rm.resep.map(r => r.rincianObat).join('\n')}</div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400 text-sm">Belum ada rekam medis.</div>
        )}
      </div>
    </DashboardShell>
  );
}