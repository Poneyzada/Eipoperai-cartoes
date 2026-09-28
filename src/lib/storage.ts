import { Card, Category, Installment, Invoice, Transaction } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';
import { calculateInvoiceMonth, calculateDueDate, calculateClosingDate, addMonthsToYM } from './utils';

const STORAGE_KEYS = {
  CARDS: 'eipoperai_cards',
  TRANSACTIONS: 'eipoperai_transactions',
  INSTALLMENTS: 'eipoperai_installments',
  INVOICES: 'eipoperai_invoices',
  CATEGORIES: 'eipoperai_categories',
  DEMO_MODE: 'eipoperai_demo_mode',
};

// Validador de formato UUID v4 do PostgreSQL
export function isValidUUID(str?: string): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

// Gerador confiável de UUID v4 (compatível com navegadores antigos e mobile)
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch (e) {
      // fallback
    }
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Alimentação & Delivery', icon: 'UtensilsCrossed', color: '#f59e0b', is_default: true },
  { id: 'cat-2', name: 'Supermercado', icon: 'ShoppingCart', color: '#10b981', is_default: true },
  { id: 'cat-3', name: 'Transporte & Combustível', icon: 'Car', color: '#3b82f6', is_default: true },
  { id: 'cat-4', name: 'Assinaturas & Streaming', icon: 'Tv', color: '#8b5cf6', is_default: true },
  { id: 'cat-5', name: 'Compras & Eletrônicos', icon: 'ShoppingBag', color: '#ec4899', is_default: true },
  { id: 'cat-6', name: 'Lazer & Viagens', icon: 'Plane', color: '#06b6d4', is_default: true },
  { id: 'cat-7', name: 'Saúde & Farmácia', icon: 'HeartPulse', color: '#ef4444', is_default: true },
  { id: 'cat-8', name: 'Contas & Moradia', icon: 'Home', color: '#64748b', is_default: true },
  { id: 'cat-9', name: 'Outros', icon: 'Tag', color: '#94a3b8', is_default: true },
];

export const INITIAL_CARDS: Card[] = [
  {
    id: 'card-nubank',
    user_id: 'user-demo',
    name: 'Nubank Ultravioleta',
    bank: 'Nubank',
    last_four: '8942',
    brand: 'Mastercard',
    color_gradient: 'from-purple-900 via-indigo-950 to-purple-800',
    total_limit: 15000,
    closing_day: 10,
    due_day: 17,
    created_at: new Date().toISOString(),
  },
  {
    id: 'card-inter',
    user_id: 'user-demo',
    name: 'Inter Black Win',
    bank: 'Inter',
    last_four: '3109',
    brand: 'Mastercard',
    color_gradient: 'from-amber-600 via-orange-700 to-stone-900',
    total_limit: 8500,
    closing_day: 20,
    due_day: 27,
    created_at: new Date().toISOString(),
  },
  {
    id: 'card-itau',
    user_id: 'user-demo',
    name: 'Itaú Personnalité',
    bank: 'Itaú',
    last_four: '7721',
    brand: 'Visa',
    color_gradient: 'from-slate-900 via-blue-950 to-amber-950',
    total_limit: 22000,
    closing_day: 5,
    due_day: 12,
    created_at: new Date().toISOString(),
  },
];

