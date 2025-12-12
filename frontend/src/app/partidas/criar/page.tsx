'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { Input } from '@/components/ui/Input';
import { SelectInput } from '@/components/ui/SelectInput';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';

// Schema de Validação
const criarPartidaSchema = z.object({
    titulo: z.string().min(3, "O título é obrigatório"),
    descricao: z.string().optional(),
    tipo: z.string().min(1, "Selecione o tipo"),
    data: z.string().min(1, "A data é obrigatória"),
    hora: z.string().min(1, "A hora é obrigatória"),
    local: z.string().optional(),
    
    // Validação simplificada para compatibilidade com valueAsNumber
    preco: z.number().min(0, "Preço inválido"),
    pixChave: z.string().optional(),
    limiteCheckin: z.number().min(1, "Mínimo 1 check-in"),
    cargaHoraria: z.number().min(0, "Carga horária deve ser positiva"),
    
    bannerUrl: z.string().url("URL inválida").optional().or(z.literal(''))
});

type CriarPartidaData = z.infer<typeof criarPartidaSchema>;

export default function CriarPartidaPage() {
    const router = useRouter();
    const { isAuthenticated, loading } = useAuth();
    const [erroAPI, setErroAPI] = useState("");

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
            cargaHoraria: 0
        }
    });

    const precoAtual = watch('preco');

    async function onSubmit(data: CriarPartidaData) {
        try {
            // 1. Criar a data ISO
            const dataCombinada = new Date(`${data.data}T${data.hora}:00`);
            
            // 2. Separar os campos que NÃO devem ir para o backend (hora e data string)
            // Usamos desestruturação para retirar 'hora' e 'data' do objeto 'rest'
            const { hora, data: dataString, ...rest } = data;

            // 3. Montar o payload limpo
            const payload = {
                ...rest, // Envia titulo, tipo, preco, etc...
                data: dataCombinada.toISOString(), // Envia a data correta no formato ISO
                pixChave: data.preco > 0 ? data.pixChave : undefined 
            };

            await api.post('/partidas', payload);
            router.push('/dashboard');
        } catch (error) {
            console.error(error);
            setErroAPI("Erro ao criar partida. Verifique os dados.");
        }
    }

    if (loading) return <div>Carregando...</div>;

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/dashboard" className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Novo Evento</h1>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <Input label="Título do Evento" placeholder="Ex: Campeonato de Vôlei de Areia" {...register("titulo")} error={errors.titulo?.message} />
                        </div>
                        
                        <SelectInput 
                            label="Tipo de Jogo"
                            options={[
                                { label: "Amador", value: "Amador" },
                                { label: "Intermediário", value: "Intermediario" },
                                { label: "Avançado", value: "Avancado" },
                                { label: "Profissional", value: "Profissional" },
                                { label: "Federado", value: "Federado" }
                            ]}
                            {...register("tipo")}
                            error={errors.tipo?.message}
                        />

                        <Input label="Local" placeholder="Endereço ou Nome da Quadra" {...register("local")} error={errors.local?.message} />
                        
                        <Input label="Data" type="date" {...register("data")} error={errors.data?.message} />
                        <Input label="Horário" type="time" {...register("hora")} error={errors.hora?.message} />
                    </div>

                    <div className="md:col-span-2">
                        <Input label="Descrição (Opcional)" placeholder="Detalhes sobre o evento..." {...register("descricao")} />
                    </div>

                    <div className="border-t pt-4 mt-4">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Configurações Avançadas</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input 
                                label="Preço (R$)" 
                                type="number" 
                                step="0.01"
                                {...register("preco", { valueAsNumber: true })} 
                                error={errors.preco?.message} 
                            />

                            {precoAtual > 0 && (
                                <Input 
                                    label="Chave PIX (Para Recebimento)" 
                                    placeholder="CPF, Email ou Aleatória"
                                    {...register("pixChave")} 
                                    error={errors.pixChave?.message} 
                                />
                            )}

                            <Input 
                                label="Limite de Check-ins por Pessoa" 
                                type="number" 
                                {...register("limiteCheckin", { valueAsNumber: true })} 
                                error={errors.limiteCheckin?.message} 
                            />

                            <Input 
                                label="Carga Horária (Para Certificado)" 
                                type="number" 
                                placeholder="Horas"
                                {...register("cargaHoraria", { valueAsNumber: true })} 
                                error={errors.cargaHoraria?.message} 
                            />
                        </div>

                        <Input 
                            label="URL do Banner (Imagem)" 
                            placeholder="https://exemplo.com/imagem.jpg"
                            {...register("bannerUrl")} 
                            error={errors.bannerUrl?.message} 
                        />
                    </div>

                    {erroAPI && (
                        <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{erroAPI}</div>
                    )}

                    <div className="flex justify-end pt-4">
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 disabled:opacity-50"
                        >
                            <Save size={20} />
                            {isSubmitting ? "Salvando..." : "Criar Evento"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}