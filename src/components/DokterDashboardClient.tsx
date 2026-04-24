'use client';

import { useState } from 'react';
import Link from 'next/link';
import MobileBottomNav from '@/components/MobileBottomNav';
import PeriksaButton from '@/app/dokter/PeriksaButton';

interface Antrean {
    id: number;
    noAntrean: number;
    status: string;
    pasien: {
        namaLengkap: string;
        nik?: string;
    };
}

interface DokterDashboardClientProps {
    antreans: Antrean[];
    poliName: string;
    currentPath: string;
}

function StatusBadge({ status }: { status: string }) {
    const cls = status === 'MENUNGGU' ? 'menunggu' : 'diperiksa';
    return (
        <span className={`status-badge ${cls}`}>
            <span style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: status === 'MENUNGGU' ? '#e65100' : '#1b5e20',
                display: 'inline-block'
            }} />
            {status}
        </span>
    );
}

export default function DokterDashboardClient({
    antreans,
    poliName,
    currentPath
}: DokterDashboardClientProps) {
    const [search, setSearch] = useState('');

    const filtered = antreans.filter(a =>
        a.pasien.namaLengkap.toLowerCase().includes(search.toLowerCase()) ||
        String(a.noAntrean).includes(search)
    );

    const navItems = [
        {
            label: 'Home',
            href: '/dokter',
            icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>,
            activeIcon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>,
        },
        {
            label: 'Pendaftaran',
            href: '/pendaftaran',
            icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z"/></svg>,
            activeIcon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z"/></svg>,
        },
        {
            label: 'EMR',
            href: '/dokter/riwayat-emr',
            icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/></svg>,
            activeIcon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/></svg>,
        },
        {
            label: 'Nursing',
            href: '/nurse',
            icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>,
            activeIcon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>,
        },
        {
            label: 'Profile',
            href: '/profile',
            icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>,
            activeIcon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>,
        },
    ];

    return (
        <>
            {/* Mobile Header */}
            <div style={{ background: 'var(--primary-color)', padding: '16px', color: 'white' }}>
                <div style={{ fontSize: '13px', opacity: 0.8, marginBottom: '4px' }}>
                    {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })}
                </div>
                <div style={{ fontSize: '18px', fontWeight: '700' }}>
                    {poliName}
                </div>
            </div>

            {/* Search */}
            <div style={{ padding: '12px 16px' }}>
                <div style={{ position: 'relative' }}>
                    <input
                        type="text"
                        placeholder="Cari pasien atau no antrean..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 16px 12px 44px',
                            borderRadius: '14px',
                            border: '1px solid var(--border-color)',
                            fontSize: '14px',
                            background: 'white',
                            boxSizing: 'border-box',
                        }}
                    />
                    <svg viewBox="0 0 24 24" fill="var(--text-muted)"
                        style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px' }}>
                        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                    </svg>
                </div>
            </div>

            {/* Queue count */}
            <div style={{ padding: '0 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    {filtered.length} {filtered.length === 1 ? 'pasien' : 'pasien'} menunggu
                </div>
            </div>

            {/* Patient list */}
            <div style={{ padding: '0 16px 100px' }}>
                {filtered.length > 0 ? (
                    <div className="mobile-card-list" style={{ padding: 0 }}>
                        {filtered.map((a) => (
                            <div key={a.id} className="mobile-patient-card">
                                <div className="mobile-patient-card-top">
                                    <div className="patient-avatar" style={{ width: '44px', height: '44px', background: 'var(--primary-bg)', border: '2px solid var(--primary-soft)', flexShrink: 0 }}>
                                        <svg viewBox="0 0 24 24" style={{ fill: 'var(--primary-color)', width: '22px', height: '22px' }}>
                                            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                                        </svg>
                                    </div>
                                    <div className="mobile-patient-card-nama">
                                        <strong>{a.pasien.namaLengkap}</strong>
                                        <span>
                                            No. {String(a.noAntrean).padStart(3, '0')}
                                            {a.pasien.nik && ` · NIK: ${a.pasien.nik}`}
                                        </span>
                                    </div>
                                    <StatusBadge status={a.status} />
                                </div>
                                <div className="mobile-patient-card-bottom">
                                    {a.status === 'MENUNGGU' ? (
                                        <PeriksaButton antreanId={a.id} />
                                    ) : (
                                        <Link
                                            href={`/dokter/rme/${a.id}`}
                                            style={{
                                                background: 'var(--primary-light)',
                                                color: 'white',
                                                padding: '10px 16px',
                                                borderRadius: '12px',
                                                fontWeight: '700',
                                                fontSize: '14px',
                                                textDecoration: 'none',
                                            }}
                                        >
                                            Lanjut EMR
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.4 }}>
                            <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48" style={{ margin: '0 auto' }}>
                                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                            </svg>
                        </div>
                        <p>Belum ada antrean hari ini!</p>
                    </div>
                )}
            </div>

            {/* FAB */}
            <Link href="/dokter/riwayat-emr" className="fab" title="Riwayat EMR">
                <svg viewBox="0 0 24 24" fill="white" width="24" height="24">
                    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z"/>
                </svg>
            </Link>

            {/* Mobile Bottom Nav */}
            <MobileBottomNav items={navItems} currentPath={currentPath} />
        </>
    );
}
