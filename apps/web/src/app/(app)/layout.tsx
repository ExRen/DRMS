'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useUnreadNotifCount } from '@/hooks/use-api';
import { cn } from '@/lib/utils';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Arsip Aktif', href: '/arsip/aktif', icon: '📁' },
    { name: 'Arsip Inaktif', href: '/arsip/inaktif', icon: '📦' },
    { name: 'Arsip Musnah', href: '/arsip/musnah', icon: '🗑️' },
    { name: 'Usul Musnah', href: '/usul-musnah', icon: '📝' },
    { name: 'Perpanjangan', href: '/perpanjangan', icon: '🔄' },
    { name: 'Monitoring Retensi', href: '/monitoring/retensi', icon: '⏰' },
    { name: 'Monitoring Lokasi', href: '/monitoring/lokasi', icon: '📍' },
    { name: 'Notifikasi', href: '/notifikasi', icon: '🔔' },
];

const adminNav = [
    { name: 'Audit Log', href: '/audit-log', icon: '📋' },
];

export default function AppLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, clearAuth } = useAuthStore();
    const { data: unreadCount } = useUnreadNotifCount();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        if (!user) router.push('/login');
    }, [user, router]);

    if (!user) return null;

    const isSetum = user.role === 'USER_SETUM';

    const handleLogout = () => { clearAuth(); router.push('/login'); };

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            {/* Sidebar */}
            <aside className={cn(
                'flex flex-col bg-white border-r border-gray-200 transition-all duration-300',
                sidebarOpen ? 'w-64' : 'w-16'
            )}>
                {/* Logo */}
                <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100">
                    <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-white">D</span>
                    </div>
                    {sidebarOpen && <span className="font-semibold text-gray-900">DRMS ASABRI</span>}
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
                    {navigation.map((item) => (
                        <Link key={item.href} href={item.href}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                                pathname.startsWith(item.href) ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
                            )}>
                            <span className="text-lg flex-shrink-0">{item.icon}</span>
                            {sidebarOpen && (
                                <span className="flex-1">{item.name}</span>
                            )}
                            {sidebarOpen && item.name === 'Notifikasi' && unreadCount?.data > 0 && (
                                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{unreadCount.data}</span>
                            )}
                        </Link>
                    ))}

                    {isSetum && (
                        <>
                            <div className="pt-3 pb-1 px-3">
                                {sidebarOpen && <span className="text-xs font-medium text-gray-400 uppercase">Admin</span>}
                            </div>
                            {adminNav.map((item) => (
                                <Link key={item.href} href={item.href}
                                    className={cn(
                                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                                        pathname.startsWith(item.href) ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
                                    )}>
                                    <span className="text-lg flex-shrink-0">{item.icon}</span>
                                    {sidebarOpen && <span>{item.name}</span>}
                                </Link>
                            ))}
                        </>
                    )}
                </nav>

                {/* User Info */}
                <div className="border-t border-gray-200 p-3">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                            {user.nama?.charAt(0)}
                        </div>
                        {sidebarOpen && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{user.nama}</p>
                                <p className="text-xs text-gray-500">{user.role.replace(/_/g, ' ')}</p>
                            </div>
                        )}
                    </div>
                    {sidebarOpen && (
                        <button onClick={handleLogout} className="w-full mt-2 text-xs text-gray-500 hover:text-red-600 transition-colors">
                            Keluar
                        </button>
                    )}
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1 overflow-y-auto">
                <div className="p-6 max-w-7xl mx-auto">{children}</div>
            </main>
        </div>
    );
}
