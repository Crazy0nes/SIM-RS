'use client';

import { useState } from 'react';
import Link from 'next/link';
import { serahkanObat } from '@/app/farmasi/actions';

interface ResepItem {
  id: number;
  rincianObat: string;
  status: string;
  rekamMedis: {
    antrean: {
      noAntrean: number;
      tanggal: string;
      pasien: { namaLengkap: string; nik: string };
      poliklinik: { namaPoli: string };
    };
  };
}

interface FarmasiClientProps {
  initialReseps: ResepItem[];
  today: string;
}

export default function FarmasiClient({ initialReseps, today }: FarmasiClientProps) {
  const [selectedResep, setSelectedResep] = useState<ResepItem | null>(null);
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());
  const [reseps, setReseps] = useState(initialReseps);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  const removeResep = async (resepId: number, formData: FormData) => {
    setConfirmingId(resepId);
    try {
      await serahkanObat(resepId, formData);
      setReseps(prev => prev.filter(r => r.id !== resepId));
      setSelectedResep(null);
    } catch {
      alert('Gagal menyerahkan obat.');
    } finally {
      setConfirmingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, resepId: number) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const biaya = formData.get('biayaObat') as string;
    if (!biaya) {
      alert('Biaya obat wajib diisi.');
      return;
    }
    setPendingIds(prev => new Set(prev).add(resepId));
    await removeResep(resepId, formData);
    setPendingIds(prev => { const n = new Set(prev); n.delete(resepId); return n; });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* =========================================
          DESKTOP SIDEBAR
          ========================================= */}
      <aside className="w-64 shrink-0 bg-green-700 text-white flex-col hidden lg:flex h-full">
        <div className="px-6 pt-6 pb-4 border-b border-green-600">
          <div className="text-base font-bold leading-tight">RS Tentara P. Siantar</div>
          <div className="text-xs text-green-300 mt-0.5">Portal Farmasi</div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <Link href="/farmasi" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium bg-white/20 text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
            </svg>
            Antrean Resep
          </Link>
        </nav>
        <div className="px-3 py-4 border-t border-green-600">
          <form action={async () => {
            const { cookies } = await import('next/headers');
            const { logoutUser } = await import('@/app/pasien/actions');
            await logoutUser();
          }}>
            <button type="submit" className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-200 hover:bg-red-500/20 hover:text-red-100 transition-all">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Logout Keluar
            </button>
          </form>
        </div>
      </aside>

      {/* =========================================
          MOBILE SIDEBAR OVERLAY
          ========================================= */}
      {false && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" />
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile Top Bar */}
        <header className="lg:hidden shrink-0 bg-green-700 text-white px-4 py-3 flex items-center justify-between shadow-md z-30 sticky top-0">
          <div className="text-sm font-bold leading-tight">RS Tentara P. Siantar</div>
          <div className="text-xs text-green-300">Portal Farmasi</div>
        </header>

        {/* =========================================
            MAIN CONTENT
            ========================================= */}
        <main className="flex-1 overflow-y-auto">

          {/* Mobile: Antrean Resep */}
          <div className="lg:hidden p-4 pb-24">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-lg font-bold text-gray-900">Antrean Resep</h1>
                <p className="text-xs text-gray-500 mt-0.5">{today}</p>
              </div>
              <span className="px-2.5 py-1 bg-purple-50 border border-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                {reseps.length} Menunggu
              </span>
            </div>
            {reseps.length > 0 ? (
              <div className="space-y-3">
                {reseps.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedResep(r)}
                    className="w-full bg-white rounded-2xl border border-gray-100 p-4 text-left shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-500">Resep #{r.id}</span>
                      <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth={2} className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{r.rekamMedis.antrean.pasien.namaLengkap}</p>
                    <p className="text-xs text-gray-400 mt-0.5">#{String(r.rekamMedis.antrean.noAntrean).padStart(3, '0')} · {r.rekamMedis.antrean.poliklinik.namaPoli}</p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth={1.5} className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <p className="text-sm font-semibold text-gray-700">Semua resep sudah diserahkan</p>
                <p className="text-xs text-gray-400 mt-1">Tidak ada antrean resep hari ini.</p>
              </div>
            )}
          </div>

          {/* Desktop: Split View */}
          <div className="hidden lg:flex h-full">

            {/* Left Panel — Queue List */}
            <div className="w-96 shrink-0 border-r border-gray-200 overflow-y-auto bg-gray-50">
              <div className="p-6 pb-4">
                <h1 className="text-xl font-bold text-gray-900">Antrean Resep</h1>
                <p className="text-sm text-gray-500 mt-0.5">{today}</p>
              </div>
              <div className="px-4 pb-6 space-y-3">
                {reseps.length > 0 ? reseps.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedResep(r)}
                    className="w-full text-left"
                  >
                    <div
                      className={`rounded-2xl border p-4 transition-all ${
                        selectedResep?.id === r.id
                          ? 'bg-green-700 border-green-700 shadow-lg'
                          : 'bg-white border-gray-100 shadow-sm hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-semibold ${selectedResep?.id === r.id ? 'text-green-200' : 'text-gray-500'}`}>
                          Resep #{r.id}
                        </span>
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          selectedResep?.id === r.id
                            ? 'bg-white/20 text-white'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {r.rekamMedis.antrean.noAntrean}
                        </span>
                      </div>
                      <p className={`text-sm font-semibold ${selectedResep?.id === r.id ? 'text-white' : 'text-gray-800'}`}>
                        {r.rekamMedis.antrean.pasien.namaLengkap}
                      </p>
                      <p className={`text-xs mt-0.5 ${selectedResep?.id === r.id ? 'text-green-200' : 'text-gray-400'}`}>
                        {r.rekamMedis.antrean.poliklinik.namaPoli}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs ${selectedResep?.id === r.id ? 'text-green-200' : 'text-gray-400'}`}>
                          NIK: {r.rekamMedis.antrean.pasien.nik}
                        </span>
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          selectedResep?.id === r.id ? 'bg-white/20' : 'bg-gray-100'
                        }`}>
                          <svg viewBox="0 0 24 24" fill="none" stroke={selectedResep?.id === r.id ? 'white' : '#9ca3af'} strokeWidth={2.5} className="w-3 h-3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                          </svg>
                        </span>
                      </div>
                    </div>
                  </button>
                )) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth={1.5} className="w-8 h-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-gray-700">Semua resep sudah diserahkan</p>
                    <p className="text-xs text-gray-400 mt-1">Tidak ada antrean resep hari ini.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel — Detail */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
              {selectedResep ? (
                <DetailPanel
                  resep={selectedResep}
                  onSubmit={handleSubmit}
                  confirmingId={confirmingId}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth={1.5} className="w-10 h-10">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                    </svg>
                  </div>
                  <p className="text-base font-semibold text-gray-500">Pilih antrean untuk melihat detail resep</p>
                  <p className="text-sm text-gray-400 mt-1">Klik salah satu kartu di sebelah kiri.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* =========================================
          MOBILE DETAIL SHEET
          ========================================= */}
      {selectedResep && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSelectedResep(null)}
          />
          {/* Sheet */}
          <div className="absolute bottom-0 left-0 right-0 bg-gray-50 rounded-t-3xl shadow-2xl flex flex-col max-h-[90vh]">
            {/* Sheet Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>
            {/* Header */}
            <div className="px-5 pt-2 pb-4 flex items-center justify-between border-b border-gray-200">
              <button
                onClick={() => setSelectedResep(null)}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 19l-7-7 7-7"/>
                </svg>
                Kembali
              </button>
              <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
                Resep #{selectedResep.id}
              </span>
            </div>
            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <DetailPanel
                resep={selectedResep}
                onSubmit={handleSubmit}
                confirmingId={confirmingId}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailPanel({
  resep,
  onSubmit,
  confirmingId,
}: {
  resep: ResepItem;
  onSubmit: (e: React.FormEvent<HTMLFormElement>, resepId: number) => void;
  confirmingId: number | null;
}) {
  return (
    <div className="max-w-lg mx-auto">
      {/* Patient Info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Info Pasien</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-400 mb-0.5">Nama Pasien</p>
            <p className="text-sm font-semibold text-gray-800">{resep.rekamMedis.antrean.pasien.namaLengkap}</p>
          </div>
          <div className="bg-green-50 rounded-xl px-4 py-3">
            <p className="text-xs text-green-600 mb-0.5">No. Antrean</p>
            <p className="text-lg font-bold text-green-700">{String(resep.rekamMedis.antrean.noAntrean).padStart(3, '0')}</p>
          </div>
          <div className="bg-gray-50 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-400 mb-0.5">NIK</p>
            <p className="text-sm font-semibold text-gray-800">{resep.rekamMedis.antrean.pasien.nik}</p>
          </div>
          <div className="bg-gray-50 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-400 mb-0.5">Poliklinik</p>
            <p className="text-sm font-semibold text-gray-800">{resep.rekamMedis.antrean.poliklinik.namaPoli}</p>
          </div>
        </div>
      </div>

      {/* Prescription Detail */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Rincian Resep</p>
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <pre className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed font-sans">
            {resep.rincianObat}
          </pre>
        </div>
      </div>

      {/* Confirm Form */}
      <form
        onSubmit={(e) => onSubmit(e, resep.id)}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6"
      >
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Serahkan Obat</p>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Total Biaya Obat (Rp)</label>
          <input
            type="number"
            name="biayaObat"
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            placeholder="Contoh: 50000"
            required
          />
        </div>
        <button
          type="submit"
          disabled={confirmingId === resep.id}
          className="w-full py-3 bg-black hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-semibold rounded-full transition-colors flex items-center justify-center gap-2"
        >
          {confirmingId === resep.id ? (
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4}/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13l4 4L19 7"/>
              </svg>
              Konfirmasi Selesai
            </>
          )}
        </button>
      </form>
    </div>
  );
}
