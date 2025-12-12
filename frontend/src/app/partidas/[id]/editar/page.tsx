'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/services/api';
import { Input } from '@/components/ui/Input';
import { SelectInput } from '@/components/ui/SelectInput';
import { useAuth } from '@/context/AuthContext';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Reaproveitando estrutura similar ao criar
const editarSchema = z.object({
    titulo: z.string().min(3),
    descricao: z.string().optional(),
    situacao: z.string(),
    data: z.string(),
    hora: z.string(),
    local: z.string().optional(),
    preco: z.number(),
    limiteCheckin: z.number().min(1)
});

type EditarFormData = z.infer<typeof editarSchema>;

export default function EditarPartidaPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);

    const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<EditarFormData>({
        resolver: zodResolver(editarSchema)
    });

    useEffect(() => {
        api.get(`/partidas/${id}`).then(res => {
            const p = res.data;
            // Validação de segurança: Só o dono edita
            if (user?.id !== p.moderador?.id) {
                alert("Você não tem permissão.");
                router.push('/dashboard');
                return;
            }

            // Preencher form
            setValue("titulo", p.titulo);
            setValue("descricao", p.descricao || "");
            setValue("situacao", p.situacao);
            setValue("local", p.local || "");
            setValue("preco", p.preco);
            setValue("limiteCheckin", p.limiteCheckin);
            
            // Tratamento de Data/Hora para inputs
            const dateObj = new Date(p.data);
            setValue("data", dateObj.toISOString().split('T')[0]);
            setValue("hora", dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
            
            setLoading(false);
        }).catch(() => {
            alert("Erro ao carregar");
            router.push('/dashboard');
        });
    }, [id, user, router, setValue]);

    async function onSubmit(data: EditarFormData) {
        try {
            const dataCombinada = new Date(`${data.data}T${data.hora}:00`);
            
            const payload = {
                ...data,
                data: dataCombinada.toISOString(), // Substitui data+hora
            };
            // Remove hora do objeto final antes de enviar (igual fizemos no criar)
            const { hora, ...finalPayload } = payload as any;

            await api.patch(`/partidas/${id}`, finalPayload);
            alert("Partida atualizada!");
            router.push(`/partidas/${id}`);
        } catch (error) {
            alert("Erro ao atualizar.");
        }
    }

    if (loading) return <div>Carregando...</div>;

    return (
        <div className="max-w-2xl mx-auto pb-10">
            <div className="flex items-center gap-4 mb-6">
                <Link href={`/partidas/${id}`} className="p-2 hover:bg-gray-200 rounded-full">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-2xl font-bold">Editar Evento</h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-xl shadow border space-y-4">
                <Input label="Título" {...register("titulo")} error={errors.titulo?.message} />
                
                <SelectInput 
                    label="Situação"
                    options={[
                        { label: "Aberta (Inscrições On)", value: "Aberta" },
                        { label: "Fechada (Inscrições Off)", value: "Fechada" },
                        { label: "Finalizada", value: "Finalizada" }
                    ]}
                    {...register("situacao")}
                />

                <div className="grid grid-cols-2 gap-4">
                    <Input label="Data" type="date" {...register("data")} />
                    <Input label="Horário" type="time" {...register("hora")} />
                </div>

                <Input label="Local" {...register("local")} />
                
                <div className="grid grid-cols-2 gap-4">
                    <Input label="Preço" type="number" step="0.01" {...register("preco", {valueAsNumber: true})} />
                    <Input label="Limite Check-in" type="number" {...register("limiteCheckin", {valueAsNumber: true})} />
                </div>

                <Input label="Descrição" {...register("descricao")} />

                <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700">
                    Salvar Alterações
                </button>
            </form>
        </div>
    );
}