'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, Save, Calendar, Clock, MapPin, DollarSign, Image as ImageIcon, Users, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const DEFAULT_BANNER = "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&q=80&w=1200";

const criarPartidaSchema = z.object({
    titulo: z.string().min(3, "O título é obrigatório"),
    descricao: z.string().optional(),
    tipo: z.string().min(1, "Selecione o tipo"),
    data: z.string().min(1, "A data é obrigatória"),
    hora: z.string().min(1, "A hora é obrigatória"),
    local: z.string().optional(),
    preco: z.number().min(0, "Preço inválido"),
    pixChave: z.string().optional(),
    limiteCheckin: z.number().min(1, "Mínimo 1 check-in"),
    bannerUrl: z.string().url("URL inválida").optional().or(z.literal('')),
    exigeAprovacao: z.boolean().optional()
});

type CriarPartidaData = z.infer<typeof criarPartidaSchema>;

export default function CriarPartidaPage() {
    const router = useRouter();
    const { user, isAuthenticated, loading } = useAuth();
    const [erroAPI, setErroAPI] = useState("");
    const { toast } = useToast();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, loading, router]);

    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<CriarPartidaData>({
        resolver: zodResolver(criarPartidaSchema),
        defaultValues: {
            preco: 0,
            limiteCheckin: 1,
            exigeAprovacao: true
        }
    });

    const precoAtual = watch('preco');
    const checkAprovacao = watch('exigeAprovacao');

    function isValidImageUrl(url: string) {
        // Aceita extensões comuns de imagem OU links do Unsplash (que não têm extensão explícita às vezes)
        return /\.(jpeg|jpg|gif|png|webp)$/i.test(url) || url.includes('images.unsplash.com');
    }

    async function onSubmit(data: CriarPartidaData) {
        try {
            setErroAPI("");
            const dataCombinada = new Date(`${data.data}T${data.hora}:00`);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { hora, data: dataString, ...rest } = data;

            // --- LÓGICA DA IMAGEM PADRÃO ---
            let bannerFinal = data.bannerUrl;

            // 1. Se estiver vazio ou nulo -> Usa Padrão
            if (!bannerFinal || bannerFinal.trim() === "") {
                bannerFinal = DEFAULT_BANNER;
            } 
            else if (!isValidImageUrl(bannerFinal)) {
                bannerFinal = DEFAULT_BANNER;
            }

            const payload = {
                ...rest,
                bannerUrl: bannerFinal, // Envia a URL tratada
                data: dataCombinada.toISOString(),
                pixChave: data.preco > 0 ? data.pixChave : undefined 
            };

            // 1. Criar Partida
            const resPartida = await api.post('/partidas', payload);
            const novaPartida = resPartida.data;

            // 2. Auto-Inscrever o Dono
            if (user) {
                const resInscricao = await api.post(`/partidas/${novaPartida.id}/inscricoes`, { 
                    nome_jogador: user.nome 
                });
                const novaInscricao = resInscricao.data;

                // 3. Auto-Confirmar se Grátis
                if (data.preco === 0) {
                    if (novaInscricao && novaInscricao.id) {
                         await api.post(`/inscricoes/${novaInscricao.id}/pagamento`, { chavePix: "GRATUITO_AUTO" });
                    }
                } else {
                    // Se for pago, como sou dono, já me aceito
                     await api.post(`/inscricoes/${novaInscricao.id}/aceitar`);
                }
            }

            toast({ title: "Evento Criado!", description: "Partida criada com sucesso e imagem definida." });
            router.push('/dashboard');
        } catch (error) {
            console.error(error);
            setErroAPI("Erro ao criar partida. Verifique os dados.");
            toast({ variant: "destructive", title: "Erro", description: "Falha ao criar evento." });
        }
    }

    if (loading) return <div className="p-8 text-center text-blue-600">Carregando...</div>;

    const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";
    const inputErrorClass = "border-red-500 focus-visible:ring-red-500";

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
                    <Link href="/dashboard" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-xl font-bold text-slate-900">Novo Evento</h1>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 mt-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    
                    {/* CARD 1: Informações Principais */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Detalhes do Jogo</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className={labelClass}>Título do Evento</label>
                                <Input 
                                    placeholder="Ex: Vôlei de Areia - Copacabana" 
                                    className={errors.titulo ? inputErrorClass : ""}
                                    {...register("titulo")} 
                                />
                                {errors.titulo && <span className="text-xs text-red-500 mt-1">{errors.titulo.message}</span>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Tipo de Jogo</label>
                                    <select 
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        {...register("tipo")}
                                    >
                                        <option value="">Selecione...</option>
                                        <option value="Amador">Amador</option>
                                        <option value="Intermediario">Intermediário</option>
                                        <option value="Avancado">Avançado</option>
                                        <option value="Profissional">Profissional</option>
                                        <option value="Federado">Federado</option>
                                    </select>
                                    {errors.tipo && <span className="text-xs text-red-500 mt-1">{errors.tipo.message}</span>}
                                </div>
                                
                                <div>
                                    <label className={labelClass}>Local</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                        <Input 
                                            placeholder="Endereço ou quadra" 
                                            className={`pl-9 ${errors.local ? inputErrorClass : ""}`}
                                            {...register("local")} 
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Data</label>
                                    <div className="relative">
                                        <Input type="date" {...register("data")} className={errors.data ? inputErrorClass : ""} />
                                    </div>
                                    {errors.data && <span className="text-xs text-red-500 mt-1">{errors.data.message}</span>}
                                </div>
                                <div>
                                    <label className={labelClass}>Horário</label>
                                    <div className="relative">
                                        <Input type="time" {...register("hora")} className={errors.hora ? inputErrorClass : ""} />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Descrição (Opcional)</label>
                                <textarea 
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Regras, observações, o que levar..."
                                    {...register("descricao")}
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* CARD 2: Configurações e Banner */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Configurações & Banner</h2>
                        
                        <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-lg border border-slate-200 mb-6">
                            <div className="flex items-center h-5">
                                <input
                                    id="checkAprovacao"
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    {...register("exigeAprovacao")}
                                />
                            </div>
                            <div className="text-sm">
                                <label htmlFor="checkAprovacao" className="font-medium text-slate-900 cursor-pointer">
                                    Exigir aprovação manual?
                                </label>
                                <p className="text-slate-500">Se desmarcado, inscrições em jogos gratuitos entram direto.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {checkAprovacao && (
                                    <div>
                                    <label className={labelClass}>Preço por Pessoa (R$)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-green-600" />
                                        <Input 
                                            type="number" 
                                            step="0.01"
                                            placeholder="0.00"
                                            className={`pl-9 font-semibold ${errors.preco ? inputErrorClass : ""}`}
                                            {...register("preco", { valueAsNumber: true })} 
                                        />
                                    </div>
                                    {errors.preco && <span className="text-xs text-red-500 mt-1">{errors.preco.message}</span>}
                                </div>
                            )}

                            <div>
                                <label className={labelClass}>Limite de Check-ins</label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <Input 
                                        type="number"
                                        className="pl-9"
                                        {...register("limiteCheckin", { valueAsNumber: true })} 
                                    />
                                </div>
                            </div>
                        </div>

                        {precoAtual > 0 && (
                            <div className="mb-6 animate-in fade-in slide-in-from-top-2">
                                <label className={labelClass}>Chave PIX para Recebimento</label>
                                <Input 
                                    placeholder="CPF, Email, Telefone ou Aleatória"
                                    className={`bg-blue-50 border-blue-200 text-blue-800 placeholder:text-blue-300 ${errors.pixChave ? inputErrorClass : ""}`}
                                    {...register("pixChave")} 
                                />
                                {errors.pixChave && <span className="text-xs text-red-500 mt-1">{errors.pixChave.message}</span>}
                            </div>
                        )}

                        <div>
                            <label className={labelClass}>URL da Imagem de Capa</label>
                            <div className="relative">
                                <ImageIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <Input 
                                    placeholder="https://..."
                                    className="pl-9"
                                    {...register("bannerUrl")} 
                                />
                            </div>
                            <p className="text-xs text-slate-400 mt-1">Cole o link de uma imagem (Unsplash, Imgur, etc).</p>
                        </div>
                    </div>

                    {erroAPI && (
                        <div className="p-4 bg-red-50 text-red-700 text-sm rounded-lg flex items-center justify-center gap-2 border border-red-100">
                            <AlertCircle size={16} />
                            {erroAPI}
                        </div>
                    )}

                    <div className="flex justify-end pt-2">
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed w-full md:w-auto"
                        >
                            {isSubmitting ? (
                                "Salvando..."
                            ) : (
                                <>
                                    <Save size={18} /> Criar Evento
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}