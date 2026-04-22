import { prisma } from '../../lib/prisma'
import Link from 'next/link'

export default async function LaporanPage() {
  const [totalPasien, totalAntrean, totalTagihan, klaimCount] = await Promise.all([
    prisma.pasien.count(),
    prisma.antrean.count(),
    prisma.tagihan.aggregate({ _sum: { totalBiaya: true } }).then(r => r._sum.totalBiaya ?? 0),
    prisma.klaimBpjs.count(),
  ])

  return (
    <div>
      <h1>Laporan Manajemen (Ringkasan)</h1>
      <ul>
        <li>Total Pasien: {totalPasien}</li>
        <li>Total Antrean: {totalAntrean}</li>
        <li>Total Nilai Tagihan: {totalTagihan.toString()}</li>
        <li>Jumlah Klaim BPJS: {klaimCount}</li>
      </ul>

      <p><Link href="/">Kembali</Link></p>
    </div>
  )
}
