'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useUsulMusnahList } from '@/hooks/use-api';
import { formatDate, getStatusBadgeClass } from '@/lib/utils';

export default function UsulMusnahPage() {
    const [filter, setFilter] = useState({ page: 1, limit: 20 });
    const { data, isLoading } = useUsulMusnahList(filter);
    const items = data?.data?.data ?? [];
    const meta = data?.data ?? {};

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Usul Musnah</h1>
                    <p className="text-gray-500 mt-1">Daftar pengajuan pemusnahan arsip</p>
                </div>
                <Link href="/usul-musnah/create" className="btn-primary">+ Ajukan Usul Musnah</Link>
            </div>
            <div className="card overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead><tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. Berkas</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode Klas.</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Diajukan Oleh</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approval</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verifikasi</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                    </tr></thead>
                    <tbody className="divide-y divide-gray-200">
                        {isLoading && <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Memuat...</td></tr>}
                        {!isLoading && items.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Tidak ada data</td></tr>}
                        {items.map((item: any) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm font-medium">{item.arsip?.nomorBerkas}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{item.arsip?.kodeKlasifikasi?.kode}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{item.diajukanOleh?.nama}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{formatDate(item.createdAt)}</td>
                                <td className="px-4 py-3"><span className={getStatusBadgeClass(item.statusApproval)}>{item.statusApproval}</span></td>
                                <td className="px-4 py-3"><span className={getStatusBadgeClass(item.statusVerifikasiSetum)}>{item.statusVerifikasiSetum}</span></td>
                                <td className="px-4 py-3"><Link href={`/usul-musnah/${item.id}`} className="text-primary-600 hover:underline text-sm">Detail</Link></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {meta.totalPages > 1 && (
                    <div className="flex justify-between items-center px-4 py-3 border-t">
                        <span className="text-sm text-gray-500">Hal. {filter.page} dari {meta.totalPages}</span>
                        <div className="flex gap-2">
                            <button className="btn-secondary text-xs" disabled={filter.page <= 1} onClick={() => setFilter({ ...filter, page: filter.page - 1 })}>Sebelumnya</button>
                            <button className="btn-secondary text-xs" disabled={filter.page >= meta.totalPages} onClick={() => setFilter({ ...filter, page: filter.page + 1 })}>Berikutnya</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