// Gerar sementes de transações realistas
function generateInitialTransactions(): { transactions: Transaction[]; installments: Installment[] } {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0');

  const txs: Transaction[] = [
    {
      id: generateUUID(),
      user_id: 'user-demo',
      card_id: 'card-nubank',
      category_id: 'cat-5',
      description: 'Notebook Dell XPS',
      amount: 6999.00,
      date: `${currentYear}-${currentMonth}-02`,
      total_installments: 10,
      notes: 'Trabalho e programação',
      created_at: new Date().toISOString(),
    },
    {
      id: generateUUID(),
      user_id: 'user-demo',
      card_id: 'card-nubank',
      category_id: 'cat-1',
      description: 'iFood - Coco Bambu',
      amount: 189.50,
      date: `${currentYear}-${currentMonth}-04`,
      total_installments: 1,
      notes: 'Jantar família',
      created_at: new Date().toISOString(),
    },
    {
      id: generateUUID(),
      user_id: 'user-demo',
      card_id: 'card-inter',
      category_id: 'cat-2',
      description: 'Supermercado Pão de Açúcar',
      amount: 540.30,
      date: `${currentYear}-${currentMonth}-03`,
      total_installments: 1,
      created_at: new Date().toISOString(),
    },
    {
      id: generateUUID(),
      user_id: 'user-demo',
      card_id: 'card-inter',
      category_id: 'cat-3',
      description: 'Posto Ipiranga Combustível',
      amount: 245.00,
      date: `${currentYear}-${currentMonth}-05`,
      total_installments: 1,
      created_at: new Date().toISOString(),
    },
    {
      id: generateUUID(),
      user_id: 'user-demo',
      card_id: 'card-itau',
      category_id: 'cat-6',
      description: 'Passagens Aéreas LATAM',
      amount: 2400.00,
      date: `${currentYear}-${currentMonth}-01`,
      total_installments: 6,
      created_at: new Date().toISOString(),
    },
    {
      id: generateUUID(),
      user_id: 'user-demo',
      card_id: 'card-nubank',
      category_id: 'cat-4',
      description: 'Netflix + Spotify + YouTube Premium',
      amount: 109.70,
      date: `${currentYear}-${currentMonth}-06`,
      total_installments: 1,
      created_at: new Date().toISOString(),
    }
  ];

  const installments: Installment[] = [];

  txs.forEach(tx => {
    const card = INITIAL_CARDS.find(c => c.id === tx.card_id) || INITIAL_CARDS[0];
    const firstInvoiceMonth = calculateInvoiceMonth(tx.date, card.closing_day);
    const installmentAmount = +(tx.amount / tx.total_installments).toFixed(2);

    for (let i = 1; i <= tx.total_installments; i++) {
      const invMonth = addMonthsToYM(firstInvoiceMonth, i - 1);
      const dueDate = calculateDueDate(invMonth, card.due_day);
      installments.push({
        id: generateUUID(),
        transaction_id: tx.id,
        user_id: tx.user_id,
        card_id: tx.card_id,
        installment_number: i,
        total_installments: tx.total_installments,
        amount: i === tx.total_installments 
          ? +(tx.amount - (installmentAmount * (tx.total_installments - 1))).toFixed(2)
          : installmentAmount,
        due_date: dueDate,
        invoice_month: invMonth,
        status: 'pending',
        description: tx.description,
        category_id: tx.category_id,
      });
    }
  });

  return { transactions: txs, installments };
}

