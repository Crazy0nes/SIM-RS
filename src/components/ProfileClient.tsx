'use client';

import { useState } from 'react';
import { updateProfile } from '@/app/pasien/actions';
import { useRouter } from 'next/navigation';

interface ProfileClientProps {
  pasien: {
    namaLengkap: string;
    nik: string;
    noBpjs?: string | null;
    alamat?: string | null;
  };
}

export default function ProfileClient({ pasien }: ProfileClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    const formData = new FormData(e.currentTarget);
    const result = await updateProfile(null, formData);

    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess('Profil berhasil diperbarui!');
      setTimeout(() => router.refresh(), 1500);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4 pb-24">
      {success && (
        <div className="mb-4 flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 flex-shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 flex-shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-bold text-gray-700 mb-4">Informasi Pribadi</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Nama Lengkap</label>
              <input type="text" name="namaLengkap" defaultValue={pasien.namaLengkap}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">NIK</label>
              <input type="text" name="nik" defaultValue={pasien.nik}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">No. BPJS</label>
              <input type="text" name="noBpjs" defaultValue={pasien.noBpjs ?? ''} placeholder="Opsional"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Alamat</label>
              <textarea name="alamat" defaultValue={pasien.alamat ?? ''} rows={2}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-3 bg-green-700 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-60">
          {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </form>
    </div>
  );
}