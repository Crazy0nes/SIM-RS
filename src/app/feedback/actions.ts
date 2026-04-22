import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '../../lib/prisma'

export async function createFeedback(formData: FormData) {
  'use server'
  try {
    const pasienId = formData.get('pasienId') ? Number(formData.get('pasienId')) : undefined
    const rating = formData.get('rating') ? Number(formData.get('rating')) : 5
    const message = String(formData.get('message') || '')

    // Validate pasienId if provided to avoid foreign-key constraint errors
    if (pasienId !== undefined) {
      const pasien = await prisma.pasien.findUnique({ where: { id: pasienId } })
      if (!pasien) {
        // redirect back with error message so UI can show it
        const msg = encodeURIComponent(`Pasien dengan id=${pasienId} tidak ditemukan`)
        return redirect(`/feedback?error=${msg}`)
      }
    }

    await prisma.feedback.create({
      data: {
        pasienId: pasienId ?? undefined,
        rating,
        message,
      },
    })

    revalidatePath('/feedback')
    // redirect to show success message
    return redirect('/feedback?success=1')
  } catch (err) {
    console.error('createFeedback error', err)
    throw err
  }
}
