'use client';

import { useState } from 'react';
import { useArsipList } from '@/hooks/use-api';
import { formatDate, getStatusBadgeClass, truncate } from '@/lib/utils';
import Link from 'next/link';

export default function ArsipMusnahPage() {
    const [filter, setFilter] = useState({ status: 'MUSNAH', page: 1, limit: 20, search: '' });
    const { data, isLoading } = useArsipList(filter);
    const arsips = data?.data?.data ?? [];

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Arsip Musnah</h1>
                <p className="text-gray-500 mt-1">Riwayat arsip yang telah dimusnahkan</p>
            </div>
            <div className="card overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead><tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. Berkas</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode Klas.</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uraian</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tahun</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                    </tr></thead>
                    <tbody className="divide-y divide-gray-200">
                        {isLoading && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Memuat...</td></tr>}
                        {!isLoading && arsips.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Tidak ada arsip musnah</td></tr>}
                        {arsips.map((a: any) => (
                            <tr key={a.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm font-medium">{a.nomorBerkas}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{a.kodeKlasifikasi?.kode}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{truncate(a.uraianInformasi, 40)}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{a.tahun}</td>
                                <td className="px-4 py-3"><span className={getStatusBadgeClass(a.status)}>{a.status}</span></td>
                                <td className="px-4 py-3"><Link href={`/arsip/musnah/${a.id}`} className="text-primary-600 hover:underline text-sm">Detail</Link></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
