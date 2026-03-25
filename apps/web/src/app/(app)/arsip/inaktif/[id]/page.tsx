'use client';

import { useParams, useRouter } from 'next/navigation';
import { useArsipDetail } from '@/hooks/use-api';
import { formatDate, formatDateTime, getStatusBadgeClass } from '@/lib/utils';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { useState } from 'react';
import api from '@/lib/api';

export default function ArsipInaktifDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { data, isLoading, refetch } = useArsipDetail(id);
    const arsip = data?.data;
    const { user } = useAuthStore();
    const isSetum = user?.role === 'USER_SETUM';

    const [lokasiForm, setLokasiForm] = useState({
        nomorRak: '', nomorLaci: '', nomorBoks: '', nomorFolder: '', keterangan: '',
    });
    const [saving, setSaving] = useState(false);

    const handleSaveLokasi = async () => {
        setSaving(true);
        try {
            if (arsip?.lokasiSimpan?.id) {
                await api.patch(`/api/lokasi-simpan/${arsip.lokasiSimpan.id}`, lokasiForm);
            } else {
                await api.post('/api/lokasi-simpan', { arsipId: id, ...lokasiForm });
            }
            refetch();
        } catch (err: any) {
            alert(err?.message ?? 'Gagal menyimpan lokasi');
        } finally {
            setSaving(false);
        }
    };

    if (isLoading) return <div className="card p-8 text-center text-gray-400">Memuat...</div>;
    if (!arsip) return <div className="card p-8 text-center text-gray-400">Arsip tidak ditemukan</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Detail Arsip Inaktif</h1>
                    <p className="text-gray-500 mt-1">{arsip.nomorBerkas}</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/arsip/inaktif" className="btn-secondary">Kembali</Link>
                </div>
            </div>

            <div className="space-y-6">
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Informasi Utama</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div><span className="text-sm text-gray-500">Nomor Berkas</span><p className="font-medium">{arsip.nomorBerkas}</p></div>
                        <div><span className="text-sm text-gray-500">Kode Klasifikasi</span><p className="font-medium">{arsip.kodeKlasifikasi?.kode} — {arsip.kodeKlasifikasi?.jenisArsip}</p></div>
                        <div><span className="text-sm text-gray-500">Tahun</span><p className="font-medium">{arsip.tahun}</p></div>
                        <div><span className="text-sm text-gray-500">Status</span><p><span className={getStatusBadgeClass(arsip.status)}>{arsip.status}</span></p></div>
                        <div><span className="text-sm text-gray-500">Unit Kerja</span><p className="font-medium">{arsip.unitKerja?.nama}</p></div>
                        <div><span className="text-sm text-gray-500">Jumlah Berkas</span><p className="font-medium">{arsip.jumlahBerkas}</p></div>
                    </div>
                    {arsip.uraianInformasi && (
                        <div className="mt-4"><span className="text-sm text-gray-500">Uraian Informasi</span><p className="mt-1">{arsip.uraianInformasi}</p></div>
                    )}
                </div>

                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Retensi</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div><span className="text-sm text-gray-500">Tanggal Aktif Berakhir</span><p className="font-medium">{arsip.tanggalAktifBerakhir ? formatDate(arsip.tanggalAktifBerakhir) : '-'}</p></div>
                        <div><span className="text-sm text-gray-500">Tanggal Inaktif Berakhir</span><p className="font-medium">{arsip.tanggalInaktifBerakhir ? formatDate(arsip.tanggalInaktifBerakhir) : 'Permanen'}</p></div>
                    </div>
                </div>

                {/* Lokasi Simpan */}
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Lokasi Simpan (Record Center)</h3>
                    {arsip.lokasiSimpan ? (
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div><span className="text-sm text-gray-500">Nomor Rak</span><p className="font-medium">{arsip.lokasiSimpan.nomorRak || '-'}</p></div>
                            <div><span className="text-sm text-gray-500">Nomor Laci</span><p className="font-medium">{arsip.lokasiSimpan.nomorLaci || '-'}</p></div>
                            <div><span className="text-sm text-gray-500">Nomor Boks</span><p className="font-medium">{arsip.lokasiSimpan.nomorBoks || '-'}</p></div>
                            <div><span className="text-sm text-gray-500">Nomor Folder</span><p className="font-medium">{arsip.lokasiSimpan.nomorFolder || '-'}</p></div>
                            {arsip.lokasiSimpan.keterangan && (
                                <div className="col-span-2"><span className="text-sm text-gray-500">Keterangan</span><p>{arsip.lokasiSimpan.keterangan}</p></div>
                            )}
                        </div>
                    ) : (
                        <p className="text-gray-400 text-sm mb-4">Lokasi simpan belum diisi</p>
                    )}

                    {isSetum && (
                        <div className="border-t pt-4 mt-4">
                            <p className="text-sm font-medium text-gray-700 mb-3">Update Lokasi Simpan</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="label text-xs">Nomor Rak</label><input className="input" value={lokasiForm.nomorRak} onChange={(e) => setLokasiForm({ ...lokasiForm, nomorRak: e.target.value })} /></div>
                                <div><label className="label text-xs">Nomor Laci</label><input className="input" value={lokasiForm.nomorLaci} onChange={(e) => setLokasiForm({ ...lokasiForm, nomorLaci: e.target.value })} /></div>
                                <div><label className="label text-xs">Nomor Boks</label><input className="input" value={lokasiForm.nomorBoks} onChange={(e) => setLokasiForm({ ...lokasiForm, nomorBoks: e.target.value })} /></div>
                                <div><label className="label text-xs">Nomor Folder</label><input className="input" value={lokasiForm.nomorFolder} onChange={(e) => setLokasiForm({ ...lokasiForm, nomorFolder: e.target.value })} /></div>
                            </div>
                            <div className="mt-3"><label className="label text-xs">Keterangan</label><input className="input" value={lokasiForm.keterangan} onChange={(e) => setLokasiForm({ ...lokasiForm, keterangan: e.target.value })} /></div>
                            <button onClick={handleSaveLokasi} disabled={saving} className="btn-primary mt-3 text-sm">
                                {saving ? 'Menyimpan...' : 'Simpan Lokasi'}
                            </button>
                        </div>
                    )}
                </div>

                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Info Sistem</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div><span className="text-sm text-gray-500">Dibuat oleh</span><p className="font-medium">{arsip.createdBy?.nama}</p></div>
                        <div><span className="text-sm text-gray-500">Dibuat pada</span><p className="font-medium">{formatDateTime(arsip.createdAt)}</p></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
