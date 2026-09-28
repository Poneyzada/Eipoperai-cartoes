import React from 'react';
import { useApp } from '../../hooks/useAppContext';
import { formatCurrency } from '../../lib/utils';
import { PieChart, Tag, ArrowUpRight } from 'lucide-react';

export const CategoryChart: React.FC = () => {
  const { installments, categories, selectedMonth, selectedCardId, currentMonthTotal } = useApp();

  // Filtrar parcelas da fatura do mês atual
  const monthInstallments = installments.filter(inst => {
    const matchesMonth = inst.invoice_month === selectedMonth;
    const matchesCard = selectedCardId === 'all' || inst.card_id === selectedCardId;
    return matchesMonth && matchesCard;
  });

  // Agrupar por categoria
  const categoryMap: Record<string, number> = {};
  monthInstallments.forEach(inst => {
    const catId = inst.category_id || 'cat-9';
    categoryMap[catId] = (categoryMap[catId] || 0) + inst.amount;
  });

  const categoryData = Object.entries(categoryMap)
    .map(([catId, amount]) => {
      const cat = categories.find(c => c.id === catId || c.name === catId) || {
        name: 'Outros',
        color: '#94a3b8',
      };
      const percent = currentMonthTotal > 0 ? Math.round((amount / currentMonthTotal) * 100) : 0;
      return {
        id: catId,
        name: cat.name,
        color: cat.color,
        amount,
        percent,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="glass-panel rounded-2xl p-5 space-y-4">
      
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Gastos por Categoria</h3>
            <p className="text-xs text-slate-400">Distribuição percentual da fatura atual</p>
          </div>
        </div>

        <span className="text-xs font-extrabold text-white">
          {categoryData.length} {categoryData.length === 1 ? 'categoria' : 'categorias'}
        </span>
      </div>

      {categoryData.length === 0 ? (
        <div className="py-8 text-center text-slate-500 text-xs">
          Nenhuma despesa para exibir na fatura deste mês.
        </div>
      ) : (
        <div className="space-y-3 pt-1">
          {categoryData.map(item => (
            <div key={item.id} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-semibold text-slate-200 truncate">{item.name}</span>
                  <span className="text-[10px] text-slate-500">({item.percent}%)</span>
                </div>
                <span className="font-bold text-slate-100 flex-shrink-0">
                  {formatCurrency(item.amount)}
                </span>
              </div>

              {/* Barra de Progresso */}
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${item.percent}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
