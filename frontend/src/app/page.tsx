'use client';

import Link from 'next/link';
import { ArrowRight, Calendar, Users, Trophy } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();

    // Se já estiver logado, redireciona automaticamente para o Dashboard
    useEffect(() => {
        if (!loading && isAuthenticated) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, loading, router]);

    // Enquanto verifica a sessão, retorna vazio para evitar "flash" de conteúdo errado
    if (loading) return null;

    return (
        <div className="flex flex-col min-h-[calc(100vh-64px)]">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-blue-600 to-indigo-800 text-white py-24 px-4 relative overflow-hidden">
                {/* Elementos decorativos de fundo */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400 opacity-10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between relative z-10">
                    <div className="md:w-1/2 mb-12 md:mb-0 text-center md:text-left">
                        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight">
                            A quadra é sua.<br/>
                            <span className="text-blue-200">A organização é nossa.</span>
                        </h1>
                        <p className="text-xl text-blue-100 mb-10 leading-relaxed max-w-lg mx-auto md:mx-0">
                            Gerencie partidas, convide amigos, controle o check-in e foque no que importa: o jogo.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                            <Link href="/cadastro" className="bg-white text-blue-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center">
                                Começar Agora <ArrowRight className="ml-2" size={20} />
                            </Link>
                            <Link href="/login" className="bg-blue-700/50 backdrop-blur-sm border border-blue-400/30 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all flex items-center justify-center">
                                Fazer Login
                            </Link>
                        </div>
                    </div>
                    
                    <div className="md:w-1/2 flex justify-center perspective-1000">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-teal-300 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                            <img 
                                src="https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=600&auto=format&fit=crop" 
                                alt="Vôlei na areia" 
                                className="relative rounded-2xl shadow-2xl transform md:rotate-3 transition-transform duration-500 hover:rotate-0 max-w-full md:max-w-md border-4 border-white/10"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-white">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Tudo que você precisa</h2>
                        <p className="text-gray-500 max-w-2xl mx-auto">Uma plataforma completa desenvolvida para jogadores e organizadores.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <FeatureCard 
                            icon={<Calendar size={32} />}
                            title="Gestão Simples"
                            desc="Crie partidas em segundos, defina locais, horários e limites de participantes."
                            color="bg-blue-50 text-blue-600"
                        />
                        <FeatureCard 
                            icon={<Users size={32} />}
                            title="Comunidade"
                            desc="Adicione amigos, veja onde eles estão jogando e receba convites exclusivos."
                            color="bg-green-50 text-green-600"
                        />
                        <FeatureCard 
                            icon={<Trophy size={32} />}
                            title="Profissional"
                            desc="Check-in via QR Code, controle de pagamentos via PIX e certificados automáticos."
                            color="bg-purple-50 text-purple-600"
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-10 border-t border-gray-800 mt-auto">
                <div className="max-w-6xl mx-auto px-4 text-center">
                    <p className="text-lg font-semibold text-white mb-2">EventSync / Galera do Vôlei</p>
                    <p className="text-sm opacity-60">&copy; 2025 - Projeto Acadêmico Integrado com IA</p>
                </div>
            </footer>
        </div>
    );
}

// Pequeno componente auxiliar para os cards
function FeatureCard({ icon, title, desc, color }: any) {
    return (
        <div className="p-8 bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-100/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${color}`}>
                {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
            <p className="text-gray-600 leading-relaxed">{desc}</p>
        </div>
    );
}