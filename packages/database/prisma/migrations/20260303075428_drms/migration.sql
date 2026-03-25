-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'USER_APPROVAL', 'USER_SETUM');

-- CreateEnum
CREATE TYPE "StatusArsip" AS ENUM ('AKTIF', 'INAKTIF', 'USUL_MUSNAH', 'MUSNAH', 'PERMANEN');

-- CreateEnum
CREATE TYPE "TingkatPerkembangan" AS ENUM ('ASLI', 'SALINAN');

-- CreateEnum
CREATE TYPE "KondisiFisik" AS ENUM ('BAIK', 'RUSAK', 'LENGKAP', 'TIDAK_LENGKAP');

-- CreateEnum
CREATE TYPE "KeteranganRetensi" AS ENUM ('PERMANEN', 'MUSNAH');

-- CreateEnum
CREATE TYPE "StatusApproval" AS ENUM ('PENDING', 'DISETUJUI', 'DITOLAK');

-- CreateEnum
CREATE TYPE "JenisNotifikasi" AS ENUM ('RETENSI_AKTIF_BERAKHIR', 'RETENSI_INAKTIF_BERAKHIR', 'USUL_MUSNAH_BARU', 'USUL_MUSNAH_DISETUJUI', 'USUL_MUSNAH_DITOLAK', 'PERPANJANGAN_DISETUJUI', 'PERPANJANGAN_DITOLAK', 'VERIFIKASI_SETUM_DIBUTUHKAN');

