import { Calendar, MapPin, DollarSign, Users } from 'lucide-react';
import Link from 'next/link';
import { Partida } from '@/types';

interface EventCardProps {
  partida: Partida;
}

export function EventCard({ partida }: EventCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number) => {
    return price === 0 ? 'Gratuito' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  };

  const getSituacaoStyles = (situacao: string) => {
    switch (situacao) {
      case 'Aberta': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Fechada': return 'bg-red-100 text-red-700 border-red-200';
      case 'Finalizada': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getTipoStyles = (tipo: string) => {
    const t = tipo.toLowerCase();
    return (t === 'profissional' || t === 'pro' || t === 'federado')
      ? 'bg-blue-100 text-blue-700 border-blue-200'
      : 'bg-orange-100 text-orange-700 border-orange-200';
  };

  const participantCount = partida.inscricoes?.filter(
    (i) => i.status === 'confirmada' || i.status === 'aceita'
  ).length || 0;

  return (
    <Link href={`/partidas/${partida.id}`} className="block group">
      <article className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200 hover:-translate-y-1 h-full flex flex-col">
        {/* Banner Area */}
        <div className="relative h-48 overflow-hidden bg-gray-100">
          {partida.bannerUrl ? (
            <img
              src={partida.bannerUrl}
              alt={partida.titulo}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          
          {/* Fallback visual se não houver imagem */}
          <div className={`${partida.bannerUrl ? 'hidden' : 'flex'} absolute inset-0 items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-800`}>
             <div className="text-center text-white/90">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                   <Users className="w-6 h-6" />
                </div>
                <span className="font-semibold text-sm tracking-wide opacity-90">Vôlei EventSync</span>
             </div>
          </div>
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm backdrop-blur-md ${getTipoStyles(partida.tipo)}`}>
              {partida.tipo}
            </span>
          </div>
          <div className="absolute top-3 right-3">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm backdrop-blur-md ${getSituacaoStyles(partida.situacao)}`}>
              {partida.situacao}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {partida.titulo}
          </h3>

          <div className="space-y-3 mb-4 flex-1">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="text-sm font-medium">{formatDate(partida.data)}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="text-sm line-clamp-1">{partida.local || "Local a definir"}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
            <div className="flex items-center gap-1 font-bold text-gray-900">
                {partida.preco === 0 ? (
                    <span className="text-green-600">Gratuito</span>
                ) : (
                    <>
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        {formatPrice(partida.preco)}
                    </>
                )}
            </div>
            
            <div className="flex items-center gap-1.5 text-gray-500 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
              <Users className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">{participantCount}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}