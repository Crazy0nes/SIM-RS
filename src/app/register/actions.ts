'use server'

import { prisma } from '@/lib/prisma'
import { promises as fs } from 'fs'
import path from 'path'

export async function registerPasien(prevState: any, formData: FormData) {
  try {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const nama_lengkap = formData.get('nama_lengkap') as string;
    const nik = formData.get('nik') as string;
    const no_bpjs = formData.get('no_bpjs') as string || null;
    
    // Kita menangkap nama file-nya saja hasil intercept dari Client Side
    const ktp_name = formData.get('ktp_name') as string | null;
    const bpjs_name = formData.get('bpjs_name') as string | null;

    if (!username || !password || !nama_lengkap || !nik || !ktp_name) {
      return { error: 'Semua field dengan tanda bintang (*) wajib diisi.' }
    }

    const existingUser = await prisma.user.findUnique({ where: { username } })
    if (existingUser) return { error: 'Username sudah terdaftar!' }
    
    const existingPasien = await prisma.pasien.findUnique({ where: { nik } })
    if (existingPasien) return { error: 'NIK sudah terdaftar!' }

    let ktpPath = null;
    let bpjsPath = null;

    // Vercel menerapkan Read-Only File System, sehingga fs.writeFile tidak akan bekerja di server produksi.
    // Sebagai MVP sementara sebelum mengintegrasikan Vercel Blob/S3, kita hanya akan menyimpan nama filenya saja.
    if (ktp_name) {
      ktpPath = `/uploads/dummy_${ktp_name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
    }
    
    if (bpjs_name) {
      bpjsPath = `/uploads/dummy_${bpjs_name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
    }

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username,
          password,
          role: 'PASIEN'
        }
      });

      await tx.pasien.create({
        data: {
          userId: user.id,
          namaLengkap: nama_lengkap,
          nik: nik,
          noBpjs: no_bpjs,
          dokumenKtp: ktpPath,
          dokumenBpjs: bpjsPath
        }
      });
    });

    return { success: true, message: 'Pendaftaran berhasil dibuat! Anda bisa login sekarang.' }
  } catch (error: unknown) {
    return { error: 'Kesalahan server internal: ' + (error as Error).message }
  }
}
