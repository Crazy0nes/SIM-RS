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
    
    const dokumen_ktp = formData.get('dokumen_ktp') as File;
    const dokumen_bpjs = formData.get('dokumen_bpjs') as File | null;

    if (!username || !password || !nama_lengkap || !nik || !dokumen_ktp) {
      return { error: 'Semua field dengan tanda bintang (*) wajib diisi.' }
    }

    const existingUser = await prisma.user.findUnique({ where: { username } })
    if (existingUser) return { error: 'Username sudah terdaftar!' }
    
    const existingPasien = await prisma.pasien.findUnique({ where: { nik } })
    if (existingPasien) return { error: 'NIK sudah terdaftar!' }

    let ktpPath = null;
    let bpjsPath = null;

    // Catatan: Vercel menerapkan Read-Only File System, sehingga fs.writeFile tidak akan bekerja di server produksi.
    // Sebagai MVP sementara sebelum mengintegrasikan Vercel Blob/S3, kita hanya akan menyimpan nama filenya saja.
    if (dokumen_ktp && dokumen_ktp.size > 0) {
      ktpPath = `/uploads/dummy_${dokumen_ktp.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
    }
    
    if (dokumen_bpjs && dokumen_bpjs.size > 0) {
      bpjsPath = `/uploads/dummy_${dokumen_bpjs.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
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
  } catch (error: any) {
    return { error: 'Kesalahan server internal' }
  }
}
