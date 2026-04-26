import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const start = url.searchParams.get('start');
  const end = url.searchParams.get('end');
  const type = url.searchParams.get('type');

  if (!start || !end) {
    return NextResponse.json({ error: 'start and end dates required' }, { status: 400 });
  }

  const startDate = new Date(start + 'T00:00:00.000Z');
  const endDate = new Date(end + 'T23:59:59.999Z');

  try {
    switch (type) {
      case 'pasien': {
        const count = await prisma.pasien.count();
        return NextResponse.json(count);
      }
      case 'antrean': {
        const count = await prisma.antrean.count({ where: { tanggal: { gte: startDate, lte: endDate } } });
        return NextResponse.json(count);
      }
      case 'selesai': {
        const count = await prisma.antrean.count({ where: { tanggal: { gte: startDate, lte: endDate }, status: 'SELESAI' } });
        return NextResponse.json(count);
      }
      case 'tagihan': {
        const agg = await prisma.tagihan.aggregate({
          where: { antrean: { tanggal: { gte: startDate, lte: endDate } } },
          _sum: { totalBiaya: true },
        });
        return NextResponse.json(Number(agg._sum.totalBiaya ?? 0));
      }
      case 'klaim': {
        const [disetujui, ditolak, menunggu] = await Promise.all([
          prisma.klaimBpjs.count({ where: { status: 'DISETUJUI' } }),
          prisma.klaimBpjs.count({ where: { status: 'DITOLAK' } }),
          prisma.klaimBpjs.count({ where: { status: 'MENUNGGU' } }),
        ]);
        return NextResponse.json({ disetujui, ditolak, menunggu });
      }
      case 'perday': {
        const antreans = await prisma.antrean.findMany({
          where: { tanggal: { gte: startDate, lte: endDate } },
          select: { tanggal: true },
        });
        const byDate: Record<string, number> = {};
        for (const a of antreans) {
          const key = a.tanggal.toISOString().slice(0, 10);
          byDate[key] = (byDate[key] ?? 0) + 1;
        }
        const result = Object.entries(byDate)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, count]) => ({ date, count }));
        return NextResponse.json(result);
      }
      default:
        return NextResponse.json({ error: 'Unknown type' }, { status: 400 });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
