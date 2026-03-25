import { PrismaClient, KeteranganRetensi } from '../../generated/client';

const kodeKlasifikasiData = [
    // ── 1. PR — PERENCANAAN STRATEGIS ──────────────────────────────────────
    { kode: 'PR', noUrut: 1, kategori: 'PERENCANAAN STRATEGIS', subKategori: null, jenisArsip: 'PERENCANAAN STRATEGIS', komponenDokumen: null, retensiAktifBulan: 0, retensiInaktifBulan: 0, keterangan: 'MUSNAH' as KeteranganRetensi, catatanRetensiAktif: null, catatanRetensiInaktif: null },
    { kode: 'PR.01', noUrut: 1, kategori: 'PERENCANAAN STRATEGIS', subKategori: 'Rencana Jangka Panjang Perusahaan (RJPP)', jenisArsip: 'Rencana Jangka Panjang Perusahaan (RJPP)', komponenDokumen: null, retensiAktifBulan: 0, retensiInaktifBulan: 0, keterangan: 'PERMANEN' as KeteranganRetensi, catatanRetensiAktif: null, catatanRetensiInaktif: null },
    { kode: 'PR.01.01', noUrut: 1, kategori: 'PERENCANAAN STRATEGIS', subKategori: 'Rencana Jangka Panjang Perusahaan (RJPP)', jenisArsip: 'Penyusunan RJPP', komponenDokumen: null, retensiAktifBulan: 24, retensiInaktifBulan: 60, keterangan: 'PERMANEN' as KeteranganRetensi, catatanRetensiAktif: '2 Tahun Setelah Diperbarui', catatanRetensiInaktif: '5 Tahun' },
    { kode: 'PR.01.02', noUrut: 1, kategori: 'PERENCANAAN STRATEGIS', subKategori: 'Rencana Jangka Panjang Perusahaan (RJPP)', jenisArsip: 'Revisi RJPP', komponenDokumen: null, retensiAktifBulan: 24, retensiInaktifBulan: 60, keterangan: 'PERMANEN' as KeteranganRetensi, catatanRetensiAktif: '2 Tahun Setelah Diperbarui', catatanRetensiInaktif: '5 Tahun' },
    { kode: 'PR.02', noUrut: 1, kategori: 'PERENCANAAN STRATEGIS', subKategori: 'Rencana Kerja dan Anggaran Perusahaan (RKAP)', jenisArsip: 'Rencana Kerja dan Anggaran Perusahaan (RKAP)', komponenDokumen: null, retensiAktifBulan: 0, retensiInaktifBulan: 0, keterangan: 'PERMANEN' as KeteranganRetensi, catatanRetensiAktif: null, catatanRetensiInaktif: null },
    { kode: 'PR.02.01', noUrut: 1, kategori: 'PERENCANAAN STRATEGIS', subKategori: 'Rencana Kerja dan Anggaran Perusahaan (RKAP)', jenisArsip: 'Penyusunan RKAP', komponenDokumen: null, retensiAktifBulan: 12, retensiInaktifBulan: 60, keterangan: 'PERMANEN' as KeteranganRetensi, catatanRetensiAktif: '1 Tahun Setelah Tahun Berjalan', catatanRetensiInaktif: '5 Tahun' },

    // ── 2. MN — MANAJEMEN ──────────────────────────────────────────────────
    { kode: 'MN', noUrut: 2, kategori: 'MANAJEMEN', subKategori: null, jenisArsip: 'MANAJEMEN', komponenDokumen: null, retensiAktifBulan: 0, retensiInaktifBulan: 0, keterangan: 'MUSNAH' as KeteranganRetensi, catatanRetensiAktif: null, catatanRetensiInaktif: null },
    { kode: 'MN.01', noUrut: 2, kategori: 'MANAJEMEN', subKategori: 'Kebijakan Perusahaan', jenisArsip: 'Kebijakan Perusahaan', komponenDokumen: null, retensiAktifBulan: -1, retensiInaktifBulan: 60, keterangan: 'PERMANEN' as KeteranganRetensi, catatanRetensiAktif: 'Selama Masih Berlaku', catatanRetensiInaktif: '5 Tahun' },

    // ── 3. MB — MANAJEMEN BISNIS ───────────────────────────────────────────
    { kode: 'MB', noUrut: 3, kategori: 'MANAJEMEN BISNIS', subKategori: null, jenisArsip: 'MANAJEMEN BISNIS', komponenDokumen: null, retensiAktifBulan: 0, retensiInaktifBulan: 0, keterangan: 'MUSNAH' as KeteranganRetensi, catatanRetensiAktif: null, catatanRetensiInaktif: null },

    // ── 4. HK — HUKUM ──────────────────────────────────────────────────────
    { kode: 'HK', noUrut: 4, kategori: 'HUKUM', subKategori: null, jenisArsip: 'HUKUM', komponenDokumen: null, retensiAktifBulan: 0, retensiInaktifBulan: 0, keterangan: 'MUSNAH' as KeteranganRetensi, catatanRetensiAktif: null, catatanRetensiInaktif: null },
    { kode: 'HK.01', noUrut: 4, kategori: 'HUKUM', subKategori: 'Peraturan Perundang-undangan', jenisArsip: 'Peraturan Perundang-undangan', komponenDokumen: null, retensiAktifBulan: -1, retensiInaktifBulan: 48, keterangan: 'PERMANEN' as KeteranganRetensi, catatanRetensiAktif: 'Selama Masih Berlaku', catatanRetensiInaktif: '4 Tahun' },

    // ── 5. PH — PENGAWASAN DAN PEMERIKSAAN ─────────────────────────────────
    { kode: 'PH', noUrut: 5, kategori: 'PENGAWASAN DAN PEMERIKSAAN', subKategori: null, jenisArsip: 'PENGAWASAN DAN PEMERIKSAAN', komponenDokumen: null, retensiAktifBulan: 0, retensiInaktifBulan: 0, keterangan: 'MUSNAH' as KeteranganRetensi, catatanRetensiAktif: null, catatanRetensiInaktif: null },

    // ── 6. MR — MANAJEMEN RISIKO ───────────────────────────────────────────
    { kode: 'MR', noUrut: 6, kategori: 'MANAJEMEN RISIKO', subKategori: null, jenisArsip: 'MANAJEMEN RISIKO', komponenDokumen: null, retensiAktifBulan: 0, retensiInaktifBulan: 0, keterangan: 'MUSNAH' as KeteranganRetensi, catatanRetensiAktif: null, catatanRetensiInaktif: null },

    // ── 7. AI — AUDIT INTERNAL ─────────────────────────────────────────────
    { kode: 'AI', noUrut: 7, kategori: 'AUDIT INTERNAL', subKategori: null, jenisArsip: 'AUDIT INTERNAL', komponenDokumen: null, retensiAktifBulan: 0, retensiInaktifBulan: 0, keterangan: 'MUSNAH' as KeteranganRetensi, catatanRetensiAktif: null, catatanRetensiInaktif: null },

    // ── 8. TU — TATA USAHA ─────────────────────────────────────────────────
    { kode: 'TU', noUrut: 8, kategori: 'TATA USAHA', subKategori: null, jenisArsip: 'TATA USAHA', komponenDokumen: null, retensiAktifBulan: 0, retensiInaktifBulan: 0, keterangan: 'MUSNAH' as KeteranganRetensi, catatanRetensiAktif: null, catatanRetensiInaktif: null },
    { kode: 'TU.07', noUrut: 8, kategori: 'TATA USAHA', subKategori: 'Pelaksanaan Rapat', jenisArsip: 'Pelaksanaan Rapat', komponenDokumen: null, retensiAktifBulan: 0, retensiInaktifBulan: 0, keterangan: 'MUSNAH' as KeteranganRetensi, catatanRetensiAktif: null, catatanRetensiInaktif: null },
    { kode: 'TU.07.01', noUrut: 8, kategori: 'TATA USAHA', subKategori: 'Pelaksanaan Rapat', jenisArsip: 'Rapat Umum Pemegang Saham', komponenDokumen: 'Undangan Rapat, Bahan Paparan RUPS, Daftar Hadir RUPS, Risalah RUPS', retensiAktifBulan: 24, retensiInaktifBulan: 48, keterangan: 'PERMANEN' as KeteranganRetensi, catatanRetensiAktif: '2 Tahun', catatanRetensiInaktif: '4 Tahun' },

    // ── 9. HM — HUBUNGAN MASYARAKAT ────────────────────────────────────────
    { kode: 'HM', noUrut: 9, kategori: 'HUBUNGAN MASYARAKAT', subKategori: null, jenisArsip: 'HUBUNGAN MASYARAKAT', komponenDokumen: null, retensiAktifBulan: 0, retensiInaktifBulan: 0, keterangan: 'MUSNAH' as KeteranganRetensi, catatanRetensiAktif: null, catatanRetensiInaktif: null },

    // ── 10. SL — SUMBER DAYA MANUSIA ───────────────────────────────────────
    { kode: 'SL', noUrut: 10, kategori: 'SUMBER DAYA MANUSIA', subKategori: null, jenisArsip: 'SUMBER DAYA MANUSIA', komponenDokumen: null, retensiAktifBulan: 0, retensiInaktifBulan: 0, keterangan: 'MUSNAH' as KeteranganRetensi, catatanRetensiAktif: null, catatanRetensiInaktif: null },
    { kode: 'SL.01', noUrut: 10, kategori: 'SUMBER DAYA MANUSIA', subKategori: 'Perencanaan SDM', jenisArsip: 'Perencanaan SDM', komponenDokumen: null, retensiAktifBulan: 12, retensiInaktifBulan: 48, keterangan: 'MUSNAH' as KeteranganRetensi, catatanRetensiAktif: '1 Tahun', catatanRetensiInaktif: '4 Tahun' },

    // ── 11. TI — TEKNOLOGI INFORMASI ───────────────────────────────────────
    { kode: 'TI', noUrut: 11, kategori: 'TEKNOLOGI INFORMASI', subKategori: null, jenisArsip: 'TEKNOLOGI INFORMASI', komponenDokumen: null, retensiAktifBulan: 0, retensiInaktifBulan: 0, keterangan: 'MUSNAH' as KeteranganRetensi, catatanRetensiAktif: null, catatanRetensiInaktif: null },

    // ── 12. BJ — BELANJA DAN JASA ──────────────────────────────────────────
    { kode: 'BJ', noUrut: 12, kategori: 'BELANJA DAN JASA', subKategori: null, jenisArsip: 'BELANJA DAN JASA', komponenDokumen: null, retensiAktifBulan: 0, retensiInaktifBulan: 0, keterangan: 'MUSNAH' as KeteranganRetensi, catatanRetensiAktif: null, catatanRetensiInaktif: null },

    // ── 13. AS — ASET ──────────────────────────────────────────────────────
    { kode: 'AS', noUrut: 13, kategori: 'ASET', subKategori: null, jenisArsip: 'ASET', komponenDokumen: null, retensiAktifBulan: 0, retensiInaktifBulan: 0, keterangan: 'MUSNAH' as KeteranganRetensi, catatanRetensiAktif: null, catatanRetensiInaktif: null },

    // ── 14. RT — RUMAH TANGGA ──────────────────────────────────────────────
    { kode: 'RT', noUrut: 14, kategori: 'RUMAH TANGGA', subKategori: null, jenisArsip: 'RUMAH TANGGA', komponenDokumen: null, retensiAktifBulan: 0, retensiInaktifBulan: 0, keterangan: 'MUSNAH' as KeteranganRetensi, catatanRetensiAktif: null, catatanRetensiInaktif: null },

    // ── 15. SM — SEKRETARIS PERUSAHAAN ─────────────────────────────────────
    { kode: 'SM', noUrut: 15, kategori: 'SEKRETARIS PERUSAHAAN', subKategori: null, jenisArsip: 'SEKRETARIS PERUSAHAAN', komponenDokumen: null, retensiAktifBulan: 0, retensiInaktifBulan: 0, keterangan: 'MUSNAH' as KeteranganRetensi, catatanRetensiAktif: null, catatanRetensiInaktif: null },

    // ── 16. AK — AKUNTANSI ─────────────────────────────────────────────────
    { kode: 'AK', noUrut: 16, kategori: 'AKUNTANSI', subKategori: null, jenisArsip: 'AKUNTANSI', komponenDokumen: null, retensiAktifBulan: 0, retensiInaktifBulan: 0, keterangan: 'MUSNAH' as KeteranganRetensi, catatanRetensiAktif: null, catatanRetensiInaktif: null },
    { kode: 'AK.01', noUrut: 16, kategori: 'AKUNTANSI', subKategori: 'Laporan Keuangan', jenisArsip: 'Laporan Keuangan', komponenDokumen: null, retensiAktifBulan: 12, retensiInaktifBulan: 120, keterangan: 'PERMANEN' as KeteranganRetensi, catatanRetensiAktif: '1 Tahun', catatanRetensiInaktif: '10 Tahun' },

    // ── 17. KU — KEUANGAN ──────────────────────────────────────────────────
    { kode: 'KU', noUrut: 17, kategori: 'KEUANGAN', subKategori: null, jenisArsip: 'KEUANGAN', komponenDokumen: null, retensiAktifBulan: 0, retensiInaktifBulan: 0, keterangan: 'MUSNAH' as KeteranganRetensi, catatanRetensiAktif: null, catatanRetensiInaktif: null },

    // ── 18. KM — KEPATUHAN ─────────────────────────────────────────────────
    { kode: 'KM', noUrut: 18, kategori: 'KEPATUHAN', subKategori: null, jenisArsip: 'KEPATUHAN', komponenDokumen: null, retensiAktifBulan: 0, retensiInaktifBulan: 0, keterangan: 'MUSNAH' as KeteranganRetensi, catatanRetensiAktif: null, catatanRetensiInaktif: null },
];

export async function seedKodeKlasifikasi(prisma: PrismaClient) {
    for (const item of kodeKlasifikasiData) {
        await prisma.kodeKlasifikasi.upsert({
            where: { kode: item.kode },
            update: {
                noUrut: item.noUrut,
                kategori: item.kategori,
                subKategori: item.subKategori,
                jenisArsip: item.jenisArsip,
                komponenDokumen: item.komponenDokumen,
                retensiAktifBulan: item.retensiAktifBulan,
                retensiInaktifBulan: item.retensiInaktifBulan,
                keterangan: item.keterangan,
                catatanRetensiAktif: item.catatanRetensiAktif,
                catatanRetensiInaktif: item.catatanRetensiInaktif,
            },
            create: item,
        });
    }
}
