'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { setCookie, deleteCookie, getCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { AuthResponse, LoginInput, Usuario, CadastroInput } from '@/types';

interface AuthContextType {
    user: Usuario | null;
    isAuthenticated: boolean;
    login: (data: LoginInput) => Promise<void>;
    register: (data: CadastroInput) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<Usuario | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Ao carregar a página, verifica se já tem usuário salvo nos cookies
    useEffect(() => {
        const carregarSessao = async () => {
            const token = getCookie('eventsync_token');
            const userStored = getCookie('eventsync_user');

            if (token && userStored) {
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                setUser(JSON.parse(userStored as string));
            }
            setLoading(false);
        };

        carregarSessao();
    }, []);

    async function login({ email, senha }: LoginInput) {
        try {
            const response = await api.post<AuthResponse>('/login', { email, senha });
            
            const { token, usuario } = response.data;

            // Salva no Cookie (1 dia de duração)
            setCookie('eventsync_token', token, { maxAge: 60 * 60 * 24 });
            setCookie('eventsync_user', JSON.stringify(usuario), { maxAge: 60 * 60 * 24 });

            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(usuario);

            router.push('/dashboard');
        } catch (error) {
            console.error("Erro ao fazer login", error);
            throw error; 
        }
    }

    async function register(data: CadastroInput) {
        try {
            await api.post('/jogadores', data);
            await login({ email: data.email, senha: data.senha });
        } catch (error) {
            console.error("Erro ao cadastrar", error);
            throw error;
        }
    }

    function logout() {
        deleteCookie('eventsync_token');
        deleteCookie('eventsync_user');
        setUser(null);
        router.push('/login');
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);