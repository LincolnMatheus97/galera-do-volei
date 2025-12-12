import { Partida } from "@/types";
import { Calendar, MapPin, DollarSign, Users } from "lucide-react";
import Link from "next/link";

interface EventCardProps {
    partida: Partida;
}

export function EventCard({ partida }: EventCardProps) {
    const dataFormatada = new Date(partida.data).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
    });

    const precoFormatado = partida.preco === 0 
        ? "Gratuito" 
        : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(partida.preco);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
            {partida.bannerUrl && (
                <div className="h-32 bg-gray-200 w-full relative">
                    {/* Fallback de imagem simples usando o próprio link se for válido, ou um placeholder */}
                    <img 
                        src={partida.bannerUrl} 
                        alt={partida.titulo}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.currentTarget.src = "https://via.placeholder.com/400x150?text=EventSync";
                        }}
                    />
                </div>
            )}
            
            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                        {partida.tipo}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                        partida.situacao === 'Aberta' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                        {partida.situacao}
                    </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">{partida.titulo}</h3>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                        <Calendar size={16} className="mr-2 text-gray-400" />
                        {dataFormatada}
                    </div>
                    <div className="flex items-center">
                        <MapPin size={16} className="mr-2 text-gray-400" />
                        {partida.local || "Local a definir"}
                    </div>
                    <div className="flex items-center">
                        <DollarSign size={16} className="mr-2 text-gray-400" />
                        {precoFormatado}
                    </div>
                    {partida.moderador && (
                        <div className="flex items-center">
                            <Users size={16} className="mr-2 text-gray-400" />
                            Org: {partida.moderador.nome}
                        </div>
                    )}
                </div>

                <Link 
                    href={`/partidas/${partida.id}`}
                    className="block w-full text-center bg-gray-900 text-white py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                    Ver Detalhes
                </Link>
            </div>
        </div>
    );
}