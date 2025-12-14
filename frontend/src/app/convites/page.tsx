'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Convite } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Mail, Check, X, Calendar, User, Clock, Inbox } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ConvitesPage() {
    const { user, isAuthenticated } = useAuth();
    const { toast } = useToast();
    const [convites, setConvites] = useState<Convite[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isAuthenticated) fetchConvites();
    }, [isAuthenticated]);

    async function fetchConvites() {
        try {
            const res = await api.get<Convite[]>('/convites');
            // Filtra convites pendentes onde sou o destinatário
            const pendentesRecebidos = res.data.filter(c => 
                c.status === 'pendente' && c.destinatario.id === user?.id
            );
            setConvites(pendentesRecebidos);
        } catch (error) {
            console.error("Erro ao buscar convites", error);
        } finally {
            setLoading(false);
        }
    }

    async function responder(id: number, aceitar: boolean) {
        try {
            const endpoint = aceitar ? 'aceitar' : 'rejeitar';
            await api.post(`/convites/${id}/${endpoint}`);
            
            toast({ 
                title: aceitar ? "Convite Aceito!" : "Convite Recusado",
                description: aceitar ? "Você foi inscrito na partida." : "O convite foi removido.",
                className: aceitar ? "bg-green-600 text-white" : ""
            });
            
            fetchConvites(); // Recarrega a lista
        } catch (error) {
            toast({ variant: "destructive", title: "Erro", description: "Não foi possível responder ao convite." });
        }
    }

    if (!isAuthenticated) return null;

    return (
        <div className="max-w-5xl mx-auto pb-12">
            
            {/* Header */}
            <div className="mb-10 p-8 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-800 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-extrabold flex items-center gap-3 mb-2">
                        <Mail className="text-blue-200" size={32} /> 
                        Caixa de Convites
                    </h1>
                    <p className="text-blue-100 text-lg opacity-90">
                        Veja quem chamou você para jogar.
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="grid gap-4">
                    {[1, 2].map(i => <div key={i} className="h-32 bg-slate-200 rounded-2xl animate-pulse"></div>)}
                </div>
            ) : convites.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                        <Inbox className="text-slate-300 w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Tudo limpo por aqui!</h3>
                    <p className="text-slate-500 max-w-sm">
                        Você não tem convites pendentes no momento. Quando alguém te chamar, aparecerá aqui.
                    </p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {convites.map(convite => (
                        <div key={convite.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 transition-all hover:shadow-md hover:border-blue-100 group">
                            
                            <div className="flex items-start gap-5 w-full">
                                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                    <Calendar size={28} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-xl text-slate-900 mb-1">{convite.partida.titulo}</h3>
                                    <div className="flex flex-wrap items-center gap-3 mt-2">
                                        <div className="flex items-center text-slate-500 text-sm bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
                                            <User size={14} className="mr-2 text-slate-400" />
                                            Convidado por: <span className="font-semibold ml-1 text-slate-700">{convite.remetente.nome}</span>
                                        </div>
                                        <div className="flex items-center text-amber-600 text-sm font-medium bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                                            <Clock size={14} className="mr-1.5" />
                                            Pendente
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                                <button 
                                    onClick={() => responder(convite.id, false)}
                                    className="flex-1 md:flex-none flex items-center justify-center px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 hover:text-red-600 hover:border-red-100 transition-all"
                                >
                                    <X size={20} className="mr-2" /> Recusar
                                </button>
                                <button 
                                    onClick={() => responder(convite.id, true)}
                                    className="flex-1 md:flex-none flex items-center justify-center bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-200 hover:shadow-green-300 transition-all hover:-translate-y-0.5"
                                >
                                    <Check size={20} className="mr-2" /> Aceitar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}