'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { useState } from 'react';
import { UserPlus } from 'lucide-react';

// Schema de Validação
const cadastroSchema = z.object({
    nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
    email: z.string().email("Email inválido"),
    senha: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
    sexo: z.string().min(1, "Selecione o sexo"),
    categoria: z.string().min(1, "Selecione a categoria"),
});

type CadastroFormData = z.infer<typeof cadastroSchema>;

export default function CadastroPage() {
    const { register: registerUser } = useAuth(); // Renomeei para não conflitar com o register do hook-form
    const [erroAPI, setErroAPI] = useState("");
    
    const { 
        register, 
        handleSubmit, 
        formState: { errors, isSubmitting } 
    } = useForm<CadastroFormData>({
        resolver: zodResolver(cadastroSchema)
    });

    async function handleCadastro(data: CadastroFormData) {
        setErroAPI("");
        try {
            await registerUser(data);
            // Redireciona via AuthContext após cadastro e login automático
        } catch (err: any) {
            // Tratamento de erros do backend (ex: email duplicado)
            if (err.response?.status === 409) {
                setErroAPI("Este email já está cadastrado.");
            } else {
                setErroAPI("Ocorreu um erro ao criar a conta. Tente novamente.");
            }
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200">
                <div className="text-center mb-6">
                    <div className="bg-green-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UserPlus className="text-white" size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Crie sua conta</h1>
                    <p className="text-gray-500 text-sm">Junte-se à Galera do Vôlei!</p>
                </div>

                <form onSubmit={handleSubmit(handleCadastro)} className="space-y-4">
                    <Input 
                        label="Nome Completo" 
                        placeholder="Seu nome"
                        {...register("nome")}
                        error={errors.nome?.message}
                    />

                    <Input 
                        label="Email" 
                        type="email"
                        placeholder="exemplo@email.com"
                        {...register("email")}
                        error={errors.email?.message}
                    />

                    <Input 
                        label="Senha" 
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        {...register("senha")}
                        error={errors.senha?.message}
                    />

                    {/* Selects Manuais com Tailwind (Para simplificar sem libs extras de UI por enquanto) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
                        <select 
                            {...register("sexo")}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500 bg-white"
                        >
                            <option value="">Selecione...</option>
                            <option value="Masculino">Masculino</option>
                            <option value="Feminino">Feminino</option>
                            <option value="Outro">Outro</option>
                        </select>
                        {errors.sexo && <span className="text-xs text-red-500 mt-1">{errors.sexo.message}</span>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                        <select 
                            {...register("categoria")}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500 bg-white"
                        >
                            <option value="">Selecione...</option>
                            <option value="Amador">Amador</option>
                            <option value="Intermediario">Intermediário</option>
                            <option value="Avancado">Avançado</option>
                            <option value="Profissional">Profissional</option>
                        </select>
                        {errors.categoria && <span className="text-xs text-red-500 mt-1">{errors.categoria.message}</span>}
                    </div>

                    {erroAPI && (
                        <div className="p-3 bg-red-100 text-red-700 text-sm rounded-lg text-center">
                            {erroAPI}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 transition duration-200 disabled:opacity-50 mt-4"
                    >
                        {isSubmitting ? "Criando conta..." : "Cadastrar"}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    Já tem uma conta?{' '}
                    <Link href="/login" className="text-green-600 font-semibold hover:underline">
                        Faça login
                    </Link>
                </div>
            </div>
        </div>
    );
}