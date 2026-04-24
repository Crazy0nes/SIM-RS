'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerPasien } from './actions';

export default function Register() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const ktpFile = formData.get('dokumen_ktp') as File;
    const bpjsFile = formData.get('dokumen_bpjs') as File;

    if (ktpFile && ktpFile.name) {
      formData.set('ktp_name', ktpFile.name);
    }
    if (bpjsFile && bpjsFile.name) {
      formData.set('bpjs_name', bpjsFile.name);
    }

    formData.delete('dokumen_ktp');
    formData.delete('dokumen_bpjs');

    try {
      const result = await registerPasien(null, formData);

      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        setSuccess(result.message || 'Pendaftaran Berhasil!');
        setTimeout(() => router.push('/login'), 2000);
      }
    } catch {
      setError('Gagal menghubungi server.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";
  const requiredStar = <span className="text-red-500 ml-0.5">*</span>;

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center flex items-start justify-center p-4 py-6"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80')" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-green-900/60 backdrop-blur-sm" />

      {/* Card */}
      <div className="relative w-full max-w-lg animate-fade-in">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/30">

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Link
              href="/login"
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center flex-shrink-0 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
              </svg>
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-green-700 leading-tight">
                Daftar Pasien Baru
              </h1>
              <p className="text-gray-500 text-xs sm:text-sm">
                Pelayanan online terpadu RS Tentara P. Siantar
              </p>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4 flex items-start gap-2">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm mb-4 flex items-start gap-2">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <div>
                {success}
                <Link href="/login" className="block mt-1 font-semibold underline">Login di sini</Link>
              </div>
            </div>
          )}

          {!success && (
            <form onSubmit={handleRegister} className="space-y-4">

              {/* Akun Section */}
              <div>
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                  Akun
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass} htmlFor="username">
                      Username{requiredStar}
                    </label>
                    <input
                      type="text" id="username" name="username"
                      required placeholder="Masukkan username"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="password">
                      Password{requiredStar}
                    </label>
                    <input
                      type="password" id="password" name="password"
                      required placeholder="Masukkan password"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Data Pribadi Section */}
              <div>
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  Data Pribadi
                </h2>

                {/* Nama Lengkap */}
                <div className="mb-3">
                  <label className={labelClass} htmlFor="nama_lengkap">
                    Nama Lengkap (Sesuai KTP){requiredStar}
                  </label>
                  <input
                    type="text" id="nama_lengkap" name="nama_lengkap"
                    required placeholder="Masukkan nama lengkap"
                    className={inputClass}
                  />
                </div>

                {/* NIK & BPJS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass} htmlFor="nik">
                      Nomor NIK{requiredStar}
                    </label>
                    <input
                      type="number" id="nik" name="nik"
                      required placeholder="16 digit NIK"
                      className={`${inputClass} appearance-none`}
                      inputMode="numeric"
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="no_bpjs">
                      Nomor BPJS <span className="text-xs font-normal text-gray-400">(Opsional)</span>
                    </label>
                    <input
                      type="number" id="no_bpjs" name="no_bpjs"
                      placeholder="13 digit BPJS"
                      className={`${inputClass} appearance-none`}
                      inputMode="numeric"
                    />
                  </div>
                </div>
              </div>

              {/* Dokumen Section */}
              <div>
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  Dokumen
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* KTP Upload */}
                  <div>
                    <label className={labelClass} htmlFor="dokumen_ktp">
                      Upload KTP{requiredStar}
                    </label>
                    <label className="block cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 border-dashed rounded-xl hover:bg-gray-100 hover:border-green-400 transition-all text-sm text-gray-500">
                        <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        <span className="truncate text-xs">Pilih file KTP...</span>
                      </div>
                      <input
                        type="file" id="dokumen_ktp" name="dokumen_ktp"
                        required accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          const label = e.target.parentElement?.querySelector('span');
                          if (label) label.textContent = file?.name || 'Pilih file KTP...';
                        }}
                      />
                    </label>
                    <p className="text-xs text-gray-400 mt-1">Format: JPG, PNG, PDF</p>
                  </div>

                  {/* BPJS Upload */}
                  <div>
                    <label className={labelClass} htmlFor="dokumen_bpjs">
                      Upload BPJS <span className="text-xs font-normal text-gray-400">(Opsional)</span>
                    </label>
                    <label className="block cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 border-dashed rounded-xl hover:bg-gray-100 hover:border-green-400 transition-all text-sm text-gray-500">
                        <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        <span className="truncate text-xs">Pilih file BPJS...</span>
                      </div>
                      <input
                        type="file" id="dokumen_bpjs" name="dokumen_bpjs"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          const label = e.target.parentElement?.querySelector('span');
                          if (label) label.textContent = file?.name || 'Pilih file BPJS...';
                        }}
                      />
                    </label>
                    <p className="text-xs text-gray-400 mt-1">Format: JPG, PNG, PDF</p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-green-700 hover:bg-green-600 active:bg-green-800 text-white font-semibold rounded-xl shadow-lg shadow-green-700/30 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-sm sm:text-base mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Memproses...
                  </span>
                ) : 'Daftar Sekarang'}
              </button>
            </form>
          )}

          {/* Login Link */}
          {!success && (
            <p className="text-center text-sm text-gray-500 mt-5">
              Sudah punya akun?{' '}
              <Link href="/login" className="font-semibold text-green-700 hover:text-green-600 transition-colors">
                Login di sini
              </Link>
            </p>
          )}

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 mt-4">
            RS Tentara P. Siantar &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
