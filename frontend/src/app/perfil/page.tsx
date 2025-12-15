'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/services/api';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { User, Save, Mail, Award, UserCircle, VenusAndMars, AtSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const perfilSchema = z.object({
    nome: z.string().min(3, "Mínimo 3 caracteres"),
    sexo: z.string().optional(),
    categoria: z.string().optional()
});

type PerfilFormData = z.infer<typeof perfilSchema>;

export default function PerfilPage() {
    const { user, isAuthenticated } = useAuth();
    const { toast } = useToast();

    const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<PerfilFormData>({
        resolver: zodResolver(perfilSchema)
    });

    useEffect(() => {
        if (user) {
            setValue("nome", user.nome);
        }
    }, [user, setValue]);

    async function onSubmit(data: PerfilFormData) {
        if (!user) return;
        try {
            await api.patch(`/jogadores/${user.id}`, data);
            toast({ title: "Perfil Atualizado", description: "Seus dados foram salvos.", className: "bg-green-600 text-white" });
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Erro", description: "Não foi possível atualizar." });
        }
    }

    if (!isAuthenticated) return null;

    const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";
    const selectClass = "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all";

    return (
        <div className="max-w-2xl mx-auto mt-8 pb-12">
            
            {/* Header Profile */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-t-2xl p-8 text-white flex items-center gap-6 shadow-lg">
                 <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-bold border-4 border-white/10 shadow-xl">
                     {user?.nome.charAt(0).toUpperCase()}
                 </div>
                 <div>
                     <h1 className="text-2xl font-bold">{user?.nome}</h1>
                     <p className="text-blue-100 flex items-center gap-2 mt-1 text-sm bg-white/10 px-3 py-1 rounded-full w-fit">
                         <Mail size={14}/> {user?.email}
                     </p>
                 </div>
            </div>

            <div className="bg-white p-8 rounded-b-2xl shadow-sm border border-t-0 border-slate-200">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    
                    <div className="grid gap-6">
                        <div>
                            <label className={labelClass}><UserCircle className="inline w-4 h-4 mr-1 text-blue-600"/> Nome Completo</label>
                            <Input {...register("nome")} />
                            {errors.nome && <span className="text-xs text-red-500 mt-1">{errors.nome.message}</span>}
                        </div>

                        <div className="grid sm:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}><VenusAndMars className="inline w-4 h-4 mr-1 text-red-600"/>Sexo</label>
                                <select className={selectClass} {...register("sexo")}>
                                    <option value="">Não informado</option>
                                    <option value="Masculino">Masculino</option>
                                    <option value="Feminino">Feminino</option>
                                    <option value="Outro">Outro</option>
                                </select>
                            </div>

                            <div>
                                <label className={labelClass}><Award className="inline w-4 h-4 mr-1 text-orange-500"/> Categoria</label>
                                <select className={selectClass} {...register("categoria")}>
                                    <option value="">Não informado</option>
                                    <option value="Amador">Amador</option>
                                    <option value="Intermediario">Intermediário</option>
                                    <option value="Avancado">Avançado</option>
                                    <option value="Profissional">Profissional</option>
                                    <option value="Federado">Federado</option>
                                </select>
                            </div>
                        </div>

                        <div>
                             <label className={labelClass}><AtSign className="inline w-4 h-4 mr-1 text-green-500"/>Email (Somente Leitura)</label>
                             <div className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 cursor-not-allowed">
                                 {user?.email}
                             </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-100">
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="flex items-center bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md hover:shadow-blue-200"
                        >
                            {isSubmitting ? "Salvando..." : <><Save size={18} className="mr-2" /> Salvar Alterações</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}