'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/services/api';
import { Input } from '@/components/ui/Input';
import { QrCode, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CheckinPage() {
    const { id } = useParams();
    const [codigo, setCodigo] = useState("");
    const [resultado, setResultado] = useState<{ success: boolean; message: string; participante?: string } | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleCheckin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setResultado(null);

        try {
            const res = await api.post(`/partidas/${id}/checkin`, { qrCode: codigo });
            setResultado({
                success: true,
                message: "Acesso Permitido!",
                participante: res.data.participante
            });
            setCodigo(""); // Limpa para o próximo
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
                <h1 className="text-2xl font-bold text-gray-900">Controle de Entrada</h1>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <div className="text-center mb-6">
                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                        <QrCode className="text-blue-600" size={32} />
                    </div>
                    <p className="text-gray-500 text-sm">
                        Digite o código do QR Code do participante ou use um leitor externo.
                    </p>
                </div>

                <form onSubmit={handleCheckin}>
                    <label htmlFor="codigo" className="block text-sm font-medium text-gray-700 mb-2">Código do Cartão</label>
                    <Input 
                        id="codigo"
                        placeholder="Ex: 123e4567-e89b..." 
                        value={codigo}
                        onChange={(e) => setCodigo(e.target.value)}
                        autoFocus
                    />
                    
                    <button 
                        type="submit" 
                        disabled={loading || codigo.length < 5}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? "Validando..." : "CHECK-IN"}
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