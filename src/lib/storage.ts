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
  const ym = `${currentYear}-${currentMonth}`;

  const txs: Transaction[] = [
    {
      id: 'tx-1',
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
      id: 'tx-2',
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
      id: 'tx-3',
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
      id: 'tx-4',
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
      id: 'tx-5',
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
      id: 'tx-6',
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
        id: `inst-${tx.id}-${i}`,
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

// STORAGE API
export const StorageService = {
  // Inicializa dados no LocalStorage se não existirem
  initLocalData() {
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
  },

  // Obter todos os cartões
  async getCards(userId?: string): Promise<Card[]> {
    if (isSupabaseConfigured && supabase && userId) {
      const { data, error } = await supabase.from('cards').select('*').eq('user_id', userId).order('created_at', { ascending: true });
      if (!error && data) return data as Card[];
    }
    this.initLocalData();
    const raw = localStorage.getItem(STORAGE_KEYS.CARDS);
    return raw ? JSON.parse(raw) : INITIAL_CARDS;
  },

  // Salvar ou atualizar cartão
  async saveCard(card: Card, userId?: string): Promise<Card> {
    if (isSupabaseConfigured && supabase && userId) {
      const { data, error } = await supabase.from('cards').upsert({ ...card, user_id: userId }).select().single();
      if (!error && data) return data as Card;
    }
    this.initLocalData();
    const cards = await this.getCards();
    const idx = cards.findIndex(c => c.id === card.id);
    if (idx >= 0) {
      cards[idx] = card;
    } else {
      cards.push(card);
    }
    localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
    return card;
  },

  // Deletar cartão
  async deleteCard(cardId: string, userId?: string): Promise<void> {
    if (isSupabaseConfigured && supabase && userId) {
      await supabase.from('cards').delete().eq('id', cardId).eq('user_id', userId);
    }
    this.initLocalData();
    const cards = (await this.getCards()).filter(c => c.id !== cardId);
    localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
  },

  // Obter transações
  async getTransactions(userId?: string): Promise<Transaction[]> {
    if (isSupabaseConfigured && supabase && userId) {
      const { data, error } = await supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false });
      if (!error && data) return data as Transaction[];
    }
    this.initLocalData();
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return raw ? JSON.parse(raw) : [];
  },

  // Salvar nova transação e desmembrar em parcelas
  async createTransaction(tx: Omit<Transaction, 'id' | 'user_id' | 'created_at'>, cards: Card[], userId?: string): Promise<Transaction> {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      user_id: userId || 'user-demo',
      created_at: new Date().toISOString(),
    };

    const card = cards.find(c => c.id === tx.card_id) || cards[0];
    const firstInvoiceMonth = calculateInvoiceMonth(tx.date, card.closing_day);
    const installmentAmount = +(tx.amount / tx.total_installments).toFixed(2);

    const newInstallments: Installment[] = [];
    for (let i = 1; i <= tx.total_installments; i++) {
      const invMonth = addMonthsToYM(firstInvoiceMonth, i - 1);
      const dueDate = calculateDueDate(invMonth, card.due_day);
      newInstallments.push({
        id: `inst-${newTx.id}-${i}`,
        transaction_id: newTx.id,
        user_id: newTx.user_id,
        card_id: newTx.card_id,
        installment_number: i,
        total_installments: newTx.total_installments,
        amount: i === tx.total_installments 
          ? +(tx.amount - (installmentAmount * (tx.total_installments - 1))).toFixed(2)
          : installmentAmount,
        due_date: dueDate,
        invoice_month: invMonth,
        status: 'pending',
        description: newTx.description,
        category_id: newTx.category_id,
      });
    }

    if (isSupabaseConfigured && supabase && userId) {
      await supabase.from('transactions').insert(newTx);
      await supabase.from('installments').insert(newInstallments);
      return newTx;
    }

    this.initLocalData();
    const txs = await this.getTransactions();
    txs.unshift(newTx);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));

    const currentInstallments = await this.getInstallments();
    const mergedInstallments = [...currentInstallments, ...newInstallments];
    localStorage.setItem(STORAGE_KEYS.INSTALLMENTS, JSON.stringify(mergedInstallments));

    return newTx;
  },

  // Deletar transação e suas parcelas
  async deleteTransaction(txId: string, userId?: string): Promise<void> {
    if (isSupabaseConfigured && supabase && userId) {
      await supabase.from('transactions').delete().eq('id', txId).eq('user_id', userId);
      await supabase.from('installments').delete().eq('transaction_id', txId).eq('user_id', userId);
    }
    this.initLocalData();
    const txs = (await this.getTransactions()).filter(t => t.id !== txId);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));

    const installments = (await this.getInstallments()).filter(inst => inst.transaction_id !== txId);
    localStorage.setItem(STORAGE_KEYS.INSTALLMENTS, JSON.stringify(installments));
  },

  // Obter parcelas
  async getInstallments(userId?: string): Promise<Installment[]> {
    if (isSupabaseConfigured && supabase && userId) {
      const { data, error } = await supabase.from('installments').select('*').eq('user_id', userId).order('due_date', { ascending: true });
      if (!error && data) return data as Installment[];
    }
    this.initLocalData();
    const raw = localStorage.getItem(STORAGE_KEYS.INSTALLMENTS);
    return raw ? JSON.parse(raw) : [];
  },

  // Obter faturas
  async getInvoices(userId?: string): Promise<Invoice[]> {
    if (isSupabaseConfigured && supabase && userId) {
      const { data, error } = await supabase.from('invoices').select('*').eq('user_id', userId);
      if (!error && data) return data as Invoice[];
    }
    this.initLocalData();
    const raw = localStorage.getItem(STORAGE_KEYS.INVOICES);
    return raw ? JSON.parse(raw) : [];
  },

  // Pagar ou alterar status de fatura
  async setInvoicePaid(cardId: string, month: string, paid: boolean, userId?: string): Promise<void> {
    const status = paid ? 'paid' : 'open';
    const paid_at = paid ? new Date().toISOString() : null;

    if (isSupabaseConfigured && supabase && userId) {
      await supabase.from('invoices').upsert({
        card_id: cardId,
        month,
        user_id: userId,
        status,
        paid_at,
      }, { onConflict: 'user_id, card_id, month' });

      // Atualizar status das parcelas daquela fatura
      await supabase.from('installments')
        .update({ status: paid ? 'paid' : 'pending' })
        .eq('card_id', cardId)
        .eq('invoice_month', month)
        .eq('user_id', userId);
    }

    this.initLocalData();
    const invoices = await this.getInvoices();
    const idx = invoices.findIndex(inv => inv.card_id === cardId && inv.month === month);
    if (idx >= 0) {
      invoices[idx].status = status;
      invoices[idx].paid_at = paid_at;
    } else {
      invoices.push({
        id: `inv-${cardId}-${month}`,
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

    // Atualizar parcelas locais
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
    if (isSupabaseConfigured && supabase && userId) {
      const { data, error } = await supabase.from('categories').select('*').or(`user_id.is.null,user_id.eq.${userId}`);
      if (!error && data && data.length > 0) return data as Category[];
    }
    this.initLocalData();
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return raw ? JSON.parse(raw) : DEFAULT_CATEGORIES;
  },

  // Resetar para dados de demonstração
  resetToDemo() {
    localStorage.removeItem(STORAGE_KEYS.CARDS);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.INSTALLMENTS);
    localStorage.removeItem(STORAGE_KEYS.INVOICES);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    this.initLocalData();
  }
};
