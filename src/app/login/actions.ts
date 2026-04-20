'use server'

import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function loginUser(prevState: any, formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string
  
  if (!username || !password) {
    return { error: 'Username dan Password wajib diisi!' }
  }

  let rolePath = '';

  try {
    const user = await prisma.user.findUnique({
      where: { username }
    })

    // Pada sistem lama, password tidak di-hash
    if (!user || user.password !== password) {
      return { error: 'Username atau password salah!' }
    }

    const cookieStore = await cookies()
    cookieStore.set('auth_user', JSON.stringify({ 
      id: user.id, 
      role: user.role, 
      username: user.username 
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7 // 1 minggu
    })

    rolePath = user.role.toLowerCase()
    
    // Custom mapping for roles that don't match folder names 1:1
    if (user.role === 'APOTEKER') {
      rolePath = 'farmasi';
    }
  } catch(e: any) {
    return { error: 'Terjadi kesalahan internal server: ' + e.message }
  }
  
  // Mengembalikan aksi sukses jika lolos (redirect ditangani klien agar UI terespon bebas)
  return { success: true, redirectUrl: `/${rolePath}` }
}
