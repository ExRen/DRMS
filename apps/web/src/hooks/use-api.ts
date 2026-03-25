import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

// ── ARSIP ──────────────────────────────────────────────────────────────
export function useArsipList(filter: any) {
    return useQuery({ queryKey: ['arsip', filter], queryFn: () => api.get('/api/arsip', { params: filter }), staleTime: 30_000 });
}
export function useArsipDetail(id: string) {
    return useQuery({ queryKey: ['arsip', id], queryFn: () => api.get(`/api/arsip/${id}`), enabled: !!id });
}
export function useCreateArsip() {
    const qc = useQueryClient();
    return useMutation({ mutationFn: (dto: any) => api.post('/api/arsip', dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['arsip'] }) });
}
export function useUpdateArsip() {
    const qc = useQueryClient();
    return useMutation({ mutationFn: ({ id, ...dto }: any) => api.patch(`/api/arsip/${id}`, dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['arsip'] }) });
}

// ── USUL MUSNAH ────────────────────────────────────────────────────────
export function useUsulMusnahList(filter: any) {
    return useQuery({ queryKey: ['usul-musnah', filter], queryFn: () => api.get('/api/usul-musnah', { params: filter }) });
}
export function useUsulMusnahDetail(id: string) {
    return useQuery({ queryKey: ['usul-musnah', id], queryFn: () => api.get(`/api/usul-musnah/${id}`), enabled: !!id });
}
export function useCreateUsulMusnah() {
    const qc = useQueryClient();
    return useMutation({ mutationFn: (dto: any) => api.post('/api/usul-musnah', dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['usul-musnah'] }) });
}

// ── PERPANJANGAN RETENSI ───────────────────────────────────────────────
export function usePerpanjanganList(filter: any) {
    return useQuery({ queryKey: ['perpanjangan', filter], queryFn: () => api.get('/api/perpanjangan-retensi', { params: filter }) });
}
export function usePerpanjanganDetail(id: string) {
    return useQuery({ queryKey: ['perpanjangan', id], queryFn: () => api.get(`/api/perpanjangan-retensi/${id}`), enabled: !!id });
}
export function useCreatePerpanjangan() {
    const qc = useQueryClient();
    return useMutation({ mutationFn: (dto: any) => api.post('/api/perpanjangan-retensi', dto), onSuccess: () => qc.invalidateQueries({ queryKey: ['perpanjangan'] }) });
}

// ── MASTER ──────────────────────────────────────────────────────────────
export function useKodeKlasifikasiList() {
    return useQuery({ queryKey: ['kode-klasifikasi'], queryFn: () => api.get('/api/master/kode-klasifikasi'), staleTime: 300_000 });
}
export function useUnitKerjaList() {
    return useQuery({ queryKey: ['unit-kerja'], queryFn: () => api.get('/api/master/unit-kerja'), staleTime: 300_000 });
}

// ── DASHBOARD ───────────────────────────────────────────────────────────
export function useDashboardSummary() {
    return useQuery({ queryKey: ['dashboard-summary'], queryFn: () => api.get('/api/dashboard/summary'), staleTime: 60_000 });
}
export function useChartRetensi() {
    return useQuery({ queryKey: ['chart-retensi'], queryFn: () => api.get('/api/dashboard/chart/retensi') });
}
export function useChartPerUnitKerja() {
    return useQuery({ queryKey: ['chart-unit-kerja'], queryFn: () => api.get('/api/dashboard/chart/per-unit-kerja') });
}

// ── NOTIFIKASI ──────────────────────────────────────────────────────────
export function useNotifikasiList(page = 1) {
    return useQuery({ queryKey: ['notifikasi', page], queryFn: () => api.get('/api/notifikasi', { params: { page } }) });
}
export function useUnreadNotifCount() {
    return useQuery({ queryKey: ['notifikasi-unread'], queryFn: () => api.get('/api/notifikasi/unread-count'), refetchInterval: 30_000 });
}

// ── AUDIT LOG ───────────────────────────────────────────────────────────
export function useAuditLogList(filter: any) {
    return useQuery({ queryKey: ['audit-log', filter], queryFn: () => api.get('/api/audit-log', { params: filter }) });
}

// ── RETENSI MONITORING ──────────────────────────────────────────────────
export function useRetensiMendekatiAktif(page = 1) {
    return useQuery({ queryKey: ['retensi-aktif', page], queryFn: () => api.get('/api/retensi/mendekati-aktif-berakhir', { params: { page } }) });
}
export function useRetensiMendekatiMusnah(page = 1) {
    return useQuery({ queryKey: ['retensi-musnah', page], queryFn: () => api.get('/api/retensi/mendekati-musnah', { params: { page } }) });
}
