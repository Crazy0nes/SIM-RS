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
