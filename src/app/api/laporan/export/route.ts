import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const start = url.searchParams.get('start')
  const end = url.searchParams.get('end')

  const where: any = {}
  if (start || end) where.tanggal = {}
  if (start) where.tanggal.gte = new Date(start)
  if (end) where.tanggal.lte = new Date(end)

  const antreans = await prisma.antrean.findMany({ where, include: { pasien: true, poliklinik: true, tagihan: true } })

  // Build CSV
  const header = ['AntreanID','Tanggal','Pasien','Poliklinik','NoAntrean','Status','TotalTagihan']
  const rows = antreans.map(a => [
    String(a.id),
    a.tanggal.toISOString(),
    a.pasien?.namaLengkap ?? '',
    a.poliklinik?.namaPoli ?? '',
    String(a.noAntrean),
    a.status,
    a.tagihan ? a.tagihan.totalBiaya.toString() : ''
  ])

  const csv = [header.join(','), ...rows.map(r => r.map(v => '"' + String(v).replace(/"/g,'""') + '"').join(','))].join('\n')

  return new NextResponse(csv, {
    status: 200,
    headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="laporan_antrean.csv"' }
  })
}
