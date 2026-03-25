'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateUsulMusnah, useArsipList } from '@/hooks/use-api';

export default function CreateUsulMusnahPage() {
    const router = useRouter();
    const { mutate: create, isPending } = useCreateUsulMusnah();
    const { data: arsipData } = useArsipList({ status: 'INAKTIF', limit: 100 });
    const arsips = arsipData?.data?.data ?? [];

    const [form, setForm] = useState({ arsipId: '', uraianSingkat: '' });
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!form.arsipId) { setError('Pilih arsip terlebih dahulu'); return; }
        create(form, {
            onSuccess: () => router.push('/usul-musnah'),
            onError: (err: any) => setError(err?.message ?? 'Gagal mengajukan usul musnah'),
        });
    };

    const selectedArsip = arsips.find((a: any) => a.id === form.arsipId);

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Ajukan Usul Musnah</h1>
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
                        <p><strong>Kode Klasifikasi:</strong> {selectedArsip.kodeKlasifikasi?.kode} — {selectedArsip.kodeKlasifikasi?.jenisArsip}</p>
                        <p><strong>Tahun:</strong> {selectedArsip.tahun}</p>
                        <p><strong>Unit Kerja:</strong> {selectedArsip.unitKerja?.nama}</p>
                        <p><strong>Uraian:</strong> {selectedArsip.uraianInformasi ?? '-'}</p>
                    </div>
                )}
                <div>
                    <label className="label">Uraian Singkat / Alasan</label>
                    <textarea className="input" rows={3} value={form.uraianSingkat}
                        onChange={(e) => setForm({ ...form, uraianSingkat: e.target.value })}
                        placeholder="Jelaskan alasan pengajuan pemusnahan..." />
                </div>
                <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={isPending} className="btn-primary">
                        {isPending ? 'Mengajukan...' : 'Ajukan Usul Musnah'}
                    </button>
                    <button type="button" onClick={() => router.back()} className="btn-secondary">Batal</button>
                </div>
            </form>
        </div>
    );
}