// STORAGE API COM SUPORTE HÍBRIDO (LOCALSTORAGE + SUPABASE RESILIENTE)
export const StorageService = {
  // Inicializa dados no LocalStorage se não existirem
  initLocalData() {
    try {
      if (!localStorage.getItem(STORAGE_KEYS.CARDS)) {
        localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(INITIAL_CARDS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
      }
      if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
        const initial = generateInitialTransactions();
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(initial.transactions));
        localStorage.setItem(STORAGE_KEYS.INSTALLMENTS, JSON.stringify(initial.installments));
      }
    } catch (e) {
      console.warn('LocalStorage access issue:', e);
    }
  },

  // Obter todos os cartões
  async getCards(userId?: string): Promise<Card[]> {
    // Se for usuário autenticado real do Supabase
    if (isSupabaseConfigured && supabase && isValidUUID(userId)) {
      try {
        const { data, error } = await supabase
          .from('cards')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: true });
        if (!error && data && data.length > 0) {
          localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(data));
          return data as Card[];
        }
      } catch (e) {
        console.warn('Supabase getCards fallback to local:', e);
      }
    }

    this.initLocalData();
    const raw = localStorage.getItem(STORAGE_KEYS.CARDS);
    return raw ? JSON.parse(raw) : INITIAL_CARDS;
  },

  // Salvar ou atualizar cartão
  async saveCard(card: Card, userId?: string): Promise<Card> {
    const isRealUser = isValidUUID(userId);
    const cardId = card.id || generateUUID();
    const safeCard: Card = {
      ...card,
      id: cardId,
      user_id: isRealUser ? userId! : 'user-demo',
      created_at: card.created_at || new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase && isRealUser && isValidUUID(safeCard.id)) {
      try {
        const { data, error } = await supabase
          .from('cards')
          .upsert(safeCard)
          .select()
          .single();
        if (error) {
          console.warn('Supabase saveCard warning:', error.message);
        }
      } catch (e) {
        console.warn('Supabase saveCard exception:', e);
      }
    }

    this.initLocalData();
    const cards = await this.getCards();
    const idx = cards.findIndex(c => c.id === safeCard.id);
    if (idx >= 0) {
      cards[idx] = safeCard;
    } else {
      cards.push(safeCard);
    }
    localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
    return safeCard;
  },

  // Deletar cartão
  async deleteCard(cardId: string, userId?: string): Promise<void> {
    if (isSupabaseConfigured && supabase && isValidUUID(userId) && isValidUUID(cardId)) {
      try {
        await supabase.from('cards').delete().eq('id', cardId).eq('user_id', userId);
      } catch (e) {
        console.warn('Supabase deleteCard error:', e);
      }
    }

    this.initLocalData();
    const cards = (await this.getCards()).filter(c => c.id !== cardId);
    localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));

    // Deletar transações e parcelas vinculadas a esse cartão
    const txs = (await this.getTransactions()).filter(t => t.card_id !== cardId);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));

    const installments = (await this.getInstallments()).filter(inst => inst.card_id !== cardId);
    localStorage.setItem(STORAGE_KEYS.INSTALLMENTS, JSON.stringify(installments));
  },

  // Obter transações
  async getTransactions(userId?: string): Promise<Transaction[]> {
    if (isSupabaseConfigured && supabase && isValidUUID(userId)) {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false });
        if (!error && data) {
          localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(data));
          return data as Transaction[];
        }
      } catch (e) {
        console.warn('Supabase getTransactions fallback:', e);
      }
    }

    this.initLocalData();
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return raw ? JSON.parse(raw) : [];
  },

  // Salvar nova transação e desmembrar em parcelas
  async createTransaction(
    tx: Omit<Transaction, 'id' | 'user_id' | 'created_at'>,
    cards: Card[],
    userId?: string
  ): Promise<Transaction> {
    const isRealUser = isValidUUID(userId);
    const txId = generateUUID();

    const card = cards.find(c => c.id === tx.card_id) || cards[0] || INITIAL_CARDS[0];
    const effectiveCardId = card ? card.id : tx.card_id;
    const closingDay = card ? card.closing_day : 10;
    const dueDay = card ? card.due_day : 17;

    const newTx: Transaction = {
      ...tx,
      id: txId,
      card_id: effectiveCardId,
      user_id: isRealUser ? userId! : 'user-demo',
      created_at: new Date().toISOString(),
    };

    const firstInvoiceMonth = calculateInvoiceMonth(newTx.date, closingDay);
    const installmentAmount = +(newTx.amount / newTx.total_installments).toFixed(2);

    const newInstallments: Installment[] = [];
    for (let i = 1; i <= newTx.total_installments; i++) {
      const invMonth = addMonthsToYM(firstInvoiceMonth, i - 1);
      const dueDate = calculateDueDate(invMonth, dueDay);
      newInstallments.push({
        id: generateUUID(),
        transaction_id: newTx.id,
        user_id: newTx.user_id,
        card_id: newTx.card_id,
        installment_number: i,
        total_installments: newTx.total_installments,
        amount: i === newTx.total_installments 
          ? +(newTx.amount - (installmentAmount * (newTx.total_installments - 1))).toFixed(2)
          : installmentAmount,
        due_date: dueDate,
        invoice_month: invMonth,
        status: 'pending',
        description: newTx.description,
        category_id: newTx.category_id,
      });
    }

    // Se for usuário real e cartão real no Supabase
    if (isSupabaseConfigured && supabase && isRealUser && isValidUUID(effectiveCardId)) {
      try {
        const { error: txErr } = await supabase.from('transactions').insert(newTx);
        if (!txErr) {
          await supabase.from('installments').insert(newInstallments);
        } else {
          console.warn('Supabase insert tx warning:', txErr.message);
        }
      } catch (e) {
        console.warn('Supabase insert tx exception:', e);
      }
    }

    // SEMPRE GRAVAR NO LOCALSTORAGE PARA NUNCA PERDER DADOS
    this.initLocalData();
    const txs = await this.getTransactions();
    txs.unshift(newTx);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));

    const currentInstallments = await this.getInstallments();
    const mergedInstallments = [...newInstallments, ...currentInstallments];
    localStorage.setItem(STORAGE_KEYS.INSTALLMENTS, JSON.stringify(mergedInstallments));

    return newTx;
  },

  // Salvar transações em LOTE (Importação de extratos super rápida e atômica)
  async createTransactionsBatch(
    items: Array<Omit<Transaction, 'id' | 'user_id' | 'created_at'>>,
    cards: Card[],
    userId?: string
  ): Promise<{ transactions: Transaction[]; installments: Installment[]; primaryInvoiceMonth: string }> {
    const isRealUser = isValidUUID(userId);
    const newTxs: Transaction[] = [];
    const allNewInstallments: Installment[] = [];
    const invoiceMonthsCount: Record<string, number> = {};

    for (const tx of items) {
      const txId = generateUUID();
      const card = cards.find(c => c.id === tx.card_id) || cards[0] || INITIAL_CARDS[0];
      const effectiveCardId = card ? card.id : tx.card_id;
      const closingDay = card ? card.closing_day : 10;
      const dueDay = card ? card.due_day : 17;

      const newTx: Transaction = {
        ...tx,
        id: txId,
        card_id: effectiveCardId,
        user_id: isRealUser ? userId! : 'user-demo',
        created_at: new Date().toISOString(),
      };

      const firstInvoiceMonth = calculateInvoiceMonth(newTx.date, closingDay);
      invoiceMonthsCount[firstInvoiceMonth] = (invoiceMonthsCount[firstInvoiceMonth] || 0) + 1;
      const installmentAmount = +(newTx.amount / newTx.total_installments).toFixed(2);

      for (let i = 1; i <= newTx.total_installments; i++) {
        const invMonth = addMonthsToYM(firstInvoiceMonth, i - 1);
        const dueDate = calculateDueDate(invMonth, dueDay);
        allNewInstallments.push({
          id: generateUUID(),
          transaction_id: newTx.id,
          user_id: newTx.user_id,
          card_id: newTx.card_id,
          installment_number: i,
          total_installments: newTx.total_installments,
          amount: i === newTx.total_installments 
            ? +(newTx.amount - (installmentAmount * (newTx.total_installments - 1))).toFixed(2)
            : installmentAmount,
          due_date: dueDate,
          invoice_month: invMonth,
          status: 'pending',
          description: newTx.description,
          category_id: newTx.category_id,
        });
      }

      newTxs.push(newTx);
    }

    // Identificar o mês de fatura onde caíram mais lançamentos
    let primaryInvoiceMonth = Object.keys(invoiceMonthsCount)[0] || '';
    let maxCount = 0;
    for (const [m, count] of Object.entries(invoiceMonthsCount)) {
      if (count > maxCount) {
        maxCount = count;
        primaryInvoiceMonth = m;
      }
    }

    // Tentativa no Supabase se usuário e cartão forem UUIDs válidos
    if (isSupabaseConfigured && supabase && isRealUser && newTxs.length > 0 && isValidUUID(newTxs[0].card_id)) {
      try {
        const { error: txsErr } = await supabase.from('transactions').insert(newTxs);
        if (!txsErr) {
          await supabase.from('installments').insert(allNewInstallments);
        } else {
          console.warn('Supabase batch insert warning:', txsErr.message);
        }
      } catch (e) {
        console.warn('Supabase batch insert exception:', e);
      }
    }

    // SEMPRE GRAVAR NO LOCALSTORAGE IMEDIATAMENTE
    this.initLocalData();
    const existingTxs = await this.getTransactions();
    const mergedTxs = [...newTxs, ...existingTxs];
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(mergedTxs));

    const existingInstallments = await this.getInstallments();
    const mergedInstallments = [...allNewInstallments, ...existingInstallments];
    localStorage.setItem(STORAGE_KEYS.INSTALLMENTS, JSON.stringify(mergedInstallments));

    return {
      transactions: newTxs,
      installments: allNewInstallments,
      primaryInvoiceMonth,
    };
  },

  // Deletar transação e suas parcelas
  async deleteTransaction(txId: string, userId?: string): Promise<void> {
    if (isSupabaseConfigured && supabase && isValidUUID(userId) && isValidUUID(txId)) {
      try {
        await supabase.from('transactions').delete().eq('id', txId).eq('user_id', userId);
        await supabase.from('installments').delete().eq('transaction_id', txId).eq('user_id', userId);
      } catch (e) {
        console.warn('Supabase deleteTransaction warning:', e);
      }
    }

    this.initLocalData();
    const txs = (await this.getTransactions()).filter(t => t.id !== txId);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));

    const installments = (await this.getInstallments()).filter(inst => inst.transaction_id !== txId);
    localStorage.setItem(STORAGE_KEYS.INSTALLMENTS, JSON.stringify(installments));
  },

  // Obter parcelas
  async getInstallments(userId?: string): Promise<Installment[]> {
    if (isSupabaseConfigured && supabase && isValidUUID(userId)) {
      try {
        const { data, error } = await supabase
          .from('installments')
          .select('*')
          .eq('user_id', userId)
          .order('due_date', { ascending: true });
        if (!error && data) {
          localStorage.setItem(STORAGE_KEYS.INSTALLMENTS, JSON.stringify(data));
          return data as Installment[];
        }
      } catch (e) {
        console.warn('Supabase getInstallments fallback:', e);
      }
    }

    this.initLocalData();
    const raw = localStorage.getItem(STORAGE_KEYS.INSTALLMENTS);
    return raw ? JSON.parse(raw) : [];
  },

  // Obter faturas
  async getInvoices(userId?: string): Promise<Invoice[]> {
    if (isSupabaseConfigured && supabase && isValidUUID(userId)) {
      try {
        const { data, error } = await supabase
          .from('invoices')
          .select('*')
          .eq('user_id', userId);
        if (!error && data) {
          localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(data));
          return data as Invoice[];
        }
      } catch (e) {
        console.warn('Supabase getInvoices fallback:', e);
      }
    }

    this.initLocalData();
    const raw = localStorage.getItem(STORAGE_KEYS.INVOICES);
    return raw ? JSON.parse(raw) : [];
  },

  // Pagar ou alterar status de fatura
  async setInvoicePaid(cardId: string, month: string, paid: boolean, userId?: string): Promise<void> {
    const status = paid ? 'paid' : 'open';
    const paid_at = paid ? new Date().toISOString() : null;

    if (isSupabaseConfigured && supabase && isValidUUID(userId) && isValidUUID(cardId)) {
      try {
        await supabase.from('invoices').upsert({
          card_id: cardId,
          month,
          user_id: userId,
          status,
          paid_at,
        }, { onConflict: 'user_id, card_id, month' });

        await supabase.from('installments')
          .update({ status: paid ? 'paid' : 'pending' })
          .eq('card_id', cardId)
          .eq('invoice_month', month)
          .eq('user_id', userId);
      } catch (e) {
        console.warn('Supabase setInvoicePaid warning:', e);
      }
    }

    this.initLocalData();
    const invoices = await this.getInvoices();
    const idx = invoices.findIndex(inv => inv.card_id === cardId && inv.month === month);
    if (idx >= 0) {
      invoices[idx].status = status;
      invoices[idx].paid_at = paid_at;
    } else {
      invoices.push({
        id: generateUUID(),
        user_id: userId || 'user-demo',
        card_id: cardId,
        month,
        closing_date: '',
        due_date: '',
        total_amount: 0,
        status,
        paid_at,
      });
    }
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));

    const installments = await this.getInstallments();
    installments.forEach(inst => {
      if (inst.card_id === cardId && inst.invoice_month === month) {
        inst.status = paid ? 'paid' : 'pending';
      }
    });
    localStorage.setItem(STORAGE_KEYS.INSTALLMENTS, JSON.stringify(installments));
  },

  // Obter categorias
  async getCategories(userId?: string): Promise<Category[]> {
    if (isSupabaseConfigured && supabase && isValidUUID(userId)) {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .or(`user_id.is.null,user_id.eq.${userId}`);
        if (!error && data && data.length > 0) {
          localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(data));
          return data as Category[];
        }
      } catch (e) {
        console.warn('Supabase getCategories fallback:', e);
      }
    }

    this.initLocalData();
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return raw ? JSON.parse(raw) : DEFAULT_CATEGORIES;
  },

  // Resetar para dados de demonstração
  resetToDemo() {
    try {
      localStorage.removeItem(STORAGE_KEYS.CARDS);
      localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
      localStorage.removeItem(STORAGE_KEYS.INSTALLMENTS);
      localStorage.removeItem(STORAGE_KEYS.INVOICES);
      localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
      this.initLocalData();
    } catch (e) {
      console.warn('Reset error:', e);
    }
  }
};
