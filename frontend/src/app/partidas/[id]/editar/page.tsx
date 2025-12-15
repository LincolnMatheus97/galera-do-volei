'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Save, ArrowLeft, Calendar, MapPin, DollarSign, Users, Type, List, Info, AlertCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { Partida } from '@/types';
import { useToast } from '@/hooks/use-toast';

// Schema de Validação
const editarSchema = z.object({
    titulo: z.string().min(3, "O título é obrigatório"),
    descricao: z.string().optional(),
    situacao: z.string(),
    data: z.string().min(1, "Data obrigatória"),
    hora: z.string().min(1, "Hora obrigatória"),
    local: z.string().optional(),
    preco: z.number().min(0, "Preço inválido"),
    limiteCheckin: z.number().min(1, "Mínimo 1 check-in")
});

type EditarFormData = z.infer<typeof editarSchema>;

export default function EditarPartidaPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [erroAPI, setErroAPI] = useState("");
    const [partida, setPartida] = useState<Partida | null>(null);

    const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<EditarFormData>({
        resolver: zodResolver(editarSchema)
    });

    useEffect(() => {
        api.get(`/partidas/${id}`).then(res => {
            const p = res.data;
            if (user?.id !== p.moderador?.id) {
                toast({ variant: "destructive", title: "Acesso Negado", description: "Você não é o dono deste evento." });
                router.push('/dashboard');
                return;
            }
            setPartida(p);
            setValue("titulo", p.titulo);
            setValue("descricao", p.descricao || "");
            setValue("situacao", p.situacao);
            setValue("local", p.local || "");
            setValue("preco", p.preco);
            setValue("limiteCheckin", p.limiteCheckin);
            
            const dateObj = new Date(p.data);
            const dateISO = dateObj.toISOString().split('T')[0];
            const timeISO = dateObj.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
            setValue("data", dateISO);
            setValue("hora", timeISO);
            setLoading(false);
        }).catch((err) => {
            toast({ variant: "destructive", title: "Erro", description: "Falha ao carregar dados." });
            router.push('/dashboard');
        });
    }, [id, user, router, setValue, toast]);

    async function onSubmit(data: EditarFormData) {
        try {
            const dataCombinada = new Date(`${data.data}T${data.hora}:00`);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { hora, data: dataString, ...rest } = data;
            const precoFinal = (partida && partida.preco > 0) ? data.preco : 0;

            const payload = {
                ...rest,
                preco: precoFinal,
                data: dataCombinada.toISOString(),
            };

            await api.patch(`/partidas/${id}`, payload);
            toast({ title: "Sucesso!", description: "Partida atualizada." });
            router.push(`/partidas/${id}`);
        } catch (error) {
            toast({ variant: "destructive", title: "Erro", description: "Não foi possível salvar." });
        }
    }

    if (loading || !partida) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="animate-pulse flex flex-col items-center">
                <div className="h-8 w-8 bg-blue-200 rounded-full mb-4"></div>
                <div className="h-4 w-32 bg-slate-200 rounded"></div>
            </div>
        </div>
    );

    const labelClass = "block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5";
    const baseInputClass = "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all";
    const errorInputClass = "border-red-500 focus:ring-red-200";

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
                <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={`/partidas/${id}`} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-800">
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="text-xl font-bold text-slate-900">Editar Evento</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 mt-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    
                    {/* CARD 1: Informações Básicas */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <Info size={18} className="text-blue-600" /> Informações Gerais
                        </h2>
                        
                        <div className="space-y-5">
                            <div>
                                <label className={labelClass}><Type size={14} /> Título</label>
                                <input 
                                    className={`${baseInputClass} ${errors.titulo ? errorInputClass : ""}`}
                                    {...register("titulo")} 
                                />
                                {errors.titulo && <span className="text-xs text-red-500 mt-1">{errors.titulo.message}</span>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className={labelClass}><List size={14} /> Situação</label>
                                    <select className={baseInputClass} {...register("situacao")}>
                                        <option value="Aberta">Aberta (Inscrições On)</option>
                                        <option value="Fechada">Fechada (Inscrições Off)</option>
                                        <option value="Finalizada">Finalizada (Encerrado)</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className={labelClass}><MapPin size={14} /> Local</label>
                                    <input 
                                        className={baseInputClass} 
                                        {...register("local")} 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className={labelClass}><Calendar size={14} /> Data</label>
                                    <input 
                                        type="date" 
                                        className={`${baseInputClass} ${errors.data ? errorInputClass : ""}`}
                                        {...register("data")} 
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}><Clock size={14} /> Horário</label>
                                    <input 
                                        type="time" 
                                        className={`${baseInputClass} ${errors.hora ? errorInputClass : ""}`}
                                        {...register("hora")} 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CARD 2: Regras e Valores */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <DollarSign size={18} className="text-green-600" /> Regras & Valores
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
                            
                            {/* CAMPO DE PREÇO CONDICIONAL: SÓ APARECE SE A PARTIDA JÁ FOR PAGA */}
                            {partida && partida.preco > 0 && (
                                <div>
                                    <label className={labelClass}>Preço (R$)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-slate-400 text-sm">R$</span>
                                        <input 
                                            type="number" 
                                            step="0.01" 
                                            className={`${baseInputClass} pl-9 font-semibold ${errors.preco ? errorInputClass : ""}`}
                                            {...register("preco", {valueAsNumber: true})} 
                                        />
                                    </div>
                                    {errors.preco && <span className="text-xs text-red-500 mt-1">{errors.preco.message}</span>}
                                </div>
                            )}

                            <div>
                                <label className={labelClass}><Users size={14} /> Limite de Check-ins</label>
                                <input 
                                    type="number" 
                                    className={baseInputClass}
                                    {...register("limiteCheckin", {valueAsNumber: true})} 
                                />
                                <p className="text-xs text-slate-400 mt-1">Quantas vezes o participante pode entrar.</p>
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Descrição / Observações</label>
                            <textarea 
                                className={`${baseInputClass} min-h-[100px] resize-y`}
                                placeholder="Regras, observações..."
                                {...register("descricao")}
                            ></textarea>
                        </div>
                    </div>

                    {erroAPI && (
                        <div className="p-4 bg-red-50 text-red-700 text-sm rounded-lg flex items-center justify-center gap-2 border border-red-100 animate-in fade-in">
                            <AlertCircle size={16} />
                            {erroAPI}
                        </div>
                    )}

                    <div className="flex justify-end pt-2 pb-8">
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed w-full md:w-auto justify-center"
                        >
                            {isSubmitting ? "Salvando..." : (
                                <>
                                    <Save size={18} /> Salvar Alterações
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}