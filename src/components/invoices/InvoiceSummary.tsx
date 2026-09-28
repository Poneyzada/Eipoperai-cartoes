import React from 'react';
import { useApp } from '../../hooks/useAppContext';
import { formatCurrency, formatMonthYear, formatDate, calculateClosingDate, calculateDueDate } from '../../lib/utils';
import { FileSpreadsheet, CheckCircle2, Clock, AlertTriangle, CreditCard, Sparkles } from 'lucide-react';

export const InvoiceSummary: React.FC = () => {
  const { 
    cards, 
    selectedCardId, 
    selectedMonth, 
    installments, 
    invoices, 
    currentMonthTotal, 
    toggleInvoicePayment 
  } = useApp();

  const activeCard = cards.find(c => c.id === selectedCardId);

  // Se 'all' estiver selecionado, exibe visão consolidada
  if (selectedCardId === 'all') {
    return (
      <div className="glass-panel rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Faturas Consolidadas</h3>
              <p className="text-xs text-slate-400 capitalize">{formatMonthYear(selectedMonth)}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400">Total Somado:</span>
            <p className="text-xl sm:text-2xl font-black text-white">
              {formatCurrency(currentMonthTotal)}
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
          💡 Para marcar uma fatura como paga ou ver o dia de fechamento específico, selecione um cartão individual no filtro superior.
        </p>

        {/* Resumo por Cartão Individual */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {cards.map(card => {
            const cardTotal = installments
              .filter(i => i.card_id === card.id && i.invoice_month === selectedMonth)
              .reduce((acc, curr) => acc + curr.amount, 0);

            const inv = invoices.find(i => i.card_id === card.id && i.month === selectedMonth);
            const isPaid = inv?.status === 'paid';

            return (
              <div
                key={card.id}
                className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-xs text-white truncate">{card.name}</p>
                  <p className="text-[10px] text-slate-400">Vence dia {card.due_day}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-xs text-white">{formatCurrency(cardTotal)}</p>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                    isPaid ? 'text-emerald-400 bg-emerald-500/20' : 'text-amber-400 bg-amber-500/20'
                  }`}>
                    {isPaid ? 'Paga' : 'Aberta'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (!activeCard) return null;

  const currentInvoice = invoices.find(i => i.card_id === activeCard.id && i.month === selectedMonth);
  const isPaid = currentInvoice?.status === 'paid';

  const closingDate = calculateClosingDate(selectedMonth, activeCard.closing_day);
  const dueDate = calculateDueDate(selectedMonth, activeCard.due_day);

  return (
    <div className="glass-panel rounded-2xl p-5 space-y-4">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Info do Cartão e Status */}
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl bg-gradient-to-tr ${activeCard.color_gradient} text-white shadow-md`}>
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base">{activeCard.name}</h3>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                isPaid 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {isPaid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                {isPaid ? 'Fatura Paga' : 'Fatura em Aberto'}
              </span>
            </div>
            <p className="text-xs text-slate-400 capitalize">
              Fatura de {formatMonthYear(selectedMonth)} (final {activeCard.last_four})
            </p>
          </div>
        </div>

        {/* Total da Fatura e Botão de Pagar */}
        <div className="flex items-center justify-between sm:justify-end gap-4">
          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 block">Valor da Fatura:</span>
            <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {formatCurrency(currentMonthTotal)}
            </span>
          </div>

          <button
            onClick={() => toggleInvoicePayment(activeCard.id, selectedMonth)}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all shadow-lg flex items-center gap-1.5 active:scale-95 ${
              isPaid
                ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
                : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-black glow-gold'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            {isPaid ? 'Reabrir Fatura' : 'Marcar como Paga'}
          </button>
        </div>

      </div>

      {/* Datas Cruciais */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-zinc-800 text-xs">
        <div className="p-3 rounded-xl bg-zinc-950/60 border border-amber-500/10">
          <span className="text-zinc-400 block text-[11px]">Fechamento da Fatura</span>
          <strong className="text-zinc-100 text-sm">{formatDate(closingDate)}</strong>
        </div>

        <div className="p-3 rounded-xl bg-zinc-950/60 border border-amber-500/10">
          <span className="text-zinc-400 block text-[11px]">Vencimento da Fatura</span>
          <strong className="text-amber-400 text-sm">{formatDate(dueDate)}</strong>
        </div>

        <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-amber-950/20 border border-amber-500/30">
          <span className="text-amber-300 block text-[11px] font-bold">Melhor Dia de Compra</span>
          <strong className="text-yellow-400 text-sm">Dia {activeCard.best_buy_day} de cada mês</strong>
        </div>
      </div>

    </div>
  );
};
