import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getUserSession } from '../../pasien/actions';
import { redirect } from 'next/navigation';

export default async function DebugPage() {
  const session = await getUserSession();

  if (!session) {
    return <div>Belum login. <Link href="/login">Login dulu</Link></div>;
  }

  if (session.role !== 'DOKTER') {
    return <div>Role Anda: {session.role}. Hanya dokter yang bisa akses halaman ini.</div>;
  }

  try {
    const antreans = await prisma.antrean.findMany({
      where: {
        status: { in: ['MENUNGGU', 'DIPERIKSA'] }
      },
      include: {
        pasien: true,
        poliklinik: true
      },
      take: 5
    });

    return (
      <div style={{ padding: '2rem' }}>
        <h1>Debug EMR Access</h1>
        <p>Session: {JSON.stringify(session)}</p>
        <p>Jumlah antrean aktif: {antreans.length}</p>

        {antreans.map(antrean => (
          <div key={antrean.id} style={{ margin: '1rem 0', padding: '1rem', border: '1px solid #ccc' }}>
            <p>ID: {antrean.id}, Status: {antrean.status}</p>
            <p>Pasien: {antrean.pasien.namaLengkap}</p>
            <Link href={`/dokter/rme/${antrean.id}`}>Test EMR Link</Link>
          </div>
        ))}
      </div>
    );
  } catch (error) {
    return <div>Error database: {error instanceof Error ? error.message : 'Unknown'}</div>;
  }
}