import React, { useState, useEffect } from 'react';
import { Card, CardBrand } from '../../types';
import { X, CreditCard, Sparkles, Check } from 'lucide-react';

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: Omit<Card, 'id' | 'user_id' | 'created_at'> & { id?: string }) => Promise<void>;
  cardToEdit?: Card | null;
}

const BANK_PRESETS = [
  {
    bank: 'Nubank',
    name: 'Nubank Ultravioleta',
    brand: 'Mastercard' as CardBrand,
    color_gradient: 'from-purple-900 via-indigo-950 to-purple-800',
    closing_day: 10,
    due_day: 17,
  },
  {
    bank: 'Inter',
    name: 'Inter Black Win',
    brand: 'Mastercard' as CardBrand,
    color_gradient: 'from-amber-600 via-orange-700 to-stone-900',
    closing_day: 20,
    due_day: 27,
  },
  {
    bank: 'Itaú',
    name: 'Itaú Personnalité',
    brand: 'Visa' as CardBrand,
    color_gradient: 'from-slate-900 via-blue-950 to-amber-950',
    closing_day: 5,
    due_day: 12,
  },
  {
    bank: 'C6 Bank',
    name: 'C6 Carbon Black',
    brand: 'Mastercard' as CardBrand,
    color_gradient: 'from-zinc-900 via-stone-900 to-neutral-950',
    closing_day: 15,
    due_day: 22,
  },
  {
    bank: 'XP',
    name: 'XP Visa Infinite',
    brand: 'Visa' as CardBrand,
    color_gradient: 'from-neutral-950 via-zinc-900 to-amber-800',
    closing_day: 1,
    due_day: 8,
  },
  {
    bank: 'Bradesco',
    name: 'Bradesco Aeternum',
    brand: 'Visa' as CardBrand,
    color_gradient: 'from-rose-950 via-red-900 to-slate-950',
    closing_day: 12,
    due_day: 19,
  },
  {
    bank: 'Santander',
    name: 'Santander Unlimited',
    brand: 'Mastercard' as CardBrand,
    color_gradient: 'from-red-950 via-red-800 to-zinc-950',
    closing_day: 18,
    due_day: 25,
  },
  {
    bank: 'BTG Pactual',
    name: 'BTG Ultrablack',
    brand: 'Mastercard' as CardBrand,
    color_gradient: 'from-blue-950 via-slate-900 to-blue-900',
    closing_day: 8,
    due_day: 15,
  },
];

export const CardModal: React.FC<CardModalProps> = ({
  isOpen,
  onClose,
  onSave,
  cardToEdit,
}) => {
  const [name, setName] = useState('');
  const [bank, setBank] = useState('Nubank');
  const [lastFour, setLastFour] = useState('0000');
  const [brand, setBrand] = useState<CardBrand>('Mastercard');
  const [colorGradient, setColorGradient] = useState('from-purple-900 via-indigo-950 to-purple-800');
  const [totalLimit, setTotalLimit] = useState<string>('5000');
  const [closingDay, setClosingDay] = useState<number>(10);
  const [dueDay, setDueDay] = useState<number>(17);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cardToEdit) {
      setName(cardToEdit.name);
      setBank(cardToEdit.bank);
      setLastFour(cardToEdit.last_four);
      setBrand(cardToEdit.brand);
      setColorGradient(cardToEdit.color_gradient);
      setTotalLimit(String(cardToEdit.total_limit));
      setClosingDay(cardToEdit.closing_day);
      setDueDay(cardToEdit.due_day);
    } else {
      // Default para novo cartão
      const preset = BANK_PRESETS[0];
      setName(preset.name);
      setBank(preset.bank);
      setLastFour(String(Math.floor(1000 + Math.random() * 9000)));
      setBrand(preset.brand);
      setColorGradient(preset.color_gradient);
      setTotalLimit('8000');
      setClosingDay(preset.closing_day);
      setDueDay(preset.due_day);
    }
  }, [cardToEdit, isOpen]);

  const applyPreset = (p: typeof BANK_PRESETS[0]) => {
    setBank(p.bank);
    setName(p.name);
    setBrand(p.brand);
    setColorGradient(p.color_gradient);
    setClosingDay(p.closing_day);
    setDueDay(p.due_day);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        id: cardToEdit ? cardToEdit.id : undefined,
        name,
        bank,
        last_four: lastFour.padStart(4, '0').slice(-4),
        brand,
        color_gradient: colorGradient,
        total_limit: parseFloat(totalLimit) || 1000,
        closing_day: Number(closingDay),
        due_day: Number(dueDay),
      });
      onClose();
    } catch (err) {
      console.error('Error saving card:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg glass-panel rounded-2xl p-6 shadow-2xl border border-slate-700/80 max-h-[90vh] overflow-y-auto">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {cardToEdit ? 'Editar Cartão' : 'Novo Cartão de Crédito'}
              </h2>
              <p className="text-xs text-zinc-400">Configuração de limites e datas de fatura</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets Rápidos de Bancos Brasileiros */}
        {!cardToEdit && (
          <div className="my-4">
            <label className="text-xs font-semibold text-zinc-300 block mb-2">
              Escolha um Banco (Preenchimento Rápido):
            </label>
            <div className="grid grid-cols-4 gap-2">
              {BANK_PRESETS.map((p) => (
                <button
                  key={p.bank}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    bank === p.bank
                      ? 'border-amber-400 bg-amber-500/20 text-white ring-1 ring-amber-400/50'
                      : 'border-zinc-800/80 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300'
                  }`}
                >
                  <p className="text-xs font-bold truncate">{p.bank}</p>
                  <div className={`h-1.5 w-full rounded-full mt-1.5 bg-gradient-to-r ${p.color_gradient}`} />
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Nome e Banco */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">Apelido do Cartão</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Nubank Principal"
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">Banco Emissor</label>
              <input
                type="text"
                required
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                placeholder="Ex: Nubank"
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Limite Total e Últimos 4 Dígitos */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">Limite Total (R$)</label>
              <input
                type="number"
                step="0.01"
                min="100"
                required
                value={totalLimit}
                onChange={(e) => setTotalLimit(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">Últimos 4 Dígitos</label>
              <input
                type="text"
                maxLength={4}
                required
                value={lastFour}
                onChange={(e) => setLastFour(e.target.value.replace(/\D/g, ''))}
                placeholder="Ex: 4892"
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono tracking-widest focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Datas Críticas da Fatura: Fechamento e Vencimento */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Dia de Fechamento
              </label>
              <select
                value={closingDay}
                onChange={(e) => setClosingDay(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>Dia {d}</option>
                ))}
              </select>
              <span className="text-[10px] text-slate-500 mt-1 block">Melhor dia p/ comprar</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Dia de Vencimento
              </label>
              <select
                value={dueDay}
                onChange={(e) => setDueDay(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>Dia {d}</option>
                ))}
              </select>
              <span className="text-[10px] text-slate-500 mt-1 block">Prazo final p/ pagar</span>
            </div>
          </div>

          {/* Bandeira */}
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1">Bandeira</label>
            <div className="grid grid-cols-4 gap-2">
              {(['Mastercard', 'Visa', 'Elo', 'Amex'] as CardBrand[]).map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBrand(b)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-colors ${
                    brand === b
                      ? 'border-amber-400 bg-amber-500/20 text-white ring-1 ring-amber-400/50'
                      : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Botões de Ação */}
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
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-black text-sm font-black shadow-lg glow-gold transition-all disabled:opacity-50"
            >
              {loading ? 'Salvando...' : cardToEdit ? 'Atualizar Cartão' : 'Criar Cartão'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
