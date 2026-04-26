import { prisma } from '@/lib/prisma';
import { getUserSession } from '@/app/pasien/actions';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import ManajemenClient from '@/components/ManajemenClient';

export const dynamic = 'force-dynamic';

export default async function LaporanPage() {
  const session = await getUserSession();
  if (!session || (session.role !== 'ADMIN' && session.role !== 'DOKTER')) {
    redirect('/login');
  }

  const today = new Date();
  const fromDate = new Date(today);
  fromDate.setDate(today.getDate() - 30);

  const startISO = fromDate.toISOString().slice(0, 10);
  const endISO = today.toISOString().slice(0, 10);

  const [totalPasien, totalAntrean, selesaiAntrean, tagihanAgg, klaimList, perDayData] = await Promise.all([
    prisma.pasien.count(),
    prisma.antrean.count({ where: { tanggal: { gte: fromDate, lte: today } } }),
    prisma.antrean.count({ where: { tanggal: { gte: fromDate, lte: today }, status: 'SELESAI' } }),
    prisma.tagihan.aggregate({
      where: { antrean: { tanggal: { gte: fromDate, lte: today } } },
      _sum: { totalBiaya: true },
    }),
    Promise.all([
      prisma.klaimBpjs.count({ where: { status: 'DISETUJUI' } }),
      prisma.klaimBpjs.count({ where: { status: 'DITOLAK' } }),
      prisma.klaimBpjs.count({ where: { status: 'MENUNGGU' } }),
    ]),
    prisma.antrean.findMany({
      where: { tanggal: { gte: fromDate, lte: today } },
      select: { tanggal: true },
    }),
  ]);

  const byDate: Record<string, number> = {};
  for (const a of perDayData) {
    const key = a.tanggal.toISOString().slice(0, 10);
    byDate[key] = (byDate[key] ?? 0) + 1;
  }
  const perDay = Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));

  const todayDisplay = today.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  });

  const initialData = {
    totalPasien,
    totalAntrean,
    selesaiAntrean,
    totalTagihan: Number(tagihanAgg._sum.totalBiaya ?? 0),
    klaimDisetujui: klaimList[0],
    klaimDitolak: klaimList[1],
    klaimMenunggu: klaimList[2],
    perDay,
    perPoli: [] as { namaPoli: string; count: number }[],
    startDate: startISO,
    endDate: endISO,
  };

  return (
    <DashboardShell role="ADMIN">
      <ManajemenClient
        initialData={initialData}
        defaultStart={startISO}
        defaultEnd={endISO}
        today={todayDisplay}
      />
    </DashboardShell>
  );
}
