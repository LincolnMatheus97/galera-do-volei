'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/services/api';
import { Input } from '@/components/ui/Input';
import { CheckCircle, XCircle, ArrowLeft, DollarSign,  } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function PagamentoPage() {
    const { id } = useParams(); // id da partida
    const router = useRouter();
    const { user } = useAuth();
    const [codigo, setCodigo] = useState("");
    const [resultado, setResultado] = useState<{ success: boolean; message: string; participante?: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [idInscricao, setIdInscricao] = useState<number | null>(null);

    useEffect(() => {
        async function fetchInscricao() {
            if (!user) return;
            try {
                const res = await api.get(`/partidas/${id}/inscricoes`);
                const inscricoes = res.data;
                const minha = inscricoes.find((i: any) => i.jogador?.email === user.email);
                if (minha) setIdInscricao(minha.id);
                else router.push(`/partidas/${id}`);
            } catch {
                router.push(`/partidas/${id}`);
            }
        }
        fetchInscricao();
    }, [id, user, router]);

    async function handlePagamento(e: React.FormEvent) {
        e.preventDefault();
        if (!idInscricao) return;
        setLoading(true);
        setResultado(null);

        try {
            const res = await api.post(`/inscricoes/${idInscricao}/pagamento`, { chavePix: codigo });
            setResultado({
                success: true,
                message: "Pagamento Confirmado!",
                participante: res.data.participante
            });
            setCodigo("");
        } catch (error: any) {
            setResultado({
                success: false,
                message: error.response?.data?.message || "Erro ao validar código."
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-md mx-auto mt-10">
            <div className="flex items-center mb-6">
                <Link href={`/partidas/${id}`} className="mr-4 text-gray-500 hover:text-gray-900">
                    <ArrowLeft />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Area de Pagamento</h1>
            </div>
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <div className="text-center mb-6">
                        <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                            <DollarSign className="text-blue-600" size={32} />
                        </div>
                        <p className="text-gray-500 text-sm">
                            Confirme o pagamento para completar sua inscrição.
                        </p>
                    </div>
                    <Input 
                        label="Código do Pix" 
                        placeholder="Ex: CPF, e-mail ou telefone" 
                        value={codigo}
                        onChange={(e) => setCodigo(e.target.value)}
                        autoFocus
                    />
                    
                    <form onSubmit={handlePagamento} className="mt-4">
                        <button 
                            type="submit" 
                            disabled={loading || !idInscricao}
                            className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? "Processando..." : "CONFIRMAR PAGAMENTO"}
                        </button>
                    </form>
            

                {/* Feedback Visual */}
                {resultado && (
                    <div className={`mt-6 p-4 rounded-lg text-center animate-pulse ${
                        resultado.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                        <div className="flex justify-center mb-2">
                            {resultado.success ? <CheckCircle size={40} /> : <XCircle size={40} />}
                        </div>
                        <h2 className="text-xl font-bold">{resultado.message}</h2>
                        {resultado.participante && (
                            <p className="text-lg mt-1 font-medium">{resultado.participante}</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}