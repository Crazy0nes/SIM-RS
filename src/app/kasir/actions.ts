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
      // For now, we keep Tagihan BELUM_DIBAYAR, or we can mark it LUNAS directly since it's going to BPJS.
      // But typically it wait for BPJS approval. To hide it from Kasir Active Tagihans, we can mark it LUNAS, or change our query.
      // Easiest MVP: Mark tagihan status as LUNAS because from the patient's view, it's paid by insurance. 
      // The BPJS dashboard will track the actual klaim status.
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
