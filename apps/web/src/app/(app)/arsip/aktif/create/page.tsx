'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateArsip, useKodeKlasifikasiList } from '@/hooks/use-api';

export default function CreateArsipPage() {
    const router = useRouter();
    const { mutate: createArsip, isPending } = useCreateArsip();
    const { data: kodeKlasData } = useKodeKlasifikasiList();
    const kodeKlasifikasi = kodeKlasData?.data ?? [];
    const [error, setError] = useState('');

    const today = new Date().toISOString().split('T')[0];

    const [form, setForm] = useState({
        nomorBerkas: '', kodeKlasifikasiId: '', uraianInformasi: '',
        tanggalArsip: today, tahun: new Date().getFullYear(),
        tanggalAktifBerakhirManual: '', tanggalInaktifBerakhirManual: '',
        tingkatPerkembangan: 'ASLI', kondisiFisik: 'BAIK', jumlahBerkas: 1, catatan: '',
        // Lokasi Simpan
        nomorLaci: '', nomorRak: '', nomorBoks: '', nomorFolder: '', keteranganLokasi: '',
    });

    // Auto-update tahun when tanggalArsip changes
    const handleTanggalChange = (val: string) => {
        const tahun = val ? new Date(val).getFullYear() : new Date().getFullYear();
        setForm({ ...form, tanggalArsip: val, tahun });
    };

    // Show retensi info from selected kode klasifikasi
    const selectedKode = kodeKlasifikasi.find((k: any) => k.id === form.kodeKlasifikasiId);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const payload: any = { ...form };
        // Clean empty strings
        if (!payload.tanggalAktifBerakhirManual) delete payload.tanggalAktifBerakhirManual;
        if (!payload.tanggalInaktifBerakhirManual) delete payload.tanggalInaktifBerakhirManual;

        createArsip(payload, {
            onSuccess: () => router.push('/arsip/aktif'),
            onError: (err: any) => setError(err?.message ?? 'Gagal menyimpan arsip'),
        });
    };

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Tambah Arsip Baru</h1>
            {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informasi Utama */}
                <div className="card space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Informasi Arsip</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Nomor Berkas *</label>
                            <input className="input" required value={form.nomorBerkas} onChange={(e) => setForm({ ...form, nomorBerkas: e.target.value })} />
                        </div>
                        <div>
                            <label className="label">Kode Klasifikasi *</label>
                            <select className="input" required value={form.kodeKlasifikasiId} onChange={(e) => setForm({ ...form, kodeKlasifikasiId: e.target.value })}>
                                <option value="">— Pilih Kode Klasifikasi —</option>
                                {kodeKlasifikasi.map((item: any) => (
                                    <option key={item.id} value={item.id}>{item.kode} — {item.jenisArsip}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {selectedKode && (
                        <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-800">
                            <strong>Info Retensi:</strong> Aktif {selectedKode.retensiAktifBulan === -1 ? '(Kondisional)' : `${selectedKode.retensiAktifBulan} bulan`},
                            Inaktif {selectedKode.retensiInaktifBulan === -1 ? '(Kondisional)' : `${selectedKode.retensiInaktifBulan} bulan`},
                            Keterangan: {selectedKode.keterangan}
                        </div>
                    )}
                    <div>
                        <label className="label">Uraian Informasi</label>
                        <textarea className="input" rows={3} value={form.uraianInformasi} onChange={(e) => setForm({ ...form, uraianInformasi: e.target.value })} />
                    </div>
                </div>

                {/* Tanggal & Retensi */}
                <div className="card space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Tanggal & Retensi</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="label">Tanggal Arsip *</label>
                            <input type="date" className="input" required value={form.tanggalArsip} onChange={(e) => handleTanggalChange(e.target.value)} />
                        </div>
                        <div>
                            <label className="label">Tgl Aktif Berakhir</label>
                            <input type="date" className="input" value={form.tanggalAktifBerakhirManual}
                                onChange={(e) => setForm({ ...form, tanggalAktifBerakhirManual: e.target.value })} />
                            <p className="text-xs text-gray-400 mt-1">Kosongkan = hitung otomatis</p>
                        </div>
                        <div>
                            <label className="label">Tgl Inaktif Berakhir</label>
                            <input type="date" className="input" value={form.tanggalInaktifBerakhirManual}
                                onChange={(e) => setForm({ ...form, tanggalInaktifBerakhirManual: e.target.value })} />
                            <p className="text-xs text-gray-400 mt-1">Kosongkan = hitung otomatis</p>
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
                    <p className="text-xs text-gray-500">Isi lokasi penyimpanan fisik arsip (opsional, bisa diisi nanti oleh Setum)</p>
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
                        <input className="input" value={form.keteranganLokasi} onChange={(e) => setForm({ ...form, keteranganLokasi: e.target.value })} placeholder="Keterangan tambahan lokasi penyimpanan..." />
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button type="submit" disabled={isPending} className="btn-primary">{isPending ? 'Menyimpan...' : 'Simpan Arsip'}</button>
                    <button type="button" onClick={() => router.back()} className="btn-secondary">Batal</button>
                </div>
            </form>
        </div>
    );
}
