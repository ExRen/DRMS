'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { setAuth } = useAuthStore();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res: any = await api.post('/api/auth/login', { username, password });
            setAuth(res.data.user, res.data.accessToken);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err?.message ?? 'Login gagal. Periksa username dan password Anda.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl font-bold text-white">D</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">DRMS ASABRI</h1>
                        <p className="text-sm text-gray-500 mt-1">Document & Record Management System</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="label">Username Active Directory</label>
                            <input type="text" className="input" placeholder="contoh: john.doe"
                                value={username} onChange={(e) => setUsername(e.target.value)} required />
                        </div>
                        <div>
                            <label className="label">Password</label>
                            <input type="password" className="input" placeholder="••••••••"
                                value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                            {loading ? 'Memproses...' : 'Masuk'}
                        </button>
                    </form>

                    <p className="text-xs text-center text-gray-400 mt-6">
                        Gunakan akun Active Directory perusahaan Anda untuk masuk.
                    </p>
                </div>
            </div>
        </div>
    );
}
