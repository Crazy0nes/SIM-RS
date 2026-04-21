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
    // Avoid heavy counts in debug page to prevent DB connection spikes
    // (counts removed as quick mitigation)

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
        <div style={{ background: '#f0f0f0', padding: '1rem', margin: '1rem 0', borderRadius: '8px' }}>
          <h3>Database Status:</h3>
          <p>✅ Database connected</p>
          <p>Total Users: —</p>
          <p>Total Antreans: —</p>
        </div>

        <div style={{ background: '#e8f5e9', padding: '1rem', margin: '1rem 0', borderRadius: '8px' }}>
          <h3>Session Info:</h3>
          <p>ID: {session.id}</p>
          <p>Username: {session.username}</p>
          <p>Role: {session.role}</p>
        </div>

        <div style={{ background: '#fff3e0', padding: '1rem', margin: '1rem 0', borderRadius: '8px' }}>
          <h3>Antrean Aktif ({antreans.length}):</h3>
          {antreans.length === 0 ? (
            <p>Tidak ada antrean aktif. Silakan buat antrean dulu.</p>
          ) : (
            antreans.map(antrean => (
              <div key={antrean.id} style={{ margin: '0.5rem 0', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}>
                <p><strong>ID:</strong> {antrean.id} | <strong>Status:</strong> {antrean.status}</p>
                <p><strong>Pasien:</strong> {antrean.pasien.namaLengkap}</p>
                <p><strong>Poli:</strong> {antrean.poliklinik.namaPoli}</p>
                <Link href={`/dokter/rme/${antrean.id}`} style={{ color: 'blue', textDecoration: 'underline' }}>
                  Test EMR Link
                </Link>
              </div>
            ))
          )}
        </div>

        <div style={{ marginTop: '2rem' }}>
          <Link href="/dokter" style={{ padding: '10px 20px', background: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Debug page error:', error);
    return (
      <div style={{ padding: '2rem', color: 'red' }}>
        <h1>Error Database</h1>
        <p><strong>Error:</strong> {error instanceof Error ? error.message : 'Unknown error'}</p>
        <p><strong>Stack:</strong> {error instanceof Error ? error.stack : 'No stack trace'}</p>
        <p><strong>Database URL:</strong> {process.env.DATABASE_URL ? 'Set' : 'Not set'}</p>
        <Link href="/login">Kembali ke Login</Link>
      </div>
    );
  }
}