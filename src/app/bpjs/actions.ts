'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getUserSession } from '../pasien/actions'

export async function setujuiKlaim(klaimId: number) {
  const session = await getUserSession()
  if (!session || session.role !== 'BPJS') {
    throw new Error('Akses ditolak.');
  }

  try {
    await prisma.klaimBpjs.update({
      where: { id: klaimId },
      data: { status: 'DISETUJUI' }
    });
    
    revalidatePath('/bpjs');
  } catch (err) {
    console.error(err);
    throw new Error('Gagal menyetujui klaim.');
  }
}
