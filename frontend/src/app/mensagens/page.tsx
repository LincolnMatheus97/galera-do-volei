'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/Input';
import { SelectInput } from '@/components/ui/SelectInput';
import { MessageSquare, Users, Send } from 'lucide-react';

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
    
    const [amigos, setAmigos] = useState<Amigo[]>([]);
    const [mensagens, setMensagens] = useState<Mensagem[]>([]);
    const [amigosOptions, setAmigosOptions] = useState<{label: string, value: string}[]>([]);
    
    // Formulario simples local
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
            // 1. Buscar Amigos
            const resAmigos = await api.get('/amigos');
            setAmigos(resAmigos.data);

            // Processar lista para o Select (quem eu posso enviar mensagem?)
            // O amigo pode estar no campo 'solicitante' ou 'destinatario', dependendo de quem pediu
            const listaFormatada = resAmigos.data.map((a: any) => {
                const amigoReal = a.solicitante.id === user?.id ? a.destinatario : a.solicitante;
                return {
                    label: amigoReal.nome,
                    value: String(amigoReal.id)
                };
            });
            setAmigosOptions(listaFormatada);

            // 2. Buscar Mensagens
            const resMsgs = await api.get('/mensagens');
            setMensagens(resMsgs.data);

        } catch (error) {
            console.error("Erro ao carregar social", error);
        }
    }

    async function handleEnviarMensagem(e: React.FormEvent) {
        e.preventDefault();
        if (!msgDestinatario || !msgConteudo) return alert("Preencha todos os campos");

        setLoadingMsg(true);
        try {
            await api.post('/mensagens', {
                destinatarioId: Number(msgDestinatario),
                conteudo: msgConteudo
            });
            alert("Mensagem enviada!");
            setMsgConteudo("");
            fetchSocialData(); // Atualiza a lista
        } catch (error: any) {
            alert(error.response?.data?.message || "Erro ao enviar");
        } finally {
            setLoadingMsg(false);
        }
    }

    async function aceitarAmizade(idAmizade: number) {
        try {
            await api.post(`/amigos/${idAmizade}/aceitar`);
            fetchSocialData();
        } catch (error) {
            console.error(error);
        }
    }

    async function recusarAmizade(idAmizade: number) {
        try {
            await api.post(`/amigos/${idAmizade}/recusar`);
            fetchSocialData();
        } catch (error) {
            console.error(error);
        }
    }

    if (!isAuthenticated) return null;

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
                <Users className="mr-3" /> Social & Mensagens
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Coluna 1: Meus Amigos e Pedidos */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h2 className="text-lg font-bold mb-4 text-blue-700">Meus Amigos</h2>
                        {amigos.length === 0 ? (
                            <p className="text-gray-500 text-sm">Você ainda não tem amigos. Entre em uma partida para adicionar pessoas!</p>
                        ) : (
                            <ul className="space-y-3">
                                {amigos.map(amigo => {
                                    const amigoData = amigo.solicitante?.id === user?.id ? amigo.destinatario : amigo.solicitante;
                                    // Se status for pendente E eu fui o destinatário (quem recebeu o pedido), mostro botão aceitar
                                    const souDestinatarioDoPedido = amigo.destinatario?.id === user?.id;
                                    
                                    return (
                                        <li key={amigo.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <span className="font-medium text-gray-700">{amigoData?.nome}</span>
                                            
                                            {amigo.status === 'pendente' && souDestinatarioDoPedido ? (
                                                <button 
                                                    onClick={() => aceitarAmizade(amigo.id)}
                                                    className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                                                >
                                                    Aceitar
                                                </button>
                                            ) : (
                                                <span className={`text-xs px-2 py-1 rounded ${
                                                    amigo.status === 'aceita' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {amigo.status === 'aceita' ? 'Amigo' : 'Pendente'}
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
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h2 className="text-lg font-bold mb-4 flex items-center text-gray-900">
                            <Send size={20} className="mr-2" /> Enviar Mensagem Avulsa
                        </h2>
                        <form onSubmit={handleEnviarMensagem} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Para quem?</label>
                                <select 
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                                    value={msgDestinatario}
                                    onChange={e => setMsgDestinatario(e.target.value)}
                                >
                                    <option value="">Selecione um amigo...</option>
                                    {amigosOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <Input 
                                label="Mensagem" 
                                placeholder="Digite sua mensagem aqui..." 
                                value={msgConteudo}
                                onChange={e => setMsgConteudo(e.target.value)}
                            />

                            <div className="flex justify-end">
                                <button 
                                    type="submit" 
                                    disabled={loadingMsg || !msgDestinatario}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                >
                                    {loadingMsg ? "Enviando..." : "Enviar"}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Caixa de Entrada */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h2 className="text-lg font-bold mb-4 flex items-center text-gray-900">
                            <MessageSquare size={20} className="mr-2" /> Histórico de Mensagens
                        </h2>
                        
                        {mensagens.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">Nenhuma mensagem trocada ainda.</p>
                        ) : (
                            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                {mensagens.map((msg, idx) => (
                                    <div key={idx} className="p-4 border rounded-lg bg-gray-50">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold text-blue-800">{msg.remetente.nome}</span>
                                            <span className="text-xs text-gray-500">
                                                {new Date(msg.data).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-gray-700">{msg.conteudo}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}