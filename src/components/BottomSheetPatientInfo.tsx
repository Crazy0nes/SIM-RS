'use client';

import Link from 'next/link';

interface PatientInfo {
    id: number;
    namaLengkap: string;
    nik?: string;
    tanggalLahir?: Date | string;
    jenisKelamin?: string;
    golDarah?: string;
    alamat?: string;
    noRm?: string;
}

interface BottomSheetPatientInfoProps {
    patient: PatientInfo;
    labels: {
        resumeMedis: string;
        riwayatKunjungan: string;
        ringkasanBilling: string;
    };
    activeTab: string;
    noRm?: string;
}

function calculateAge(birthDate: Date | string): number {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
}

function formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

export default function BottomSheetPatientInfo({
    patient,
    labels,
    activeTab,
    noRm
}: BottomSheetPatientInfoProps) {
    const displayNoRm = noRm || `PSN-${String(patient.id).padStart(4, '0')}`;

    const tabs = [
        { key: 'resume', label: labels.resumeMedis, href: '#resume' },
        { key: 'riwayat', label: labels.riwayatKunjungan, href: '#riwayat' },
        { key: 'billing', label: labels.ringkasanBilling, href: '#billing' },
    ];

    return (
        <div>
            {/* Bottom Sheet Header */}
            <div className="bottom-sheet-header">
                <div className="bottom-sheet-handle" />
                <div className="patient-card">
                    <div className="patient-avatar">
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                        </svg>
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px', lineHeight: 1.2 }}>
                            {patient.namaLengkap}
                        </div>
                        <ul className="patient-info-list">
                            {patient.noRm && (
                                <li className="patient-info-item">
                                    <span style={{ opacity: 0.7 }}>No. RM:</span>
                                    <strong>{displayNoRm}</strong>
                                </li>
                            )}
                            {patient.tanggalLahir && (
                                <li className="patient-info-item">
                                    <span style={{ opacity: 0.7 }}>Tgl Lahir:</span>
                                    <span>
                                        {formatDate(patient.tanggalLahir)}
                                        {typeof patient.tanggalLahir === 'object' && ` | ${calculateAge(patient.tanggalLahir)} th`}
                                    </span>
                                </li>
                            )}
                            {patient.jenisKelamin && (
                                <li className="patient-info-item">
                                    <span style={{ opacity: 0.7 }}>JK:</span>
                                    <span>{patient.jenisKelamin}</span>
                                </li>
                            )}
                            {patient.golDarah && (
                                <li className="patient-info-item">
                                    <span style={{ opacity: 0.7 }}>Gol. Darah:</span>
                                    <span>{patient.golDarah}</span>
                                </li>
                            )}
                            {patient.alamat && (
                                <li className="patient-info-item" style={{ minWidth: '100%' }}>
                                    <span style={{ opacity: 0.7 }}>Alamat:</span>
                                    <span style={{ fontSize: '12px' }}>{patient.alamat}</span>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="tab-nav">
                {tabs.map(tab => (
                    <Link
                        key={tab.key}
                        href={tab.href}
                        className={`tab-nav-item ${activeTab === tab.key ? 'active' : ''}`}
                    >
                        {tab.label}
                    </Link>
                ))}
            </div>
        </div>
    );
}
