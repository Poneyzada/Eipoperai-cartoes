import React, { useState } from 'react';
import { AuthProvider } from './hooks/useAuth';
import { AppProvider, useApp } from './hooks/useAppContext';
import { Navbar } from './components/layout/Navbar';
import { BottomNav, ActiveTab } from './components/layout/BottomNav';
import { PWAInstallPrompt } from './components/layout/PWAInstallPrompt';
import { CreditCardView } from './components/cards/CreditCardView';
import { CardModal } from './components/cards/CardModal';
import { TransactionModal } from './components/transactions/TransactionModal';
import { StatementImporter } from './components/transactions/StatementImporter';
import { InvoiceSummary } from './components/invoices/InvoiceSummary';
import { InvoiceProjection } from './components/invoices/InvoiceProjection';
import { OverviewStats } from './components/dashboard/OverviewStats';
import { CategoryChart } from './components/dashboard/CategoryChart';
import { TransactionList } from './components/transactions/TransactionList';
import { AuthModal } from './components/auth/AuthModal';
import { Card } from './types';
import { Plus, Upload, CreditCard, Sparkles, AlertCircle } from 'lucide-react';

const MainContent: React.FC = () => {
  const { 
    cards, 
    selectedCardId, 
    setSelectedCardId, 
    saveCard, 
    deleteCard, 
    loading 
  } = useApp();

  // Modais
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isImporterModalOpen, setIsImporterModalOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [cardToEdit, setCardToEdit] = useState<Card | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Tab ativa no mobile
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  const handleEditCard = (card: Card) => {
    setCardToEdit(card);
    setIsCardModalOpen(true);
  };

  const handleAddNewCard = () => {
    setCardToEdit(null);
    setIsCardModalOpen(true);
  };

  const handleDeleteCard = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este cartão? Todos os lançamentos dele serão mantidos ou excluídos conforme o banco.')) {
      await deleteCard(id);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col pb-24 md:pb-12 text-zinc-100">
      
      {/* Banner PWA de Instalação no Celular */}
      <PWAInstallPrompt />

      {/* Barra de Navegação Superior */}
      <Navbar
        onOpenTransactionModal={() => setIsTransactionModalOpen(true)}
        onOpenImporterModal={() => setIsImporterModalOpen(true)}
        onOpenCardModal={handleAddNewCard}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Conteúdo Central */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
        
        {/* =========================================================================
            DESKTOP VIEW: Mostra Dashboard completo e organizado em colunas
            ========================================================================= */}
        <div className="hidden md:block space-y-6">
          
          {/* 1. KPIs Principais */}
          <OverviewStats />

          {/* 2. Seção de Cartões & Fatura Atual */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Coluna 1 & 2: Cartões de Crédito Físicos Interativos */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-400" />
                  <h2 className="font-extrabold text-white text-lg">Meus Cartões de Crédito</h2>
                  <span className="text-xs bg-zinc-800 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">
                    {cards.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsImporterModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-amber-500/30 transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Importar Fatura (Eipô Peraí)
                  </button>
                  <button
                    onClick={handleAddNewCard}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-black rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-black shadow-md glow-gold transition-all"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    Adicionar Cartão
                  </button>
                </div>
              </div>

              {/* Grid de Cartões */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {cards.map(card => (
                  <CreditCardView
                    key={card.id}
                    card={card}
                    isSelected={selectedCardId === card.id}
                    onSelect={(id) => setSelectedCardId(selectedCardId === id ? 'all' : id)}
                    onEdit={handleEditCard}
                    onDelete={handleDeleteCard}
                  />
                ))}

                {/* Card de Adicionar Novo Cartão */}
                <button
                  onClick={handleAddNewCard}
                  className="w-full aspect-[1.586/1] rounded-2xl border-2 border-dashed border-zinc-800 hover:border-amber-400/60 bg-[#0d0d10]/40 hover:bg-amber-500/5 transition-all flex flex-col items-center justify-center gap-2 text-zinc-400 hover:text-amber-300 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-zinc-900 group-hover:bg-amber-500/20 flex items-center justify-center transition-colors border border-zinc-800 group-hover:border-amber-500/30">
                    <Plus className="w-6 h-6 text-zinc-400 group-hover:text-amber-400" />
                  </div>
                  <span className="font-bold text-sm">Adicionar Outro Cartão</span>
                  <span className="text-[11px] text-zinc-500">Nubank, Itaú, Inter, C6, etc.</span>
                </button>
              </div>

              {/* Resumo e Ações da Fatura Atual */}
              <InvoiceSummary />
            </div>

            {/* Coluna 3: Gastos por Categoria & Dicas */}
            <div className="space-y-6">
              <CategoryChart />
              <InvoiceProjection />
            </div>

          </div>

          {/* 3. Tabela / Listagem de Lançamentos da Fatura */}
          <TransactionList />

        </div>

        {/* =========================================================================
            MOBILE VIEW: Alterna entre abas para experiência de App Nativo
            ========================================================================= */}
        <div className="block md:hidden space-y-4">
          
          {/* Tab: Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="space-y-4 animate-fadeIn">
              <OverviewStats />
              <InvoiceSummary />
              <CategoryChart />
              <InvoiceProjection />
            </div>
          )}

          {/* Tab: Cartões */}
          {activeTab === 'cards' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-1">
                <h2 className="font-extrabold text-white text-base">Meus Cartões ({cards.length})</h2>
                <button
                  onClick={handleAddNewCard}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-black rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-black shadow-md glow-gold"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  Adicionar
                </button>
              </div>

              <div className="space-y-4">
                {cards.map(card => (
                  <CreditCardView
                    key={card.id}
                    card={card}
                    isSelected={selectedCardId === card.id}
                    onSelect={(id) => setSelectedCardId(selectedCardId === id ? 'all' : id)}
                    onEdit={handleEditCard}
                    onDelete={handleDeleteCard}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Tab: Gastos / Lançamentos */}
          {activeTab === 'transactions' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsImporterModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-zinc-900 text-amber-300 border border-amber-500/30 text-xs font-bold shadow-sm"
                >
                  <Upload className="w-4 h-4 text-amber-400" />
                  Importar Extrato Copiado
                </button>
              </div>
              <TransactionList />
            </div>
          )}

          {/* Tab: Faturas */}
          {activeTab === 'invoices' && (
            <div className="space-y-4 animate-fadeIn">
              <InvoiceSummary />
              <InvoiceProjection />
            </div>
          )}

        </div>

      </main>

      {/* Navegação Fixa Inferior Mobile */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onOpenTransactionModal={() => setIsTransactionModalOpen(true)}
      />

      {/* Modais Globais */}
      <CardModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        onSave={saveCard}
        cardToEdit={cardToEdit}
      />

      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
      />

      <StatementImporter
        isOpen={isImporterModalOpen}
        onClose={() => setIsImporterModalOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
