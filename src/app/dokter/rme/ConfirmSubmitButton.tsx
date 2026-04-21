'use client'

import React from 'react'

export default function ConfirmSubmitButton({ formId }: { formId: string }) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!confirm('Apakah Anda yakin ingin menyimpan EMR dan menyelesaikan antrean pasien ini?')) {
      return
    }

    const form = document.getElementById(formId) as HTMLFormElement | null
    if (form) {
      // Use requestSubmit if available to trigger form validation
      if (typeof (form as any).requestSubmit === 'function') {
        ;(form as any).requestSubmit()
      } else {
        form.submit()
      }
    }
  }

  return (
    <button type="button" className="btn btn-primary" style={{ padding: '12px', fontSize: '16px', marginTop: '1rem' }} onClick={handleClick}>
      Simpan EMR & Selesaikan Antrean
    </button>
  )
}
