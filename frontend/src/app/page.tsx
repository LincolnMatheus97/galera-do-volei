'use client';

import Link from 'next/link';
import { ArrowRight, Calendar, MapPin, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Partida } from '@/types';
import { EventCard } from '@/components/events/EventCard';

export default function Home() {
    const [partidas, setPartidas] = useState<Partida[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPublicEvents() {
            try {
                const res = await api.get<Partida[]>('/partidas');
                setPartidas(res.data.filter(partida => partida.situacao === 'Aberta'));
            } catch (error) {
                console.error("Erro ao buscar eventos públicos", error);
            } finally {
                setLoading(false);
            }
        }
        fetchPublicEvents();
    }, []);

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section Simplificada */}
            <section className="bg-gradient-to-br from-blue-900 to-blue-700 text-white py-20 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
                        Galera do Vôlei <span className="text-blue-200">EventSync</span>
                    </h1>
                    <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                        Encontre jogos, participe de campeonatos e gerencie seus eventos esportivos em um só lugar.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link href="/dashboard" className="bg-white text-blue-900 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition shadow-lg">
                            Acessar Painel
                        </Link>
                    </div>
                </div>
            </section>

            {/* Listagem Pública de Eventos */}
            <section className="py-16 bg-gray-50 flex-grow">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                            <Calendar className="mr-3 text-blue-600" /> Próximos Eventos
                        </h2>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse"></div>)}
                        </div>
                    ) : partidas.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {partidas.map(partida => (
                                <EventCard key={partida.id} partida={partida} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                            <p className="text-gray-500 text-lg">Nenhum evento público encontrado no momento.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}