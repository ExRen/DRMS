'use client';

import { useNotifikasiList, useUnreadNotifCount } from '@/hooks/use-api';
import { formatRelative } from '@/lib/utils';
import api from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

export default function NotifikasiPage() {
    const [page, setPage] = useState(1);
    const { data, isLoading } = useNotifikasiList(page);
    const { data: unreadCount } = useUnreadNotifCount();
    const qc = useQueryClient();
    const items = data?.data?.data ?? [];

    const handleMarkAllRead = async () => {
        await api.patch('/api/notifikasi/read-all');
        qc.invalidateQueries({ queryKey: ['notifikasi'] });
        qc.invalidateQueries({ queryKey: ['notifikasi-unread'] });
    };

    const handleMarkRead = async (id: string) => {
        await api.patch(`/api/notifikasi/${id}/read`);
        qc.invalidateQueries({ queryKey: ['notifikasi'] });
        qc.invalidateQueries({ queryKey: ['notifikasi-unread'] });
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Notifikasi</h1>
                    <p className="text-gray-500 mt-1">{unreadCount?.data ?? 0} belum dibaca</p>
                </div>
                <button className="btn-secondary" onClick={handleMarkAllRead}>Tandai Semua Dibaca</button>
            </div>
            <div className="space-y-3">
                {isLoading && <div className="card text-center text-gray-400 py-8">Memuat...</div>}
                {items.length === 0 && !isLoading && <div className="card text-center text-gray-400 py-8">Tidak ada notifikasi</div>}
                {items.map((n: any) => (
                    <div key={n.id} className={`card cursor-pointer transition-colors ${n.isRead ? 'opacity-60' : 'border-l-4 border-l-primary-500'}`}
                        onClick={() => !n.isRead && handleMarkRead(n.id)}>
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900">{n.judul}</h3>
                                <p className="text-sm text-gray-600 mt-1">{n.pesan}</p>
                            </div>
                            <span className="text-xs text-gray-400 whitespace-nowrap ml-4">{formatRelative(n.createdAt)}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
