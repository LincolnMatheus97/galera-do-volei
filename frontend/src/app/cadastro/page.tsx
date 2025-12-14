'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/Input'; // Componente visual do Lovable
import Link from 'next/link';
import { useState } from 'react';
import { UserPlus, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const cadastroSchema = z.object({
    nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
    email: z.string().email("Email inválido"),
    senha: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
    sexo: z.string().min(1, "Selecione o sexo"),
    categoria: z.string().min(1, "Selecione a categoria"),
});

type CadastroFormData = z.infer<typeof cadastroSchema>;

export default function CadastroPage() {
    const { register: registerUser } = useAuth();
    const { toast } = useToast();
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
            toast({ 
                title: "Conta criada!", 
                description: "Bem-vindo à Galera do Vôlei.",
                className: "bg-green-600 text-white"
            });
            // O redirect acontece no AuthContext
        } catch (err: any) {
            const msg = err.response?.status === 409 
                ? "Este email já está cadastrado." 
                : "Ocorreu um erro ao criar a conta.";
            
            setErroAPI(msg);
            toast({ variant: "destructive", title: "Erro no cadastro", description: msg });
        }
    }

    // Estilos auxiliares
    const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";
    const selectClass = "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
                <div className="text-center mb-8">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
                        <UserPlus className="text-white" size={28} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Crie sua conta</h1>
                    <p className="text-slate-500 text-sm mt-1">Junte-se à Galera do Vôlei!</p>
                </div>

                <form onSubmit={handleSubmit(handleCadastro)} className="space-y-5">
                    <div>
                        <label className={labelClass}>Nome Completo</label>
                        <Input placeholder="Seu nome" {...register("nome")} />
                        {errors.nome && <span className="text-xs text-red-500 mt-1 block">{errors.nome.message}</span>}
                    </div>

                    <div>
                        <label className={labelClass}>Email</label>
                        <Input type="email" placeholder="exemplo@email.com" {...register("email")} />
                        {errors.email && <span className="text-xs text-red-500 mt-1 block">{errors.email.message}</span>}
                    </div>

                    <div>
                        <label className={labelClass}>Senha</label>
                        <Input type="password" placeholder="Mínimo 6 caracteres" {...register("senha")} />
                        {errors.senha && <span className="text-xs text-red-500 mt-1 block">{errors.senha.message}</span>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Sexo</label>
                            <select className={selectClass} {...register("sexo")}>
                                <option value="">Selecione...</option>
                                <option value="Masculino">Masculino</option>
                                <option value="Feminino">Feminino</option>
                                <option value="Outro">Outro</option>
                            </select>
                            {errors.sexo && <span className="text-xs text-red-500 mt-1 block">{errors.sexo.message}</span>}
                        </div>

                        <div>
                            <label className={labelClass}>Categoria</label>
                            <select className={selectClass} {...register("categoria")}>
                                <option value="">Selecione...</option>
                                <option value="Amador">Amador</option>
                                <option value="Intermediario">Intermediário</option>
                                <option value="Avancado">Avançado</option>
                                <option value="Profissional">Profissional</option>
                            </select>
                            {errors.categoria && <span className="text-xs text-red-500 mt-1 block">{errors.categoria.message}</span>}
                        </div>
                    </div>

                    {erroAPI && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center font-medium border border-red-100">
                            {erroAPI}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 disabled:opacity-70 mt-2"
                    >
                        {isSubmitting ? "Criando..." : <><span className="mr-1">Cadastrar</span> <ArrowRight size={18} /></>}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-slate-500">
                    Já tem uma conta?{' '}
                    <Link href="/login" className="text-blue-600 font-bold hover:underline">
                        Faça login
                    </Link>
                </div>
            </div>
        </div>
    );
}