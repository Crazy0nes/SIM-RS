'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getUserSession } from '../pasien/actions'

export async function serahkanObat(resepId: number, formData: FormData) {
  const session = await getUserSession()
  if (!session || session.role !== 'APOTEKER') {
    throw new Error('Akses ditolak. Anda bukan Apoteker.');
  }

  const biayaObatStr = formData.get('biayaObat') as string;
  if (!biayaObatStr) {
      throw new Error('Biaya Obat harus diisi.');
  }
  const biayaObat = parseFloat(biayaObatStr);

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Dapatkan resep + tagging antrean
      const resep = await tx.resep.findUnique({
        where: { id: resepId },
        include: { rekamMedis: true }
      });
      if (!resep) throw new Error('Resep tidak ditemukan');

      // 2. Update status resep
      await tx.resep.update({
        where: { id: resepId },
        data: { status: 'DIAMBIL' }
      });

      // 3. Tambahkan ItemTagihan ke antrean tsb
      const tagihan = await tx.tagihan.findUnique({
        where: { antreanId: resep.rekamMedis.antreanId }
      });

      if (tagihan) {
        await tx.itemTagihan.create({
           data: {
              tagihanId: tagihan.id,
              namaItem: 'Biaya Obat Farmasi',
              jumlah: 1,
              harga: biayaObat,
              subTotal: biayaObat
           }
        });
        
        // Update Total Biaya Tagihan
        await tx.tagihan.update({
           where: { id: tagihan.id },
           data: {
              totalBiaya: { increment: biayaObat }
           }
        });
      }
    });
    
    revalidatePath('/farmasi');
  } catch (err) {
    console.error(err);
    throw new Error('Gagal merubah status resep.');
  }
}
