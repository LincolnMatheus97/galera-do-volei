'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Partida } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { EventCard } from '@/components/events/EventCard';
import { useRouter } from 'next/navigation';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();
    
    const [partidas, setPartidas] = useState<Partida[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    // Proteção da Rota: Se não logado, manda pro login
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [authLoading, isAuthenticated, router]);

    // Busca dados da API
    useEffect(() => {
        if (isAuthenticated) {
            fetchPartidas();
        }
    }, [isAuthenticated]);

    async function fetchPartidas() {
        try {
            const response = await api.get<Partida[]>('/partidas');
            setPartidas(response.data);
        } catch (error) {
            console.error("Erro ao buscar partidas", error);
        } finally {
            setLoadingData(false);
        }
    }

    if (authLoading || (!isAuthenticated && !loadingData)) {
        return <div className="flex justify-center p-8">Carregando sessão...</div>;
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Eventos Disponíveis</h1>
                    <p className="text-gray-500 mt-1">Encontre sua próxima partida e participe!</p>
                </div>
                
                {/* Só mostra botão de criar se for moderador (Regra de Negócio) */}
                {/* Note que no backend todos podem criar partida se tiver endpoint, mas aqui escondemos visualmente se quiser */}
                <Link 
                    href="/partidas/criar" 
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                    <PlusCircle size={20} />
                    Criar Evento
                </Link>
            </div>

            {loadingData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            ) : partidas.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {partidas.map(partida => (
                        <EventCard key={partida.id} partida={partida} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-500 text-lg">Nenhuma partida encontrada.</p>
                    <p className="text-gray-400">Seja o primeiro a criar um evento!</p>
                </div>
            )}
        </div>
    );
}