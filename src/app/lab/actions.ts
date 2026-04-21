'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getUserSession } from '../pasien/actions'

export async function simpanHasilLab(labId: number, formData: FormData) {
  const session = await getUserSession()
  if (!session || session.role !== 'LAB') {
    throw new Error('Akses ditolak. Anda bukan petugas Lab.');
  }

  const hasilLab = formData.get('hasilLab') as string;
  if (!hasilLab) {
      throw new Error('Hasil Lab harus diisi sebelum menyelesaikannya.');
  }

  try {
    await prisma.lab.update({
      where: { id: labId },
      data: { 
        hasilLab: hasilLab,
        status: 'SELESAI' 
      }
    });
    
    revalidatePath('/lab');
  } catch (err) {
    console.error(err);
    throw new Error('Gagal menyimpan hasil lab.');
  }
}
