'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/services/api';
import { Input } from '@/components/ui/Input';
import { SelectInput } from '@/components/ui/SelectInput';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { User, Save } from 'lucide-react';

const perfilSchema = z.object({
    nome: z.string().min(3, "Mínimo 3 caracteres"),
    sexo: z.string().optional(),
    categoria: z.string().optional()
});

type PerfilFormData = z.infer<typeof perfilSchema>;

export default function PerfilPage() {
    const { user, isAuthenticated } = useAuth();
    const [msg, setMsg] = useState("");

    const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<PerfilFormData>({
        resolver: zodResolver(perfilSchema)
    });

    useEffect(() => {
        if (user) {
            // Preenche o formulário com os dados atuais (que estão no cookie/contexto)
            // Obs: Idealmente buscaríamos um GET /me atualizado do backend, mas usaremos o que temos.
            setValue("nome", user.nome);
            // Sexo e categoria não vem no loginResponse "Usuario" padrão do frontend types atual.
            // Se eles não aparecerem, é porque o tipo Usuario precisa ser atualizado ou buscado novamente.
        }
    }, [user, setValue]);

    async function onSubmit(data: PerfilFormData) {
        if (!user) return;
        setMsg("");
        try {
            await api.patch(`/jogadores/${user.id}`, data);
            setMsg("Perfil atualizado com sucesso!");
            // Aqui poderíamos atualizar o contexto, mas exigiria um reload ou refetch
        } catch (error) {
            console.error(error);
            setMsg("Erro ao atualizar.");
        }
    }

    if (!isAuthenticated) return null;

    return (
        <div className="max-w-xl mx-auto mt-10">
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <User className="mr-3 text-blue-600" /> Editar Perfil
                </h1>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input 
                        label="Nome Completo" 
                        {...register("nome")} 
                        error={errors.nome?.message} 
                    />

                    <SelectInput 
                        label="Sexo"
                        options={[
                            { label: "Masculino", value: "Masculino" },
                            { label: "Feminino", value: "Feminino" },
                            { label: "Outro", value: "Outro" }
                        ]}
                        {...register("sexo")}
                    />

                    <SelectInput 
                        label="Categoria"
                        options={[
                            { label: "Amador", value: "Amador" },
                            { label: "Intermediário", value: "Intermediario" },
                            { label: "Avançado", value: "Avancado" },
                            { label: "Profissional", value: "Profissional" },
                            { label: "Federado", value: "Federado" }
                        ]}
                        {...register("categoria")}
                    />

                    <div className="pt-2">
                        <label className="block text-sm font-medium text-gray-500 mb-1">Email (Não editável)</label>
                        <div className="px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-600">
                            {user?.email}
                        </div>
                    </div>

                    {msg && (
                        <div className={`p-3 rounded text-center ${msg.includes("sucesso") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                            {msg}
                        </div>
                    )}

                    <div className="flex justify-end pt-4">
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="flex items-center bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            <Save size={18} className="mr-2" /> Salvar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}