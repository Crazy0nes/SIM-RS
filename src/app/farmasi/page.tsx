import { prisma } from '@/lib/prisma';
import { getUserSession } from '@/app/pasien/actions';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import FarmasiClient from '@/components/FarmasiClient';

export const dynamic = 'force-dynamic';

export default async function FarmasiDashboard() {
  const session = await getUserSession();
  if (!session || session.role !== 'APOTEKER') {
    redirect('/login');
  }

  const reseps = await prisma.resep.findMany({
    where: { status: 'MENUNGGU' },
    include: {
      rekamMedis: {
        include: {
          antrean: {
            include: { pasien: true, poliklinik: true }
          }
        }
      }
    },
    orderBy: { id: 'asc' }
  });

  const serializedReseps = reseps.map(r => ({
    id: r.id,
    rincianObat: r.rincianObat,
    status: r.status,
    rekamMedis: {
      antrean: {
        noAntrean: r.rekamMedis.antrean.noAntrean,
        tanggal: r.rekamMedis.antrean.tanggal.toISOString(),
        pasien: {
          namaLengkap: r.rekamMedis.antrean.pasien.namaLengkap,
          nik: r.rekamMedis.antrean.pasien.nik,
        },
        poliklinik: {
          namaPoli: r.rekamMedis.antrean.poliklinik.namaPoli,
        }
      }
    }
  }));

  const today = new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  });

  return (
    <DashboardShell role="APOTEKER">
      <FarmasiClient initialReseps={serializedReseps} today={today} />
    </DashboardShell>
  );
}
