import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Card, Category, Installment, Invoice, Transaction, ExtractedTransaction } from '../types';
import { StorageService } from '../lib/storage';
import { useAuth } from './useAuth';
import { getCurrentInvoiceMonth, getBestBuyDay, calculateInvoiceMonth, addMonthsToYM, calculateDueDate } from '../lib/utils';
import confetti from 'canvas-confetti';

interface AppContextType {
  cards: Card[];
  transactions: Transaction[];
  installments: Installment[];
  invoices: Invoice[];
  categories: Category[];
  selectedCardId: string; // 'all' or card.id
  setSelectedCardId: (id: string) => void;
  selectedMonth: string;  // 'YYYY-MM'
  setSelectedMonth: (m: string) => void;
  loading: boolean;
  
  // Ações
  saveCard: (card: Omit<Card, 'id' | 'user_id' | 'created_at'> & { id?: string }) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  createTransaction: (tx: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  toggleInvoicePayment: (cardId: string, month: string) => Promise<void>;
  importTransactions: (cardId: string, items: ExtractedTransaction[]) => Promise<void>;
  resetToDemoData: () => Promise<void>;
  refresh: () => Promise<void>;

  // Métricas Computadas
  totalLimit: number;
  totalUsedLimit: number;
  totalAvailableLimit: number;
  currentMonthTotal: number;
  nextMonthTotal: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cardsRaw, setCardsRaw] = useState<Card[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentInvoiceMonth());
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [c, t, inst, inv, cat] = await Promise.all([
        StorageService.getCards(user?.id),
        StorageService.getTransactions(user?.id),
        StorageService.getInstallments(user?.id),
        StorageService.getInvoices(user?.id),
        StorageService.getCategories(user?.id),
      ]);
      setCardsRaw(c);
      setTransactions(t);
      setInstallments(inst);
      setInvoices(inv);
      setCategories(cat);
    } catch (e) {
      console.error('Error loading app data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  // Enriquecer os cartões com os limites utilizados e disponíveis calculados
  const cards = useMemo(() => {
    return cardsRaw.map(card => {
      // O limite comprometido inclui todas as parcelas pendentes daquele cartão
      const pendingInstallments = installments.filter(
        inst => inst.card_id === card.id && inst.status === 'pending'
      );
      const usedLimit = pendingInstallments.reduce((acc, curr) => acc + curr.amount, 0);
      const availableLimit = Math.max(0, card.total_limit - usedLimit);
      const bestBuyDay = getBestBuyDay(card.closing_day);

      return {
        ...card,
        used_limit: usedLimit,
        available_limit: availableLimit,
        best_buy_day: bestBuyDay,
      };
    });
  }, [cardsRaw, installments]);

  // Cálculos Consolidados
  const totalLimit = useMemo(() => {
    const activeCards = selectedCardId === 'all' 
      ? cards 
      : cards.filter(c => c.id === selectedCardId);
    return activeCards.reduce((acc, c) => acc + c.total_limit, 0);
  }, [cards, selectedCardId]);

  const totalUsedLimit = useMemo(() => {
    const activeCards = selectedCardId === 'all' 
      ? cards 
      : cards.filter(c => c.id === selectedCardId);
    return activeCards.reduce((acc, c) => acc + (c.used_limit || 0), 0);
  }, [cards, selectedCardId]);

  const totalAvailableLimit = useMemo(() => {
    return Math.max(0, totalLimit - totalUsedLimit);
  }, [totalLimit, totalUsedLimit]);

  // Total da fatura do mês selecionado
  const currentMonthTotal = useMemo(() => {
    return installments
      .filter(inst => {
        const matchesMonth = inst.invoice_month === selectedMonth;
        const matchesCard = selectedCardId === 'all' || inst.card_id === selectedCardId;
        return matchesMonth && matchesCard;
      })
      .reduce((acc, inst) => acc + inst.amount, 0);
  }, [installments, selectedMonth, selectedCardId]);

  // Total da fatura do próximo mês (projeção imediata)
  const nextMonthTotal = useMemo(() => {
    const nextYM = addMonthsToYM(selectedMonth, 1);
    return installments
      .filter(inst => {
        const matchesMonth = inst.invoice_month === nextYM;
        const matchesCard = selectedCardId === 'all' || inst.card_id === selectedCardId;
        return matchesMonth && matchesCard;
      })
      .reduce((acc, inst) => acc + inst.amount, 0);
  }, [installments, selectedMonth, selectedCardId]);

  // Operações
  const saveCard = async (cardData: Omit<Card, 'id' | 'user_id' | 'created_at'> & { id?: string }) => {
    const fullCard: Card = {
      ...cardData,
      id: cardData.id || `card-${Date.now()}`,
      user_id: user?.id || 'user-demo',
      created_at: new Date().toISOString(),
    };
    await StorageService.saveCard(fullCard, user?.id);
    await loadData();
  };

  const deleteCard = async (id: string) => {
    await StorageService.deleteCard(id, user?.id);
    if (selectedCardId === id) setSelectedCardId('all');
    await loadData();
  };

  const createTransaction = async (txData: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => {
    const card = cardsRaw.find(c => c.id === txData.card_id) || cardsRaw[0];
    const closingDay = card ? card.closing_day : 10;
    const invoiceMonth = calculateInvoiceMonth(txData.date, closingDay);

    await StorageService.createTransaction(txData, cardsRaw, user?.id);
    setSelectedMonth(invoiceMonth);
    await loadData();
  };

  const deleteTransaction = async (id: string) => {
    await StorageService.deleteTransaction(id, user?.id);
    await loadData();
  };

  const toggleInvoicePayment = async (cardId: string, month: string) => {
    const existingInv = invoices.find(i => i.card_id === cardId && i.month === month);
    const isCurrentlyPaid = existingInv?.status === 'paid';
    const newPaidStatus = !isCurrentlyPaid;

    await StorageService.setInvoicePaid(cardId, month, newPaidStatus, user?.id);

    if (newPaidStatus) {
      // Efeito de confete ao pagar fatura
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Ignorar se não suportado
      }
    }
    await loadData();
  };

  const importTransactions = async (cardId: string, items: ExtractedTransaction[]) => {
    const selectedItems = items.filter(e => e.selected);
    if (selectedItems.length === 0) return;

    // Se o cartão passado não existir, pega o primeiro cartão válido
    const effectiveCardId = (cardId && cardsRaw.some(c => c.id === cardId))
      ? cardId
      : (cardsRaw[0]?.id || 'card-nubank');

    const txInputs = selectedItems.map(item => {
      const cat = categories.find(c => c.name.toLowerCase() === item.suggested_category.toLowerCase()) || categories[0];
      return {
        card_id: effectiveCardId,
        description: item.description,
        amount: item.amount,
        date: item.date,
        total_installments: 1,
        category_id: cat?.id || 'cat-9',
        notes: 'Importado de extrato',
      };
    });

    const result = await StorageService.createTransactionsBatch(txInputs, cardsRaw, user?.id);

    // Mudar imediatamente para o mês onde caíram os lançamentos
    if (result.primaryInvoiceMonth) {
      setSelectedMonth(result.primaryInvoiceMonth);
    }

    // Confetes de comemoração
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (e) {
      // Ignorar se não suportado
    }

    await loadData();
  };

  const resetToDemoData = async () => {
    StorageService.resetToDemo();
    await loadData();
  };

  return (
    <AppContext.Provider value={{
      cards,
      transactions,
      installments,
      invoices,
      categories,
      selectedCardId,
      setSelectedCardId,
      selectedMonth,
      setSelectedMonth,
      loading,
      saveCard,
      deleteCard,
      createTransaction,
      deleteTransaction,
      toggleInvoicePayment,
      importTransactions,
      resetToDemoData,
      refresh: loadData,
      totalLimit,
      totalUsedLimit,
      totalAvailableLimit,
      currentMonthTotal,
      nextMonthTotal,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
