'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Partida, Inscricao } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { EventCard } from '@/components/events/EventCard';
import { QRCodeCard } from '@/components/events/QRCodeCard'; // Supondo que exista esse componente
import { Ticket } from 'lucide-react';

export default function MeusEventosPage() {
    const { user, isAuthenticated } = useAuth();
    const [minhasPartidas, setMinhasPartidas] = useState<Partida[]>([]);
    const [minhasInscricoes, setMinhasInscricoes] = useState<Inscricao[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchMeusDados();
            fetchMinhasInscricoes();
        }
    }, [user]);

    async function fetchMeusDados() {
        try {
            const resPartidas = await api.get<Partida[]>('/partidas');
            const todasPartidas = resPartidas.data;
            const criadasPorMim = todasPartidas.filter(p => p.moderador?.id === user?.id);
            setMinhasPartidas(criadasPorMim);
        } catch (error) {
            console.error("Erro", error);
        }
    }

    async function fetchMinhasInscricoes() {
    try {
        const resPartidas = await api.get<Partida[]>('/partidas');
        const partidas = resPartidas.data;
        let inscricoesUsuario: Inscricao[] = [];

        // Para cada partida, busca as inscrições e filtra as do usuário
        await Promise.all(partidas.map(async (partida) => {
            const res = await api.get<Inscricao[]>(`/partidas/${partida.id}/inscricoes`);
            const inscricoes = res.data;
            const minhas = inscricoes.filter(i => i.jogador?.email === user?.email);
            minhas.forEach(i => {
                if (i.jogador) {
                    i.jogador.email = partida.inscricoes ? partida.titulo : i.jogador.email;
                }
            });
            inscricoesUsuario.push(...minhas);
        }));

        setMinhasInscricoes(inscricoesUsuario);
    } catch (error) {
        console.error("Erro ao buscar inscrições", error);
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
                        {loading ? (
                            <div className="h-40 bg-gray-100 rounded animate-pulse"></div>
                        ) : minhasInscricoes.length > 0 ? (
                            <div className="space-y-4">
                                {minhasInscricoes
                                    .filter(i => i.status === 'confirmada' || i.status === 'aceita')
                                    .map(inscricao => (
                                        <QRCodeCard
                                            key={inscricao.id}
                                            inscricao={inscricao}
                                            nomeEvento={minhasPartidas.find(p => p.id === inscricao.id)?.titulo || 'Evento Desconhecido'}
                                        />
                                    ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 p-4 border border-dashed rounded-lg bg-white">
                                Você ainda não possui tickets de eventos.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}