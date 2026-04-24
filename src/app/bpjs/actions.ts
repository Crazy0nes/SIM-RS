'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getUserSession } from '../pasien/actions'
import { submitClaimToBPJS, checkClaimStatusFromBPJS } from '@/lib/bpjsClient'
import { StatusKlaim } from '@prisma/client'

export async function submitKlaim(formData: FormData) {
  try {
    const tagihanId = Number(formData.get('tagihanId'))
    const klaim = await prisma.klaimBpjs.create({ data: { tagihanId } })
    try {
      const res = await submitClaimToBPJS(tagihanId)
      if (res?.approved) {
        await prisma.klaimBpjs.update({ where: { id: klaim.id }, data: { status: 'DISETUJUI' } })
      } else {
        await prisma.klaimBpjs.update({ where: { id: klaim.id }, data: { status: 'DITOLAK' } })
      }
    } catch (e) {
      console.error('BPJS submit error (simulated)', e)
    }
    revalidatePath('/bpjs')
  } catch (err) {
    console.error('submitKlaim error', err)
    throw err
  }
}

export async function setujuiKlaim(klaimId: number) {
  const session = await getUserSession()
  if (!session || session.role !== 'BPJS') {
    throw new Error('Akses ditolak.')
  }
  try {
    await prisma.klaimBpjs.update({ where: { id: klaimId }, data: { status: 'DISETUJUI' } })
    revalidatePath('/bpjs')
  } catch (err) {
    console.error(err)
    throw new Error('Gagal menyetujui klaim.')
  }
}

export async function syncKlaimStatuses() {
  try {
    const pending = await prisma.klaimBpjs.findMany({ where: { status: 'MENUNGGU' } })
    for (const k of pending) {
      try {
        const res = await checkClaimStatusFromBPJS(k.id)
        if (res?.status) {
          await prisma.klaimBpjs.update({ where: { id: k.id }, data: { status: res.status as StatusKlaim } })
        }
      } catch (e) {
        console.error('error checking claim', k.id, e)
      }
    }
    revalidatePath('/bpjs')
  } catch (e) {
    console.error('syncKlaimStatuses error', e)
    throw e
  }
}