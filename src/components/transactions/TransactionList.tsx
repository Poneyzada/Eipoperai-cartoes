import React, { useState } from 'react';
import { useApp } from '../../hooks/useAppContext';
import { formatCurrency, formatDate } from '../../lib/utils';
import { 
  Receipt, 
  Trash2, 
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
    <div className="glass-panel rounded-2xl p-4 sm:p-5 space-y-4">
      
      {/* Topo: Título + Busca */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Receipt className="w-5 h-5 text-amber-400" />
          <h3 className="font-extrabold text-white text-base">
            Lançamentos da Fatura ({monthInstallments.length})
          </h3>
        </div>

        {/* Campo de Busca */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar compra..."
            className="w-full bg-[#0d0d10] border border-amber-500/20 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Lista de Transações */}
      {monthInstallments.length === 0 ? (
        <div className="py-10 text-center text-zinc-500 space-y-2">
          <Receipt className="w-8 h-8 mx-auto text-zinc-600 opacity-60" />
          <p className="text-sm font-medium">Nenhum lançamento encontrado nesta fatura.</p>
          <p className="text-xs text-zinc-600">Toque em "Nova Despesa" ou "Importar Extrato" para lançar compras.</p>
        </div>
      ) : (
        <div className="divide-y divide-zinc-800/60">
          {monthInstallments.map((inst) => {
            const card = getCard(inst.card_id);
            const category = getCategory(inst.category_id);

            return (
              <div
                key={inst.id}
                className="py-3 px-1 sm:px-2 flex items-center justify-between gap-3 hover:bg-zinc-900/40 rounded-xl transition-colors group"
              >
                {/* Lado Esquerdo: Ícone + Detalhes da Compra */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  
                  {/* Ícone Redondo */}
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md border border-white/5"
                    style={{ backgroundColor: `${category?.color || '#f59e0b'}20` }}
                  >
                    {renderIcon(category?.icon || 'Tag', category?.color || '#f59e0b')}
                  </div>

                  {/* Informações de Texto */}
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-zinc-100 truncate tracking-tight">
                      {inst.description}
                    </p>

                    {/* Subtítulo Compacto que NÃO quebra de forma feia no mobile */}
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-0.5 flex-wrap sm:flex-nowrap">
                      <span className="font-mono text-zinc-400">{formatDate(inst.due_date)}</span>
                      
                      {card && (
                        <>
                          <span className="text-zinc-600">•</span>
                          <span className="truncate text-zinc-300 font-medium max-w-[120px] sm:max-w-none">
                            {card.bank} <span className="text-zinc-500 font-mono">..{card.last_four}</span>
                          </span>
                        </>
                      )}

                      {inst.total_installments > 1 && (
                        <span className="bg-amber-500/15 border border-amber-500/30 text-amber-300 font-extrabold text-[10px] px-1.5 py-0.2 rounded-md whitespace-nowrap">
                          {inst.installment_number}/{inst.total_installments}x
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Lado Direito: Valor + Categoria + Lixeira */}
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 text-right">
                  <div>
                    <p className="font-black text-sm text-white tracking-tight">
                      {formatCurrency(inst.amount)}
                    </p>
                    <p className="text-[10px] text-zinc-500 truncate max-w-[100px] sm:max-w-none">
                      {category?.name || 'Geral'}
                    </p>
                  </div>

                  {/* Botão de Excluir */}
                  <button
                    onClick={() => {
                      if (confirm(`Deseja excluir a compra "${inst.description}"?`)) {
                        deleteTransaction(inst.transaction_id);
                      }
                    }}
                    className="p-1.5 hover:bg-rose-500/20 rounded-lg text-zinc-500 hover:text-rose-400 transition-colors"
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
