'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Users, Send, UserCheck, UserX, Clock } from 'lucide-react';

interface Amigo {
    id: number;
    solicitante?: { id: number, nome: string };
    destinatario?: { id: number, nome: string };
    status: string;
}

interface Mensagem {
    id: number;
    conteudo: string;
    remetente: { nome: string };
    data: string;
}

export default function MensagensPage() {
    const { user, isAuthenticated } = useAuth();
    const { toast } = useToast();
    
    const [amigos, setAmigos] = useState<Amigo[]>([]);
    const [mensagens, setMensagens] = useState<Mensagem[]>([]);
    const [amigosOptions, setAmigosOptions] = useState<{label: string, value: string}[]>([]);
    
    const [msgDestinatario, setMsgDestinatario] = useState("");
    const [msgConteudo, setMsgConteudo] = useState("");
    const [loadingMsg, setLoadingMsg] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            fetchSocialData();
        }
    }, [isAuthenticated]);

    async function fetchSocialData() {
        try {
            const resAmigos = await api.get('/amigos');
            setAmigos(resAmigos.data);

            const listaFormatada = resAmigos.data
                .filter((a: any) => a.status === 'aceita')
                .map((a: any) => {
                    const amigoReal = a.solicitante.id === user?.id ? a.destinatario : a.solicitante;
                    return {
                        label: amigoReal.nome,
                        value: String(amigoReal.id)
                    };
                });
            setAmigosOptions(listaFormatada);

            const resMsgs = await api.get('/mensagens');
            setMensagens(resMsgs.data);
        } catch (error) {
            console.error("Erro social", error);
        }
    }

    async function handleEnviarMensagem(e: React.FormEvent) {
        e.preventDefault();
        if (!msgDestinatario || !msgConteudo) {
             toast({ variant: "destructive", title: "Erro", description: "Preencha o destinatário e a mensagem." });
             return;
        }

        setLoadingMsg(true);
        try {
            await api.post('/mensagens', {
                destinatarioId: Number(msgDestinatario),
                conteudo: msgConteudo
            });
            toast({ title: "Enviada", description: "Sua mensagem foi entregue." });
            setMsgConteudo("");
            fetchSocialData();
        } catch (error: any) {
            toast({ variant: "destructive", title: "Erro", description: error.response?.data?.message || "Falha ao enviar." });
        } finally {
            setLoadingMsg(false);
        }
    }

    async function responderAmizade(id: number, aceitar: boolean) {
        try {
            if (aceitar) {
                 await api.post(`/amigos/${id}/aceitar`);
                 toast({ title: "Amizade aceita!", className: "bg-green-600 text-white" });
            }
            fetchSocialData();
        } catch (error) {
            toast({ variant: "destructive", title: "Erro", description: "Falha ao processar solicitação." });
        }
    }

    if (!isAuthenticated) return null;

    const selectClass = "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all";

    return (
        <div className="max-w-6xl mx-auto pb-12">
            {/* Header */}
            <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-lg">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Users className="text-blue-200" /> Social Hub
                </h1>
                <p className="text-blue-100 mt-2">Gerencie seus amigos e troque mensagens.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Coluna 1: Amigos */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h2 className="text-lg font-bold mb-4 text-slate-800 border-b pb-2 flex items-center gap-2">
                             <Users size={18}/> Meus Amigos
                        </h2>
                        {amigos.length === 0 ? (
                            <div className="text-center py-6 text-slate-400 text-sm">
                                <p>Você ainda não tem conexões.</p>
                                <p className="text-xs mt-1">Participe de jogos para conhecer gente nova!</p>
                            </div>
                        ) : (
                            <ul className="space-y-3">
                                {amigos.map(amigo => {
                                    const amigoData = amigo.solicitante?.id === user?.id ? amigo.destinatario : amigo.solicitante;
                                    const souDestinatario = amigo.destinatario?.id === user?.id;
                                    
                                    return (
                                        <li key={amigo.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                 <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                                                     {amigoData?.nome.charAt(0).toUpperCase()}
                                                 </div>
                                                 <span className="font-semibold text-slate-700 text-sm">{amigoData?.nome}</span>
                                            </div>
                                            
                                            {amigo.status === 'pendente' && souDestinatario ? (
                                                <div className="flex gap-1">
                                                    <button onClick={() => responderAmizade(amigo.id, true)} className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200" title="Aceitar"><UserCheck size={16}/></button>
                                                </div>
                                            ) : (
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                                                    amigo.status === 'aceita' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {amigo.status === 'aceita' ? 'Amigo' : <Clock size={14}/>}
                                                </span>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Coluna 2 e 3: Mensagens */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Nova Mensagem */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h2 className="text-lg font-bold mb-4 flex items-center text-slate-800 gap-2 border-b pb-2">
                            <Send size={18} className="text-blue-600" /> Nova Mensagem
                        </h2>
                        <form onSubmit={handleEnviarMensagem} className="space-y-4">
                            <div className="grid sm:grid-cols-3 gap-4">
                                <div className="sm:col-span-1">
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Para quem?</label>
                                    <select 
                                        className={selectClass}
                                        value={msgDestinatario}
                                        onChange={e => setMsgDestinatario(e.target.value)}
                                    >
                                        <option value="">Selecione...</option>
                                        {amigosOptions.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Mensagem</label>
                                    <div className="flex gap-2">
                                        <Input 
                                            placeholder="Digite aqui..." 
                                            value={msgConteudo}
                                            onChange={e => setMsgConteudo(e.target.value)}
                                        />
                                        <button 
                                            type="submit" 
                                            disabled={loadingMsg || !msgDestinatario}
                                            className="bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center"
                                        >
                                            {loadingMsg ? "..." : <Send size={18}/>}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Histórico */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h2 className="text-lg font-bold mb-4 flex items-center text-slate-800 gap-2">
                            <MessageSquare size={18} className="text-purple-600" /> Histórico
                        </h2>
                        
                        {mensagens.length === 0 ? (
                            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                <p className="text-slate-500">Nenhuma mensagem trocada ainda.</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                                {mensagens.map((msg, idx) => {
                                    const souEu = msg.remetente.nome === user?.nome;
                                    return (
                                        <div key={idx} className={`flex flex-col p-4 rounded-xl border ${souEu ? 'bg-blue-50 border-blue-100 ml-8' : 'bg-white border-slate-100 mr-8'}`}>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className={`font-bold text-sm ${souEu ? 'text-blue-700' : 'text-slate-700'}`}>
                                                    {souEu ? 'Você' : msg.remetente.nome}
                                                </span>
                                                <span className="text-[10px] text-slate-400 uppercase tracking-wide">
                                                    {new Date(msg.data).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-slate-700 text-sm leading-relaxed">{msg.conteudo}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}