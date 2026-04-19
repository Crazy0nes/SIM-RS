'use client'

import { useState } from 'react'
import { ambilAntrean } from './actions'
import { useRouter } from 'next/navigation'

export default function AmbilAntreanButton({ poliklinikList }: { poliklinikList: {id: number, namaPoli: string}[] }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [poliId, setPoliId] = useState('')
  const [tanggal, setTanggal] = useState('')
  const router = useRouter()

  const handleAmbil = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!poliId) return setError('Pilih poliklinik terlebih dahulu.')
    if (!tanggal) return setError('Pilih tanggal berobat.')

    setLoading(true)
    setError('')
    try {
      const res = await ambilAntrean(parseInt(poliId, 10), tanggal)
      if (res?.error) {
        setError(res.error)
        alert(res.error)
      } else {
        router.refresh()
      }
    } catch (e: unknown) {
      setError('Kesalahan sistem: ' + (e as Error).message)
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleAmbil} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px', textAlign: 'left' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Tujuan Poliklinik</label>
        <select 
          value={poliId} 
          onChange={(e) => setPoliId(e.target.value)} 
          className="form-control" 
          required
          style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)' }}
        >
          <option value="">-- Pilih Poliklinik --</option>
          {poliklinikList.map(poly => (
            <option key={poly.id} value={poly.id}>{poly.namaPoli}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Tanggal Berobat</label>
        <input 
          type="date" 
          value={tanggal} 
          onChange={(e) => setTanggal(e.target.value)}
          className="form-control"
          required
          min={new Date().toISOString().split('T')[0]} // hanya hari ini/ke depan
          style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)' }}
        />
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="btn btn-primary"
        style={{ marginTop: '10px' }}
      >
        {loading ? 'Memproses...' : 'Ambil Tiket Antrean'}
      </button>
      {error && <p style={{ color: 'red', marginTop: '10px', textAlign: 'center' }}>{error}</p>}
    </form>
  )
}
