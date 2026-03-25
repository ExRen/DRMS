import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthUser {
    id: string;
    nama: string;
    email: string;
    role: string;
    unitKerja?: { id: string; kode: string; nama: string };
}

interface AuthState {
    user: AuthUser | null;
    token: string | null;
    setAuth: (user: AuthUser, token: string) => void;
    clearAuth: () => void;
    isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            setAuth: (user, token) => {
                localStorage.setItem('drms_token', token);
                set({ user, token });
            },
            clearAuth: () => {
                localStorage.removeItem('drms_token');
                set({ user: null, token: null });
            },
            isAuthenticated: () => !!get().token,
        }),
        { name: 'drms-auth-storage' },
    ),
);
