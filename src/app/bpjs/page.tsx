import { prisma } from '@/lib/prisma';
import { getUserSession } from '@/app/pasien/actions';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import BPJSClient from '@/components/BPJSClient';

export const dynamic = 'force-dynamic';

export default async function BPJSPage() {
  const session = await getUserSession();
  if (!session || (session.role !== 'BPJS' && session.role !== 'ADMIN' && session.role !== 'KASIR')) {
    redirect('/login');
  }

  const klaims = await prisma.klaimBpjs.findMany({
    take: 50,
    include: {
      tagihan: {
        include: {
          antrean: {
            include: { pasien: true }
          },
          items: {
            select: { id: true, namaItem: true, jumlah: true, harga: true, subTotal: true }
          }
        }
      }
    },
    orderBy: { id: 'desc' }
  });

  const serializedKlaims = klaims.map(k => ({
    id: k.id,
    tagihanId: k.tagihanId,
    status: k.status,
    tagihan: {
      totalBiaya: k.tagihan.totalBiaya.toString(),
      status: k.tagihan.status,
      antrean: {
        noAntrean: k.tagihan.antrean.noAntrean,
        pasien: {
          namaLengkap: k.tagihan.antrean.pasien.namaLengkap,
          nik: k.tagihan.antrean.pasien.nik,
          noBpjs: k.tagihan.antrean.pasien.noBpjs,
        }
      },
      items: k.tagihan.items.map(i => ({
        id: i.id,
        namaItem: i.namaItem,
        jumlah: i.jumlah,
        harga: i.harga.toString(),
        subTotal: i.subTotal.toString(),
      }))
    }
  }));

  const stats = {
    total: klaims.length,
    disetujui: klaims.filter(k => k.status === 'DISETUJUI').length,
    menunggu: klaims.filter(k => k.status === 'MENUNGGU').length,
  };

  const today = new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  });

  return (
    <DashboardShell role="KASIR">
      <BPJSClient initialKlaims={serializedKlaims} stats={stats} today={today} />
    </DashboardShell>
  );
}
