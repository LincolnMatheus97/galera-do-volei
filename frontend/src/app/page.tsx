'use client';

import Link from 'next/link';
import { ArrowRight, Users, Calendar, MapPin, Star, ChevronRight, Activity, UserStar } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Partida } from '@/types';
import { EventCard } from '@/components/events/EventCard';

// Dados estáticos para seções institucionais (Features, Depoimentos)
const features = [
  {
    icon: Calendar,
    title: 'Encontre Partidas',
    description: 'Descubra jogos de vôlei perto de você e inscreva-se facilmente.',
  },
  {
    icon: Users,
    title: 'Conheça Jogadores',
    description: 'Conecte-se com outros entusiastas do vôlei na sua região.',
  },
  {
    icon: UserStar,
    title: 'Deixe Avaliações',
    description: 'Avalie partidas e organizadores para ajudar a comunidade a crescer.',
  },
  {
    icon: MapPin,
    title: 'Organize Eventos',
    description: 'Crie suas próprias partidas e gerencie inscrições.',
  },
];

const testimonials = [
  {
    name: 'Natiele Grazielly',
    role: 'Jogadora Amadora',
    text: 'Nunca foi tão fácil encontrar partidas perto de mim!',
    avatar: 'N',
  },
  {
    name: 'Marcos Gabriel',
    role: 'Organizador',
    text: 'Gerenciar inscrições e check-ins nunca foi tão fácil. Recomendo demais!',
    avatar: 'M',
  },
  {
    name: 'Thalisson Moura',
    role: 'Jogador Profissional',
    text: 'Encontrei meu time de competição através do app. Comunidade incrível!',
    avatar: 'T',
  },
];

export default function Home() {
    const [partidas, setPartidas] = useState<Partida[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPublicEvents() {
            try {
                const res = await api.get<Partida[]>('/partidas');
                // Filtra apenas as abertas para a home
                setPartidas(res.data.filter(partida => partida.situacao === 'Aberta').slice(0, 3)); 
            } catch (error) {
                console.error("Erro ao buscar eventos públicos", error);
            } finally {
                setLoading(false);
            }
        }
        fetchPublicEvents();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-slate-900 pt-20 pb-32 md:pt-32 md:pb-48">
                {/* Background Decorativo */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 -right-20 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl animate-pulse" />
                    <div className="absolute bottom-1/4 -left-20 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl" />
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=1200')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
                </div>
                
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-blue-100 text-sm font-medium mb-8 border border-white/10 backdrop-blur-sm">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span>A comunidade que mais cresce no Brasil</span>
                        </div>
                        
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight">
                            Encontre sua próxima{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                                partida
                            </span>
                        </h1>
                        
                        <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                            Organize jogos, encontre times e eleve seu nível no vôlei. Tudo em um só lugar.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/login"
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30"
                            >
                                <span>Explorar Partidas</span>
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link
                                href="/cadastro"
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-all text-lg font-medium backdrop-blur-sm"
                            >
                                Criar Conta Grátis
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 md:py-28 bg-white relative z-20 -mt-10 rounded-t-[2.5rem]">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                            Tudo que você precisa para jogar
                        </h2>
                        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                            Uma plataforma completa para encontrar, organizar e participar de partidas de vôlei.
                        </p>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={feature.title}
                                className="bg-slate-50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-100"
                            >
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-5 shadow-lg shadow-blue-500/20 text-white">
                                    <feature.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-slate-500 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Events */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                                Próximas Partidas
                            </h2>
                            <p className="text-slate-500">
                                Junte-se aos jogos que estão rolando agora.
                            </p>
                        </div>
                        <Link
                            href="/login"
                            className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-white hover:shadow-sm transition-all"
                        >
                            Ver todas
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                    
                    {loading ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => <div key={i} className="h-80 bg-slate-200 rounded-2xl animate-pulse"></div>)}
                        </div>
                    ) : partidas.length > 0 ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {partidas.map((partida) => (
                                <EventCard key={partida.id} partida={partida} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
                            <Activity className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                            <p className="text-slate-500 text-lg">Nenhuma partida pública encontrada no momento.</p>
                        </div>
                    )}
                    
                    <div className="mt-10 text-center md:hidden">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium shadow-sm w-full justify-center"
                        >
                            Ver todas as partidas
                        </Link>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                            O que a galera diz
                        </h2>
                        <p className="text-slate-500 text-lg">
                            Milhares de jogadores já fazem parte da nossa comunidade.
                        </p>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial) => (
                            <div
                                key={testimonial.name}
                                className="bg-slate-50 rounded-2xl p-8 border border-slate-100"
                            >
                                <div className="flex items-center gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-orange-400 text-orange-400" />
                                    ))}
                                </div>
                                <p className="text-slate-700 mb-6 leading-relaxed italic">
                                    "{testimonial.text}"
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                                        {testimonial.avatar}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">{testimonial.name}</p>
                                        <p className="text-sm text-slate-500">{testimonial.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-800 rounded-3xl p-10 md:p-20 text-center relative overflow-hidden shadow-2xl">
                        <div className="absolute inset-0 opacity-20">
                            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white blur-3xl" />
                            <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-white blur-3xl" />
                        </div>
                        
                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
                                Pronto para entrar em quadra?
                            </h2>
                            <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
                                Crie sua conta agora, encontre seu time e participe dos melhores eventos da sua região.
                            </p>
                            <Link
                                href="/cadastro"
                                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-blue-700 hover:bg-blue-50 transition-all text-lg font-bold shadow-lg"
                            >
                                <span>Começar Agora</span>
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 py-12">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                GV
                            </div>
                            <span className="text-xl font-bold text-slate-900">
                                Galera do Vôlei
                            </span>
                        </div>
                        
                        <div className="flex flex-wrap justify-center gap-8 text-slate-500 font-medium text-sm">
                            <Link href="https://github.com/LincolnMatheus97" className="hover:text-blue-600 transition-colors">Contato</Link>
                        </div>
                        
                        <p className="text-sm text-slate-400">
                            Desenvolvido por <strong>Lincoln Matheus</strong>
                            © 2025 Galera do Vôlei.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}