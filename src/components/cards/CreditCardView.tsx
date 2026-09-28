import React from 'react';
import { Card } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { Wifi, Edit2, Trash2, CalendarCheck, Sparkles, ShieldCheck } from 'lucide-react';

interface CreditCardViewProps {
  card: Card;
  onEdit?: (card: Card) => void;
  onDelete?: (id: string) => void;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

export const CreditCardView: React.FC<CreditCardViewProps> = ({
  card,
  onEdit,
  onDelete,
  isSelected,
  onSelect,
}) => {
  const usedPercent = Math.min(100, Math.round(((card.used_limit || 0) / (card.total_limit || 1)) * 100));

  return (
    <div className="flex flex-col gap-3 group">
      {/* O Cartão Físico Digital Realista */}
      <div
        onClick={() => onSelect && onSelect(card.id)}
        className={`relative w-full aspect-[1.586/1] rounded-2xl p-5 sm:p-6 bg-gradient-to-br ${card.color_gradient} text-white shadow-xl flex flex-col justify-between overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl border ${
          isSelected ? 'border-emerald-400 ring-2 ring-emerald-400/50' : 'border-white/10'
        }`}
      >
        {/* Efeito de Reflexo / Vidro Metálico */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/15 pointer-events-none" />
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-white/5 blur-2xl pointer-events-none" />

        {/* Linha Superior: Banco + Chip + Contactless */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Chip de Ouro/Metal */}
            <div className="w-10 h-7 rounded-md bg-gradient-to-tr from-amber-400 via-amber-300 to-amber-500 border border-amber-600/40 p-1 flex flex-col justify-between shadow-sm">
              <div className="w-full h-[1px] bg-amber-700/30" />
              <div className="w-full h-[1px] bg-amber-700/30" />
              <div className="w-full h-[1px] bg-amber-700/30" />
            </div>
            {/* Contactless */}
            <Wifi className="w-5 h-5 text-white/70 rotate-90" />
          </div>

          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-wider text-sm sm:text-base uppercase drop-shadow-sm">
              {card.bank}
            </span>
          </div>
        </div>

        {/* Linha Central: Nome do Cartão e 4 Últimos Dígitos */}
        <div className="relative z-10 my-auto">
          <p className="text-xs sm:text-sm font-medium text-white/80 tracking-wide">
            {card.name}
          </p>
          <div className="flex items-center gap-3 mt-1 text-sm sm:text-lg font-mono tracking-widest text-white/90">
            <span>••••</span>
            <span>••••</span>
            <span>••••</span>
            <span className="font-bold text-white">{card.last_four}</span>
          </div>
        </div>

        {/* Linha Inferior: Datas + Bandeira */}
        <div className="relative z-10 flex items-end justify-between">
          <div className="flex items-center gap-3 sm:gap-4 text-[11px] sm:text-xs text-white/80">
            <div>
              <p className="text-[9px] uppercase tracking-wider text-white/60 font-semibold">Fecha</p>
              <p className="font-bold">Dia {card.closing_day}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wider text-white/60 font-semibold">Vence</p>
              <p className="font-bold">Dia {card.due_day}</p>
            </div>
            {card.best_buy_day && (
              <div className="hidden sm:block bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-inner">
                Melhor dia: {card.best_buy_day}
              </div>
            )}
          </div>

          {/* Bandeira do Cartão */}
          <div className="flex items-center">
            {card.brand === 'Mastercard' ? (
              <div className="flex items-center -space-x-2">
                <div className="w-6 h-6 rounded-full bg-red-500/90 shadow-sm" />
                <div className="w-6 h-6 rounded-full bg-amber-400/90 shadow-sm" />
              </div>
            ) : card.brand === 'Visa' ? (
              <span className="italic font-black text-lg tracking-tighter text-white">
                VISA
              </span>
            ) : (
              <span className="font-bold text-xs uppercase bg-white/20 px-2 py-1 rounded">
                {card.brand}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Barra de Limite e Resumo do Cartão */}
      <div className="glass-panel rounded-xl p-3.5 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <span>Limite Disponível:</span>
            <span className="font-extrabold text-amber-400 text-sm">
              {formatCurrency(card.available_limit || 0)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                onClick={() => onEdit(card)}
                className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-amber-300 transition-colors"
                title="Editar Cartão"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(card.id)}
                className="p-1 hover:bg-red-500/20 rounded text-zinc-400 hover:text-red-400 transition-colors"
                title="Excluir Cartão"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Barra de Progresso do Limite */}
        <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden relative border border-zinc-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              usedPercent > 85 
                ? 'bg-rose-500' 
                : usedPercent > 60 
                ? 'bg-amber-500' 
                : 'bg-gradient-to-r from-amber-500 to-yellow-300'
            }`}
            style={{ width: `${usedPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-0.5">
          <span>Comprometido: <strong className="text-zinc-200">{formatCurrency(card.used_limit || 0)}</strong> ({usedPercent}%)</span>
          <span>Total: <strong className="text-zinc-200">{formatCurrency(card.total_limit)}</strong></span>
        </div>

        {/* Dica de Ouro: Melhor dia de compra */}
        <div className="flex items-center gap-1.5 pt-1.5 text-[11px] text-amber-300 font-semibold border-t border-amber-500/10">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
          <span>Melhor dia para comprar: <strong className="text-yellow-300">Dia {card.best_buy_day}</strong> (ganhe até 40 dias de prazo)</span>
        </div>
      </div>
    </div>
  );
};
