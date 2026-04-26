'use client';

import { useState } from 'react';
import Link from 'next/link';
import { simpanHasilLab } from '@/app/lab/actions';

interface LabItem {
  id: number;
  jenisTes: string;
  hasilLab: string | null;
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

interface LabClientProps {
  initialLabs: LabItem[];
  today: string;
}

export default function LabClient({ initialLabs, today }: LabClientProps) {
  const [selectedLab, setSelectedLab] = useState<LabItem | null>(null);
  const [labs, setLabs] = useState(initialLabs);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, labId: number) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const hasilLab = formData.get('hasilLab') as string;
    if (!hasilLab?.trim()) {
      alert('Hasil lab wajib diisi.');
      return;
    }
    setConfirmingId(labId);
    try {
      await simpanHasilLab(labId, formData);
      setLabs(prev => prev.filter(l => l.id !== labId));
      setSelectedLab(null);
    } catch {
      alert('Gagal menyimpan hasil lab.');
    } finally {
      setConfirmingId(null);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* Desktop Sidebar */}
      <aside className="w-64 shrink-0 bg-blue-700 text-white flex-col hidden lg:flex h-full">
        <div className="px-6 pt-6 pb-4 border-b border-blue-600">
          <div className="text-base font-bold leading-tight">RS Tentara P. Siantar</div>
          <div className="text-xs text-blue-300 mt-0.5">Portal Laboratorium</div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <Link href="/lab" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium bg-white/20 text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11m0 0H5m4 0h10m0-11v11m0 0H15"/>
            </svg>
            Permintaan Tes
          </Link>
        </nav>
        <div className="px-3 py-4 border-t border-blue-600">
          <form action={async () => {
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile Top Bar */}
        <header className="lg:hidden shrink-0 bg-blue-700 text-white px-4 py-3 flex items-center justify-between shadow-md z-30 sticky top-0">
          <div className="text-sm font-bold leading-tight">RS Tentara P. Siantar</div>
          <div className="text-xs text-blue-300">Portal Laboratorium</div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto">

          {/* Mobile: Lab Request List */}
          <div className="lg:hidden p-4 pb-24">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-lg font-bold text-gray-900">Permintaan Tes</h1>
                <p className="text-xs text-gray-500 mt-0.5">{today}</p>
              </div>
              <span className="px-2.5 py-1 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                {labs.length} Menunggu
              </span>
            </div>
            {labs.length > 0 ? (
              <div className="space-y-3">
                {labs.map((lab) => (
                  <button
                    key={lab.id}
                    onClick={() => setSelectedLab(lab)}
                    className="w-full bg-white rounded-2xl border border-gray-100 p-4 text-left shadow-sm hover:shadow-md transition-shadow flex items-center gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          Lab #{lab.id}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-800 truncate">{lab.rekamMedis.antrean.pasien.namaLengkap}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        #{String(lab.rekamMedis.antrean.noAntrean).padStart(3, '0')} · {lab.rekamMedis.antrean.poliklinik.namaPoli}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 truncate">{lab.jenisTes}</p>
                    </div>
                    <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                    </div>
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
                <p className="text-sm font-semibold text-gray-700">Semua permintaan tes sudah diproses</p>
                <p className="text-xs text-gray-400 mt-1">Tidak ada permintaan tes yang menunggu.</p>
              </div>
            )}
          </div>

          {/* Desktop: Split View */}
          <div className="hidden lg:flex h-full">

            {/* Left Panel — Lab Request List */}
            <div className="w-96 shrink-0 border-r border-gray-200 overflow-y-auto bg-gray-50">
              <div className="p-6 pb-4">
                <h1 className="text-xl font-bold text-gray-900">Permintaan Tes Medis</h1>
                <p className="text-sm text-gray-500 mt-0.5">{today}</p>
              </div>
              <div className="px-4 pb-6 space-y-3">
                {labs.length > 0 ? labs.map((lab) => (
                  <button
                    key={lab.id}
                    onClick={() => setSelectedLab(lab)}
                    className="w-full text-left"
                  >
                    <div
                      className={`rounded-2xl border p-4 flex items-center gap-3 transition-all ${
                        selectedLab?.id === lab.id
                          ? 'bg-blue-700 border-blue-700 shadow-lg'
                          : 'bg-white border-gray-100 shadow-sm hover:shadow-md'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-semibold ${selectedLab?.id === lab.id ? 'text-blue-200' : 'text-gray-500'}`}>
                            Lab #{lab.id}
                          </span>
                          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            selectedLab?.id === lab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {lab.rekamMedis.antrean.noAntrean}
                          </span>
                        </div>
                        <p className={`text-sm font-semibold truncate ${selectedLab?.id === lab.id ? 'text-white' : 'text-gray-800'}`}>
                          {lab.rekamMedis.antrean.pasien.namaLengkap}
                        </p>
                        <p className={`text-xs mt-0.5 truncate ${selectedLab?.id === lab.id ? 'text-blue-200' : 'text-gray-400'}`}>
                          {lab.rekamMedis.antrean.poliklinik.namaPoli}
                        </p>
                        <p className={`text-xs mt-1 truncate ${selectedLab?.id === lab.id ? 'text-blue-200' : 'text-gray-500'}`}>
                          {lab.jenisTes}
                        </p>
                      </div>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        selectedLab?.id === lab.id ? 'bg-white/20' : 'bg-black'
                      }`}>
                        <svg viewBox="0 0 24 24" fill="none" stroke={selectedLab?.id === lab.id ? 'white' : 'white'} strokeWidth={2.5} className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19"/>
                          <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
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
                    <p className="text-sm font-semibold text-gray-700">Semua permintaan tes sudah diproses</p>
                    <p className="text-xs text-gray-400 mt-1">Tidak ada permintaan tes yang menunggu.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel — Input Form */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
              {selectedLab ? (
                <LabInputPanel
                  lab={selectedLab}
                  onSubmit={handleSubmit}
                  confirmingId={confirmingId}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth={1.5} className="w-10 h-10">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11m0 0H5m4 0h10m0-11v11m0 0H15"/>
                    </svg>
                  </div>
                  <p className="text-base font-semibold text-gray-500">Pilih permintaan tes untuk mengisi hasil</p>
                  <p className="text-sm text-gray-400 mt-1">Klik tombol + pada salah satu kartu di sebelah kiri.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Detail Sheet */}
      {selectedLab && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedLab(null)} />
          <div className="absolute bottom-0 left-0 right-0 bg-gray-50 rounded-t-3xl shadow-2xl flex flex-col max-h-[90vh]">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>
            {/* Header with back */}
            <div className="px-5 pt-2 pb-3 flex items-center gap-3">
              <button
                onClick={() => setSelectedLab(null)}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-gray-600" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              <span className="text-sm font-semibold text-gray-800">Input Hasil Tes</span>
              <span className="ml-auto text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                Lab #{selectedLab.id}
              </span>
            </div>
            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 pb-6">
              <LabInputPanel
                lab={selectedLab}
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

function LabInputPanel({
  lab,
  onSubmit,
  confirmingId,
}: {
  lab: LabItem;
  onSubmit: (e: React.FormEvent<HTMLFormElement>, labId: number) => void;
  confirmingId: number | null;
}) {
  const params = lab.jenisTes.split(/[,;\n]/).map(p => p.trim()).filter(Boolean);

  return (
    <div className="max-w-lg mx-auto">
      {/* Summary Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Info Pasien</p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-400 mb-0.5">Nama Pasien</p>
            <p className="text-sm font-semibold text-gray-800">{lab.rekamMedis.antrean.pasien.namaLengkap}</p>
          </div>
          <div className="bg-blue-50 rounded-xl px-4 py-3">
            <p className="text-xs text-blue-600 mb-0.5">No. Antrean</p>
            <p className="text-lg font-bold text-blue-700">{String(lab.rekamMedis.antrean.noAntrean).padStart(3, '0')}</p>
          </div>
          <div className="bg-gray-50 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-400 mb-0.5">NIK</p>
            <p className="text-sm font-semibold text-gray-800">{lab.rekamMedis.antrean.pasien.nik}</p>
          </div>
          <div className="bg-gray-50 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-400 mb-0.5">Poliklinik</p>
            <p className="text-sm font-semibold text-gray-800">{lab.rekamMedis.antrean.poliklinik.namaPoli}</p>
          </div>
        </div>

        {/* Parameter Checklist */}
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Parameter Pemeriksaan</p>
        <div className="space-y-2">
          {params.length > 0 ? params.map((param, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} className="w-3 h-3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-700">{param}</p>
            </div>
          )) : (
            <p className="text-sm text-gray-400 italic">Tidak ada parameter spesifik.</p>
          )}
        </div>
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => onSubmit(e, lab.id)}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6"
      >
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Input Hasil Pemeriksaan</p>

        {/* Row 1: Tanggal */}
        <div className="mb-3">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
            <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth={2} className="w-3 h-3">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            Tanggal Pemeriksaan
          </label>
          <input
            type="date"
            name="tanggalPemeriksaan"
            defaultValue={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Row 2 & 3: Hasil Lab */}
        <div className="mb-4">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
            <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-400 text-xs font-bold">i</div>
            Hasil Tes / Catatan
          </label>
          <textarea
            name="hasilLab"
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            rows={5}
            placeholder="Ketik hasil pemeriksaan laboratorium di sini..."
            required
          />
        </div>

        <button
          type="submit"
          disabled={confirmingId === lab.id}
          className="w-full py-3.5 bg-black hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-semibold rounded-full transition-colors flex items-center justify-center gap-2"
        >
          {confirmingId === lab.id ? (
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4}/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Input Hasil Pemeriksaan
            </>
          )}
        </button>
      </form>
    </div>
  );
}
