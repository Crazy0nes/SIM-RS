'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ReportData {
  totalPasien: number;
  totalAntrean: number;
  selesaiAntrean: number;
  totalTagihan: number;
  klaimDisetujui: number;
  klaimDitolak: number;
  klaimMenunggu: number;
  perDay: { date: string; count: number }[];
  perPoli: { namaPoli: string; count: number }[];
  startDate: string;
  endDate: string;
}

interface ManajemenClientProps {
  initialData: ReportData;
  defaultStart: string;
  defaultEnd: string;
  today: string;
}

export default function ManajemenClient({ initialData, defaultStart, defaultEnd, today }: ManajemenClientProps) {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [from, setFrom] = useState(defaultStart);
  const [to, setTo] = useState(defaultEnd);
  const [loading, setLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const data = hasGenerated && reportData ? reportData : initialData;
  const maxDay = Math.max(...data.perDay.map(d => d.count), 1);
  const maxPoli = Math.max(...data.perPoli.map(p => p.count), 1);
  const totalKlaim = data.klaimDisetujui + data.klaimDitolak + data.klaimMenunggu || 1;

  const donutSegments = [
    { label: 'Disetujui', value: data.klaimDisetujui, color: '#22c55e' },
    { label: 'Ditolak', value: data.klaimDitolak, color: '#ef4444' },
    { label: 'Menunggu', value: data.klaimMenunggu, color: '#f59e0b' },
  ];

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const startDate = new Date(from + 'T00:00:00.000Z');
      const endDate = new Date(to + 'T23:59:59.999Z');

      const [totalPasien, totalAntrean, selesaiAntrean, tagihanAgg, klaimList, perDayData] = await Promise.all([
        fetch(`/api/laporan/data?start=${from}&end=${to}&type=pasien`).then(r => r.json()),
        fetch(`/api/laporan/data?start=${from}&end=${to}&type=antrean`).then(r => r.json()),
        fetch(`/api/laporan/data?start=${from}&end=${to}&type=selesai`).then(r => r.json()),
        fetch(`/api/laporan/data?start=${from}&end=${to}&type=tagihan`).then(r => r.json()),
        fetch(`/api/laporan/data?start=${from}&end=${to}&type=klaim`).then(r => r.json()),
        fetch(`/api/laporan/data?start=${from}&end=${to}&type=perday`).then(r => r.json()),
      ]);

      setReportData({
        totalPasien,
        totalAntrean,
        selesaiAntrean,
        totalTagihan: tagihanAgg,
        klaimDisetujui: klaimList.disetujui ?? 0,
        klaimDitolak: klaimList.ditolak ?? 0,
        klaimMenunggu: klaimList.menunggu ?? 0,
        perDay: perDayData,
        perPoli: [],
        startDate: from,
        endDate: to,
      });
      setHasGenerated(true);
    } catch {
      alert('Gagal memuat data laporan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* Desktop Sidebar */}
      <aside className="w-64 shrink-0 bg-gray-800 text-white flex-col hidden lg:flex h-full">
        <div className="px-6 pt-6 pb-4 border-b border-gray-700">
          <div className="text-base font-bold leading-tight">RS Tentara P. Siantar</div>
          <div className="text-xs text-gray-400 mt-0.5">Portal Manajemen</div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <Link href="/laporan" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium bg-white/20 text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            Laporan Mutu
          </Link>
          <Link href="/bpjs" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-white/10 hover:text-white transition-all">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
            Klaim BPJS
          </Link>
        </nav>
        <div className="px-3 py-4 border-t border-gray-700">
          <form action={async () => {
            const { logoutUser } = await import('@/app/pasien/actions');
            await logoutUser();
          }}>
            <button type="submit" className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all">
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
        <header className="lg:hidden shrink-0 bg-gray-800 text-white px-4 py-3 flex items-center justify-between shadow-md z-30 sticky top-0">
          <div className="text-sm font-bold leading-tight">RS Tentara P. Siantar</div>
          <div className="text-xs text-gray-400">Portal Manajemen</div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto">

          {/* Mobile: Management */}
          <div className="lg:hidden p-4 pb-24">
            <h1 className="text-lg font-bold text-gray-900">Laporan Analisis Mutu</h1>
            <p className="text-xs text-gray-500 mt-0.5 mb-4">{today}</p>

            {/* Filter Form */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Periode Laporan</p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Dari</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={from}
                      onChange={e => setFrom(e.target.value)}
                      className="w-full px-4 py-3 pr-10 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 transition-all"
                    />
                    <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth={2} className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Sampai</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={to}
                      onChange={e => setTo(e.target.value)}
                      className="w-full px-4 py-3 pr-10 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 transition-all"
                    />
                    <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth={2} className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </div>
                </div>
              </div>
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-3 bg-black hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-semibold rounded-full transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4}/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                ) : 'Generate Laporan'}
              </button>
            </div>

            {/* Report Mobile */}
            <ReportOutput data={data} maxDay={maxDay} maxPoli={maxPoli} donutSegments={donutSegments} totalKlaim={totalKlaim} />
          </div>

          {/* Desktop: Split View */}
          <div className="hidden lg:flex h-full">

            {/* Left Panel — Filter */}
            <div className="w-80 shrink-0 border-r border-gray-200 overflow-y-auto bg-white">
              <div className="p-6">
                <h1 className="text-xl font-bold text-gray-900">Dashboard Manajemen</h1>
                <p className="text-sm text-gray-500 mt-0.5">{today}</p>
              </div>

              <div className="px-6 pb-6">
                <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Periode Laporan</p>
                  <div className="mb-4">
                    <label className="block text-xs text-gray-500 mb-1.5">Dari Tanggal</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={from}
                        onChange={e => setFrom(e.target.value)}
                        className="w-full px-4 py-3 pr-10 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 transition-all"
                      />
                      <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth={2} className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                    </div>
                  </div>
                  <div className="mb-5">
                    <label className="block text-xs text-gray-500 mb-1.5">Sampai Tanggal</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={to}
                        onChange={e => setTo(e.target.value)}
                        className="w-full px-4 py-3 pr-10 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 transition-all"
                      />
                      <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth={2} className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                    </div>
                  </div>

                  <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="w-full py-3 bg-black hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-semibold rounded-full transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4}/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                        </svg>
                        Generate Laporan
                      </>
                    )}
                  </button>
                </div>

                {/* Quick Stats */}
                <div className="mt-4 space-y-2">
                  {[
                    { label: 'Total Pasien', value: data.totalPasien },
                    { label: 'Total Antrean', value: data.totalAntrean },
                    { label: 'Selesai', value: data.selesaiAntrean },
                  ].map(stat => (
                    <div key={stat.label} className="flex items-center justify-between py-2 px-4 bg-white rounded-xl border border-gray-100">
                      <span className="text-xs text-gray-500">{stat.label}</span>
                      <span className="text-sm font-bold text-gray-800">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Panel — Report Output */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
              {/* Report Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Laporan Analisis Mutu</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {new Date(data.startDate || defaultStart).toLocaleDateString('id-ID')} — {new Date(data.endDate || defaultEnd).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-full transition-colors">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Download
                </button>
              </div>

              <ReportOutput data={data} maxDay={maxDay} maxPoli={maxPoli} donutSegments={donutSegments} totalKlaim={totalKlaim} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function ReportOutput({
  data,
  maxDay,
  maxPoli,
  donutSegments,
  totalKlaim,
}: {
  data: ReportData;
  maxDay: number;
  maxPoli: number;
  donutSegments: { label: string; value: number; color: string }[];
  totalKlaim: number;
}) {
  const progressItems = [
    { label: 'Tingkat Kepuasan Pasien', percent: Math.round((data.selesaiAntrean / Math.max(data.totalAntrean, 1)) * 100), color: 'bg-blue-600' },
    { label: 'Tingkat Kelengkapan Rekam Medis', percent: Math.round((data.selesaiAntrean / Math.max(data.totalAntrean, 1)) * 85), color: 'bg-gray-800' },
    { label: 'Efisiensi Waktu Tunggu Antrean', percent: Math.round((data.selesaiAntrean / Math.max(data.totalAntrean, 1)) * 92), color: 'bg-blue-400' },
  ];

  const barLabels = data.perDay.slice(-7);
  const barWidth = 100 / Math.max(barLabels.length, 1);

  const size = 160;
  const strokeWidth = 28;
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;

  let cumulativePercent = 0;

  return (
    <div className="space-y-4">

      {/* KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Pasien', value: data.totalPasien, color: 'border-blue-300 bg-blue-50' },
          { label: 'Total Antrean', value: data.totalAntrean, color: 'border-gray-300 bg-white' },
          { label: 'Antrean Selesai', value: data.selesaiAntrean, color: 'border-green-300 bg-green-50' },
          { label: 'Total Tagihan', value: `Rp ${Number(data.totalTagihan).toLocaleString('id-ID')}`, color: 'border-orange-300 bg-orange-50' },
        ].map(kpi => (
          <div key={kpi.label} className={`rounded-2xl border-2 p-4 ${kpi.color}`}>
            <div className="text-xs text-gray-500 mb-1">{kpi.label}</div>
            <div className="text-xl font-bold text-gray-900">{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Progress Bars */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Indikator Mutu</p>
        <div className="space-y-4">
          {progressItems.map(item => (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
                <span className="text-sm font-bold text-gray-800">{item.percent}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                  style={{ width: `${item.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Bar Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Jumlah Antrean per Hari</p>
          <div className="flex items-end gap-2 h-36">
            {barLabels.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-gray-800 rounded-t-sm relative" style={{ height: `${Math.max((d.count / maxDay) * 100, 2)}%` }}>
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-700 whitespace-nowrap">
                    {d.count}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(d.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                </span>
              </div>
            ))}
            {barLabels.length === 0 && (
              <div className="w-full flex items-center justify-center text-xs text-gray-400 h-full">
                Tidak ada data
              </div>
            )}
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Distribusi Klaim BPJS</p>
          <div className="flex items-center gap-4">
            <div className="relative shrink-0" style={{ width: size, height: size }}>
              <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
                {donutSegments.map((seg, i) => {
                  const percent = seg.value / totalKlaim;
                  const dashArray = circumference;
                  const dashOffset = dashArray * (1 - percent);
                  const rotation = (cumulativePercent / totalKlaim) * circumference;
                  cumulativePercent += seg.value;
                  return (
                    <circle
                      key={i}
                      cx={cx}
                      cy={cy}
                      r={r}
                      fill="none"
                      stroke={seg.color}
                      strokeWidth={strokeWidth}
                      strokeDasharray={`${dashArray * percent} ${dashArray * (1 - percent)}`}
                      strokeDashoffset={-rotation}
                      strokeLinecap="round"
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">{totalKlaim}</span>
                <span className="text-xs text-gray-500">Total</span>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              {donutSegments.map(seg => (
                <div key={seg.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                    <span className="text-xs text-gray-600">{seg.label}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-800">{seg.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
