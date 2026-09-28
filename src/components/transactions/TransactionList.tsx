import React, { useState } from 'react';
import { useApp } from '../../hooks/useAppContext';
import { formatCurrency, formatDate } from '../../lib/utils';
import { 
  Receipt, 
  Trash2, 
  CreditCard, 
  Search, 
  Tag, 
  UtensilsCrossed, 
  ShoppingCart, 
  Car, 
  Tv, 
  ShoppingBag, 
  Plane, 
  HeartPulse, 
  Home 
} from 'lucide-react';

export const TransactionList: React.FC = () => {
  const { 
    installments, 
    transactions, 
    cards, 
    categories, 
    selectedMonth, 
    selectedCardId, 
    deleteTransaction 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar parcelas daquele mês e cartão selecionado
  const monthInstallments = installments.filter(inst => {
    const matchesMonth = inst.invoice_month === selectedMonth;
    const matchesCard = selectedCardId === 'all' || inst.card_id === selectedCardId;
    const matchesSearch = !searchTerm || (inst.description?.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesMonth && matchesCard && matchesSearch;
  });

  const getCategory = (catId?: string) => {
    return categories.find(c => c.id === catId || c.name === catId) || categories[categories.length - 1];
  };

  const getCard = (cardId: string) => {
    return cards.find(c => c.id === cardId);
  };

  const renderIcon = (iconName: string, color: string) => {
    const props = { className: "w-4 h-4", style: { color } };
    switch (iconName) {
      case 'UtensilsCrossed': return <UtensilsCrossed {...props} />;
      case 'ShoppingCart': return <ShoppingCart {...props} />;
      case 'Car': return <Car {...props} />;
      case 'Tv': return <Tv {...props} />;
      case 'ShoppingBag': return <ShoppingBag {...props} />;
      case 'Plane': return <Plane {...props} />;
      case 'HeartPulse': return <HeartPulse {...props} />;
      case 'Home': return <Home {...props} />;
      default: return <Tag {...props} />;
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 space-y-4">
      
      {/* Topo: Título + Busca */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Receipt className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-white text-base">
            Lançamentos da Fatura ({monthInstallments.length})
          </h3>
        </div>

        {/* Campo de Busca */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome ou loja..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Lista de Transações */}
      {monthInstallments.length === 0 ? (
        <div className="py-12 text-center text-slate-500 space-y-2">
          <Receipt className="w-8 h-8 mx-auto text-slate-600 opacity-60" />
          <p className="text-sm font-medium">Nenhum lançamento encontrado nesta fatura.</p>
          <p className="text-xs text-slate-600">Toque em "Nova Despesa" ou "Importar Extrato" para lançar compras.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-800/60">
          {monthInstallments.map((inst) => {
            const card = getCard(inst.card_id);
            const category = getCategory(inst.category_id);

            return (
              <div
                key={inst.id}
                className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-800/30 px-2 rounded-xl transition-colors group"
              >
                {/* Ícone e Detalhes da Compra */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-white/5"
                    style={{ backgroundColor: `${category?.color || '#3b82f6'}20` }}
                  >
                    {renderIcon(category?.icon || 'Tag', category?.color || '#3b82f6')}
                  </div>

                  <div className="min-w-0">
                    <p className="font-bold text-sm text-slate-100 truncate">
                      {inst.description}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{formatDate(inst.due_date)}</span>
                      <span>•</span>
                      {card && (
                        <span className="flex items-center gap-1">
                          <CreditCard className="w-3 h-3 text-slate-400" />
                          {card.name} (..{card.last_four})
                        </span>
                      )}
                      {inst.total_installments > 1 && (
                        <>
                          <span>•</span>
                          <span className="bg-indigo-500/20 text-indigo-400 px-1.5 py-0.2 rounded font-semibold text-[10px]">
                            {inst.installment_number}/{inst.total_installments}x
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Valor e Ações */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="font-extrabold text-sm text-white">
                      {formatCurrency(inst.amount)}
                    </p>
                    <p className="text-[10px] text-slate-500 capitalize">
                      {category?.name || 'Geral'}
                    </p>
                  </div>

                  <button
                    onClick={() => deleteTransaction(inst.transaction_id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-500/20 rounded-lg text-slate-500 hover:text-red-400"
                    title="Excluir Compra"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