-- CreateTable
CREATE TABLE "unit_kerja" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unit_kerja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kode_klasifikasi" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "noUrut" INTEGER NOT NULL,
    "kategori" TEXT NOT NULL,
    "subKategori" TEXT,
    "jenisArsip" TEXT NOT NULL,
    "komponenDokumen" TEXT,
    "retensiAktifBulan" INTEGER NOT NULL,
    "retensiInaktifBulan" INTEGER NOT NULL,
    "keterangan" "KeteranganRetensi" NOT NULL,
    "catatanRetensiAktif" TEXT,
    "catatanRetensiInaktif" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kode_klasifikasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "adUsername" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "jabatan" TEXT,
    "nip" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "unitKerjaId" TEXT NOT NULL,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "arsip" (
    "id" TEXT NOT NULL,
    "nomorArsip" TEXT,
    "nomorBerkas" TEXT NOT NULL,
    "kodeKlasifikasiId" TEXT NOT NULL,
    "uraianInformasi" TEXT,
    "tahun" INTEGER NOT NULL,
    "tingkatPerkembangan" "TingkatPerkembangan" NOT NULL DEFAULT 'ASLI',
    "kondisiFisik" "KondisiFisik" NOT NULL DEFAULT 'BAIK',
    "jumlahBerkas" INTEGER NOT NULL DEFAULT 1,
    "status" "StatusArsip" NOT NULL DEFAULT 'AKTIF',
    "unitKerjaId" TEXT NOT NULL,
    "tanggalAktifBerakhir" TIMESTAMP(3),
    "tanggalInaktifBerakhir" TIMESTAMP(3),
    "fileDigitalKey" TEXT,
    "fileMimeType" TEXT,
    "fileUkuranBytes" INTEGER,
    "catatan" TEXT,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "arsip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lokasi_simpan" (
    "id" TEXT NOT NULL,
    "arsipId" TEXT NOT NULL,
    "nomorLaci" TEXT,
    "nomorRak" TEXT,
    "nomorBoks" TEXT,
    "nomorFolder" TEXT,
    "keterangan" TEXT,
    "updatedBySetumId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lokasi_simpan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usul_musnah" (
    "id" TEXT NOT NULL,
    "arsipId" TEXT NOT NULL,
    "fileNotaDinasKey" TEXT,
    "uraianSingkat" TEXT,
    "masaSimpan" INTEGER NOT NULL,
    "statusApproval" "StatusApproval" NOT NULL DEFAULT 'PENDING',
    "approvedOlehId" TEXT,
    "penilaianApproval" TEXT,
    "tanggalApproval" TIMESTAMP(3),
    "statusVerifikasiSetum" "StatusApproval" NOT NULL DEFAULT 'PENDING',
    "verifikasiSetumId" TEXT,
    "catatanSetum" TEXT,
    "tanggalVerifikasi" TIMESTAMP(3),
    "diajukanOlehId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usul_musnah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perpanjangan_retensi" (
    "id" TEXT NOT NULL,
    "arsipId" TEXT NOT NULL,
    "durasiPerpanjanganBulan" INTEGER NOT NULL,
    "alasanPerpanjangan" TEXT NOT NULL,
    "status" "StatusApproval" NOT NULL DEFAULT 'PENDING',
    "approvedOlehId" TEXT,
    "catatanApproval" TEXT,
    "tanggalInaktifBaruBerakhir" TIMESTAMP(3),
    "diajukanOlehId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "perpanjangan_retensi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifikasi" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jenis" "JenisNotifikasi" NOT NULL,
    "judul" TEXT NOT NULL,
    "pesan" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "entityType" TEXT,
    "entityId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifikasi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unit_kerja_kode_key" ON "unit_kerja"("kode");

-- CreateIndex
CREATE INDEX "unit_kerja_parentId_idx" ON "unit_kerja"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "kode_klasifikasi_kode_key" ON "kode_klasifikasi"("kode");

-- CreateIndex
CREATE INDEX "kode_klasifikasi_noUrut_idx" ON "kode_klasifikasi"("noUrut");

-- CreateIndex
CREATE INDEX "kode_klasifikasi_kategori_idx" ON "kode_klasifikasi"("kategori");

-- CreateIndex
CREATE UNIQUE INDEX "users_adUsername_key" ON "users"("adUsername");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_nip_key" ON "users"("nip");

-- CreateIndex
CREATE INDEX "users_unitKerjaId_idx" ON "users"("unitKerjaId");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "arsip_status_idx" ON "arsip"("status");

-- CreateIndex
CREATE INDEX "arsip_unitKerjaId_idx" ON "arsip"("unitKerjaId");

-- CreateIndex
CREATE INDEX "arsip_kodeKlasifikasiId_idx" ON "arsip"("kodeKlasifikasiId");

-- CreateIndex
CREATE INDEX "arsip_tahun_idx" ON "arsip"("tahun");

-- CreateIndex
CREATE INDEX "arsip_tanggalAktifBerakhir_idx" ON "arsip"("tanggalAktifBerakhir");

-- CreateIndex
CREATE INDEX "arsip_tanggalInaktifBerakhir_idx" ON "arsip"("tanggalInaktifBerakhir");

-- CreateIndex
CREATE INDEX "arsip_status_unitKerjaId_idx" ON "arsip"("status", "unitKerjaId");

-- CreateIndex
CREATE INDEX "arsip_status_tanggalAktifBerakhir_idx" ON "arsip"("status", "tanggalAktifBerakhir");

-- CreateIndex
CREATE UNIQUE INDEX "lokasi_simpan_arsipId_key" ON "lokasi_simpan"("arsipId");

-- CreateIndex
CREATE INDEX "usul_musnah_arsipId_idx" ON "usul_musnah"("arsipId");

-- CreateIndex
CREATE INDEX "usul_musnah_statusApproval_idx" ON "usul_musnah"("statusApproval");

-- CreateIndex
CREATE INDEX "usul_musnah_statusVerifikasiSetum_idx" ON "usul_musnah"("statusVerifikasiSetum");

-- CreateIndex
CREATE INDEX "usul_musnah_statusApproval_statusVerifikasiSetum_idx" ON "usul_musnah"("statusApproval", "statusVerifikasiSetum");

-- CreateIndex
CREATE INDEX "perpanjangan_retensi_arsipId_idx" ON "perpanjangan_retensi"("arsipId");

-- CreateIndex
CREATE INDEX "perpanjangan_retensi_status_idx" ON "perpanjangan_retensi"("status");

-- CreateIndex
CREATE INDEX "audit_log_userId_idx" ON "audit_log"("userId");

-- CreateIndex
CREATE INDEX "audit_log_entityType_entityId_idx" ON "audit_log"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_log_action_idx" ON "audit_log"("action");

-- CreateIndex
CREATE INDEX "audit_log_createdAt_idx" ON "audit_log"("createdAt");

-- CreateIndex
CREATE INDEX "notifikasi_userId_isRead_idx" ON "notifikasi"("userId", "isRead");

-- CreateIndex
CREATE INDEX "notifikasi_userId_createdAt_idx" ON "notifikasi"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "unit_kerja" ADD CONSTRAINT "unit_kerja_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "unit_kerja"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_unitKerjaId_fkey" FOREIGN KEY ("unitKerjaId") REFERENCES "unit_kerja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "arsip" ADD CONSTRAINT "arsip_kodeKlasifikasiId_fkey" FOREIGN KEY ("kodeKlasifikasiId") REFERENCES "kode_klasifikasi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "arsip" ADD CONSTRAINT "arsip_unitKerjaId_fkey" FOREIGN KEY ("unitKerjaId") REFERENCES "unit_kerja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "arsip" ADD CONSTRAINT "arsip_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "arsip" ADD CONSTRAINT "arsip_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lokasi_simpan" ADD CONSTRAINT "lokasi_simpan_arsipId_fkey" FOREIGN KEY ("arsipId") REFERENCES "arsip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usul_musnah" ADD CONSTRAINT "usul_musnah_arsipId_fkey" FOREIGN KEY ("arsipId") REFERENCES "arsip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usul_musnah" ADD CONSTRAINT "usul_musnah_approvedOlehId_fkey" FOREIGN KEY ("approvedOlehId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usul_musnah" ADD CONSTRAINT "usul_musnah_verifikasiSetumId_fkey" FOREIGN KEY ("verifikasiSetumId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usul_musnah" ADD CONSTRAINT "usul_musnah_diajukanOlehId_fkey" FOREIGN KEY ("diajukanOlehId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perpanjangan_retensi" ADD CONSTRAINT "perpanjangan_retensi_arsipId_fkey" FOREIGN KEY ("arsipId") REFERENCES "arsip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perpanjangan_retensi" ADD CONSTRAINT "perpanjangan_retensi_approvedOlehId_fkey" FOREIGN KEY ("approvedOlehId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perpanjangan_retensi" ADD CONSTRAINT "perpanjangan_retensi_diajukanOlehId_fkey" FOREIGN KEY ("diajukanOlehId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifikasi" ADD CONSTRAINT "notifikasi_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
