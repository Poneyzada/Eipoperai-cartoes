import React from 'react';
import { useApp } from '../../hooks/useAppContext';
import { formatCurrency, formatMonthYear, getNextMonths } from '../../lib/utils';
import { TrendingUp, Calendar, ArrowRight, Layers } from 'lucide-react';

export const InvoiceProjection: React.FC = () => {
  const { 
    installments, 
    selectedCardId, 
    selectedMonth, 
    setSelectedMonth 
  } = useApp();

  // Calcular projeção dos próximos 6 meses
  const futureMonths = getNextMonths(selectedMonth, 6);

  const projectionData = futureMonths.map(ym => {
    const monthInst = installments.filter(inst => {
      const matchesMonth = inst.invoice_month === ym;
      const matchesCard = selectedCardId === 'all' || inst.card_id === selectedCardId;
      return matchesMonth && matchesCard;
    });

    const total = monthInst.reduce((acc, curr) => acc + curr.amount, 0);
    const count = monthInst.length;

    return {
      month: ym,
      label: formatMonthYear(ym),
      total,
      count,
      installments: monthInst,
    };
  });

  const maxTotal = Math.max(...projectionData.map(d => d.total), 1);

  return (
    <div className="glass-panel rounded-2xl p-5 space-y-4">
      
      {/* Cabeçalho */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">
              Projeção de Faturas Futuras
            </h3>
            <p className="text-xs text-zinc-400">
              Compromissos já parcelados para os próximos 6 meses
            </p>
          </div>
        </div>

        <span className="text-[11px] font-bold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
          Parcelas Futuras
        </span>
      </div>

      {/* Gráfico Visual de Barras */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5 pt-2">
        {projectionData.map((data, index) => {
          const heightPercent = Math.max(12, Math.round((data.total / maxTotal) * 100));
          const isSelected = data.month === selectedMonth;

          return (
            <div
              key={data.month}
              onClick={() => setSelectedMonth(data.month)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                isSelected
                  ? 'border-amber-400 bg-amber-500/15 shadow-lg glow-gold'
                  : 'border-zinc-800/80 bg-zinc-950/60 hover:bg-zinc-900/80 hover:border-amber-500/30'
              }`}
            >
              <div>
                <p className="text-[11px] font-bold text-zinc-300 capitalize truncate">
                  {data.label.split(' / ')[0]}
                </p>
                <p className="text-[10px] text-zinc-500">
                  {data.label.split(' / ')[1]}
                </p>
              </div>

              {/* Coluna de Gráfico com Barra */}
              <div className="h-28 flex items-end my-3 relative">
                <div className="w-full bg-zinc-900/80 rounded-xl h-full flex items-end p-1 border border-zinc-800">
                  <div
                    className={`w-full rounded-lg transition-all duration-500 ${
                      index === 0
                        ? 'bg-gradient-to-t from-amber-600 via-yellow-500 to-amber-300 shadow-sm'
                        : isSelected
                        ? 'bg-gradient-to-t from-amber-500 to-yellow-300 glow-gold'
                        : 'bg-gradient-to-t from-zinc-700 to-amber-600/70 group-hover:from-amber-600 group-hover:to-yellow-400'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
              </div>

              <div>
                <p className="font-extrabold text-xs text-white truncate">
                  {formatCurrency(data.total)}
                </p>
                <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                  <Layers className="w-2.5 h-2.5" />
                  {data.count} {data.count === 1 ? 'item' : 'itens'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center pt-1">
        <p className="text-[11px] text-slate-500">
          💡 Clique em qualquer mês acima para visualizar e gerenciar o detalhamento daquela fatura.
        </p>
      </div>

    </div>
  );
};
