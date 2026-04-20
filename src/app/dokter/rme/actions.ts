'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getUserSession } from '../../pasien/actions'
import { redirect } from 'next/navigation'

export async function simpanRekamMedis(formData: FormData) {
  const session = await getUserSession()
  if (!session || session.role !== 'DOKTER') {
    throw new Error('Akses ditolak.');
  }

  const antreanId = parseInt(formData.get('antreanId') as string)
  const keluhanUtama = formData.get('keluhanUtama') as string
  const riwayatPenyakit = formData.get('riwayatPenyakit') as string
  const tekananDarah = formData.get('tekananDarah') as string
  const suhuTubuhStr = formData.get('suhuTubuh') as string
  const beratBadanStr = formData.get('beratBadan') as string
  const tinggiBadanStr = formData.get('tinggiBadan') as string
  const diagnosa = formData.get('diagnosa') as string
  const catatanTambahan = formData.get('catatanTambahan') as string
  const rincianObat = formData.get('rincianObat') as string

  if (!antreanId || !keluhanUtama || !riwayatPenyakit || !tekananDarah || !suhuTubuhStr || !beratBadanStr || !tinggiBadanStr || !diagnosa || !catatanTambahan) {
     throw new Error('Semua field RME wajib diisi.');
  }

  const suhuTubuh = parseFloat(suhuTubuhStr)
  const beratBadan = parseFloat(beratBadanStr)
  const tinggiBadan = parseFloat(tinggiBadanStr)

  try {
    await prisma.$transaction(async (tx) => {
      const rm = await tx.rekamMedis.upsert({
        where: { antreanId },
        update: {
          keluhanUtama,
          riwayatPenyakit,
          tekananDarah,
          suhuTubuh,
          beratBadan,
          tinggiBadan,
          diagnosa,
          catatanTambahan
        },
        create: {
          antreanId,
          keluhanUtama,
          riwayatPenyakit,
          tekananDarah,
          suhuTubuh,
          beratBadan,
          tinggiBadan,
          diagnosa,
          catatanTambahan
        }
      });

      if (rincianObat && rincianObat.trim().length > 0) {
        // Cek apakah sudah ada resep untuk RM ini (untuk kasus update ganda)
        const existingResep = await tx.resep.findFirst({
           where: { rekamMedisId: rm.id }
        });
        if (existingResep) {
            await tx.resep.update({
               where: { id: existingResep.id },
               data: { rincianObat }
            });
        } else {
            await tx.resep.create({
               data: {
                  rekamMedisId: rm.id,
                  rincianObat,
                  status: 'MENUNGGU'
               }
            });
        }
      }

      const antreanData = await tx.antrean.findUnique({
        where: { id: antreanId },
        include: { poliklinik: true }
      });

      const biayaKonsultasi = antreanData?.poliklinik.biayaKonsultasi || 150000;

      // 3. Generate initial Tagihan and ItemTagihan (Konsultasi)
      const existingTagihan = await tx.tagihan.findUnique({
        where: { antreanId }
      });

      if (!existingTagihan) {
        await tx.tagihan.create({
          data: {
            antreanId,
            totalBiaya: biayaKonsultasi,
            status: 'BELUM_DIBAYAR',
            items: {
              create: [
                {
                  namaItem: `Jasa Konsultasi - ${antreanData?.poliklinik.namaPoli}`,
                  jumlah: 1,
                  harga: biayaKonsultasi,
                  subTotal: biayaKonsultasi
                }
              ]
            }
          }
        });
      }

      await tx.antrean.update({
        where: { id: antreanId },
        data: { status: 'SELESAI' }
      });
    });

  } catch (err) {
    console.error("Gagal menyimpan rekam medis", err)
    throw new Error('Gagal menyimpan rekam medis.');
  }

  // Redirect kembali ke halaman antrean dokter
  revalidatePath('/dokter')
  redirect('/dokter')
}
