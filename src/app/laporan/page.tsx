import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function LaporanPage() {
  const [totalPasien, totalAntrean, totalTagihan, klaimCount, selesaiCount] = await Promise.all([
    prisma.pasien.count(),
    prisma.antrean.count(),
    prisma.tagihan.aggregate({ _sum: { totalBiaya: true } }).then(r => r._sum.totalBiaya ?? 0),
    prisma.klaimBpjs.count(),
    prisma.antrean.count({ where: { status: 'SELESAI' } }),
  ])

  const today = new Date()
  const from = new Date(today)
  from.setDate(today.getDate() - 30)
  const startISO = from.toISOString().slice(0, 10)
  const endISO = today.toISOString().slice(0, 10)
  const displayDate = today.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })

  const stats = [
    { label: 'Total Pasien', value: totalPasien.toLocaleString('id-ID'), icon: '👥', color: 'green' },
    { label: 'Total Antrean', value: totalAntrean.toLocaleString('id-ID'), icon: '📋', color: 'blue' },
    { label: 'Antrean Selesai', value: selesaiCount.toLocaleString('id-ID'), icon: '✅', color: 'emerald' },
    { label: 'Total Tagihan', value: `Rp ${Number(totalTagihan).toLocaleString('id-ID')}`, icon: '💰', color: 'orange' },
    { label: 'Klaim BPJS', value: klaimCount.toLocaleString('id-ID'), icon: '🏥', color: 'indigo' },
  ]

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
            <h1 className="text-base font-bold">Laporan Manajemen</h1>
            <p className="text-xs text-green-300">{displayDate}</p>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {stats.map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-xl font-bold text-gray-800">{stat.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Period Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">Periode Laporan Default</h3>
          <p className="text-xs text-gray-400 mb-4">Rentang 30 hari terakhir dari data yang tersedia.</p>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3">
              <div className="text-xs text-gray-400 mb-0.5">Dari</div>
              <div className="font-semibold text-gray-700">{new Date(startISO).toLocaleDateString('id-ID')}</div>
            </div>
            <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3">
              <div className="text-xs text-gray-400 mb-0.5">Sampai</div>
              <div className="font-semibold text-gray-700">{new Date(endISO).toLocaleDateString('id-ID')}</div>
            </div>
          </div>

          <h3 className="text-sm font-semibold text-gray-700 mb-3">Ekspor Laporan</h3>
          <form method="get" action="/api/laporan/export" className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Dari Tanggal</label>
              <input name="start" type="date" defaultValue={startISO}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Sampai Tanggal</label>
              <input name="end" type="date" defaultValue={endISO}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <button type="submit"
              className="px-6 py-2.5 bg-green-700 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-colors whitespace-nowrap">
              Ekspor CSV
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
