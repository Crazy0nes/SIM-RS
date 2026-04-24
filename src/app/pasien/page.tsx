import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getUserSession } from './actions';
import { redirect } from 'next/navigation';
import AmbilAntreanButton from './AmbilAntreanButton';
import PasienDashboardClient from '@/components/PasienDashboardClient';
import DashboardShell from '@/components/DashboardShell';

export const dynamic = 'force-dynamic';

export default async function PasienDashboard() {
  const session = await getUserSession();

  if (!session || session.role !== 'PASIEN') {
    redirect('/login');
  }

  const dateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());
  const todayUTC = new Date(dateStr + 'T00:00:00.000Z');

  const pasien = await prisma.pasien.findUnique({
    where: { userId: session.id },
    include: {
      antreans: {
        where: { tanggal: { gte: todayUTC } },
        orderBy: [ { tanggal: 'asc' }, { id: 'asc' } ],
        take: 1,
        include: { poliklinik: true }
      }
    }
  });

  const poliklinikList = await prisma.poliklinik.findMany({
    orderBy: { namaPoli: 'asc' }
  });
  const serializablePoliklinikList = poliklinikList.map(p => ({
    id: p.id,
    namaPoli: p.namaPoli,
    biayaKonsultasi: p.biayaKonsultasi?.toString?.() ?? String(p.biayaKonsultasi ?? '')
  }));

  const antreanHariIni = pasien?.antreans[0];

  const serializedPasien = pasien ? {
    namaLengkap: pasien.namaLengkap,
    id: pasien.id,
    nik: pasien.nik,
    noBpjs: pasien.noBpjs,
    alamat: pasien.alamat,
  } : null;

  const serializedAntrean = antreanHariIni ? {
    noAntrean: antreanHariIni.noAntrean,
    status: antreanHariIni.status,
    tanggal: antreanHariIni.tanggal,
    poliklinik: antreanHariIni.poliklinik ? { namaPoli: antreanHariIni.poliklinik.namaPoli } : undefined,
  } : null;

  const today = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' });

  return (
    <DashboardShell role="PASIEN">
      {/* Desktop view */}
      <div className="hidden lg:block p-6">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Selamat Datang, {pasien?.namaLengkap || session.username}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">{today}</p>
          </div>
          <Link
            href="/feedback"
            className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Isi Evaluasi Kepuasan
          </Link>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Queue Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <h3 className="text-base font-semibold text-gray-600 mb-6">Nomor Antrean Anda Hari Ini</h3>
            {antreanHariIni ? (
              <>
                <div className="inline-block text-7xl font-extrabold text-green-700 border-4 border-dashed border-green-300 px-10 py-4 rounded-2xl mb-4">
                  {String(antreanHariIni.noAntrean).padStart(3, '0')}
                </div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"/>
                  <span className="text-sm font-semibold text-green-700 uppercase">{antreanHariIni.status}</span>
                </div>
                <p className="text-sm text-gray-500 mb-1">
                  {new Date(antreanHariIni.tanggal).toLocaleDateString('id-ID', {day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta'})}
                </p>
                {antreanHariIni.poliklinik && (
                  <p className="text-sm text-gray-400 mt-1">
                    Poli: {antreanHariIni.poliklinik.namaPoli}
                  </p>
                )}
              </>
            ) : (
              <>
                <div className="inline-block text-7xl font-extrabold text-gray-300 border-4 border-dashed border-gray-200 px-10 py-4 rounded-2xl mb-4">
                  --
                </div>
                <p className="text-gray-500 mb-5">Anda belum mengambil tiket antrean hari ini.</p>
                {pasien ? (
                  <AmbilAntreanButton poliklinikList={serializablePoliklinikList} />
                ) : (
                  <p className="text-red-500 text-sm">Anda belum melengkapi form pendaftaran pasien.</p>
                )}
              </>
            )}
          </div>

          {/* Info Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-base font-semibold text-gray-700 mb-4">Informasi Pasien</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
                <span className="text-sm text-gray-500">Nama Lengkap</span>
                <span className="text-sm font-semibold text-gray-800">{pasien?.namaLengkap || '-'}</span>
              </div>
              <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
                <span className="text-sm text-gray-500">ID Pasien</span>
                <span className="text-sm font-semibold text-gray-800">PSN-{String(pasien?.id || 0).padStart(4, '0')}</span>
              </div>
              <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
                <span className="text-sm text-gray-500">NIK</span>
                <span className="text-sm font-semibold text-gray-800">{pasien?.nik || '-'}</span>
              </div>
              {pasien?.noBpjs && (
                <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
                  <span className="text-sm text-gray-500">No. BPJS</span>
                  <span className="text-sm font-semibold text-gray-800">{pasien.noBpjs}</span>
                </div>
              )}
              {pasien?.alamat && (
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-gray-500">Alamat</span>
                  <span className="text-sm font-semibold text-gray-800 text-right max-w-xs">{pasien.alamat}</span>
                </div>
              )}
            </div>

            <h3 className="text-base font-semibold text-gray-700 mt-6 mb-4">Notifikasi</h3>
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">
              Belum ada notifikasi baru untuk Anda hari ini.
            </div>
          </div>
        </div>
      </div>

      {/* Mobile view */}
      <div className="lg:hidden">
        <PasienDashboardClient
          pasien={serializedPasien}
          antreanHariIni={serializedAntrean}
          poliList={serializablePoliklinikList}
        />
      </div>
    </DashboardShell>
  );
}