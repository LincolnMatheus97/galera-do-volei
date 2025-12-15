'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Partida, Inscricao } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { EventCard } from '@/components/events/EventCard';
import { QRCodeCard } from '@/components/events/QRCodeCard';
import { Ticket, Trophy, Calendar, Frown } from 'lucide-react';

interface InscricaoComEvento extends Inscricao {
    nomeEvento: string;
    dataEvento: string;
    localEvento: string;
}

export default function MeusEventosPage() {
    const { user, isAuthenticated } = useAuth();
    const [minhasPartidas, setMinhasPartidas] = useState<Partida[]>([]);
    const [meusTickets, setMeusTickets] = useState<InscricaoComEvento[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isAuthenticated && user) {
            carregarDados();
        }
    }, [isAuthenticated, user]);

    async function carregarDados() {
        try {
            const res = await api.get<Partida[]>('/partidas');
            const todasPartidas = res.data;
            const organizando = todasPartidas.filter(p => p.moderador?.id === user?.id);
            setMinhasPartidas(organizando);

            const ticketsEncontrados: InscricaoComEvento[] = [];
            await Promise.all(todasPartidas.map(async (partida) => {
                try {
                    const resInsc = await api.get<Inscricao[]>(`/partidas/${partida.id}/inscricoes`);
                    const inscricoesDaPartida = resInsc.data;
                    const minhaInscricao = inscricoesDaPartida.find(i => i.jogadorId === user?.id);

                    if (minhaInscricao) {
                        ticketsEncontrados.push({
                            ...minhaInscricao,
                            nomeEvento: partida.titulo,
                            dataEvento: partida.data,
                            localEvento: partida.local || "Local a definir"
                        });
                    }
                } catch (err) {
                    console.error(`Erro ao buscar inscrições da partida ${partida.id}`);
                }
            }));

            const ticketsOrdenados = ticketsEncontrados.sort((a, b) => 
                new Date(b.dataEvento).getTime() - new Date(a.dataEvento).getTime()
            );

            setMeusTickets(ticketsOrdenados);

        } catch (error) {
            console.error("Erro geral ao carregar meus eventos", error);
        } finally {
            setLoading(false);
        }
    }

    if (!isAuthenticated) return null;

    return (
        <div className="max-w-7xl mx-auto pb-12">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-8 mb-10 text-white shadow-xl">
                <h1 className="text-3xl font-extrabold flex items-center gap-3">
                    <Calendar className="text-blue-300" size={32} />
                    Minha Área Esportiva
                </h1>
                <p className="text-blue-100 mt-2 text-lg">Gerencie seus jogos e acesse seus tickets.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* COLUNA ESQUERDA: Eventos que Organizo (Maior destaque se for moderador) */}
                <div className="lg:col-span-7 space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 border-b pb-2 border-gray-200">
                        <Trophy className="text-purple-600" /> Eventos que Organizo
                    </h2>
                    
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2].map(i => <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse"></div>)}
                        </div>
                    ) : minhasPartidas.length > 0 ? (
                        <div className="grid sm:grid-cols-2 gap-4">
                            {minhasPartidas.map(p => (
                                <EventCard key={p.id} partida={p} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white p-8 rounded-xl border-2 border-dashed border-gray-200 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trophy className="text-gray-300" size={32} />
                            </div>
                            <p className="text-gray-500 font-medium">Você não está organizando nenhum jogo.</p>
                        </div>
                    )}
                </div>

                {/* COLUNA DIREITA: Meus Tickets (Vertical e clean) */}
                <div className="lg:col-span-5 space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 border-b pb-2 border-gray-200">
                        <Ticket className="text-green-600" /> Meus Tickets
                    </h2>

                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2].map(i => <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse"></div>)}
                        </div>
                    ) : meusTickets.length > 0 ? (
                        <div className="space-y-6">
                            {meusTickets.map(ticket => (
                                <div key={ticket.id} className="relative group">
                                    {/* Efeito visual de ticket rasgado no topo se quiser, mas vamos manter clean */}
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-green-500 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
                                    <div className="relative bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{ticket.nomeEvento}</h3>
                                                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                                    <Calendar size={12}/> {new Date(ticket.dataEvento).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${
                                                ticket.status === 'confirmada' ? 'bg-green-50 text-green-700 border-green-200' :
                                                ticket.status === 'aceita' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                'bg-yellow-50 text-yellow-700 border-yellow-200'
                                            }`}>
                                                {ticket.status}
                                            </span>
                                        </div>

                                        {/* Só mostra QR se estiver confirmado/aceito */}
                                        {(ticket.status === 'confirmada' || ticket.status === 'aceita') ? (
                                            <div className="flex justify-center bg-gray-50 p-4 rounded-lg border border-dashed border-gray-200 group-hover:border-blue-300 transition-colors">
                                                 <QRCodeCard inscricao={ticket} nomeEvento={ticket.nomeEvento} />
                                            </div>
                                        ) : (
                                            <div className="bg-yellow-50 p-4 rounded-lg text-center border border-yellow-100">
                                                <p className="text-yellow-800 text-sm font-medium">Aguardando confirmação</p>
                                                <p className="text-yellow-600 text-xs mt-1">O QR Code aparecerá aqui após o pagamento/aprovação.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white p-8 rounded-xl border-2 border-dashed border-gray-200 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Frown className="text-gray-300" size={32} />
                            </div>
                            <p className="text-gray-500 font-medium">Nenhum ticket encontrado.</p>
                            <p className="text-sm text-gray-400 mt-2">Inscreva-se em partidas para vê-las aqui.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}