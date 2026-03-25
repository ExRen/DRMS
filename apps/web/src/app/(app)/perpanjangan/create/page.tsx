'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreatePerpanjangan, useArsipList } from '@/hooks/use-api';

export default function CreatePerpanjanganPage() {
    const router = useRouter();
    const { mutate: create, isPending } = useCreatePerpanjangan();
    const { data: arsipData } = useArsipList({ status: 'INAKTIF', limit: 100 });
    const arsips = arsipData?.data?.data ?? [];

    const [form, setForm] = useState({ arsipId: '', durasiPerpanjanganBulan: 12, alasanPerpanjangan: '' });
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!form.arsipId) { setError('Pilih arsip terlebih dahulu'); return; }
        if (!form.alasanPerpanjangan.trim()) { setError('Alasan perpanjangan wajib diisi'); return; }
        create(form, {
            onSuccess: () => router.push('/perpanjangan'),
            onError: (err: any) => setError(err?.message ?? 'Gagal mengajukan perpanjangan'),
        });
    };

    const selectedArsip = arsips.find((a: any) => a.id === form.arsipId);

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Ajukan Perpanjangan Retensi</h1>
            {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className="card space-y-4">
                <div>
                    <label className="label">Pilih Arsip Inaktif *</label>
                    <select className="input" required value={form.arsipId}
                        onChange={(e) => setForm({ ...form, arsipId: e.target.value })}>
                        <option value="">— Pilih Arsip —</option>
                        {arsips.map((a: any) => (
                            <option key={a.id} value={a.id}>
                                {a.nomorBerkas} — {a.kodeKlasifikasi?.kode} ({a.tahun})
                            </option>
                        ))}
                    </select>
                </div>
                {selectedArsip && (
                    <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1">
                        <p><strong>No. Berkas:</strong> {selectedArsip.nomorBerkas}</p>
                        <p><strong>Kode Klasifikasi:</strong> {selectedArsip.kodeKlasifikasi?.kode}</p>
                        <p><strong>Tahun:</strong> {selectedArsip.tahun}</p>
                        <p><strong>Unit Kerja:</strong> {selectedArsip.unitKerja?.nama}</p>
                    </div>
                )}
                <div>
                    <label className="label">Durasi Perpanjangan (bulan) *</label>
                    <input type="number" className="input" min={1} max={60} required
                        value={form.durasiPerpanjanganBulan}
                        onChange={(e) => setForm({ ...form, durasiPerpanjanganBulan: parseInt(e.target.value) })} />
                    <p className="text-xs text-gray-400 mt-1">Maksimal 60 bulan (5 tahun) per pengajuan</p>
                </div>
                <div>
                    <label className="label">Alasan Perpanjangan *</label>
                    <textarea className="input" rows={3} required value={form.alasanPerpanjangan}
                        onChange={(e) => setForm({ ...form, alasanPerpanjangan: e.target.value })}
                        placeholder="Jelaskan alasan mengapa arsip ini perlu diperpanjang masa retensinya..." />
                </div>
                <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={isPending} className="btn-primary">
                        {isPending ? 'Mengajukan...' : 'Ajukan Perpanjangan'}
                    </button>
                    <button type="button" onClick={() => router.back()} className="btn-secondary">Batal</button>
                </div>
            </form>
        </div>
    );
}
