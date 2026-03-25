'use client';

import { useParams, useRouter } from 'next/navigation';
import { useUsulMusnahDetail } from '@/hooks/use-api';
import { formatDate, formatDateTime, getStatusBadgeClass } from '@/lib/utils';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useState } from 'react';

export default function UsulMusnahDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { data, isLoading, refetch } = useUsulMusnahDetail(id as string);
    const item = data?.data ?? null;
    const { user } = useAuthStore();
    const [actionLoading, setActionLoading] = useState('');
    const [catatan, setCatatan] = useState('');

    const handleAction = async (action: string) => {
        setActionLoading(action);
        try {
            await api.post(`/api/usul-musnah/${id}/${action}`, {
                penilaianApproval: catatan || undefined,
                alasan: catatan || undefined,
                catatanSetum: catatan || undefined,
            });
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

    const isApproval = user?.role === 'USER_APPROVAL';
    const isSetum = user?.role === 'USER_SETUM';
    const canApprove = isApproval && item.statusApproval === 'PENDING';
    const canVerify = isSetum && item.statusApproval === 'DISETUJUI' && item.statusVerifikasiSetum === 'PENDING';

    return (
        <div className="max-w-3xl mx-auto">
            <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700 mb-4">← Kembali</button>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Detail Usul Musnah</h1>

            {/* Arsip Info */}
            <div className="card mb-6">
                <h3 className="text-lg font-semibold mb-4">Informasi Arsip</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-500">No. Berkas:</span> <span className="font-medium">{item.arsip?.nomorBerkas}</span></div>
                    <div><span className="text-gray-500">Kode Klasifikasi:</span> <span className="font-medium">{item.arsip?.kodeKlasifikasi?.kode}</span></div>
                    <div><span className="text-gray-500">Tahun:</span> <span className="font-medium">{item.arsip?.tahun}</span></div>
                    <div><span className="text-gray-500">Unit Kerja:</span> <span className="font-medium">{item.arsip?.unitKerja?.nama}</span></div>
                    <div className="col-span-2"><span className="text-gray-500">Uraian:</span> <span className="font-medium">{item.uraianSingkat ?? '-'}</span></div>
                </div>
            </div>

            {/* Status */}
            <div className="card mb-6">
                <h3 className="text-lg font-semibold mb-4">Status Approval</h3>
                <div className="flex gap-8">
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Tahap 1 — Kadiv/Kabid</p>
                        <span className={getStatusBadgeClass(item.statusApproval)}>{item.statusApproval}</span>
                        {item.approvedOleh && <p className="text-xs text-gray-500 mt-1">oleh {item.approvedOleh.nama}</p>}
                        {item.tanggalApproval && <p className="text-xs text-gray-400">{formatDateTime(item.tanggalApproval)}</p>}
                        {item.penilaianApproval && <p className="text-xs text-gray-600 mt-1">"{item.penilaianApproval}"</p>}
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Tahap 2 — Setum</p>
                        <span className={getStatusBadgeClass(item.statusVerifikasiSetum)}>{item.statusVerifikasiSetum}</span>
                        {item.verifikasiSetum && <p className="text-xs text-gray-500 mt-1">oleh {item.verifikasiSetum.nama}</p>}
                        {item.tanggalVerifikasi && <p className="text-xs text-gray-400">{formatDateTime(item.tanggalVerifikasi)}</p>}
                        {item.catatanSetum && <p className="text-xs text-gray-600 mt-1">"{item.catatanSetum}"</p>}
                    </div>
                </div>
                <div className="mt-4 text-xs text-gray-400">
                    Diajukan oleh {item.diajukanOleh?.nama} pada {formatDate(item.createdAt)}
                </div>
            </div>

            {/* Actions */}
            {(canApprove || canVerify) && (
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">
                        {canApprove ? 'Review Approval (Tahap 1)' : 'Verifikasi Setum (Tahap 2)'}
                    </h3>
                    <div className="mb-4">
                        <label className="label">Catatan / Penilaian</label>
                        <textarea className="input" rows={3} value={catatan} onChange={(e) => setCatatan(e.target.value)}
                            placeholder="Tulis catatan atau alasan..." />
                    </div>
                    <div className="flex gap-3">
                        {canApprove && (
                            <>
                                <button onClick={() => handleAction('approve')} disabled={!!actionLoading}
                                    className="btn-primary bg-green-600 hover:bg-green-700">
                                    {actionLoading === 'approve' ? 'Memproses...' : '✓ Setujui'}
                                </button>
                                <button onClick={() => handleAction('reject')} disabled={!!actionLoading}
                                    className="btn-primary bg-red-600 hover:bg-red-700">
                                    {actionLoading === 'reject' ? 'Memproses...' : '✗ Tolak'}
                                </button>
                            </>
                        )}
                        {canVerify && (
                            <>
                                <button onClick={() => handleAction('verify')} disabled={!!actionLoading}
                                    className="btn-primary bg-green-600 hover:bg-green-700">
                                    {actionLoading === 'verify' ? 'Memproses...' : '✓ Verifikasi (Setujui)'}
                                </button>
                                <button onClick={() => handleAction('verify-reject')} disabled={!!actionLoading}
                                    className="btn-primary bg-red-600 hover:bg-red-700">
                                    {actionLoading === 'verify-reject' ? 'Memproses...' : '✗ Tolak Verifikasi'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
