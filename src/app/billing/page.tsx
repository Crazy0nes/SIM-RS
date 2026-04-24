import { prisma } from '@/lib/prisma';
import { getUserSession } from '../pasien/actions';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import DashboardShell from '@/components/DashboardShell';

export const dynamic = 'force-dynamic';

export default async function BillingPage() {
  const session = await getUserSession();
  if (!session || session.role !== 'PASIEN') {
    redirect('/login');
  }

  const pasien = await prisma.pasien.findUnique({ where: { userId: session.id } });
  if (!pasien) redirect('/login');

  const tagihans = await prisma.tagihan.findMany({
    where: { antrean: { pasienId: pasien.id } },
    include: { antrean: { include: { poliklinik: true } }, items: true },
    orderBy: { id: 'desc' },
    take: 20,
  });

  const totalBelumBayar = tagihans
    .filter(t => t.status === 'BELUM_DIBAYAR')
    .reduce((sum, t) => sum + Number(t.totalBiaya), 0);

  const statusBadge: Record<string, string> = {
    BELUM_DIBAYAR: 'bg-orange-100 text-orange-700',
    LUNAS: 'bg-green-100 text-green-700',
    MENUNGGU_BPJS: 'bg-blue-100 text-blue-700',
    DITOLAK_BPJS: 'bg-red-100 text-red-700',
  };

  return (
    <DashboardShell role="PASIEN">
      {/* Desktop */}
      <div className="hidden lg:block p-6">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Daftar Tagihan</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })}
            </p>
          </div>
          {totalBelumBayar > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-2">
              <span className="text-xs text-orange-600 font-medium">Total Belum Bayar: </span>
              <span className="text-sm font-bold text-orange-700">Rp {totalBelumBayar.toLocaleString('id-ID')}</span>
            </div>
          )}
        </div>

        {tagihans.length > 0 ? (
          <div className="space-y-4">
            {tagihans.map((tagihan) => (
              <div key={tagihan.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Invoice #{tagihan.id}</div>
                    <div className="text-sm font-semibold text-gray-800">{tagihan.antrean.poliklinik.namaPoli}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(tagihan.antrean.tanggal).toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta' })}
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusBadge[tagihan.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {tagihan.status === 'BELUM_DIBAYAR' ? 'Belum Bayar' : tagihan.status === 'LUNAS' ? 'Lunas' : tagihan.status}
                  </span>
                </div>

                <table className="w-full text-sm mb-4">
                  <tbody>
                    {tagihan.items.map((item) => (
                      <tr key={item.id} className="border-b border-gray-50">
                        <td className="py-2 pr-4 text-gray-600">{item.namaItem}</td>
                        <td className="py-2 pr-4 text-center text-gray-400 w-12">x{item.jumlah}</td>
                        <td className="py-2 text-right font-medium text-gray-800">Rp {Number(item.subTotal).toLocaleString('id-ID')}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={2} className="py-2 text-sm font-bold text-gray-700">Total</td>
                      <td className="py-2 text-right text-base font-bold text-orange-600">Rp {Number(tagihan.totalBiaya).toLocaleString('id-ID')}</td>
                    </tr>
                  </tfoot>
                </table>

                {tagihan.status === 'BELUM_DIBAYAR' && (
                  <div className="flex justify-end">
                    <Link href="/kasir" className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-colors">
                      Bayar Sekarang
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-2xl p-8 text-center text-gray-400">
            <p>Belum ada tagihan.</p>
          </div>
        )}
      </div>

      {/* Mobile */}
      <div className="lg:hidden p-4">
        <div className="bg-green-700 text-white p-4 rounded-2xl mb-4">
          <div className="text-lg font-bold">Daftar Tagihan</div>
          <div className="text-xs opacity-75 mt-1">
            {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })}
          </div>
        </div>

        {totalBelumBayar > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 mb-4">
            <span className="text-xs text-orange-600 font-medium">Total Belum Bayar: </span>
            <span className="text-sm font-bold text-orange-700">Rp {totalBelumBayar.toLocaleString('id-ID')}</span>
          </div>
        )}

        {tagihans.length > 0 ? (
          <div className="space-y-3 pb-20">
            {tagihans.map((tagihan) => (
              <div key={tagihan.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-xs text-gray-400">#{tagihan.id}</div>
                    <div className="text-sm font-medium text-gray-800">{tagihan.antrean.poliklinik.namaPoli}</div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge[tagihan.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {tagihan.status === 'BELUM_DIBAYAR' ? 'Belum Bayar' : tagihan.status}
                  </span>
                </div>
                <div className="text-base font-bold text-orange-600 mb-3">Rp {Number(tagihan.totalBiaya).toLocaleString('id-ID')}</div>
                {tagihan.status === 'BELUM_DIBAYAR' && (
                  <Link href="/kasir" className="block w-full py-2 text-center bg-green-700 text-white text-sm font-semibold rounded-xl">
                    Bayar Sekarang
                  </Link>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400 text-sm">Belum ada tagihan.</div>
        )}
      </div>
    </DashboardShell>
  );
}