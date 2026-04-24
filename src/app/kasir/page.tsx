import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getUserSession } from '../pasien/actions';
import { redirect } from 'next/navigation';
import { prosesPembayaran } from './actions';
import DashboardShell from '@/components/DashboardShell';

export const dynamic = 'force-dynamic';

export default async function KasirDashboard() {
  const session = await getUserSession();
  if (!session || session.role !== 'KASIR') {
    redirect('/login');
  }

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

  const totalBelumBayar = tagihanList.reduce((sum, t) => sum + Number(t.totalBiaya), 0);
  const today = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' });

  return (
    <DashboardShell role="KASIR">
      {/* Desktop */}
      <div className="hidden lg:block p-6">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Pembayaran</h1>
            <p className="text-sm text-gray-500 mt-0.5">{today}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 bg-red-50 border border-red-100 text-red-700 text-xs font-semibold rounded-full">
              {tagihanList.length} Tagihan
            </span>
            <span className="px-3 py-1.5 bg-orange-50 border border-orange-100 text-orange-700 text-xs font-semibold rounded-full">
              Rp {(totalBelumBayar / 1000).toFixed(0)}K tertunda
            </span>
          </div>
        </div>

        {tagihanList.length > 0 ? (
          <div className="space-y-4">
            {tagihanList.map((tagihan) => (
              <div key={tagihan.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start pb-4 border-b border-dashed border-gray-200">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">INVOICE #{tagihan.id}</span>
                      <span className="text-xs text-gray-400">|</span>
                      <span className="text-xs text-gray-400">{tagihan.antrean.poliklinik.namaPoli}</span>
                    </div>
                    <p className="text-sm text-gray-700 font-medium">{tagihan.antrean.pasien.namaLengkap}</p>
                    <p className="text-xs text-gray-400">NIK: {tagihan.antrean.pasien.nik} · {new Date(tagihan.antrean.tanggal).toLocaleDateString('id-ID')}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-xs text-gray-400 mb-0.5">Total Tagihan</div>
                    <div className="text-2xl font-bold text-orange-600">
                      Rp {Number(tagihan.totalBiaya).toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Rincian:</p>
                  <div className="space-y-1">
                    {tagihan.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-400 w-6 text-center">{item.jumlah}x</span>
                          <span className="text-sm text-gray-700">{item.namaItem}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          Rp {Number(item.subTotal).toLocaleString('id-ID')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 justify-end mt-4">
                  <Link href={`/kasir/kuitansi/${tagihan.id}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-medium rounded-lg transition-colors">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                    </svg>
                    Cetak Kuitansi
                  </Link>

                  {tagihan.antrean.pasien.noBpjs && tagihan.antrean.pasien.noBpjs.trim() !== '' && (
                    <form action={async () => {
                      'use server';
                      const { ajukanKlaimBpjs } = await import('./actions');
                      await ajukanKlaimBpjs(tagihan.id);
                    }}>
                      <button type="submit"
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg transition-colors">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                        </svg>
                        Ajukan Klaim BPJS
                      </button>
                    </form>
                  )}

                  <form action={prosesPembayaran.bind(null, tagihan.id)}>
                    <button type="submit"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-700 hover:bg-green-600 text-white text-xs font-semibold rounded-lg transition-colors">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                      </svg>
                      Proses Lunas Tunai
                    </button>
                  </form>
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
            <h3 className="text-base font-bold text-gray-800 mb-1">Semua Tagihan Lunas!</h3>
            <p className="text-sm text-gray-400">Tidak ada tagihan yang perlu diproses saat ini.</p>
          </div>
        )}
      </div>

      {/* Mobile */}
      <div className="lg:hidden">
        <div className="bg-green-700 text-white px-4 py-4 sticky top-0 z-10 shadow-md">
          <h1 className="text-base font-bold">Dashboard Kasir</h1>
          <p className="text-xs text-green-300 mt-0.5">{today}</p>
        </div>

        <div className="p-4 pb-24">
          {tagihanList.length > 0 ? (
            <div className="space-y-3">
              {tagihanList.map((tagihan) => (
                <div key={tagihan.id} className="bg-white rounded-xl border border-gray-100 p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">INV #{tagihan.id}</span>
                      <p className="text-sm font-semibold text-gray-800 mt-1">{tagihan.antrean.pasien.namaLengkap}</p>
                      <p className="text-xs text-gray-400">{tagihan.antrean.poliklinik.namaPoli}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Total</p>
                      <p className="text-lg font-bold text-orange-600">
                        Rp {Number(tagihan.totalBiaya).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/kasir/kuitansi/${tagihan.id}`} target="_blank"
                      className="flex-1 text-center py-2 border border-gray-200 text-gray-600 text-xs font-medium rounded-lg">
                      Cetak
                    </Link>
                    <form action={prosesPembayaran.bind(null, tagihan.id)} className="flex-1">
                      <button type="submit"
                        className="w-full py-2 bg-green-700 text-white text-xs font-semibold rounded-lg">
                        Bayar
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400 text-sm">
              Semua tagihan sudah lunas.
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
