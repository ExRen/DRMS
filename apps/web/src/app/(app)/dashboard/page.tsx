'use client';

import { useDashboardSummary, useChartRetensi, useChartPerUnitKerja } from '@/hooks/use-api';
import { useAuthStore } from '@/store/auth.store';

const statCards = [
    { key: 'totalArsip', label: 'Total Arsip', color: 'bg-blue-500', icon: '📁' },
    { key: 'arsipAktif', label: 'Arsip Aktif', color: 'bg-green-500', icon: '✅' },
    { key: 'arsipInaktif', label: 'Arsip Inaktif', color: 'bg-yellow-500', icon: '📦' },
    { key: 'arsipMusnah', label: 'Arsip Musnah', color: 'bg-red-500', icon: '🗑️' },
    { key: 'arsipPermanen', label: 'Arsip Permanen', color: 'bg-purple-500', icon: '🏛️' },
    { key: 'usulMusnahPending', label: 'Usul Musnah Pending', color: 'bg-orange-500', icon: '📝' },
    { key: 'perpanjanganPending', label: 'Perpanjangan Pending', color: 'bg-cyan-500', icon: '🔄' },
];

export default function DashboardPage() {
    const { user } = useAuthStore();
    const { data: summary, isLoading } = useDashboardSummary();
    const { data: chartRetensi } = useChartRetensi();
    const { data: chartUnit } = useChartPerUnitKerja();

    const summaryData = summary?.data ?? {};
    const retensiData = chartRetensi?.data ?? [];
    const unitData = chartUnit?.data ?? [];

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500 mt-1">Selamat datang, {user?.nama}</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
                {statCards.map((card) => (
                    <div key={card.key} className="card flex flex-col items-center text-center">
                        <span className="text-2xl mb-2">{card.icon}</span>
                        <p className="text-2xl font-bold text-gray-900">{isLoading ? '...' : summaryData[card.key] ?? 0}</p>
                        <p className="text-xs text-gray-500 mt-1">{card.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart Retensi */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribusi Status Arsip</h3>
                    <div className="space-y-3">
                        {retensiData.map((item: any) => (
                            <div key={item.status} className="flex items-center justify-between">
                                <span className={`badge-${item.status.toLowerCase()}`}>{item.status}</span>
                                <span className="font-medium">{item.count}</span>
                            </div>
                        ))}
                        {retensiData.length === 0 && <p className="text-sm text-gray-400">Belum ada data</p>}
                    </div>
                </div>

                {/* Chart Per Unit Kerja */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Arsip per Unit Kerja</h3>
                    <div className="space-y-3">
                        {unitData.map((item: any) => (
                            <div key={item.kode} className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">{item.nama}</span>
                                <span className="font-medium text-primary-600">{item.count}</span>
                            </div>
                        ))}
                        {unitData.length === 0 && <p className="text-sm text-gray-400">Belum ada data</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
