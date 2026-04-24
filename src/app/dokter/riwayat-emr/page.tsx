import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getUserSession } from '@/app/pasien/actions';
import { redirect } from 'next/navigation';
import RiwayatEMRClient from '@/components/RiwayatEMRClient';
import DashboardShell from '@/components/DashboardShell';

export const dynamic = 'force-dynamic';

export default async function RiwayatEMR({
  searchParams
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const resolvedParams = await searchParams;
  const session = await getUserSession();

  if (!session || session.role !== 'DOKTER') {
    redirect('/login');
  }

  const dokter = await prisma.dokter.findUnique({
    where: { userId: session.id },
    include: { poliklinik: true }
  });

  if (!dokter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center max-w-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-2">Akun Belum Dipetakan</h2>
          <p className="text-sm text-gray-500">Akun Anda belum dipetakan sebagai Dokter.</p>
        </div>
      </div>
    );
  }

  const rekamMedisList = await prisma.rekamMedis.findMany({
    where: { antrean: { poliklinikId: dokter.poliklinikId } },
    include: { antrean: { include: { pasien: true } } },
    orderBy: { id: 'desc' },
    take: 50,
  });

  const serializedRekamMedis = rekamMedisList.map(rm => ({
    id: rm.id,
    diagnosa: rm.diagnosa,
    antreanId: rm.antreanId,
    antrean: {
      noAntrean: rm.antrean.noAntrean,
      tanggal: rm.antrean.tanggal,
      status: rm.antrean.status,
      pasien: { namaLengkap: rm.antrean.pasien.namaLengkap, nik: rm.antrean.pasien.nik }
    }
  }));

  return (
    <DashboardShell role="DOKTER" poliName={dokter.poliklinik.namaPoli}>
      {/* Desktop */}
      <div className="hidden lg:block p-6">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Riwayat Rekam Medis Elektronik</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {dokter.poliklinik.namaPoli} — {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })}
            </p>
          </div>
          <span className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
            {rekamMedisList.length} EMR
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">Riwayat EMR Pasien</h3>
          </div>

          {rekamMedisList.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    {['Tanggal', 'No Antrean', 'Nama Pasien', 'NIK', 'Diagnosa', 'Aksi'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {rekamMedisList.map((rm) => (
                    <tr key={rm.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3.5 text-sm text-gray-500">
                        {rm.antrean.tanggal.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-green-700">{String(rm.antrean.noAntrean).padStart(3, '0')}</span>
                      </td>
                      <td className="px-4 py-3.5 text-sm font-medium text-gray-800">{rm.antrean.pasien.namaLengkap}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-500">{rm.antrean.pasien.nik}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-600 max-w-xs truncate">{rm.diagnosa}</td>
                      <td className="px-4 py-3.5">
                        <Link href={`/dokter/rme/${rm.antreanId}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-medium rounded-lg transition-colors">
                          Lihat Detail
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                            <path d="M9 5l7 7-7 7"/>
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-gray-400 text-sm">Belum ada riwayat EMR untuk poliklinik ini.</div>
          )}
        </div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden">
        <RiwayatEMRClient
          initialTab={resolvedParams.tab || 'resume'}
          rekamMedisList={serializedRekamMedis}
          currentPath="/dokter/riwayat-emr"
          poliName={dokter.poliklinik.namaPoli}
        />
      </div>
    </DashboardShell>
  );
}