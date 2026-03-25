'use client';

import { useParams, useRouter } from 'next/navigation';
import { useArsipDetail } from '@/hooks/use-api';
import { formatDate, formatDateTime, getStatusBadgeClass } from '@/lib/utils';
import Link from 'next/link';

export default function ArsipMusnahDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { data, isLoading } = useArsipDetail(id);
    const arsip = data?.data;

    if (isLoading) return <div className="card p-8 text-center text-gray-400">Memuat...</div>;
    if (!arsip) return <div className="card p-8 text-center text-gray-400">Arsip tidak ditemukan</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Detail Arsip Musnah</h1>
                    <p className="text-gray-500 mt-1">{arsip.nomorBerkas}</p>
                </div>
                <Link href="/arsip/musnah" className="btn-secondary">Kembali</Link>
            </div>

            <div className="space-y-6">
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Informasi Arsip</h3>
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
                        <div><span className="text-sm text-gray-500">Tanggal Inaktif Berakhir</span><p className="font-medium">{arsip.tanggalInaktifBerakhir ? formatDate(arsip.tanggalInaktifBerakhir) : '-'}</p></div>
                    </div>
                </div>

                {/* Timeline Pemusnahan */}
                {arsip.usulMusnahs && arsip.usulMusnahs.length > 0 && (
                    <div className="card">
                        <h3 className="text-lg font-semibold mb-4">Timeline Pemusnahan</h3>
                        <div className="space-y-4">
                            {arsip.usulMusnahs.map((um: any) => (
                                <div key={um.id} className="border-l-4 border-red-400 pl-4 py-2">
                                    <p className="text-sm"><strong>Usul Musnah</strong> oleh {um.diajukanOleh?.nama}</p>
                                    <p className="text-xs text-gray-500">{formatDateTime(um.createdAt)}</p>
                                    <p className="text-sm mt-1">Approval: <span className={getStatusBadgeClass(um.statusApproval)}>{um.statusApproval}</span></p>
                                    <p className="text-sm">Verifikasi: <span className={getStatusBadgeClass(um.statusVerifikasiSetum)}>{um.statusVerifikasiSetum}</span></p>
                                    {um.uraianSingkat && <p className="text-xs text-gray-600 italic mt-1">"{um.uraianSingkat}"</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

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
