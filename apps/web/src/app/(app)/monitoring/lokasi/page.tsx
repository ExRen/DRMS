'use client';

import { useState, useEffect } from 'react';
import { useArsipList } from '@/hooks/use-api';
import Link from 'next/link';
import api from '@/lib/api';

export default function MonitoringLokasiPage() {
    const [filter, setFilter] = useState({ page: 1, limit: 50, search: '' });
    const { data: aktifData, isLoading: loadAktif } = useArsipList({ ...filter, status: 'AKTIF' });
    const { data: inaktifData, isLoading: loadInaktif } = useArsipList({ ...filter, status: 'INAKTIF' });
    const aktifArsips = aktifData?.data?.data ?? [];
    const inaktifArsips = inaktifData?.data?.data ?? [];
    const [tab, setTab] = useState<'aktif' | 'inaktif'>('aktif');

    const arsips = tab === 'aktif' ? aktifArsips : inaktifArsips;
    const isLoading = tab === 'aktif' ? loadAktif : loadInaktif;

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Monitoring Lokasi Simpan</h1>
            <p className="text-gray-500 mb-6">Pemetaan lokasi fisik penyimpanan arsip (Rak, Laci, Boks, Folder)</p>

            <div className="flex gap-2 mb-4">
                <button className={tab === 'aktif' ? 'btn-primary' : 'btn-secondary'} onClick={() => setTab('aktif')}>
                    Arsip Aktif ({aktifArsips.length})
                </button>
                <button className={tab === 'inaktif' ? 'btn-primary' : 'btn-secondary'} onClick={() => setTab('inaktif')}>
                    Arsip Inaktif ({inaktifArsips.length})
                </button>
            </div>

            <div className="card mb-4">
                <input type="text" className="input" placeholder="Cari nomor berkas atau uraian..."
                    value={filter.search} onChange={(e) => setFilter({ ...filter, search: e.target.value, page: 1 })} />
            </div>

            <div className="card overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. Berkas</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode Klas.</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Kerja</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rak</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Laci</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Boks</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Folder</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status Lokasi</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {isLoading && <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">Memuat...</td></tr>}
                        {!isLoading && arsips.length === 0 && <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">Tidak ada data</td></tr>}
                        {arsips.map((arsip: any) => {
                            const lok = arsip.lokasiSimpan;
                            const hasLokasi = lok && (lok.nomorRak || lok.nomorLaci || lok.nomorBoks || lok.nomorFolder);
                            return (
                                <tr key={arsip.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm font-medium">{arsip.nomorBerkas}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{arsip.kodeKlasifikasi?.kode}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{arsip.unitKerja?.nama}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{lok?.nomorRak || '-'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{lok?.nomorLaci || '-'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{lok?.nomorBoks || '-'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{lok?.nomorFolder || '-'}</td>
                                    <td className="px-4 py-3">
                                        {hasLokasi ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Terisi</span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">Belum Diisi</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Link href={tab === 'aktif' ? `/arsip/aktif/${arsip.id}` : `/arsip/inaktif/${arsip.id}`}
                                            className="text-primary-600 hover:underline text-sm">
                                            Detail
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
