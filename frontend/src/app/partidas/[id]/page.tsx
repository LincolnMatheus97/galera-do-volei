'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { Partida, Inscricao } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Calendar, MapPin, DollarSign, Clock, Users, CheckCircle, AlertCircle, ArrowLeft, UserPlus, Shield, Mail, Send, Edit, Award, Lock, Unlock, CheckSquare, Star, MessageCircle } from 'lucide-react';
import { QRCodeCard } from '@/components/events/QRCodeCard';
import Link from 'next/link';

export default function DetalhesPartidaPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    
    const [partida, setPartida] = useState<Partida | null>(null);
    const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    
    // Estados para Convite
    const [inviteName, setInviteName] = useState("");
    const [inviting, setInviting] = useState(false);

    // Estados para Avaliação
    const [nota, setNota] = useState(5);
    const [comentario, setComentario] = useState("");
    const [enviandoAvaliacao, setEnviandoAvaliacao] = useState(false);

    const isModerador = user && partida?.moderador?.id === user.id;
    const minhaInscricao = inscricoes.find(i => i.jogador?.email === user?.email);
    const estouAptoSocial = isModerador || (minhaInscricao?.status === 'aceita' || minhaInscricao?.status === 'confirmada');
    const fizCheckIn = minhaInscricao && minhaInscricao.checkInCount > 0;
    const jaAvaliei = partida?.avaliacoes?.some(av => av.jogadorId === user?.id);

    useEffect(() => {
        if (id) fetchDados();
    }, [id]);

    async function fetchDados() {
        try {
            const resPartida = await api.get<Partida>(`/partidas/${id}`);
            setPartida(resPartida.data);
            const resInscricoes = await api.get<Inscricao[]>(`/partidas/${id}/inscricoes`);
            setInscricoes(resInscricoes.data);
        } catch (error: any) {
            console.error("Erro ao carregar detalhes", error);
            if (error.response?.status === 404 || error.response?.status === 400) {
                alert("Partida não encontrada");
                router.push('/dashboard');
            }
        } finally {
            setLoading(false);
        }
    }

    // --- AÇÕES ---
    async function handleInscrever() {
        if (!user) return router.push('/login');
        setProcessing(true);
        try {
            await api.post(`/partidas/${id}/inscricoes`, { nome_jogador: user.nome });
            alert("Solicitação enviada com sucesso!");
            fetchDados();
        } catch (error: any) {
            alert(error.response?.data?.message || "Erro ao se inscrever");
        } finally {
            setProcessing(false);
        }
    }

    async function handleAceitar(idInscricao: number) {
        if (!confirm("Aceitar este jogador?")) return;
        try { await api.post(`/inscricoes/${idInscricao}/aceitar`); fetchDados(); } catch (error) { console.error(error); }
    }

    async function handleRecusar(idInscricao: number) {
        if (!confirm("Recusar este jogador?")) return;
        try { await api.post(`/inscricoes/${idInscricao}/recusar`); fetchDados(); } catch (error) { console.error(error); }
    }

    async function handleSolicitarAmizade(emailDestino: string) {
        if (!confirm(`Enviar solicitação de amizade?`)) return;
        try {
            await api.post('/amigos/solicitar', { email: emailDestino });
            alert("Solicitação enviada!");
        } catch (error: any) {
            alert(error.response?.data?.message || "Erro ao solicitar amizade.");
        }
    }

    async function handleEnviarConvite(e: React.FormEvent) {
        e.preventDefault();
        if(!inviteName) return;
        setInviting(true);
        try {
            await api.post('/convites', { nome_destinatario: inviteName, id_partida: partida?.id });
            alert(`Convite enviado para ${inviteName}!`);
            setInviteName("");
        } catch (error: any) {
            alert(error.response?.data?.message || "Erro ao enviar convite.");
        } finally {
            setInviting(false);
        }
    }

    async function alterarStatusPartida(novoStatus: string) {
        if (!confirm(`Tem certeza que deseja mudar o status para "${novoStatus}"?`)) return;
        try {
            await api.patch(`/partidas/${id}`, { situacao: novoStatus });
            fetchDados();
        } catch (error) {
            alert("Erro ao atualizar status.");
        }
    }

    async function handleDownloadCertificado() {
        if (!fizCheckIn) return alert("Você precisa ter feito Check-in para baixar o certificado.");
        
        try {
            const response = await api.get(`/partidas/${id}/certificado`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `certificado_evento_${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert("Erro ao baixar certificado.");
        }
    }

    async function handleEnviarAvaliacao(e: React.FormEvent) {
        e.preventDefault();
        if (!user) return;
        setEnviandoAvaliacao(true);
        try {
            await api.post(`/partidas/${id}/avaliacoes`, {
                nome_jogador: user.nome,
                nota: Number(nota),
                comentario: comentario
            });
            alert("Avaliação enviada com sucesso!");
            setComentario("");
            fetchDados();
        } catch (error: any) {
            alert(error.response?.data?.message || "Erro ao enviar avaliação.");
        } finally {
            setEnviandoAvaliacao(false);
        }
    }

    if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Carregando detalhes...</div>;
    if (!partida) return <div className="p-8 text-center text-red-500">Partida não encontrada.</div>;

    return (
         <div className="max-w-5xl mx-auto pb-12 animate-fadeIn">
            {/* Header */}
            <div className="relative h-80 w-full rounded-2xl overflow-hidden bg-gray-900 mb-8 shadow-2xl">
                <img src={partida.bannerUrl || "https://via.placeholder.com/800x300"} className="w-full h-full object-cover opacity-50" onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/800x300"; }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8 text-white w-full">
                    <Link href="/dashboard" className="text-gray-300 hover:text-white flex items-center mb-4 text-sm font-medium w-fit bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">
                        <ArrowLeft size={16} className="mr-1" /> Voltar
                    </Link>
                    <div className="flex justify-between items-end">
                        <div>
                            <span className={`bg-blue-600 text-xs px-3 py-1 rounded-full text-white font-bold uppercase tracking-wider mb-2 inline-block`}>{partida.tipo}</span>
                            <h1 className="text-4xl font-extrabold tracking-tight mb-2 drop-shadow-lg">{partida.titulo}</h1>
                            <div className="flex items-center text-gray-300 text-sm"><Users size={16} className="mr-1" /> Org: {partida.moderador?.nome}</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-xl border border-white/20 shadow-xl">
                            <span className="block text-xs text-gray-300 uppercase tracking-widest mb-1">Preço</span>
                            <span className="text-2xl font-bold text-green-400">{partida.preco === 0 ? "GRÁTIS" : `R$ ${partida.preco}`}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ESQUERDA: INFOS, LISTA E AVALIAÇÃO */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center"><AlertCircle className="mr-2 text-blue-600" /> Sobre</h2>
                        <p className="text-gray-600 mb-8">{partida.descricao || "Sem descrição."}</p>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="flex items-center p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <Calendar className="mr-4 text-blue-600" />
                                <div><span className="text-xs text-gray-500 uppercase font-semibold">Data</span><div className="font-bold text-gray-900">{new Date(partida.data).toLocaleDateString()}</div></div>
                            </div>
                            <div className="flex items-center p-4 bg-purple-50 rounded-xl border border-purple-100">
                                <Clock className="mr-4 text-purple-600" />
                                <div><span className="text-xs text-gray-500 uppercase font-semibold">Hora</span><div className="font-bold text-gray-900">{new Date(partida.data).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div></div>
                            </div>
                            <div className="flex items-center p-4 bg-orange-50 rounded-xl border border-orange-100 col-span-2">
                                <MapPin className="mr-4 text-orange-600" />
                                <div><span className="text-xs text-gray-500 uppercase font-semibold">Local</span><div className="font-bold text-gray-900">{partida.local}</div></div>
                            </div>
                        </div>
                    </div>

                    {/* SEÇÃO DE AVALIAÇÕES */}
                    {partida.situacao === 'Finalizada' && (
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 animate-slideUp">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                <Star className="mr-2 text-yellow-500" fill="currentColor" /> Avaliações
                            </h2>

                            {/* FORMULÁRIO: Só para quem fez check-in e não avaliou */}
                            {estouAptoSocial && !isModerador && !jaAvaliei && fizCheckIn ? (
                                <div className="mb-8 p-6 bg-yellow-50 rounded-xl border border-yellow-100">
                                    <h3 className="font-bold text-yellow-800 mb-4">O que achou do jogo?</h3>
                                    <form onSubmit={handleEnviarAvaliacao} className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-yellow-700">Nota (1-10): <span className="font-bold">{nota}</span></label>
                                            <input type="range" min="1" max="10" value={nota} onChange={e => setNota(Number(e.target.value))} className="w-full accent-yellow-600" />
                                        </div>
                                        <textarea className="w-full p-3 rounded-lg border border-yellow-200" rows={3} placeholder="Comentário..." value={comentario} onChange={e => setComentario(e.target.value)}></textarea>
                                        <button type="submit" disabled={enviandoAvaliacao} className="bg-yellow-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-yellow-700 transition-colors disabled:opacity-50">Enviar</button>
                                    </form>
                                </div>
                            ) : !fizCheckIn && !isModerador ? (
                                <p className="text-sm text-red-500 mb-4 bg-red-50 p-3 rounded-lg border border-red-100">
                                    Você precisa ter realizado o Check-in no dia do jogo para avaliar.
                                </p>
                            ) : null}

                            {/* Lista de Reviews */}
                            <div className="space-y-4">
                                {partida.avaliacoes?.length ? partida.avaliacoes.map((av) => (
                                    <div key={av.id} className="p-4 border-b last:border-0">
                                        <div className="flex justify-between"><span className="font-bold">{av.nome_jogador}</span><span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded flex items-center"><Star size={10} className="mr-1" fill="currentColor"/>{av.nota}</span></div>
                                        <p className="text-gray-600 text-sm italic">"{av.comentario}"</p>
                                    </div>
                                )) : <p className="text-gray-500 italic">Sem avaliações ainda.</p>}
                            </div>
                        </div>
                    )}

                    {/* Lista Participantes */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold mb-6 flex items-center"><Users className="mr-2 text-blue-600" /> Participantes</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 border bg-blue-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center font-bold text-blue-800">{partida.moderador?.nome.charAt(0)}</div>
                                    <div><p className="font-bold text-gray-900">{partida.moderador?.nome}</p><span className="text-xs font-bold text-blue-600 uppercase">Organizador</span></div>
                                </div>
                                {estouAptoSocial && user?.id !== partida.moderador?.id && (
                                    <button onClick={() => handleSolicitarAmizade(partida.moderador?.email || "")} disabled={!partida.moderador?.email} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"><UserPlus size={20}/></button>
                                )}
                            </div>
                            {inscricoes.map(ins => (
                                <div key={ins.id} className="flex justify-between items-center p-3 border rounded-xl hover:bg-gray-50">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${(ins.status === 'aceita' || ins.status === 'confirmada') ? 'bg-green-500' : 'bg-gray-400'}`}>{ins.jogador?.nome.charAt(0)}</div>
                                        <div>
                                            <p className="font-bold text-gray-800">{ins.jogador?.nome}</p>
                                            <span className="text-[10px] bg-gray-200 px-2 py-0.5 rounded-full font-bold uppercase">{ins.status}</span>
                                            {/* Indicador de Check-in na lista para o moderador ver */}
                                            {ins.checkInCount > 0 && <span className="ml-2 text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-bold">✔ Presente</span>}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {user?.email !== ins.jogador?.email && estouAptoSocial && (ins.status === 'aceita' || ins.status === 'confirmada') && (
                                            <button onClick={() => handleSolicitarAmizade(ins.jogador?.email || "")} className="p-2 text-gray-400 hover:text-blue-600 rounded-full"><UserPlus size={20}/></button>
                                        )}
                                        {isModerador && ins.status === 'pendente' && (
                                            <><button onClick={() => handleAceitar(ins.id)} className="p-2 text-green-600 hover:bg-green-100 rounded-full"><CheckCircle/></button><button onClick={() => handleRecusar(ins.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-full"><AlertCircle/></button></>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* DIREITA: PAINEL DE AÇÃO */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 sticky top-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4">Gerenciamento</h3>
                        
                        {isModerador ? (
                            <div className="space-y-4">
                                <div className="p-3 bg-blue-50 text-blue-800 rounded-lg text-sm border border-blue-100">Você é o Organizador.</div>
                                
                                <Link href={`/partidas/${id}/checkin`} className="block w-full text-center bg-gray-900 text-white py-3 rounded-lg font-bold hover:bg-gray-800 shadow-md">Scanner Check-in</Link>
                                
                                {/* BOTÃO EDITAR */}
                                <Link href={`/partidas/${id}/editar`} className="block w-full text-center border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-50 flex items-center justify-center gap-2">
                                    <Edit size={18} /> Editar Partida
                                </Link>

                                <div className="grid grid-cols-2 gap-2 pt-2">
                                    {partida.situacao === 'Aberta' && <button onClick={() => alterarStatusPartida("Fechada")} className="bg-yellow-100 text-yellow-800 py-2 rounded-lg font-bold text-xs flex flex-col items-center"><Lock size={14} className="mb-1"/> Fechar Inscrição</button>}
                                    {partida.situacao === 'Fechada' && <button onClick={() => alterarStatusPartida("Aberta")} className="bg-green-100 text-green-800 py-2 rounded-lg font-bold text-xs flex flex-col items-center"><Unlock size={14} className="mb-1"/> Reabrir</button>}
                                    {partida.situacao !== 'Finalizada' && <button onClick={() => alterarStatusPartida("Finalizada")} className="col-span-2 bg-gray-800 text-white py-2 rounded-lg font-bold text-xs flex flex-col items-center"><CheckSquare size={14} className="mb-1"/> Finalizar Evento</button>}
                                </div>

                                {partida.situacao === 'Aberta' ? (
                                    <div className="mt-4 pt-4 border-t">
                                        <form onSubmit={handleEnviarConvite} className="flex gap-2">
                                            <input type="text" placeholder="Convidar (nome)" className="flex-1 bg-gray-50 border rounded px-2 text-sm" value={inviteName} onChange={e => setInviteName(e.target.value)} />
                                            <button type="submit" disabled={inviting || !inviteName} className="bg-blue-600 text-white p-2 rounded"><Send size={16}/></button>
                                        </form>
                                    </div>
                                ) : <div className="mt-4 text-center text-xs text-gray-400">Convites desabilitados.</div>}
                            </div>
                        ) : minhaInscricao ? (
                            <div className="space-y-6">
                                <div className={`p-4 rounded-lg text-center border-2 ${minhaInscricao.status === 'aceita' || minhaInscricao.status === 'confirmada' ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
                                    <p className="text-xs uppercase font-bold text-gray-500">Status</p>
                                    <p className="text-xl font-black text-gray-800">{minhaInscricao.status.toUpperCase()}</p>
                                    
                                    {fizCheckIn && <p className="text-xs font-bold text-green-600 mt-1 bg-green-100 inline-block px-2 rounded">✔ Check-in Realizado</p>}
                                </div>

                                {(minhaInscricao.status === 'aceita' || minhaInscricao.status === 'confirmada') && (
                                    <>
                                        <div className="transform scale-90 origin-top"><QRCodeCard inscricao={minhaInscricao} nomeEvento={partida.titulo} /></div>
                                        {partida.situacao === 'Finalizada' && (
                                            fizCheckIn ? (
                                                <button onClick={handleDownloadCertificado} className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 shadow-md flex items-center justify-center gap-2">
                                                    <Award size={20} /> Baixar Certificado
                                                </button>
                                            ) : (
                                                <div className="text-xs text-center text-red-500 bg-red-50 p-2 rounded border border-red-100">
                                                    Certificado indisponível (Faltou Check-in).
                                                </div>
                                            )
                                        )}
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="text-center">
                                {partida.situacao === 'Aberta' ? (
                                    <button onClick={handleInscrever} disabled={processing} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold shadow-lg hover:bg-blue-700 transition-all hover:-translate-y-1">Quero Participar</button>
                                ) : <button disabled className="w-full bg-gray-300 text-gray-500 py-3 rounded-lg font-bold cursor-not-allowed">Encerrado</button>}
                            </div>
                        )}
                        
                        {partida.pixChave && <div className="mt-6 pt-4 border-t border-dashed"><p className="text-xs text-gray-500 mb-1">Chave PIX:</p><div className="bg-gray-100 p-2 rounded text-xs font-mono text-center select-all">{partida.pixChave}</div></div>}
                    </div>
                </div>
            </div>
        </div>
    );
}