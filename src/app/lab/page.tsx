import { prisma } from '@/lib/prisma';
import { getUserSession } from '@/app/pasien/actions';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import LabClient from '@/components/LabClient';

export const dynamic = 'force-dynamic';

export default async function LabDashboard() {
  const session = await getUserSession();
  if (!session || session.role !== 'LAB') {
    redirect('/login');
  }

  const labs = await prisma.lab.findMany({
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

  const serializedLabs = labs.map(l => ({
    id: l.id,
    jenisTes: l.jenisTes,
    hasilLab: l.hasilLab,
    status: l.status,
    rekamMedis: {
      antrean: {
        noAntrean: l.rekamMedis.antrean.noAntrean,
        tanggal: l.rekamMedis.antrean.tanggal.toISOString(),
        pasien: {
          namaLengkap: l.rekamMedis.antrean.pasien.namaLengkap,
          nik: l.rekamMedis.antrean.pasien.nik,
        },
        poliklinik: {
          namaPoli: l.rekamMedis.antrean.poliklinik.namaPoli,
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
    <DashboardShell role="LAB">
      <LabClient initialLabs={serializedLabs} today={today} />
    </DashboardShell>
  );
}
