'use client';

import { useState } from 'react';
import { useAuditLogList } from '@/hooks/use-api';
import { formatDateTime } from '@/lib/utils';

export default function AuditLogPage() {
    const [filter, setFilter] = useState({ page: 1, limit: 20, action: '', entityType: '' });
    const { data, isLoading } = useAuditLogList(filter);
    const items = data?.data?.data ?? [];
    const meta = data?.data ?? {};

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
                <p className="text-gray-500 mt-1">Riwayat seluruh aksi pada sistem</p>
            </div>
            <div className="card mb-4 flex gap-4">
                <select className="input w-48" value={filter.action} onChange={(e) => setFilter({ ...filter, action: e.target.value, page: 1 })}>
                    <option value="">Semua Aksi</option>
                    <option value="CREATE">CREATE</option><option value="UPDATE">UPDATE</option><option value="DELETE">DELETE</option>
                    <option value="APPROVE">APPROVE</option><option value="REJECT">REJECT</option><option value="LOGIN">LOGIN</option>
                </select>
                <select className="input w-48" value={filter.entityType} onChange={(e) => setFilter({ ...filter, entityType: e.target.value, page: 1 })}>
                    <option value="">Semua Entity</option>
                    <option value="Arsip">Arsip</option><option value="UsulMusnah">Usul Musnah</option><option value="PerpanjanganRetensi">Perpanjangan</option>
                </select>
            </div>
            <div className="card overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead><tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waktu</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                    </tr></thead>
                    <tbody className="divide-y divide-gray-200">
                        {isLoading && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Memuat...</td></tr>}
                        {items.map((log: any) => (
                            <tr key={log.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm text-gray-600">{formatDateTime(log.createdAt)}</td>
                                <td className="px-4 py-3 text-sm font-medium">{log.user?.nama}</td>
                                <td className="px-4 py-3 text-sm"><span className="badge bg-gray-100 text-gray-800">{log.action}</span></td>
                                <td className="px-4 py-3 text-sm text-gray-600">{log.entityType} #{log.entityId?.slice(0, 8)}</td>
                                <td className="px-4 py-3 text-sm text-gray-400">{log.ipAddress ?? '-'}</td>
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
