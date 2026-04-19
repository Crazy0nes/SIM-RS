'use server'

import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function getUserSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get('auth_user')
  if (!session) return null
  try {
    return JSON.parse(session.value)
  } catch {
    return null
  }
}

export async function logoutUser() {
  const cookieStore = await cookies()
  cookieStore.delete('auth_user')
  redirect('/')
}

export async function ambilAntrean(poliklinikId: number) {
  const session = await getUserSession()
  if (!session || session.role !== 'PASIEN') {
    return { error: 'Anda tidak memiliki akses.' }
  }

  try {
    // Dapatkan pasienId dari userId
    const pasien = await prisma.pasien.findUnique({
      where: { userId: session.id }
    })

    if (!pasien) {
      return { error: 'Data detail pasien belum lengkap.' }
    }

    const dateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());
    const targetDateUTC = new Date(dateStr + 'T00:00:00.000Z');

    const existingAntrean = await prisma.antrean.findFirst({
      where: {
        pasienId: pasien.id,
        tanggal: targetDateUTC
      }
    })

    if (existingAntrean) {
      return { error: 'Anda sudah mengambil antrean untuk tanggal tersebut.' }
    }

    // Hitung antrean di POLI yang sama, pada TANGGAL tersebut
    const antreanCount = await prisma.antrean.count({
      where: {
        poliklinikId: poliklinikId,
        tanggal: targetDateUTC
      }
    })

    // Buat antrean baru
    await prisma.antrean.create({
      data: {
        pasienId: pasien.id,
        poliklinikId: poliklinikId,
        tanggal: targetDateUTC,
        noAntrean: antreanCount + 1,
        status: 'MENUNGGU'
      }
    })

    revalidatePath('/pasien')
    return { success: true }
  } catch (error: unknown) {
    console.error("Antrean error:", error);
    return { error: 'Gagal mengambil antrean: ' + (error as Error).message }
  }
}
