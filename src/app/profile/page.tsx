import { prisma } from '@/lib/prisma';
import { getUserSession } from '../pasien/actions';
import { redirect } from 'next/navigation';
import ProfileClient from '@/components/ProfileClient';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const session = await getUserSession();
  if (!session || session.role !== 'PASIEN') {
    redirect('/login');
  }

  const pasien = await prisma.pasien.findUnique({ where: { userId: session.id } });
  if (!pasien) redirect('/login');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-700 text-white px-4 py-5 sticky top-0 z-10 shadow-md">
        <div className="max-w-lg mx-auto">
          <div className="text-xs text-green-300">
            {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })}
          </div>
          <h1 className="text-lg font-bold">Profil Saya</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto pt-2">
        <ProfileClient
          pasien={{
            namaLengkap: pasien.namaLengkap,
            nik: pasien.nik,
            noBpjs: pasien.noBpjs,
            alamat: pasien.alamat,
          }}
        />
      </div>
    </div>
  );
}