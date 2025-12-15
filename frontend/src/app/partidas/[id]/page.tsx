'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/services/api';
import { Partida, Inscricao, Avaliacao } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {Calendar, MapPin, DollarSign, Users, ArrowLeft, UserCheck, CheckCircle2, Clock, XCircle, AlertCircle, Share2, Heart, Trophy, Star, Award, UserPlus, Send} from 'lucide-react';
import { QRCodeCard } from '@/components/events/QRCodeCard';

type PartidaDetalhes = Omit<Partida, 'avaliacoes'> & {
    exigeAprovacao?: boolean;
    avaliacoes?: (Omit<Avaliacao, 'nome_jogador'> & { nome_jogador?: string })[];
};

export default function PartidaDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [partida, setPartida] = useState<PartidaDetalhes | null>(null);
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [nota, setNota] = useState(10);
  const [comentario, setComentario] = useState("");
  const [enviandoAvaliacao, setEnviandoAvaliacao] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviting, setInviting] = useState(false);

  const isModerador = user && partida?.moderador?.id === user.id;
  const minhaInscricao = inscricoes.find(i => i.jogador?.email === user?.email);
  const fizCheckIn = minhaInscricao && minhaInscricao.checkInCount > 0;
  const jaAvaliei = partida?.avaliacoes?.some(av => av.jogadorId === user?.id);
  const confirmedCount = inscricoes.filter((i) => i.status === 'confirmada' || i.status === 'aceita').length;
  
  const estouAptoSocial = isModerador || (minhaInscricao?.status === 'aceita' || minhaInscricao?.status === 'confirmada');

  useEffect(() => {
    if (id) fetchDados();
  }, [id]);

  async function fetchDados() {
    try {
      const resPartida = await api.get<PartidaDetalhes>(`/partidas/${id}`);
      setPartida(resPartida.data);
      const resInscricoes = await api.get<Inscricao[]>(`/partidas/${id}/inscricoes`);
      setInscricoes(resInscricoes.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast({ variant: "destructive", title: "Erro", description: "Partida não encontrada." });
        router.push('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleInscrever() {
    if (!user) return router.push('/login');
    setProcessing(true);
    try {
      const res = await api.post(`/partidas/${id}/inscricoes`, { nome_jogador: user.nome });
      const novaInscricao = res.data;

      if (partida && partida.preco === 0) {
          if (novaInscricao && novaInscricao.id) {
              await api.post(`/inscricoes/${novaInscricao.id}/pagamento`, { chavePix: "GRATUITO_AUTO" });
          }
          toast({ title: "Sucesso!", description: "Inscrição realizada e confirmada.", className: "bg-green-600 text-white" });
      } else {
          toast({ title: "Inscrição Solicitada", description: "Aguarde aprovação ou realize o pagamento." });
      }

      await fetchDados();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro ao inscrever", description: error.response?.data?.message || "Tente novamente." });
    } finally {
      setProcessing(false);
    }
  }

  async function handleSolicitarAmizade(emailDestino: string) {
    if (!confirm(`Enviar solicitação de amizade?`)) return;
    try {
        await api.post('/amigos/solicitar', { email: emailDestino });
        toast({ title: "Solicitação enviada!", description: `Pedido enviado para ${emailDestino}` });
    } catch (error: any) {
        toast({ variant: "destructive", title: "Erro", description: error.response?.data?.message || "Erro ao solicitar." });
    }
  }

  async function handleEnviarConvite(e: React.FormEvent) {
    e.preventDefault();
    if(!inviteName) return;
    setInviting(true);
    try {
        await api.post('/convites', { nome_destinatario: inviteName, id_partida: partida?.id });
        toast({ title: "Convite Enviado", description: `Convite enviado para ${inviteName}!` });
        setInviteName("");
    } catch (error: any) {
        toast({ variant: "destructive", title: "Erro", description: error.response?.data?.message || "Erro ao enviar convite." });
    } finally {
        setInviting(false);
    }
  }

  async function handleDownloadCertificado() {
    if (!fizCheckIn) {
        return toast({ variant: "destructive", title: "Atenção", description: "Você precisa ter feito Check-in para baixar o certificado." });
    }
    
    try {
        const response = await api.get(`/partidas/${id}/certificado`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `certificado_evento_${id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast({ title: "Download iniciado", description: "Seu certificado está sendo baixado." });
    } catch (error) {
        toast({ variant: "destructive", title: "Erro", description: "Não foi possível baixar o certificado." });
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
        toast({ title: "Obrigado!", description: "Sua avaliação foi registrada." });
        setComentario("");
        fetchDados();
    } catch (error: any) {
        toast({ variant: "destructive", title: "Erro", description: "Não foi possível enviar a avaliação." });
    } finally {
        setEnviandoAvaliacao(false);
    }
  }

  async function alterarStatusPartida(novoStatus: string) {
    if (!confirm(`Mudar status para ${novoStatus}?`)) return;
    try {
      await api.patch(`/partidas/${id}`, { situacao: novoStatus });
      toast({ title: "Status Atualizado", description: `Partida agora está ${novoStatus}` });
      fetchDados();
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: "Falha ao atualizar status." });
    }
  }

  async function handleAceitar(idInscricao: number) {
    try { 
        await api.post(`/inscricoes/${idInscricao}/aceitar`); 
        toast({ title: "Jogador Aceito", className: "bg-green-600 text-white" });
        fetchDados(); 
    } catch (e) { console.error(e); }
  }

  async function handleRecusar(idInscricao: number) {
    if (!confirm("Recusar?")) return;
    try { 
        await api.post(`/inscricoes/${idInscricao}/recusar`); 
        toast({ title: "Jogador Recusado", variant: "destructive" });
        fetchDados(); 
    } catch (e) { console.error(e); }
  }

  const formatPrice = (price: number) => price === 0 ? 'Gratuito' : `R$ ${price.toFixed(2)}`;
  
  const getInitial = (name?: string) => {
      if (!name) return "?";
      return name.charAt(0).toUpperCase();
  };

  const getSituacaoStyles = (situacao: string) => {
    switch (situacao) {
      case 'Aberta': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Fechada': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmada': case 'aceita': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'pendente': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'recusada': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const renderStatusCard = () => {
    if (!minhaInscricao || !partida) return null;

    const podePagar = (minhaInscricao.status === 'aceita') || 
                      (minhaInscricao.status === 'pendente' && partida.exigeAprovacao === false && partida.preco > 0);

    const pagamentoConfirmado = minhaInscricao.status === 'confirmada';
    const acessoLiberado = pagamentoConfirmado || (minhaInscricao.status === 'aceita' && partida.preco === 0);

    return (
      <div className="bg-white rounded-xl p-6 shadow-card border border-gray-100 w-full relative">
        <div className="text-center">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${acessoLiberado ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
             {getStatusIcon(minhaInscricao.status)}
          </div>
          <h3 className="font-bold text-lg text-gray-900 mb-1">
             Status: {minhaInscricao.status.toUpperCase()}
          </h3>
          
          <p className="text-sm text-gray-500 mb-6">
            {acessoLiberado ? 'Você está confirmado no jogo!' : 
             podePagar ? 'Falta pouco! Realize o pagamento.' : 
             'Aguardando aprovação do organizador.'}
          </p>

          {acessoLiberado ? (
             <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300">
                 <p className="text-xs font-bold text-gray-400 uppercase mb-2">Seu Ticket de Acesso</p>
                 <QRCodeCard inscricao={minhaInscricao} nomeEvento={partida.titulo} />
             </div>
          ) : podePagar && partida.pixChave ? (
             <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                <p className="text-blue-800 font-bold mb-3">Valor: {formatPrice(partida.preco)}</p>
                <Link href={`/partidas/${id}/pagamento`} className="w-full block py-3 rounded-lg text-white font-bold bg-green-600 hover:bg-green-700 text-center shadow-lg transition-all hover:-translate-y-1">
                  Pagar Agora com PIX
                </Link>
             </div>
          ) : null}
        </div>
      </div>
    );
  };

  if (loading || !partida) return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-blue-600 font-medium">Carregando partida...</div></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Hero Section */}
      <section className="relative h-[350px] md:h-[400px] w-full rounded-b-[2rem] md:rounded-3xl md:mx-auto md:max-w-7xl md:mt-4 overflow-hidden shadow-2xl mb-8 group">
        <div className="absolute inset-0 bg-gray-900">
          {partida.bannerUrl ? (
            <img src={partida.bannerUrl} alt={partida.titulo} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" onError={(e) => e.currentTarget.style.display = 'none'} />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-900 to-indigo-900 opacity-80" />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
          <Link href={isAuthenticated ? "/dashboard" : "/"} className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-auto mt-4 transition-colors w-fit px-3 py-1 rounded-full hover:bg-white/10 backdrop-blur-sm border border-white/10">
            <ArrowLeft className="w-4 h-4" /> <span>Voltar</span>
          </Link>
          
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md ${getSituacaoStyles(partida.situacao)}`}>{partida.situacao}</span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white border border-white/30 backdrop-blur-md">{partida.tipo}</span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-2 tracking-tight drop-shadow-lg">{partida.titulo}</h1>
          {partida.moderador && (
            <p className="text-white/80 font-medium flex items-center gap-2 text-sm md:text-base">
              <Trophy size={16} className="text-yellow-400" />
              Organizado por <span className="text-white border-b border-white/30 hover:border-white transition-colors">{partida.moderador.nome}</span>
            </p>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-3 gap-8 items-start">
        {/* ESQUERDA */}
        <div className="lg:col-span-2 space-y-6">
            {/* Info Cards Grid */}
            <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                    <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-500 font-bold uppercase">Data</p>
                    <p className="font-semibold text-gray-900">{new Date(partida.data).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-400">{new Date(partida.data).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                    <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-500 font-bold uppercase">Valor</p>
                    <p className={`font-semibold ${partida.preco === 0 ? 'text-green-600' : 'text-gray-900'}`}>{formatPrice(partida.preco)}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                    <Users className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-500 font-bold uppercase">Vagas</p>
                    <p className="font-semibold text-gray-900">{confirmedCount} Confirmados</p>
                </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Detalhes do Evento</h2>
                <p className="text-gray-600 leading-relaxed mb-6">{partida.descricao || 'O organizador não forneceu uma descrição detalhada.'}</p>
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-orange-500 mt-1" />
                    <div>
                        <h3 className="font-bold text-gray-900 text-sm">Localização</h3>
                        <p className="text-gray-600 text-sm">{partida.local}</p>
                    </div>
                </div>
            </div>

            {/* SEÇÃO DE AVALIAÇÕES */}
            {partida.situacao === 'Finalizada' && (
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Star className="fill-yellow-400 text-yellow-400"/> Avaliações</h2>
                    
                    {user && fizCheckIn && !jaAvaliei && !isModerador && (
                        <form onSubmit={handleEnviarAvaliacao} className="bg-yellow-50 p-5 rounded-xl mb-6">
                            <label className="block text-sm font-bold text-yellow-800 mb-2">Nota (0-10)</label>
                            <input type="number" min="0" max="10" value={nota} onChange={e => setNota(Number(e.target.value))} className="w-full p-2 rounded border border-yellow-200 mb-3"/>
                            <textarea value={comentario} onChange={e => setComentario(e.target.value)} className="w-full p-2 rounded border border-yellow-200 mb-3" placeholder="Comentário..."></textarea>
                            <button disabled={enviandoAvaliacao} className="bg-yellow-600 text-white px-4 py-2 rounded font-bold">{enviandoAvaliacao ? 'Enviando...' : 'Avaliar'}</button>
                        </form>
                    )}
                    
                    <div className="space-y-4">
                        {partida.avaliacoes?.map(av => (
                            <div key={av.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xs">
                                            {getInitial(av.nome_jogador || "A")}
                                        </div>
                                        <span className="font-semibold text-gray-900">
                                            {av.nome_jogador || "Participante"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-gray-200 shadow-sm">
                                        <Star size={12} className="text-yellow-500 fill-yellow-500" />
                                        <span className="text-xs font-bold text-gray-700">{av.nota}</span>
                                    </div>
                                </div>
                                <p className="text-gray-600 text-sm ml-10">"{av.comentario}"</p>
                            </div>
                        ))}
                        {(!partida.avaliacoes || partida.avaliacoes.length === 0) && <p className="text-gray-500 italic">Sem avaliações.</p>}
                    </div>
                </div>
            )}

            {/* LISTA DE PARTICIPANTES */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Participantes</h2>
                <div className="space-y-2">
                    {inscricoes.map(insc => (
                        <div key={insc.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600 text-xs">{getInitial(insc.jogador?.nome || '?')}</div>
                                <div>
                                    <p className="font-semibold text-sm text-gray-900">{insc.jogador?.nome}</p>
                                    {isModerador && <p className="text-xs text-gray-400">{insc.jogador?.email}</p>}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-1 bg-white border rounded text-[10px] uppercase font-bold text-gray-500">{insc.status}</span>
                                
                                {/* BOTÃO DE ADICIONAR AMIGO */}
                                {user?.email !== insc.jogador?.email && estouAptoSocial && (insc.status === 'aceita' || insc.status === 'confirmada') && (
                                     <button 
                                        onClick={() => handleSolicitarAmizade(insc.jogador?.email || "")} 
                                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                        title="Adicionar Amigo"
                                     >
                                        <UserPlus size={18}/>
                                     </button>
                                )}

                                {isModerador && insc.status === 'pendente' && (
                                    <>
                                        <button onClick={() => handleAceitar(insc.id)} className="text-green-600 hover:bg-green-50 p-1.5 rounded"><CheckCircle2 size={18}/></button>
                                        <button onClick={() => handleRecusar(insc.id)} className="text-red-600 hover:bg-red-50 p-1.5 rounded"><XCircle size={18}/></button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                    {inscricoes.length === 0 && <p className="text-center text-gray-400 py-4">Lista vazia.</p>}
                </div>
            </div>
        </div>

        {/* --- COLUNA DIREITA - AÇÕES --- */}
        <div className="space-y-6 lg:col-span-1 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto scrollbar-hide pb-4">
            
            {/* 1. STATUS DA INSCRIÇÃO / PAGAMENTO */}
            {!isModerador && !minhaInscricao && (
                 <div className="bg-white rounded-xl p-6 shadow-card border border-gray-100 text-center w-full">
                    <p className="text-3xl font-extrabold text-blue-900 mb-1">{formatPrice(partida.preco)}</p>
                    <p className="text-sm text-gray-500 mb-6 uppercase tracking-wide font-medium">Por Pessoa</p>
                    {partida.situacao === 'Aberta' ? (
                        <button onClick={handleInscrever} disabled={processing} className="w-full bg-orange-500 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-orange-600 hover:shadow-orange-200 transition-all hover:-translate-y-1">
                            {processing ? "Processando..." : "Garantir Vaga"}
                        </button>
                    ) : (
                        <button disabled className="w-full bg-gray-100 text-gray-400 font-bold py-4 rounded-xl cursor-not-allowed">Encerrado</button>
                    )}
                    
                    <div className="flex justify-center gap-4 mt-6 pt-6 border-t border-gray-100">
                        <button className="text-gray-400 hover:text-blue-600 transition-colors flex flex-col items-center text-xs gap-1">
                            <Share2 size={20} /> Compartilhar
                        </button>
                        <button className="text-gray-400 hover:text-red-500 transition-colors flex flex-col items-center text-xs gap-1">
                            <Heart size={20} /> Salvar
                        </button>
                    </div>
                 </div>
            )}

            {minhaInscricao && renderStatusCard()}

            {partida.situacao === 'Finalizada' && minhaInscricao && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-purple-100 text-center w-full">
                    {fizCheckIn ? (
                         <>
                            <Trophy className="w-10 h-10 text-purple-600 mx-auto mb-3" />
                            <h3 className="font-bold text-gray-900 mb-2">Evento Concluído!</h3>
                            <p className="text-sm text-gray-500 mb-4">Parabéns pela participação. Seu certificado já está disponível.</p>
                            <button 
                                onClick={handleDownloadCertificado}
                                className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 shadow-md transition-all hover:-translate-y-1"
                            >
                                <Award size={20} /> Baixar Certificado
                            </button>
                         </>
                    ) : (
                        <div className="text-sm text-gray-400">
                             <p>Evento finalizado.</p>
                             <p className="text-xs mt-1">(Certificado indisponível: Check-in não realizado)</p>
                        </div>
                    )}
                </div>
            )}

            {isModerador && (
                <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-blue-100 w-full animate-in fade-in slide-in-from-bottom-2">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><UserCheck className="text-blue-600"/> Painel Organizador</h3>
                    <div className="space-y-2">
                        <Link href={`/partidas/${id}/checkin`} className="block w-full py-2 bg-blue-50 text-blue-700 text-center rounded-lg font-bold hover:bg-blue-100">Scanner Check-in</Link>
                        <Link href={`/partidas/${id}/editar`} className="block w-full py-2 border text-gray-700 text-center rounded-lg font-bold hover:bg-gray-50">Editar</Link>
                        {partida.situacao === 'Aberta' ? 
                            <button onClick={() => alterarStatusPartida('Fechada')} className="w-full py-2 bg-amber-50 text-amber-700 rounded-lg font-bold hover:bg-amber-100">Fechar Inscrições</button> :
                            <button onClick={() => alterarStatusPartida('Aberta')} className="w-full py-2 bg-emerald-50 text-emerald-700 rounded-lg font-bold hover:bg-emerald-100">Reabrir</button>
                        }
                        {partida.situacao !== 'Finalizada' && <button onClick={() => alterarStatusPartida('Finalizada')} className="w-full py-2 bg-gray-900 text-white rounded-lg font-bold mt-2">Finalizar Evento</button>}
                        
                        {partida.situacao === 'Aberta' && (
                             <div className="mt-4 pt-4 border-t border-gray-200">
                                 <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Convidar Jogador</p>
                                 <form onSubmit={handleEnviarConvite} className="flex gap-2">
                                     <input 
                                         type="text" 
                                         placeholder="Nome exato" 
                                         className="flex-1 bg-gray-50 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" 
                                         value={inviteName} 
                                         onChange={e => setInviteName(e.target.value)} 
                                     />
                                     <button type="submit" disabled={inviting || !inviteName} className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50">
                                         <Send size={16}/>
                                     </button>
                                 </form>
                             </div>
                         )}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}