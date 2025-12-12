'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { useState } from 'react';
import { LogIn } from 'lucide-react';

// Schema de Validação (Igual ao que você fez no backend, mas agora no front para feedback instantâneo)
const loginSchema = z.object({
    email: z.string().email("Email inválido"),
    senha: z.string().min(1, "A senha é obrigatória"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const { login } = useAuth();
    const [erroAPI, setErroAPI] = useState("");
    
    const { 
        register, 
        handleSubmit, 
        formState: { errors, isSubmitting } 
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema)
    });

    async function handleLogin(data: LoginFormData) {
        setErroAPI("");
        try {
            await login(data);
            // O redirecionamento acontece dentro do AuthContext
        } catch (err: any) {
            // Se o backend retornar erro (401, 404), mostramos aqui
            setErroAPI("Email ou senha incorretos.");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200">
                <div className="text-center mb-8">
                    <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                        <LogIn className="text-white" size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Acesse sua conta</h1>
                    <p className="text-gray-500 text-sm">Bem-vindo de volta ao Galera do Vôlei!</p>
                </div>

                <form onSubmit={handleSubmit(handleLogin)}>
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
                        placeholder="********"
                        {...register("senha")}
                        error={errors.senha?.message}
                    />

                    {erroAPI && (
                        <div className="p-3 bg-red-100 text-red-700 text-sm rounded-lg mb-4 text-center">
                            {erroAPI}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 disabled:opacity-50"
                    >
                        {isSubmitting ? "Entrando..." : "Entrar"}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    Não tem uma conta?{' '}
                    <Link href="/cadastro" className="text-blue-600 font-semibold hover:underline">
                        Cadastre-se
                    </Link>
                </div>
            </div>
        </div>
    );
}