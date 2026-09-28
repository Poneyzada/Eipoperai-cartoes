import React from 'react';
import { useApp } from '../../hooks/useAppContext';
import { formatCurrency, formatMonthYear } from '../../lib/utils';
import { DollarSign, ShieldCheck, ArrowUpRight, TrendingUp, CreditCard } from 'lucide-react';

export const OverviewStats: React.FC = () => {
  const { 
    currentMonthTotal, 
    nextMonthTotal, 
    totalAvailableLimit, 
    totalUsedLimit, 
    totalLimit, 
    selectedMonth, 
  } = useApp();

  const usedPercent = Math.min(100, Math.round((totalUsedLimit / (totalLimit || 1)) * 100));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* Card 1: Fatura Atual */}
      <div className="glass-panel rounded-2xl p-5 relative overflow-hidden group hover:border-amber-500/50 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Fatura {formatMonthYear(selectedMonth).split(' / ')[0]}
          </span>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3">
          <h3 className="text-2xl font-black text-white tracking-tight">
            {formatCurrency(currentMonthTotal)}
          </h3>
          <p className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-amber-400" />
            <span>Fatura do mês selecionado</span>
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />
      </div>

      {/* Card 2: Limite Disponível */}
      <div className="glass-panel rounded-2xl p-5 relative overflow-hidden group hover:border-emerald-500/50 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Limite Livre (Disponível)
          </span>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3">
          <h3 className="text-2xl font-black text-emerald-400 tracking-tight">
            {formatCurrency(totalAvailableLimit)}
          </h3>
          <p className="text-[11px] text-zinc-400 mt-1">
            de {formatCurrency(totalLimit)} limite total
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
      </div>

      {/* Card 3: Limite Comprometido */}
      <div className="glass-panel rounded-2xl p-5 relative overflow-hidden group hover:border-amber-500/50 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Limite Comprometido
          </span>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <CreditCard className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3">
          <h3 className="text-2xl font-black text-zinc-100 tracking-tight">
            {formatCurrency(totalUsedLimit)}
          </h3>
          <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-1">
            <span>{usedPercent}% utilizado</span>
            <div className="w-20 h-1.5 rounded-full bg-zinc-800 overflow-hidden ml-2">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full"
                style={{ width: `${usedPercent}%` }}
              />
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 to-yellow-600" />
      </div>

      {/* Card 4: Próxima Fatura (Projeção) */}
      <div className="glass-panel rounded-2xl p-5 relative overflow-hidden group hover:border-amber-500/50 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Próxima Fatura (+1 Mês)
          </span>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/20">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3">
          <h3 className="text-2xl font-black text-amber-200 tracking-tight">
            {formatCurrency(nextMonthTotal)}
          </h3>
          <p className="text-[11px] text-zinc-400 mt-1">
            Parcelas já contratadas
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-amber-700" />
      </div>

    </div>
  );
};
