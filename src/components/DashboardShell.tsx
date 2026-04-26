'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutUser } from '@/app/pasien/actions';

interface DashboardShellProps {
  role: 'DOKTER' | 'PASIEN' | 'PERAWAT' | 'APOTEKER' | 'KASIR' | 'ADMIN' | 'LAB';
  poliName?: string;
  children: React.ReactNode;
}

export default function DashboardShell({ role, poliName, children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const pasienItems = [
    { label: 'Pusat Layanan', href: '/pasien' },
    { label: 'Daftar Tagihan', href: '/billing' },
    { label: 'Rekam Medis', href: '/emr' },
    { label: 'Paparan Survey', href: '/feedback' },
  ];

  const dokterItems = [
    { label: 'Daftar Antrean', href: '/dokter' },
    { label: 'Riwayat EMR', href: '/dokter/riwayat-emr' },
  ];

  const kasirItems = [
    { label: 'Tagihan Aktif', href: '/kasir' },
    { label: 'Klaim BPJS', href: '/bpjs' },
    { label: 'Laporan', href: '/laporan' },
  ];

  const apotekerItems = [
    { label: 'Antrean Resep', href: '/farmasi' },
  ];

  const labItems = [
    { label: 'Permintaan Tes', href: '/lab' },
  ];

  const navItems = role === 'PASIEN' ? pasienItems
    : role === 'DOKTER' ? dokterItems
    : role === 'KASIR' || role === 'ADMIN' ? kasirItems
    : role === 'APOTEKER' ? apotekerItems
    : role === 'LAB' || role === 'PERAWAT' ? labItems
    : [];

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  const portalLabel = role === 'DOKTER' ? 'Dokter'
    : role === 'PASIEN' ? 'Pasien'
    : role === 'KASIR' ? 'Kasir'
    : role === 'APOTEKER' ? 'Farmasi'
    : role === 'LAB' ? 'Laboratorium'
    : role === 'PERAWAT' ? 'Perawat'
    : role === 'ADMIN' ? 'Manajemen'
    : role;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* =========================================
          DESKTOP SIDEBAR — lg+
          ========================================= */}
      <aside className="w-64 shrink-0 bg-green-700 text-white flex-col hidden lg:flex h-full">
        <div className="px-6 pt-6 pb-4 border-b border-green-600">
          <div className="text-base font-bold leading-tight">RS Tentara P. Siantar</div>
          {poliName && <div className="text-xs text-green-300 mt-0.5">{poliName}</div>}
          <div className="text-xs text-green-300 mt-0.5">Portal {portalLabel}</div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive(item.href)
                  ? 'bg-white/20 text-white'
                  : 'text-green-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <NavIcon href={item.href} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-green-600">
          <form action={logoutUser}>
            <button
              type="submit"
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-200 hover:bg-red-500/20 hover:text-red-100 transition-all"
            >
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
          MOBILE SIDEBAR OVERLAY — < lg
          ========================================= */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-72 bg-green-700 shadow-2xl z-50 flex flex-col transition-transform duration-300 lg:hidden ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="px-5 pt-16 pb-4 border-b border-green-600 flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-white">RS Tentara P. Siantar</div>
            {poliName && <div className="text-xs text-green-300">{poliName}</div>}
            <div className="text-xs text-green-300 mt-0.5">Portal {portalLabel}</div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-white/10 text-green-200 hover:text-white transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive(item.href)
                  ? 'bg-white/20 text-white'
                  : 'text-green-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <NavIcon href={item.href} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-green-600">
          <form action={logoutUser}>
            <button
              type="submit"
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-200 hover:bg-red-500/20 hover:text-red-100 transition-all"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Logout Keluar
            </button>
          </form>
        </div>
      </div>

      {/* =========================================
          MAIN CONTENT AREA
          ========================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile Top Bar */}
        <header className="lg:hidden shrink-0 bg-green-700 text-white px-4 py-3 flex items-center justify-between shadow-md z-30 sticky top-0">
          <div className="text-sm font-bold leading-tight">RS Tentara P. Siantar</div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Buka menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavIcon({ href }: { href: string }) {
  if (href.includes('antrean') || href.includes('/dokter')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    );
  }
  if (href.includes('emr') || href.includes('riwayat')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    );
  }
  if (href.includes('pasien') || href.includes('/pasien') && !href.includes('billing') && !href.includes('emr')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    );
  }
  if (href.includes('billing') || href.includes('tagihan')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    );
  }
  if (href.includes('feedback') || href.includes('survey')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );
}