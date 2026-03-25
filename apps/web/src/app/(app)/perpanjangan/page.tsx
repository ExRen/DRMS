'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePerpanjanganList } from '@/hooks/use-api';
import { formatDate, getStatusBadgeClass } from '@/lib/utils';

export default function PerpanjanganPage() {
    const [filter, setFilter] = useState({ page: 1, limit: 20 });
    const { data, isLoading } = usePerpanjanganList(filter);
    const items = data?.data?.data ?? [];
    const meta = data?.data ?? {};

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Perpanjangan Retensi</h1>
                    <p className="text-gray-500 mt-1">Daftar pengajuan perpanjangan masa retensi arsip</p>
                </div>
                <Link href="/perpanjangan/create" className="btn-primary">+ Ajukan Perpanjangan</Link>
            </div>
            <div className="card overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead><tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. Berkas</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durasi</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alasan</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Diajukan</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                    </tr></thead>
                    <tbody className="divide-y divide-gray-200">
                        {isLoading && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Memuat...</td></tr>}
                        {!isLoading && items.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Tidak ada data</td></tr>}
                        {items.map((item: any) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm font-medium">{item.arsip?.nomorBerkas}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{item.durasiPerpanjanganBulan} bulan</td>
                                <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{item.alasanPerpanjangan}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{formatDate(item.createdAt)}</td>
                                <td className="px-4 py-3"><span className={getStatusBadgeClass(item.status)}>{item.status}</span></td>
                                <td className="px-4 py-3"><Link href={`/perpanjangan/${item.id}`} className="text-primary-600 hover:underline text-sm">Detail</Link></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
