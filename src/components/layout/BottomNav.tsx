import React from 'react';
import { LayoutDashboard, CreditCard, Receipt, FileSpreadsheet, Plus } from 'lucide-react';

export type ActiveTab = 'dashboard' | 'cards' | 'transactions' | 'invoices';

interface BottomNavProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  onOpenTransactionModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  onOpenTransactionModal,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070709]/95 backdrop-blur-xl border-t border-amber-500/20 px-3 py-2 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.8)]">
      <div className="flex items-center justify-around relative">
        
        {/* Tab: Dashboard */}
        <button
          onClick={() => onChangeTab('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg transition-colors ${
            activeTab === 'dashboard' ? 'text-amber-400 font-bold' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px]">Início</span>
        </button>

        {/* Tab: Cartões */}
        <button
          onClick={() => onChangeTab('cards')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg transition-colors ${
            activeTab === 'cards' ? 'text-amber-400 font-bold' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <CreditCard className="w-5 h-5" />
          <span className="text-[10px]">Cartões</span>
        </button>

        {/* Floating Action Button: Nova Despesa (Gold Glow) */}
        <div className="relative -top-5">
          <button
            onClick={onOpenTransactionModal}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 text-black shadow-2xl glow-gold flex items-center justify-center border-4 border-[#050505] active:scale-95 transition-transform"
            title="Nova Despesa"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        {/* Tab: Lançamentos */}
        <button
          onClick={() => onChangeTab('transactions')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg transition-colors ${
            activeTab === 'transactions' ? 'text-amber-400 font-bold' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Receipt className="w-5 h-5" />
          <span className="text-[10px]">Gastos</span>
        </button>

        {/* Tab: Faturas */}
        <button
          onClick={() => onChangeTab('invoices')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg transition-colors ${
            activeTab === 'invoices' ? 'text-amber-400 font-bold' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <FileSpreadsheet className="w-5 h-5" />
          <span className="text-[10px]">Faturas</span>
        </button>

      </div>
    </nav>
  );
};
