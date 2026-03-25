'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useArsipDetail, useUpdateArsip } from '@/hooks/use-api';

export default function EditArsipPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { data, isLoading } = useArsipDetail(id);
    const arsip = data?.data;
    const { mutate: updateArsip, isPending } = useUpdateArsip();
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        nomorBerkas: '', uraianInformasi: '',
        tanggalAktifBerakhirManual: '', tanggalInaktifBerakhirManual: '',
        tingkatPerkembangan: 'ASLI', kondisiFisik: 'BAIK', jumlahBerkas: 1, catatan: '',
        // Lokasi Simpan
        nomorLaci: '', nomorRak: '', nomorBoks: '', nomorFolder: '', keteranganLokasi: '',
    });

    useEffect(() => {
        if (arsip) {
            setForm({
                nomorBerkas: arsip.nomorBerkas ?? '',
                uraianInformasi: arsip.uraianInformasi ?? '',
                tanggalAktifBerakhirManual: arsip.tanggalAktifBerakhir ? new Date(arsip.tanggalAktifBerakhir).toISOString().split('T')[0] : '',
                tanggalInaktifBerakhirManual: arsip.tanggalInaktifBerakhir ? new Date(arsip.tanggalInaktifBerakhir).toISOString().split('T')[0] : '',
                tingkatPerkembangan: arsip.tingkatPerkembangan ?? 'ASLI',
                kondisiFisik: arsip.kondisiFisik ?? 'BAIK',
                jumlahBerkas: arsip.jumlahBerkas ?? 1,
                catatan: arsip.catatan ?? '',
                nomorLaci: arsip.lokasiSimpan?.nomorLaci ?? '',
                nomorRak: arsip.lokasiSimpan?.nomorRak ?? '',
                nomorBoks: arsip.lokasiSimpan?.nomorBoks ?? '',
                nomorFolder: arsip.lokasiSimpan?.nomorFolder ?? '',
                keteranganLokasi: arsip.lokasiSimpan?.keterangan ?? '',
            });
        }
    }, [arsip]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const payload: any = { id, ...form };
        if (!payload.tanggalAktifBerakhirManual) delete payload.tanggalAktifBerakhirManual;
        if (!payload.tanggalInaktifBerakhirManual) delete payload.tanggalInaktifBerakhirManual;

        updateArsip(payload, {
            onSuccess: () => router.push(`/arsip/aktif/${id}`),
            onError: (err: any) => setError(err?.message ?? 'Gagal menyimpan'),
        });
    };

    if (isLoading) return <div className="card p-8 text-center text-gray-400">Memuat...</div>;
    if (!arsip) return <div className="card p-8 text-center text-gray-400">Arsip tidak ditemukan</div>;
    if (arsip.status !== 'AKTIF') return <div className="card p-8 text-center text-red-500">Arsip hanya bisa diedit saat berstatus AKTIF</div>;

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Edit Arsip</h1>
            <p className="text-gray-500 mb-6">{arsip.nomorBerkas} — {arsip.kodeKlasifikasi?.kode}</p>
            {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informasi Utama */}
                <div className="card space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Informasi Arsip</h3>
                    <div>
                        <label className="label">Nomor Berkas *</label>
                        <input className="input" required value={form.nomorBerkas} onChange={(e) => setForm({ ...form, nomorBerkas: e.target.value })} />
                    </div>
                    <div>
                        <label className="label">Uraian Informasi</label>
                        <textarea className="input" rows={3} value={form.uraianInformasi} onChange={(e) => setForm({ ...form, uraianInformasi: e.target.value })} />
                    </div>
                </div>

                {/* Tanggal Retensi */}
                <div className="card space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Tanggal Retensi</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Tgl Aktif Berakhir</label>
                            <input type="date" className="input" value={form.tanggalAktifBerakhirManual}
                                onChange={(e) => setForm({ ...form, tanggalAktifBerakhirManual: e.target.value })} />
                        </div>
                        <div>
                            <label className="label">Tgl Inaktif Berakhir</label>
                            <input type="date" className="input" value={form.tanggalInaktifBerakhirManual}
                                onChange={(e) => setForm({ ...form, tanggalInaktifBerakhirManual: e.target.value })} />
                        </div>
                    </div>
                </div>

                {/* Detail Fisik */}
                <div className="card space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Detail Fisik</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="label">Jumlah Berkas</label>
                            <input type="number" className="input" min={1} value={form.jumlahBerkas} onChange={(e) => setForm({ ...form, jumlahBerkas: parseInt(e.target.value) || 1 })} />
                        </div>
                        <div>
                            <label className="label">Tingkat Perkembangan</label>
                            <select className="input" value={form.tingkatPerkembangan} onChange={(e) => setForm({ ...form, tingkatPerkembangan: e.target.value })}>
                                <option value="ASLI">Asli</option><option value="SALINAN">Salinan</option>
                            </select>
                        </div>
                        <div>
                            <label className="label">Kondisi Fisik</label>
                            <select className="input" value={form.kondisiFisik} onChange={(e) => setForm({ ...form, kondisiFisik: e.target.value })}>
                                <option value="BAIK">Baik</option><option value="RUSAK">Rusak</option>
                                <option value="LENGKAP">Lengkap</option><option value="TIDAK_LENGKAP">Tidak Lengkap</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="label">Catatan</label>
                        <textarea className="input" rows={2} value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })} />
                    </div>
                </div>

                {/* Lokasi Simpan */}
                <div className="card space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Lokasi Simpan</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Nomor Rak</label>
                            <input className="input" value={form.nomorRak} onChange={(e) => setForm({ ...form, nomorRak: e.target.value })} placeholder="cth: R-01" />
                        </div>
                        <div>
                            <label className="label">Nomor Laci</label>
                            <input className="input" value={form.nomorLaci} onChange={(e) => setForm({ ...form, nomorLaci: e.target.value })} placeholder="cth: L-03" />
                        </div>
                        <div>
                            <label className="label">Nomor Boks</label>
                            <input className="input" value={form.nomorBoks} onChange={(e) => setForm({ ...form, nomorBoks: e.target.value })} placeholder="cth: B-12" />
                        </div>
                        <div>
                            <label className="label">Nomor Folder</label>
                            <input className="input" value={form.nomorFolder} onChange={(e) => setForm({ ...form, nomorFolder: e.target.value })} placeholder="cth: F-005" />
                        </div>
                    </div>
                    <div>
                        <label className="label">Keterangan Lokasi</label>
                        <input className="input" value={form.keteranganLokasi} onChange={(e) => setForm({ ...form, keteranganLokasi: e.target.value })} placeholder="Keterangan tambahan..." />
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button type="submit" disabled={isPending} className="btn-primary">{isPending ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
                    <button type="button" onClick={() => router.back()} className="btn-secondary">Batal</button>
                </div>
            </form>
        </div>
    );
}
