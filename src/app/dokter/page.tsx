import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getUserSession } from '@/app/pasien/actions';
import { redirect } from 'next/navigation';
import PeriksaButton from './PeriksaButton';
import DokterDashboardClient from '@/components/DokterDashboardClient';
import DashboardShell from '@/components/DashboardShell';

export const dynamic = 'force-dynamic';

export default async function DokterDashboard({
  searchParams
}: {
  searchParams: Promise<{ success?: string }>
}) {
  const resolvedParams = await searchParams;
  const session = await getUserSession();

  if (!session || session.role !== 'DOKTER') {
    redirect('/login');
  }

  const dateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());
  const todayUTC = new Date(dateStr + 'T00:00:00.000Z');

  const dokter = await prisma.dokter.findUnique({
    where: { userId: session.id },
    include: { poliklinik: true }
  });

  if (!dokter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center max-w-sm">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth={2} className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">Akun Belum Dipetakan</h2>
          <p className="text-sm text-gray-500">Akun Anda belum dipetakan sebagai Dokter di database. Hubungi Manajemen.</p>
        </div>
      </div>
    );
  }

  const antreans = await prisma.antrean.findMany({
    where: {
      tanggal: todayUTC,
      poliklinikId: dokter.poliklinikId,
      status: { in: ['MENUNGGU', 'DIPERIKSA'] }
    },
    include: { pasien: true },
    orderBy: { noAntrean: 'asc' }
  });

  const serializedAntreans = antreans.map(a => ({
    id: a.id,
    noAntrean: a.noAntrean,
    status: a.status,
    pasien: { namaLengkap: a.pasien.namaLengkap, nik: a.pasien.nik }
  }));

  const today = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' });

  return (
    <DashboardShell role="DOKTER" poliName={dokter.poliklinik.namaPoli}>
      {/* Desktop */}
      <div className="hidden lg:block p-6">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Antrean Pasien</h1>
            <p className="text-sm text-gray-500 mt-0.5">{dokter.poliklinik.namaPoli} — {today}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
              {antreans.filter(a => a.status === 'MENUNGGU').length} Menunggu
            </span>
            <span className="px-3 py-1.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
              {antreans.filter(a => a.status === 'DIPERIKSA').length} Diproses
            </span>
          </div>
        </div>

        {resolvedParams.success === 'emr_saved' && (
          <div className="mb-5 flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            EMR berhasil disimpan dan antrean pasien telah diselesaikan.
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">Daftar Pasien Menunggu Hari Ini</h3>
            <span className="text-xs text-gray-400">{antreans.length} pasien</span>
          </div>

          {antreans.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    {['No Antrean', 'ID Pasien', 'Nama Pasien', 'Status', 'Aksi'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {antreans.map(row => (
                    <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-green-700 text-base">{String(row.noAntrean).padStart(3, '0')}</span>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-600">PSN-{String(row.pasienId).padStart(4, '0')}</td>
                      <td className="px-4 py-3.5 text-sm font-medium text-gray-800">{row.pasien.namaLengkap}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          row.status === 'MENUNGGU' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${row.status === 'MENUNGGU' ? 'bg-orange-500' : 'bg-blue-500'}`}/>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {row.status === 'MENUNGGU' ? (
                          <PeriksaButton antreanId={row.id} />
                        ) : (
                          <Link href={`/dokter/rme/${row.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg transition-colors">
                            Lanjut EMR
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                              <path d="M9 5l7 7-7 7"/>
                            </svg>
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-16 h-16 mb-4 opacity-40">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/>
              </svg>
              <p className="text-sm font-medium">Belum ada antrean hari ini!</p>
              <p className="text-xs text-gray-400 mt-1">Pasien akan muncul di sini setelah mendaftar.</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden">
        <DokterDashboardClient antreans={serializedAntreans} poliName={dokter.poliklinik.namaPoli} currentPath="/dokter" />
      </div>
    </DashboardShell>
  );
}