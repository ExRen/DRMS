'use client';

import { useState } from 'react';
import { useRetensiMendekatiAktif, useRetensiMendekatiMusnah } from '@/hooks/use-api';
import { formatDate } from '@/lib/utils';

export default function MonitoringRetensiPage() {
    const [tabAktif, setTabAktif] = useState(true);
    const { data: aktifData, isLoading: loadAktif } = useRetensiMendekatiAktif();
    const { data: musnahData, isLoading: loadMusnah } = useRetensiMendekatiMusnah();
    const aktifItems = aktifData?.data?.data ?? [];
    const musnahItems = musnahData?.data?.data ?? [];

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Monitoring Retensi</h1>
            <p className="text-gray-500 mb-6">Arsip yang mendekati batas waktu retensi (30 hari ke depan)</p>

            <div className="flex gap-2 mb-4">
                <button className={tabAktif ? 'btn-primary' : 'btn-secondary'} onClick={() => setTabAktif(true)}>
                    Mendekati Inaktif ({aktifItems.length})
                </button>
                <button className={!tabAktif ? 'btn-primary' : 'btn-secondary'} onClick={() => setTabAktif(false)}>
                    Mendekati Musnah ({musnahItems.length})
                </button>
            </div>

            <div className="card overflow-x-auto">
                {tabAktif ? (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead><tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. Berkas</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Kerja</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aktif Berakhir</th>
                        </tr></thead>
                        <tbody className="divide-y divide-gray-200">
                            {loadAktif && <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-400">Memuat...</td></tr>}
                            {aktifItems.map((a: any) => (
                                <tr key={a.id}><td className="px-4 py-3 text-sm">{a.nomorBerkas}</td><td className="px-4 py-3 text-sm">{a.unitKerja?.nama}</td><td className="px-4 py-3 text-sm text-warning-600 font-medium">{formatDate(a.tanggalAktifBerakhir)}</td></tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead><tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. Berkas</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Kerja</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inaktif Berakhir</th>
                        </tr></thead>
                        <tbody className="divide-y divide-gray-200">
                            {loadMusnah && <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-400">Memuat...</td></tr>}
                            {musnahItems.map((a: any) => (
                                <tr key={a.id}><td className="px-4 py-3 text-sm">{a.nomorBerkas}</td><td className="px-4 py-3 text-sm">{a.unitKerja?.nama}</td><td className="px-4 py-3 text-sm text-danger-600 font-medium">{formatDate(a.tanggalInaktifBerakhir)}</td></tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
