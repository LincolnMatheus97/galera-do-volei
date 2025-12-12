'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Partida } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { EventCard } from '@/components/events/EventCard';
import { Ticket } from 'lucide-react';

export default function MeusEventosPage() {
    const { user, isAuthenticated } = useAuth();
    const [minhasPartidas, setMinhasPartidas] = useState<Partida[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) fetchMeusDados();
    }, [user]);

    async function fetchMeusDados() {
        try {
            // Busca todas as partidas e filtra as criadas pelo usuário
            const resPartidas = await api.get<Partida[]>('/partidas');
            const todasPartidas = resPartidas.data;
            const criadasPorMim = todasPartidas.filter(p => p.moderador?.id === user?.id);
            setMinhasPartidas(criadasPorMim);
        } catch (error) {
            console.error("Erro", error);
        } finally {
            setLoading(false);
        }
    }

    if (!isAuthenticated) return null;

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Minha Área</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Coluna 1: Eventos que Organizo */}
                <div>
                    <h2 className="text-xl font-semibold mb-4 flex items-center text-blue-700">
                        Eventos que Organizo
                    </h2>
                    {loading ? (
                        <div className="h-40 bg-gray-100 rounded animate-pulse"></div>
                    ) : minhasPartidas.length > 0 ? (
                        <div className="space-y-4">
                            {minhasPartidas.map(p => (
                                <EventCard key={p.id} partida={p} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 p-4 border border-dashed rounded-lg bg-white">
                            Você ainda não criou eventos.
                        </p>
                    )}
                </div>

                {/* Coluna 2: Meus Tickets */}
                <div>
                    <h2 className="text-xl font-semibold mb-4 flex items-center text-green-700">
                        <Ticket className="mr-2" /> Meus Tickets
                    </h2>
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                        <p className="text-gray-600 text-sm mb-2">
                            Para visualizar seus ingressos e QR Codes, acesse a página de detalhes do evento em que você se inscreveu no <a href="/dashboard" className="text-blue-600 underline">Dashboard</a>.
                        </p>
                        <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 text-xs rounded border border-yellow-200">
                            <strong>Dica:</strong> Após ser aprovado, o QR Code aparecerá automaticamente na página do evento.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}