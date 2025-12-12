'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Convite } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Mail, Check, X, Calendar, User } from 'lucide-react';

export default function ConvitesPage() {
    const { user, isAuthenticated } = useAuth();
    const [convites, setConvites] = useState<Convite[]>([]);
    const [loading, setLoading] = useState(true);
    const [mensagem, setMensagem] = useState<{texto: string, tipo: 'sucesso' | 'erro'} | null>(null);

    useEffect(() => {
        if (isAuthenticated) fetchConvites();
    }, [isAuthenticated]);

    async function fetchConvites() {
        try {
            const res = await api.get<Convite[]>('/convites');
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
        setMensagem(null);
        try {
            const endpoint = aceitar ? 'aceitar' : 'rejeitar'; // Backend usa 'rejeitar'
            await api.post(`/convites/${id}/${endpoint}`);
            
            setMensagem({
                texto: aceitar ? "Convite aceito! Você foi inscrito." : "Convite recusado.",
                tipo: 'sucesso'
            });
            
            fetchConvites(); // Recarrega a lista
        } catch (error) {
            setMensagem({
                texto: "Erro ao processar convite. Tente novamente.",
                tipo: 'erro'
            });
        }
    }

    if (!isAuthenticated) return null;

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
                <Mail className="mr-3 text-blue-600" /> Convites de Jogos
            </h1>

            {mensagem && (
                <div className={`p-4 mb-6 rounded-lg text-center ${mensagem.tipo === 'sucesso' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {mensagem.texto}
                </div>
            )}

            {loading ? (
                <div className="space-y-4">
                    {[1, 2].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse"></div>)}
                </div>
            ) : convites.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="text-gray-400" size={32} />
                    </div>
                    <p className="text-gray-500 font-medium">Sua caixa de entrada está vazia.</p>
                    <p className="text-gray-400 text-sm mt-1">Quando alguém te convidar para uma partida, aparecerá aqui.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {convites.map(convite => (
                        <div key={convite.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 transition-all hover:shadow-md">
                            <div className="flex items-start gap-4">
                                <div className="bg-blue-100 p-3 rounded-full hidden md:block">
                                    <Calendar className="text-blue-600" size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl text-gray-900">{convite.partida.titulo}</h3>
                                    <div className="flex items-center text-gray-600 mt-2 text-sm bg-gray-50 px-3 py-1 rounded-full w-fit">
                                        <User size={14} className="mr-2" />
                                        Convidado por: <span className="font-semibold ml-1 text-blue-600">{convite.remetente.nome}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex gap-3 w-full md:w-auto">
                                <button 
                                    onClick={() => responder(convite.id, true)}
                                    className="flex-1 md:flex-none flex items-center justify-center bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm hover:shadow"
                                >
                                    <Check size={18} className="mr-2" /> Aceitar
                                </button>
                                <button 
                                    onClick={() => responder(convite.id, false)}
                                    className="flex-1 md:flex-none flex items-center justify-center bg-white border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors font-medium"
                                >
                                    <X size={18} className="mr-2" /> Recusar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}