'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useArsipList } from '@/hooks/use-api';
import { formatDate, getStatusBadgeClass, truncate } from '@/lib/utils';

export default function ArsipAktifPage() {
    const [filter, setFilter] = useState({ status: 'AKTIF', page: 1, limit: 20, search: '' });
    const { data, isLoading } = useArsipList(filter);
    const arsips = data?.data?.data ?? [];
    const meta = data?.data ?? {};

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Arsip Aktif</h1>
                    <p className="text-gray-500 mt-1">Daftar arsip dengan status aktif</p>
                </div>
                <Link href="/arsip/aktif/create" className="btn-primary">+ Tambah Arsip</Link>
            </div>

            {/* Search */}
            <div className="card mb-4">
                <input type="text" className="input" placeholder="Cari nomor berkas atau uraian..."
                    value={filter.search} onChange={(e) => setFilter({ ...filter, search: e.target.value, page: 1 })} />
            </div>

            {/* Table */}
            <div className="card overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. Berkas</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode Klas.</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uraian</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tahun</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Kerja</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aktif Berakhir</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {isLoading && <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Memuat...</td></tr>}
                        {!isLoading && arsips.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Tidak ada data arsip</td></tr>}
                        {arsips.map((arsip: any) => (
                            <tr key={arsip.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{arsip.nomorBerkas}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{arsip.kodeKlasifikasi?.kode}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{truncate(arsip.uraianInformasi, 40)}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{arsip.tahun}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{arsip.unitKerja?.nama}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{arsip.tanggalAktifBerakhir ? formatDate(arsip.tanggalAktifBerakhir) : '-'}</td>
                                <td className="px-4 py-3"><span className={getStatusBadgeClass(arsip.status)}>{arsip.status}</span></td>
                                <td className="px-4 py-3">
                                    <Link href={`/arsip/aktif/${arsip.id}`} className="text-primary-600 hover:underline text-sm">Detail</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination */}
                {meta.totalPages > 1 && (
                    <div className="flex justify-between items-center px-4 py-3 border-t">
                        <span className="text-sm text-gray-500">
                            Menampilkan {arsips.length} dari {meta.total} arsip
                        </span>
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
