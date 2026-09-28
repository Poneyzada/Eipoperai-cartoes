import React from 'react';
import { CreditCard, Calendar, Plus, Upload, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../../hooks/useAppContext';
import { useAuth } from '../../hooks/useAuth';
import { formatMonthYear, addMonthsToYM } from '../../lib/utils';

interface NavbarProps {
  onOpenTransactionModal: () => void;
  onOpenImporterModal: () => void;
  onOpenCardModal: () => void;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenTransactionModal,
  onOpenImporterModal,
  onOpenCardModal,
  onOpenAuthModal,
}) => {
  const { 
    cards, 
    selectedCardId, 
    setSelectedCardId, 
    selectedMonth, 
    setSelectedMonth 
  } = useApp();
  const { user, isDemo } = useAuth();

  const handlePrevMonth = () => {
    setSelectedMonth(addMonthsToYM(selectedMonth, -1));
  };

  const handleNextMonth = () => {
    setSelectedMonth(addMonthsToYM(selectedMonth, 1));
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-amber-500/20 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Logo & Marca Eipô Peraí com Dourado */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-600 p-[1px] shadow-lg glow-gold">
              <div className="h-full w-full bg-[#0d0d10] rounded-xl flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight bg-gradient-to-r from-amber-100 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
                  Eipô Peraí
                </span>
                <span className="text-[10px] uppercase font-extrabold tracking-widest px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Card PWA
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium">Controle Inteligente de Cartões</p>
            </div>
          </div>

          {/* Botão de Auth no Mobile */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={onOpenAuthModal}
              className="p-2 rounded-xl bg-zinc-900 border border-amber-500/30 text-amber-300 hover:text-white text-xs flex items-center gap-1.5"
            >
              <User className="w-4 h-4 text-amber-400" />
              <span className="max-w-[70px] truncate">{user?.full_name?.split(' ')[0] || 'Entrar'}</span>
            </button>
          </div>
        </div>

        {/* Seletor de Mês & Filtro de Cartão */}
        <div className="flex items-center flex-wrap justify-center gap-2 w-full md:w-auto">
          
          {/* Navegador de Mês */}
          <div className="flex items-center bg-[#0d0d10] border border-amber-500/20 rounded-xl p-1 shadow-inner">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-amber-300 transition-colors"
              title="Mês anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-3 py-1 flex items-center gap-1.5 text-xs font-semibold capitalize text-zinc-200 min-w-[140px] justify-center">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              {formatMonthYear(selectedMonth)}
            </div>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-amber-300 transition-colors"
              title="Próximo mês"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Filtro por Cartão */}
          <div className="relative">
            <select
              value={selectedCardId}
              onChange={(e) => setSelectedCardId(e.target.value)}
              className="bg-[#0d0d10] border border-amber-500/20 text-zinc-200 text-xs rounded-xl px-3 py-2 pr-8 focus:outline-none focus:border-amber-400 transition-colors font-medium appearance-none cursor-pointer"
            >
              <option value="all">💳 Todos os Cartões ({cards.length})</option>
              {cards.map(card => (
                <option key={card.id} value={card.id}>
                  {card.name} (..{card.last_four})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-400">
              <ChevronRight className="w-3.5 h-3.5 rotate-90" />
            </div>
          </div>
        </div>

        {/* Botões de Ação Rápida */}
        <div className="hidden md:flex items-center gap-2.5">
          <button
            onClick={onOpenImporterModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-amber-500/30 hover:border-amber-400 transition-all shadow-sm"
          >
            <Upload className="w-3.5 h-3.5 text-amber-400" />
            Importar Extrato
          </button>

          <button
            onClick={onOpenTransactionModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-black rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-lg glow-gold transition-all transform active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Nova Despesa
          </button>

          {/* Usuário / Auth */}
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-[#0d0d10] border border-amber-500/20 hover:border-amber-400/50 transition-colors text-xs text-zinc-300"
          >
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-[11px] border border-amber-500/30">
              {user?.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="text-left">
              <p className="font-semibold text-zinc-200 leading-tight truncate max-w-[90px]">
                {user?.full_name?.split(' ')[0]}
              </p>
              <p className="text-[10px] text-amber-400 flex items-center gap-1">
                {isDemo ? 'Modo Local' : 'Nuvem Conectada'}
              </p>
            </div>
          </button>
        </div>

      </div>
    </header>
  );
};
