'use client';

import { useState } from 'react';
import Link from 'next/link';
import { setujuiKlaim, tolakKlaim } from '@/app/bpjs/actions';

interface KlaimItem {
  id: number;
  tagihanId: number;
  status: string;
  tagihan: {
    totalBiaya: string;
    status: string;
    antrean: {
      noAntrean: number;
      pasien: { namaLengkap: string; nik: string; noBpjs: string | null };
    };
    items: { id: number; namaItem: string; jumlah: number; harga: string; subTotal: string }[];
  };
}

interface BPJSClientProps {
  initialKlaims: KlaimItem[];
  stats: { total: number; disetujui: number; menunggu: number };
  today: string;
}

export default function BPJSClient({ initialKlaims, stats, today }: BPJSClientProps) {
  const [selectedKlaim, setSelectedKlaim] = useState<KlaimItem | null>(null);
  const [klaims, setKlaims] = useState(initialKlaims);
  const [docChecked, setDocChecked] = useState(false);
  const [verified, setVerified] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const handleAction = async (action: 'terima' | 'tolak', klaimId: number) => {
    if (!docChecked || !verified) {
      alert('Lengkapi verifikasi terlebih dahulu (toggle switch).');
      return;
    }
    setProcessingId(klaimId);
    try {
      if (action === 'terima') {
        await setujuiKlaim(klaimId);
      } else {
        await tolakKlaim(klaimId);
      }
      setKlaims(prev => prev.filter(k => k.id !== klaimId));
      setSelectedKlaim(null);
    } catch {
      alert('Gagal memproses klaim.');
    } finally {
      setProcessingId(null);
    }
  };

  const openKlaim = (k: KlaimItem) => {
    setDocChecked(false);
    setVerified(false);
    setSelectedKlaim(k);
  };

  const statusBadge = (status: string) => {
    if (status === 'DISETUJUI') return { bg: 'bg-green-50', text: 'text-green-700', label: 'Disetujui' };
    if (status === 'DITOLAK') return { bg: 'bg-red-50', text: 'text-red-700', label: 'Ditolak' };
    return { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Menunggu' };
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* Desktop Sidebar */}
      <aside className="w-64 shrink-0 bg-orange-700 text-white flex-col hidden lg:flex h-full">
        <div className="px-6 pt-6 pb-4 border-b border-orange-600">
          <div className="text-base font-bold leading-tight">RS Tentara P. Siantar</div>
          <div className="text-xs text-orange-300 mt-0.5">Portal BPJS</div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <Link href="/bpjs" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium bg-white/20 text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
            Klaim BPJS
          </Link>
        </nav>
        <div className="px-3 py-4 border-t border-orange-600">
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
        <header className="lg:hidden shrink-0 bg-orange-700 text-white px-4 py-3 flex items-center justify-between shadow-md z-30 sticky top-0">
          <div className="text-sm font-bold leading-tight">RS Tentara P. Siantar</div>
          <div className="text-xs text-orange-300">Portal BPJS</div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto">

          {/* Mobile: Klaim List */}
          <div className="lg:hidden p-4 pb-24">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-lg font-bold text-gray-900">Klaim BPJS</h1>
                <p className="text-xs text-gray-500 mt-0.5">{today}</p>
              </div>
              <span className="px-2.5 py-1 bg-yellow-50 border border-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                {stats.menunggu} Menunggu
              </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: 'Total', value: stats.total, color: 'text-gray-800' },
                { label: 'Disetujui', value: stats.disetujui, color: 'text-green-700' },
                { label: 'Menunggu', value: stats.menunggu, color: 'text-yellow-700' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl p-3 text-center border border-gray-100">
                  <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {klaims.length > 0 ? (
              <div className="space-y-3">
                {klaims.map((k) => {
                  const badge = statusBadge(k.status);
                  return (
                    <button
                      key={k.id}
                      onClick={() => openKlaim(k)}
                      className="w-full bg-white rounded-2xl border border-gray-100 p-4 text-left shadow-sm hover:shadow-md transition-shadow flex items-center gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-gray-500">Klaim #{k.id}</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>{badge.label}</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-800">{k.tagihan.antrean.pasien.namaLengkap}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Tagihan #{k.tagihanId} · Rp {Number(k.tagihan.totalBiaya).toLocaleString('id-ID')}</p>
                      </div>
                      <svg viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth={2} className="w-4 h-4 shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                      </svg>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-sm font-semibold text-gray-700">Belum ada klaim yang perlu diproses.</p>
              </div>
            )}
          </div>

          {/* Desktop: Split View */}
          <div className="hidden lg:flex h-full">

            {/* Left Panel — Klaim List */}
            <div className="w-96 shrink-0 border-r border-gray-200 overflow-y-auto bg-gray-50">
              <div className="p-6 pb-4">
                <h1 className="text-xl font-bold text-gray-900">Klaim BPJS</h1>
                <p className="text-sm text-gray-500 mt-0.5">{today}</p>
              </div>

              {/* Stats */}
              <div className="px-6 pb-4 grid grid-cols-3 gap-3">
                {[
                  { label: 'Total', value: stats.total, color: 'text-gray-800', bg: 'bg-white' },
                  { label: 'Disetujui', value: stats.disetujui, color: 'text-green-700', bg: 'bg-green-50' },
                  { label: 'Menunggu', value: stats.menunggu, color: 'text-yellow-700', bg: 'bg-yellow-50' },
                ].map(s => (
                  <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center border border-gray-100`}>
                    <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="px-4 pb-6 space-y-3">
                {klaims.length > 0 ? klaims.map((k) => {
                  const badge = statusBadge(k.status);
                  return (
                    <button key={k.id} onClick={() => openKlaim(k)} className="w-full text-left">
                      <div
                        className={`rounded-2xl border p-4 flex items-center gap-3 transition-all ${
                          selectedKlaim?.id === k.id
                            ? 'bg-orange-700 border-orange-700 shadow-lg'
                            : 'bg-white border-gray-100 shadow-sm hover:shadow-md'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs font-semibold ${selectedKlaim?.id === k.id ? 'text-orange-200' : 'text-gray-500'}`}>
                              Klaim #{k.id}
                            </span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              selectedKlaim?.id === k.id ? 'bg-white/20 text-white' : badge.bg + ' ' + badge.text
                            }`}>
                              {selectedKlaim?.id === k.id ? 'Dipilih' : badge.label}
                            </span>
                          </div>
                          <p className={`text-sm font-semibold truncate ${selectedKlaim?.id === k.id ? 'text-white' : 'text-gray-800'}`}>
                            {k.tagihan.antrean.pasien.namaLengkap}
                          </p>
                          <p className={`text-xs mt-0.5 ${selectedKlaim?.id === k.id ? 'text-orange-200' : 'text-gray-400'}`}>
                            #{k.tagihanId} · Rp {Number(k.tagihan.totalBiaya).toLocaleString('id-ID')}
                          </p>
                        </div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          selectedKlaim?.id === k.id ? 'bg-white/20' : 'bg-gray-100'
                        }`}>
                          <svg viewBox="0 0 24 24" fill="none" stroke={selectedKlaim?.id === k.id ? 'white' : '#9ca3af'} strokeWidth={2.5} className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                          </svg>
                        </div>
                      </div>
                    </button>
                  );
                }) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <p className="text-sm font-semibold text-gray-700">Belum ada klaim yang perlu diproses.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel — Detail */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
              {selectedKlaim ? (
                <BPJSReviewPanel
                  klaim={selectedKlaim}
                  onAction={handleAction}
                  processingId={processingId}
                  docChecked={docChecked}
                  verified={verified}
                  onDocChecked={setDocChecked}
                  onVerified={setVerified}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth={1.5} className="w-10 h-10">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 11l3 3L22 4"/>
                      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                    </svg>
                  </div>
                  <p className="text-base font-semibold text-gray-500">Pilih klaim untuk meninjau detail</p>
                  <p className="text-sm text-gray-400 mt-1">Klik salah satu kartu di sebelah kiri.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Detail Sheet */}
      {selectedKlaim && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedKlaim(null)} />
          <div className="absolute bottom-0 left-0 right-0 bg-gray-50 rounded-t-3xl shadow-2xl flex flex-col max-h-[90vh]">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>
            {/* Header */}
            <div className="px-5 pt-2 pb-3 flex items-center gap-3 border-b border-gray-200">
              <button
                onClick={() => setSelectedKlaim(null)}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-gray-600" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              <span className="text-sm font-semibold text-gray-800">Tinjau Klaim</span>
              <span className="ml-auto text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                Klaim #{selectedKlaim.id}
              </span>
            </div>
            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 pb-6">
              <BPJSReviewPanel
                klaim={selectedKlaim}
                onAction={handleAction}
                processingId={processingId}
                docChecked={docChecked}
                verified={verified}
                onDocChecked={setDocChecked}
                onVerified={setVerified}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ToggleSwitch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${
          checked ? 'bg-black' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

function BPJSReviewPanel({
  klaim,
  onAction,
  processingId,
  docChecked,
  verified,
  onDocChecked,
  onVerified,
}: {
  klaim: KlaimItem;
  onAction: (action: 'terima' | 'tolak', id: number) => void;
  processingId: number | null;
  docChecked: boolean;
  verified: boolean;
  onDocChecked: (v: boolean) => void;
  onVerified: (v: boolean) => void;
}) {
  const pasien = klaim.tagihan.antrean.pasien;

  return (
    <div className="max-w-lg mx-auto">
      {/* BPJS Card Preview */}
      <div className="bg-linear-to-br from-orange-700 to-orange-900 rounded-2xl p-5 mb-4 text-white shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
            <div>
              <div className="text-xs text-orange-200">BPJS Kesehatan</div>
              <div className="text-sm font-bold">{pasien.namaLengkap}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-orange-200">No. Peserta</div>
            <div className="text-sm font-semibold">{pasien.noBpjs || '—'}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl px-3 py-2">
            <div className="text-xs text-orange-200">NIK</div>
            <div className="text-sm font-semibold">{pasien.nik}</div>
          </div>
          <div className="bg-white/10 rounded-xl px-3 py-2">
            <div className="text-xs text-orange-200">No. Antrean</div>
            <div className="text-sm font-bold">{String(klaim.tagihan.antrean.noAntrean).padStart(3, '0')}</div>
          </div>
        </div>
      </div>

      {/* Tagihan Detail */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Rincian Tagihan</p>

        {/* Items */}
        <div className="space-y-2 mb-4">
          {klaim.tagihan.items.length > 0 ? klaim.tagihan.items.map(item => (
            <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-700">{item.namaItem}</p>
                <p className="text-xs text-gray-400">{item.jumlah}x · Rp {Number(item.harga).toLocaleString('id-ID')}</p>
              </div>
              <p className="text-sm font-semibold text-gray-800">Rp {Number(item.subTotal).toLocaleString('id-ID')}</p>
            </div>
          )) : (
            <p className="text-sm text-gray-400 italic py-2">Tidak ada item tagihan.</p>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-sm font-semibold text-gray-700">Total Biaya</span>
          <span className="text-lg font-bold text-gray-900">Rp {Number(klaim.tagihan.totalBiaya).toLocaleString('id-ID')}</span>
        </div>
      </div>

      {/* Verification Toggles */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Verifikasi</p>
        <div className="divide-y divide-gray-50">
          <ToggleSwitch label="Dokumen sudah diperiksa" checked={docChecked} onChange={onDocChecked} />
          <ToggleSwitch label="Data tagihan terverifikasi" checked={verified} onChange={onVerified} />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => onAction('tolak', klaim.id)}
          disabled={processingId === klaim.id}
          className="flex-1 py-3 bg-black hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-semibold rounded-full transition-colors flex items-center justify-center gap-2"
        >
          {processingId === klaim.id ? (
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4}/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          ) : 'Tolak'}
        </button>
        <button
          onClick={() => onAction('terima', klaim.id)}
          disabled={processingId === klaim.id}
          className="flex-1 py-3 bg-white border-2 border-black text-black text-sm font-semibold rounded-full hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {processingId === klaim.id ? (
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4}/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          ) : 'Terima'}
        </button>
      </div>
    </div>
  );
}
