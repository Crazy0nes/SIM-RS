import Link from 'next/link'
import { submitKlaim, syncKlaimStatuses } from './actions'
import { prisma } from '@/lib/prisma'

export default async function BPJSPage() {
  const klaims = await prisma.klaimBpjs.findMany({
    take: 50,
    include: {
      tagihan: {
        include: {
          antrean: {
            include: { pasien: true }
          }
        }
      }
    },
    orderBy: { id: 'desc' }
  })

  const statusColors: Record<string, string> = {
    MENUNGGU: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    DISETUJUI: 'bg-green-50 text-green-700 border-green-100',
    DITOLAK: 'bg-red-50 text-red-700 border-red-100',
    default: 'bg-gray-50 text-gray-600 border-gray-100'
  }

  const today = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-700 text-white sticky top-0 z-10 shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path d="M15 19l-7-7 7-7"/>
            </svg>
          </Link>
          <div>
            <h1 className="text-base font-bold">Integrasi BPJS</h1>
            <p className="text-xs text-green-300">{today}</p>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Klaim', value: klaims.length, color: 'text-gray-800', bg: 'bg-white' },
            { label: 'Disetujui', value: klaims.filter(k => k.status === 'DISETUJUI').length, color: 'text-green-700', bg: 'bg-green-50' },
            { label: 'Ditunda', value: klaims.filter(k => k.status === 'MENUNGGU').length, color: 'text-yellow-700', bg: 'bg-yellow-50' },
          ].map(stat => (
            <div key={stat.label} className={`${stat.bg} rounded-xl p-4 text-center border border-gray-100`}>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Klaim Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">Riwayat Klaim BPJS</h3>
          </div>
          {klaims.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    {['ID Klaim', 'ID Tagihan', 'Nama Pasien', 'Status'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {klaims.map(k => (
                    <tr key={k.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3.5 text-sm font-medium text-gray-800">{k.id}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-500">#{k.tagihanId}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-700">
                        {k.tagihan?.antrean?.pasien?.namaLengkap ?? '—'}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          statusColors[k.status] ?? statusColors.default
                        }`}>
                          {k.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-10 text-center text-gray-400 text-sm">Belum ada data klaim.</div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Buat Klaim Baru</h3>
          <form action={submitKlaim} className="flex flex-col sm:flex-row gap-3">
            <input
              name="tagihanId"
              type="number"
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Tagihan ID"
              required
            />
            <button type="submit" className="px-6 py-2.5 bg-green-700 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-colors">
              Kirim Klaim
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <form action={syncKlaimStatuses}>
              <button type="submit"
                className="px-5 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm font-medium rounded-xl transition-colors">
                Sinkronkan Status Klaim
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
