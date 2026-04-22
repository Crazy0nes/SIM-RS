import Link from 'next/link'
import { submitKlaim, syncKlaimStatuses } from './actions'
import { prisma } from '../../lib/prisma'

export default async function BPJSPage() {
  const klaims = await prisma.klaimBpjs.findMany({ take: 50, include: { tagihan: { include: { antrean: { include: { pasien: true } } } } }, orderBy: { id: 'desc' } })

  return (
    <div>
      <h1>Integrasi BPJS (Daftar Klaim)</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr><th style={{ border: '1px solid #ccc', padding: '8px' }}>ID</th><th style={{ border: '1px solid #ccc', padding: '8px' }}>Tagihan</th><th style={{ border: '1px solid #ccc', padding: '8px' }}>Pasien</th><th style={{ border: '1px solid #ccc', padding: '8px' }}>Status</th></tr></thead>
        <tbody>
          {klaims.map(k => (
            <tr key={k.id}>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{k.id}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{k.tagihanId}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{k.tagihan?.antrean?.pasien?.namaLengkap ?? '—'}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{k.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ marginTop: '2rem' }}>Buat Klaim Baru (dummy)</h2>
      <form action={submitKlaim} style={{ marginTop: '1rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Tagihan ID: <input name="tagihanId" type="number" required /></label>
        </div>
        <button type="submit">Kirim Klaim</button>
      </form>

      <form action={syncKlaimStatuses} style={{ marginTop: '1rem' }}>
        <button type="submit">Sinkronkan Status Klaim (Manual)</button>
      </form>

      <p><Link href="/">Kembali</Link></p>
    </div>
  )
}
