'use client';

import { useParams, useRouter } from 'next/navigation';
import { usePerpanjanganDetail } from '@/hooks/use-api';
import { formatDate, formatDateTime, getStatusBadgeClass } from '@/lib/utils';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useState } from 'react';

export default function PerpanjanganDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { data, isLoading, refetch } = usePerpanjanganDetail(id as string);
    const item = data?.data ?? null;
    const { user } = useAuthStore();
    const [actionLoading, setActionLoading] = useState('');
    const [catatan, setCatatan] = useState('');

    const handleAction = async (action: string) => {
        setActionLoading(action);
        try {
            await api.post(`/api/perpanjangan-retensi/${id}/${action}`, { catatanApproval: catatan || undefined });
            refetch();
            setCatatan('');
        } catch (err: any) {
            alert(err?.message ?? `Gagal ${action}`);
        } finally {
            setActionLoading('');
        }
    };

    if (isLoading) return <div className="text-center py-12 text-gray-400">Memuat...</div>;
    if (!item) return <div className="text-center py-12 text-gray-400">Data tidak ditemukan</div>;

    const isSetum = user?.role === 'USER_SETUM';
    const canReview = isSetum && item.status === 'PENDING';

    return (
        <div className="max-w-3xl mx-auto">
            <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700 mb-4">← Kembali</button>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Detail Perpanjangan Retensi</h1>

            <div className="card mb-6">
                <h3 className="text-lg font-semibold mb-4">Informasi Arsip</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-500">No. Berkas:</span> <span className="font-medium">{item.arsip?.nomorBerkas}</span></div>
                    <div><span className="text-gray-500">Kode Klas.:</span> <span className="font-medium">{item.arsip?.kodeKlasifikasi?.kode}</span></div>
                    <div><span className="text-gray-500">Tahun:</span> <span className="font-medium">{item.arsip?.tahun}</span></div>
                    <div><span className="text-gray-500">Unit Kerja:</span> <span className="font-medium">{item.arsip?.unitKerja?.nama}</span></div>
                </div>
            </div>

            <div className="card mb-6">
                <h3 className="text-lg font-semibold mb-4">Detail Pengajuan</h3>
                <div className="space-y-3 text-sm">
                    <div><span className="text-gray-500">Durasi Perpanjangan:</span> <span className="font-medium">{item.durasiPerpanjanganBulan} bulan</span></div>
                    <div><span className="text-gray-500">Alasan:</span> <p className="font-medium mt-1">{item.alasanPerpanjangan}</p></div>
                    <div><span className="text-gray-500">Status:</span> <span className={getStatusBadgeClass(item.status)}>{item.status}</span></div>
                    <div><span className="text-gray-500">Diajukan oleh:</span> <span>{item.diajukanOleh?.nama}</span></div>
                    <div><span className="text-gray-500">Tanggal:</span> <span>{formatDate(item.createdAt)}</span></div>
                    {item.approvedOleh && (
                        <div><span className="text-gray-500">Diproses oleh:</span> <span>{item.approvedOleh.nama}</span></div>
                    )}
                    {item.catatanApproval && (
                        <div><span className="text-gray-500">Catatan:</span> <p className="italic">"{item.catatanApproval}"</p></div>
                    )}
                    {item.tanggalInaktifBaruBerakhir && (
                        <div><span className="text-gray-500">Tanggal Inaktif Baru:</span> <span className="font-medium text-green-600">{formatDate(item.tanggalInaktifBaruBerakhir)}</span></div>
                    )}
                </div>
            </div>

            {canReview && (
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Review Perpanjangan</h3>
                    <div className="mb-4">
                        <label className="label">Catatan</label>
                        <textarea className="input" rows={3} value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="Tulis catatan..." />
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => handleAction('approve')} disabled={!!actionLoading}
                            className="btn-primary bg-green-600 hover:bg-green-700">
                            {actionLoading === 'approve' ? 'Memproses...' : '✓ Setujui'}
                        </button>
                        <button onClick={() => handleAction('reject')} disabled={!!actionLoading}
                            className="btn-primary bg-red-600 hover:bg-red-700">
                            {actionLoading === 'reject' ? 'Memproses...' : '✗ Tolak'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
