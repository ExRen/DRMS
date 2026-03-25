'use client';

import { useParams } from 'next/navigation';
import { useArsipDetail } from '@/hooks/use-api';
import { formatDate, formatDateTime, getStatusBadgeClass } from '@/lib/utils';
import Link from 'next/link';

export default function ArsipDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { data, isLoading } = useArsipDetail(id);
    const arsip = data?.data;

    if (isLoading) return <div className="card p-8 text-center text-gray-400">Memuat...</div>;
    if (!arsip) return <div className="card p-8 text-center text-gray-400">Arsip tidak ditemukan</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Detail Arsip</h1>
                    <p className="text-gray-500 mt-1">{arsip.nomorBerkas}</p>
                </div>
                <div className="flex gap-2">
                    {arsip.status === 'AKTIF' && (
                        <Link href={`/arsip/aktif/${id}/edit`} className="btn-secondary">Edit</Link>
                    )}
                    <Link href="/arsip/aktif" className="btn-secondary">Kembali</Link>
                </div>
            </div>

            <div className="space-y-6">
                {/* Info Utama */}
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Informasi Utama</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div><span className="text-sm text-gray-500">Nomor Berkas</span><p className="font-medium">{arsip.nomorBerkas}</p></div>
                        <div><span className="text-sm text-gray-500">Kode Klasifikasi</span><p className="font-medium">{arsip.kodeKlasifikasi?.kode} — {arsip.kodeKlasifikasi?.jenisArsip}</p></div>
                        <div><span className="text-sm text-gray-500">Tahun</span><p className="font-medium">{arsip.tahun}</p></div>
                        <div><span className="text-sm text-gray-500">Status</span><p><span className={getStatusBadgeClass(arsip.status)}>{arsip.status}</span></p></div>
                        <div><span className="text-sm text-gray-500">Unit Kerja</span><p className="font-medium">{arsip.unitKerja?.nama}</p></div>
                        <div><span className="text-sm text-gray-500">Tingkat Perkembangan</span><p className="font-medium">{arsip.tingkatPerkembangan}</p></div>
                        <div><span className="text-sm text-gray-500">Kondisi Fisik</span><p className="font-medium">{arsip.kondisiFisik}</p></div>
                        <div><span className="text-sm text-gray-500">Jumlah Berkas</span><p className="font-medium">{arsip.jumlahBerkas}</p></div>
                    </div>
                    {arsip.uraianInformasi && (
                        <div className="mt-4"><span className="text-sm text-gray-500">Uraian Informasi</span><p className="mt-1">{arsip.uraianInformasi}</p></div>
                    )}
                </div>

                {/* Retensi */}
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Retensi</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div><span className="text-sm text-gray-500">Tanggal Aktif Berakhir</span><p className="font-medium">{arsip.tanggalAktifBerakhir ? formatDate(arsip.tanggalAktifBerakhir) : 'Tidak ditentukan'}</p></div>
                        <div><span className="text-sm text-gray-500">Tanggal Inaktif Berakhir</span><p className="font-medium">{arsip.tanggalInaktifBerakhir ? formatDate(arsip.tanggalInaktifBerakhir) : 'Permanen / Tidak ditentukan'}</p></div>
                    </div>
                </div>

                {/* Lokasi Simpan */}
                {arsip.lokasiSimpan && (
                    <div className="card">
                        <h3 className="text-lg font-semibold mb-4">Lokasi Simpan</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div><span className="text-sm text-gray-500">Nomor Rak</span><p className="font-medium">{arsip.lokasiSimpan.nomorRak || '-'}</p></div>
                            <div><span className="text-sm text-gray-500">Nomor Laci</span><p className="font-medium">{arsip.lokasiSimpan.nomorLaci || '-'}</p></div>
                            <div><span className="text-sm text-gray-500">Nomor Boks</span><p className="font-medium">{arsip.lokasiSimpan.nomorBoks || '-'}</p></div>
                            <div><span className="text-sm text-gray-500">Nomor Folder</span><p className="font-medium">{arsip.lokasiSimpan.nomorFolder || '-'}</p></div>
                        </div>
                    </div>
                )}

                {/* Meta */}
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Info Sistem</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div><span className="text-sm text-gray-500">Dibuat oleh</span><p className="font-medium">{arsip.createdBy?.nama}</p></div>
                        <div><span className="text-sm text-gray-500">Dibuat pada</span><p className="font-medium">{formatDateTime(arsip.createdAt)}</p></div>
                        <div><span className="text-sm text-gray-500">Terakhir diubah oleh</span><p className="font-medium">{arsip.updatedBy?.nama ?? '-'}</p></div>
                        <div><span className="text-sm text-gray-500">Terakhir diubah pada</span><p className="font-medium">{formatDateTime(arsip.updatedAt)}</p></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
