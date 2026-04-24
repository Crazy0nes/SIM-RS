'use client';

import { useState } from 'react';
import Link from 'next/link';
import BottomSheetPatientInfo from '@/components/BottomSheetPatientInfo';
import MobileBottomNav from '@/components/MobileBottomNav';

interface RekamMedis {
    id: number;
    diagnosa: string;
    antreanId: number;
    antrean: {
        noAntrean: number;
        tanggal: Date;
        status: string;
        pasien: {
            namaLengkap: string;
            nik?: string;
        };
    };
}

interface RiwayatEMRClientProps {
    initialTab?: string;
    rekamMedisList: RekamMedis[];
    currentPath: string;
    poliName: string;
}

function StatusBadge({ status }: { status: string }) {
    const cls = status === 'SELESAI' ? 'lunas' : 'menunggu';
    return <span className={`status-badge ${cls}`}>{status}</span>;
}

export default function RiwayatEMRClient({
    initialTab = 'resume',
    rekamMedisList,
    currentPath,
    poliName
}: RiwayatEMRClientProps) {
    const [activeTab, setActiveTab] = useState(initialTab);

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

    const tabs = [
        { key: 'resume', label: 'Resume Medis' },
        { key: 'riwayat', label: 'Riwayat Kunjungan' },
        { key: 'billing', label: 'Ringkasan Billing' },
    ];

    const resumeList = rekamMedisList;

    return (
        <>
            {/* Bottom Sheet Header */}
            <div className="bottom-sheet-header">
                <div className="bottom-sheet-handle" />
                <div className="patient-card" style={{ paddingBottom: '16px' }}>
                    <div className="patient-avatar">
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
                        </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: 'white', marginBottom: '4px' }}>
                            {poliName}
                        </div>
                        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>
                            {resumeList.length} {resumeList.length === 1 ? 'rekam medis' : 'rekam medis'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="tab-nav">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`tab-nav-item ${activeTab === tab.key ? 'active' : ''}`}
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div style={{ padding: '16px' }}>
                {activeTab === 'resume' && (
                    <div>
                        <div className="mobile-section-title">Resume Medis</div>
                        {resumeList.length > 0 ? (
                            <div className="mobile-card-list">
                                {resumeList.map((rm) => (
                                    <div key={rm.id} className="mobile-patient-card">
                                        <div className="mobile-patient-card-top">
                                            <div className="patient-avatar" style={{ width: '44px', height: '44px', background: 'var(--primary-bg)', border: '2px solid var(--primary-soft)', flexShrink: 0 }}>
                                                <svg viewBox="0 0 24 24" style={{ fill: 'var(--primary-color)' }}>
                                                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                                                </svg>
                                            </div>
                                            <div className="mobile-patient-card-nama">
                                                <strong>{rm.antrean.pasien.namaLengkap}</strong>
                                                <span>
                                                    {rm.antrean.tanggal.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    {' · '}
                                                    No. {String(rm.antrean.noAntrean).padStart(3, '0')}
                                                </span>
                                            </div>
                                            <StatusBadge status={rm.antrean.status} />
                                        </div>
                                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                                            <strong>Diagnosa:</strong> {rm.diagnosa || '-'}
                                        </div>
                                        <Link
                                            href={`/dokter/rme/${rm.antreanId}`}
                                            className="btn btn-outline"
                                            style={{ width: '100%', textAlign: 'center', padding: '10px', borderRadius: '12px', fontSize: '14px', textDecoration: 'none', display: 'block' }}
                                        >
                                            Lihat Detail EMR
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                                <div style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.4 }}>
                                    <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
                                        <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z"/>
                                    </svg>
                                </div>
                                <p>Belum ada resume medis untuk poliklinik ini.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'riwayat' && (
                    <div>
                        <div className="mobile-section-title">Riwayat Kunjungan</div>
                        {resumeList.length > 0 ? (
                            <div className="mobile-card-list">
                                {resumeList.map((rm) => (
                                    <div key={rm.id} className="mobile-patient-card">
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <div style={{ fontWeight: '700', fontSize: '15px' }}>
                                                {rm.antrean.pasien.namaLengkap}
                                            </div>
                                            <StatusBadge status={rm.antrean.status} />
                                        </div>
                                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <div>Tanggal: {rm.antrean.tanggal.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                                            <div>No. Antrean: {String(rm.antrean.noAntrean).padStart(3, '0')}</div>
                                            <div>Diagnosa: {rm.diagnosa || '-'}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                                <p>Belum ada riwayat kunjungan.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'billing' && (
                    <div>
                        <div className="mobile-section-title">Ringkasan Billing</div>
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                            <div style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.4 }}>
                                <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
                                    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z"/>
                                </svg>
                            </div>
                            <p>Data billing tersedia di menu Billing.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* FAB - Tambah EMR */}
            <Link href="/dokter" className="fab" title="Tambah Rekam Medis">
                <svg viewBox="0 0 24 24" fill="white" width="28" height="28">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
            </Link>

            {/* Mobile Bottom Nav */}
            <MobileBottomNav items={navItems} currentPath={currentPath} />
        </>
    );
}
