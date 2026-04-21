'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getUserSession } from '../pasien/actions'

export async function prosesPembayaran(tagihanId: number) {
  const session = await getUserSession()
  if (!session || session.role !== 'KASIR') {
    throw new Error('Akses ditolak. Anda bukan Kasir.');
  }

  try {
    await prisma.tagihan.update({
      where: { id: tagihanId },
      data: { status: 'LUNAS' }
    });
    
    revalidatePath('/kasir');
  } catch (err) {
    console.error(err);
    throw new Error('Gagal memproses pembayaran tagihan.');
  }
}

export async function ajukanKlaimBpjs(tagihanId: number) {
  const session = await getUserSession()
  if (!session || session.role !== 'KASIR') {
    throw new Error('Akses ditolak. Anda bukan Kasir.');
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Create Klaim Bpjs
      await tx.klaimBpjs.create({
        data: {
          tagihanId,
          status: 'MENUNGGU'
        }
      });
      // Biarkan tagihan BELUM_DIBAYAR sementara, atau langsung LUNAS karena klaim BPJS.
      // Tunggu approval BPJS. Sembunyikan dari daftar kasir dengan mark LUNAS.
      // MVP: Mark LUNAS, pasien anggap sudah bayar.
      // BPJS dashboard track status klaim.
      await tx.tagihan.update({
        where: { id: tagihanId },
        data: { status: 'LUNAS' }
      });
    });
    
    revalidatePath('/kasir');
  } catch (err) {
    console.error(err);
    throw new Error('Gagal mengajukan klaim BPJS.');
  }
}
