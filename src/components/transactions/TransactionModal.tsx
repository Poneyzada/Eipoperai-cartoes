import React, { useState, useEffect } from 'react';
import { useApp } from '../../hooks/useAppContext';
import { formatCurrency, calculateInvoiceMonth, formatMonthYear } from '../../lib/utils';
import { X, Receipt, CreditCard, Tag, Calendar, Layers, Sparkles, Info } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { cards, categories, createTransaction, selectedCardId } = useApp();

  const [amountStr, setAmountStr] = useState('');
  const [description, setDescription] = useState('');
  const [cardId, setCardId] = useState(cards[0]?.id || '');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat-1');
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [installments, setInstallments] = useState(1);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cards.length > 0) {
      if (selectedCardId !== 'all' && cards.some(c => c.id === selectedCardId)) {
        setCardId(selectedCardId);
      } else if (!cardId || !cards.some(c => c.id === cardId)) {
        setCardId(cards[0].id);
      }
    }
  }, [cards, selectedCardId, isOpen]);

  const selectedCard = cards.find(c => c.id === cardId) || cards[0];
  const parsedAmount = parseFloat(amountStr.replace(/\./g, '').replace(',', '.')) || 0;
  const installmentValue = installments > 0 ? parsedAmount / installments : 0;
  const initialInvoiceMonth = selectedCard ? calculateInvoiceMonth(date, selectedCard.closing_day) : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAmount <= 0) return;
    setLoading(true);

    try {
      await createTransaction({
        card_id: cardId,
        category_id: categoryId,
        description: description.trim(),
        amount: parsedAmount,
        date,
        total_installments: Number(installments),
        notes: notes.trim() || undefined,
      });
      // Reset
      setAmountStr('');
      setDescription('');
      setInstallments(1);
      setNotes('');
      onClose();
    } catch (err) {
      console.error('Error creating transaction:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg glass-panel rounded-2xl p-6 shadow-2xl border border-slate-700/80 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Nova Despesa no Cartão</h2>
              <p className="text-xs text-zinc-400">Lançamento à vista ou parcelado</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          
          {/* Valor da Compra com Destaque Dourado */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">
              Valor Total (R$)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400 font-bold text-lg">
                R$
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                autoFocus
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="0,00"
                className="w-full bg-zinc-950 border border-amber-500/30 rounded-2xl pl-12 pr-4 py-3.5 text-2xl font-black text-amber-300 focus:outline-none focus:border-amber-400 shadow-inner tracking-tight"
              />
            </div>
          </div>

          {/* Descrição / Estabelecimento */}
          <div>
            <label className="text-xs font-medium text-zinc-400 block mb-1">
              Descrição / Estabelecimento
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: iFood, Supermercado, Amazon, Apple..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Selecionar Cartão */}
          <div>
            <label className="text-xs font-medium text-zinc-400 block mb-1">
              Cartão Utilizado
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {cards.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => setCardId(card.id)}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                    cardId === card.id
                      ? 'border-amber-400 bg-amber-500/15 text-white ring-1 ring-amber-400/50'
                      : 'border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold leading-tight">{card.name}</p>
                    <p className="text-[10px] text-zinc-400">Fecha dia {card.closing_day}</p>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">..{card.last_four}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Data da Compra e Parcelamento */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">Data da Compra</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">Parcelamento</label>
              <select
                value={installments}
                onChange={(e) => setInstallments(Number(e.target.value))}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value={1}>1x (À Vista)</option>
                {Array.from({ length: 47 }, (_, i) => i + 2).map((n) => (
                  <option key={n} value={n}>
                    {n}x de {formatCurrency(parsedAmount ? parsedAmount / n : 0)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Prévia Inteligente da Fatura de Destino */}
          {selectedCard && (
            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-zinc-300 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p>
                  Essa compra cairá na fatura de <strong className="text-amber-300 capitalize">{formatMonthYear(initialInvoiceMonth)}</strong> (fechamento dia {selectedCard.closing_day}).
                </p>
                {installments > 1 && (
                  <p className="text-amber-400 font-bold mt-0.5">
                    {installments} parcelas de {formatCurrency(installmentValue)} serão projetadas automaticamente nos próximos meses.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Categoria */}
          <div>
            <label className="text-xs font-medium text-zinc-400 block mb-1">Categoria</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Observações */}
          <div>
            <label className="text-xs font-medium text-zinc-400 block mb-1">Observações (Opcional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Compra com desconto, garantia estendida..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Botões */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || parsedAmount <= 0}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-black text-sm font-black shadow-lg glow-gold transition-all disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Lançar Despesa'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
