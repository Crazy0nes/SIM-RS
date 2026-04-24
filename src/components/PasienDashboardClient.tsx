'use client';

import Link from 'next/link';
import MobileBottomNav from '@/components/MobileBottomNav';

interface PasienData {
  namaLengkap: string;
  id: number;
  nik?: string;
  noBpjs?: string | null;
  alamat?: string | null;
}

interface AntreanData {
  noAntrean: number;
  status: string;
  tanggal: Date;
  poliklinik?: { namaPoli: string };
}

interface PasienDashboardClientProps {
  pasien: PasienData | null;
  antreanHariIni: AntreanData | null;
  poliList: { id: number; namaPoli: string; biayaKonsultasi: string }[];
}

export default function PasienDashboardClient({
  pasien,
  antreanHariIni,
  poliList,
}: PasienDashboardClientProps) {
  const today = new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  });

  const navItems = [
    {
      label: 'Home',
      href: '/pasien',
      icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>,
      activeIcon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>,
    },
    {
      label: 'Pendaftaran',
      href: '/register',
      icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z"/></svg>,
      activeIcon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z"/></svg>,
    },
    {
      label: 'EMR',
      href: '/emr',
      icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
      activeIcon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
    },
    {
      label: 'Billing',
      href: '/billing',
      icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>,
      activeIcon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>,
    },
    {
      label: 'Profile',
      href: '/profile',
      icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>,
      activeIcon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-green-700 text-white px-4 pt-4 pb-3 flex-shrink-0">
        <p className="text-xs text-green-300">{today}</p>
        <h1 className="text-lg font-bold mt-0.5">
          Selamat Datang, {pasien?.namaLengkap || 'Pasien'}
        </h1>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-28">

        {/* Queue Card */}
        {antreanHariIni ? (
          <div className="mt-4 bg-green-700 rounded-2xl overflow-hidden shadow-lg">
            <div className="text-center py-6 px-4">
              <p className="text-xs text-green-200 mb-3">Nomor Antrean Anda</p>
              <div className="border-4 border-dashed border-green-400 rounded-2xl px-8 py-3 inline-block mb-3">
                <span className="text-7xl font-extrabold text-white leading-none">
                  {String(antreanHariIni.noAntrean).padStart(3, '0')}
                </span>
              </div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm font-semibold text-white uppercase tracking-wide">
                  {antreanHariIni.status}
                </span>
              </div>
              <p className="text-xs text-green-200">
                {new Date(antreanHariIni.tanggal).toLocaleDateString('id-ID', {
                  day: '2-digit', month: 'long', year: 'numeric',
                  timeZone: 'Asia/Jakarta',
                })}
              </p>
              {antreanHariIni.poliklinik && (
                <p className="text-xs text-green-200 mt-1">
                  Poli: {antreanHariIni.poliklinik.namaPoli}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-4 bg-green-700 rounded-2xl overflow-hidden shadow-lg">
            <div className="text-center py-8 px-4">
              <p className="text-xs text-green-200 mb-3">Nomor Antrean Anda</p>
              <div className="border-4 border-dashed border-green-400/50 rounded-2xl px-8 py-3 inline-block mb-4 opacity-60">
                <span className="text-7xl font-extrabold text-white/80 leading-none">--</span>
              </div>
              <p className="text-sm text-green-200 mb-4">
                Anda belum mengambil tiket antrean hari ini.
              </p>
              <Link
                href="/pasien"
                className="inline-block px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                Ambil Antrean
              </Link>
            </div>
          </div>
        )}

        {/* Patient Info Card */}
        <div className="mt-4 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Informasi Pasien</p>
          </div>
          <div className="divide-y divide-gray-50">
            <div className="flex justify-between items-center px-4 py-3">
              <span className="text-sm text-gray-500">Nama</span>
              <span className="text-sm font-semibold text-gray-800">{pasien?.namaLengkap || '-'}</span>
            </div>
            <div className="flex justify-between items-center px-4 py-3">
              <span className="text-sm text-gray-500">No. RM</span>
              <span className="text-sm font-semibold text-gray-800">
                {pasien ? `PSN-${String(pasien.id).padStart(4, '0')}` : '-'}
              </span>
            </div>
            <div className="flex justify-between items-center px-4 py-3">
              <span className="text-sm text-gray-500">NIK</span>
              <span className="text-sm font-semibold text-gray-800">{pasien?.nik || '-'}</span>
            </div>
            {pasien?.noBpjs && (
              <div className="flex justify-between items-center px-4 py-3">
                <span className="text-sm text-gray-500">No. BPJS</span>
                <span className="text-sm font-semibold text-gray-800">{pasien.noBpjs}</span>
              </div>
            )}
            {pasien?.alamat && (
              <div className="flex justify-between items-center px-4 py-3">
                <span className="text-sm text-gray-500">Alamat</span>
                <span className="text-sm font-semibold text-gray-800 text-right max-w-xs">{pasien.alamat}</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-4 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Menu Cepat</p>
          </div>
          <div className="p-4 flex flex-col gap-3">
            <Link
              href="/feedback"
              className="flex items-center gap-3 px-4 py-3 bg-green-50 hover:bg-green-100 rounded-xl text-green-800 font-medium text-sm transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-green-700 flex-shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
              Paparan Survey Kepuasan
            </Link>
            <Link
              href="/billing"
              className="flex items-center gap-3 px-4 py-3 bg-green-50 hover:bg-green-100 rounded-xl text-green-800 font-medium text-sm transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-green-700 flex-shrink-0">
                <rect x="2" y="5" width="20" height="14" rx="2"/>
                <line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
              Daftar Tagihan
            </Link>
            <Link
              href="/emr"
              className="flex items-center gap-3 px-4 py-3 bg-green-50 hover:bg-green-100 rounded-xl text-green-800 font-medium text-sm transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-green-700 flex-shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              Rekam Medis Elektronik
            </Link>
          </div>
        </div>

        <div className="h-4" />
      </div>

      {/* Mobile Bottom Nav */}
      <MobileBottomNav items={navItems} currentPath="/pasien" />
    </div>
  );
}
