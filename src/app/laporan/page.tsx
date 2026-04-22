import { prisma } from '../../lib/prisma'
import Link from 'next/link'

export default async function LaporanPage() {
  const [totalPasien, totalAntrean, totalTagihan, klaimCount] = await Promise.all([
    prisma.pasien.count(),
    prisma.antrean.count(),
    prisma.tagihan.aggregate({ _sum: { totalBiaya: true } }).then(r => r._sum.totalBiaya ?? 0),
    prisma.klaimBpjs.count(),
  ])

  const today = new Date()
  const from = new Date(today)
  from.setDate(today.getDate() - 30)
  const startISO = from.toISOString().slice(0, 10)
  const endISO = today.toISOString().slice(0, 10)

  return (
    <div>
      <h1>Laporan Manajemen (Ringkasan)</h1>
      <ul>
        <li>Total Pasien: {totalPasien}</li>
        <li>Total Antrean: {totalAntrean}</li>
        <li>Total Nilai Tagihan: {totalTagihan.toString()}</li>
        <li>Jumlah Klaim BPJS: {klaimCount}</li>
      </ul>

      <h2>Ekspor Laporan</h2>
      <form method="get" action="/api/laporan/export">
        <label style={{ display: 'block', marginBottom: 8 }}>
          Dari: <input name="start" type="date" defaultValue={startISO} />
        </label>
        <label style={{ display: 'block', marginBottom: 8 }}>
          Sampai: <input name="end" type="date" defaultValue={endISO} />
        </label>
        <button type="submit">Ekspor CSV</button>
      </form>

      <p style={{ marginTop: 16 }}><Link href="/">Kembali</Link></p>
    </div>
  )
}
