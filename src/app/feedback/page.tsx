import Link from 'next/link'
import { createFeedback } from './actions'
import { prisma } from '../../lib/prisma'

export default async function FeedbackPage({ searchParams }: { searchParams?: { [key: string]: string } }) {
  const recent = await prisma.feedback.findMany({ take: 10, orderBy: { createdAt: 'desc' }, include: { pasien: true } })
  const agg = await prisma.feedback.aggregate({ _avg: { rating: true }, _count: { id: true } })
  const error = searchParams?.error ? decodeURIComponent(searchParams.error) : null
  const success = !!searchParams?.success

  return (
    <div>
      <h1>Evaluasi Kepuasan Pasien</h1>
      {error && <div style={{ background: '#fee', color: '#900', padding: '8px', marginBottom: '12px' }}>Error: {error}</div>}
      {success && <div style={{ background: '#efe', color: '#060', padding: '8px', marginBottom: '12px' }}>Feedback terkirim. Terima kasih.</div>}
      <form action={createFeedback}>
        <label>Pasien ID (opsional): <input name="pasienId" type="number" /></label>
        <label>Rating: <select name="rating">
          <option value="5">5</option>
          <option value="4">4</option>
          <option value="3">3</option>
          <option value="2">2</option>
          <option value="1">1</option>
        </select></label>
        <label>Pesan: <textarea name="message" required /></label>
        <button type="submit">Kirim Feedback</button>
      </form>

      <h3>Statistik</h3>
      <ul>
        <li>Jumlah feedback: {agg._count.id}</li>
        <li>Rata-rata rating: {agg._avg.rating ? Number(agg._avg.rating).toFixed(2) : '—'}</li>
      </ul>

      <h2>Feedback Terakhir</h2>
      <ul>
        {recent.map(f => {
          const pasienName = f.pasien?.namaLengkap
          const initials = pasienName ? pasienName.split(' ').map(s => s[0]).join('').slice(0,3) : null
          return (
            <li key={f.id}>{f.rating} ★ — {f.message} {initials ? `(${initials})` : ''}</li>
          )
        })}
      </ul>

      <p><Link href="/">Kembali</Link></p>
    </div>
  )
}
