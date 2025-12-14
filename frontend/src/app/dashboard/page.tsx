'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Users, Trophy, Plus, Activity } from 'lucide-react';
import { api } from '@/services/api';
import { Partida } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { EventCard } from '@/components/events/EventCard';

export default function DashboardPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [loadingData, setLoadingData] = useState(true);

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

  // Estatísticas para visual
  const stats = [
    { label: 'Eventos Ativos', value: partidas.length, icon: Calendar, color: 'bg-blue-100 text-blue-600' },
    { label: 'Minhas Partidas', value: partidas.filter(p => p.moderador?.id === user?.id).length, icon: Trophy, color: 'bg-purple-100 text-purple-600' },
    { label: 'Comunidade', value: 'On', icon: Users, color: 'bg-green-100 text-green-600' },
    { label: 'Status', value: user?.moderador ? 'Organizador' : 'Jogador', icon: Activity, color: 'bg-orange-100 text-orange-600' },
  ];

  if (authLoading) return <div className="p-8 text-center text-gray-500">Carregando...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header com Gradiente */}
      <section className="bg-gradient-to-r from-blue-700 to-indigo-800 py-12 mb-8 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white font-bold text-3xl border border-white/20 shadow-xl">
            {user?.nome.charAt(0).toUpperCase()}
          </div>
          <div className="text-white">
            <h1 className="text-3xl font-extrabold mb-1">
              Olá, {user?.nome.split(' ')[0]}! 👋
            </h1>
            <p className="text-blue-100 text-lg font-medium opacity-90">
              Pronto para mais uma partida hoje?
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10 -mt-16">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-5 shadow-lg border border-gray-100 flex flex-col items-start hover:-translate-y-1 transition-transform">
              <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Header da Lista */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="text-blue-600" /> Eventos Disponíveis
          </h2>
          
          {/* CORREÇÃO: Removi a verificação de moderador para o botão aparecer para todos */}
          <Link 
            href="/partidas/criar" 
            className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-orange-600 transition-all shadow-md hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Criar Evento
          </Link>
        </div>

        {/* Grid de Cards */}
        {loadingData ? (
           <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <div key={i} className="h-72 bg-gray-200 rounded-xl animate-pulse"></div>)}
           </div>
        ) : partidas.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {partidas.map((partida) => (
              <EventCard key={partida.id} partida={partida} />
            ))}
          </div>
        ) : (
           <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900">Nenhum evento encontrado</h3>
              <p className="text-gray-500">Seja o primeiro a criar uma partida!</p>
           </div>
        )}
      </section>
    </div>
  );
}