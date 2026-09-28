-- SCHEMA DO SUPABASE POSTGRESQL PARA CONTROLE DE CARTÕES E FATURAS (MONERIX CLONE)
-- Execute este script no SQL Editor do seu projeto Supabase

-- 1. Habilitar extensões
create extension if not exists "uuid-ossp";

-- 2. Tabela de Perfis de Usuário
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  currency text default 'BRL',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Tabela de Cartões de Crédito
create table if not exists public.cards (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,                      -- Ex: 'Nubank Ultravioleta'
  bank text not null,                      -- Ex: 'Nubank', 'Itaú', 'Inter', 'C6', 'XP', 'Bradesco'
  last_four text default '****',           -- Ex: '4589'
  brand text default 'Mastercard',         -- 'Mastercard', 'Visa', 'Elo', 'Amex'
  color_gradient text not null,            -- Classe ou CSS do gradiente do cartão
  total_limit numeric(12, 2) not null,     -- Ex: 10000.00
  closing_day integer not null check (closing_day >= 1 and closing_day <= 31), -- Dia de fechamento
  due_day integer not null check (due_day >= 1 and due_day <= 31),             -- Dia de vencimento
  archived boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Tabela de Categorias
create table if not exists public.categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade, -- null se for categoria global do sistema
  name text not null,
  icon text not null default 'Tag',
  color text not null default '#3b82f6',
  is_default boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Tabela de Transações / Compras
create table if not exists public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  card_id uuid references public.cards on delete cascade not null,
  category_id text, -- ID da categoria ou nome
  description text not null,               -- Ex: 'iFood', 'Mercado Livre', 'Supermercado'
  amount numeric(12, 2) not null,          -- Valor total da compra
  date date not null,                      -- Data da compra
  total_installments integer default 1 check (total_installments >= 1), -- Quantidade de parcelas
  notes text,
  tags text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Tabela de Parcelas Projetadas (Installments)
create table if not exists public.installments (
  id uuid default gen_random_uuid() primary key,
  transaction_id uuid references public.transactions on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  card_id uuid references public.cards on delete cascade not null,
  installment_number integer not null,     -- Ex: 1, 2, 3...
  total_installments integer not null,     -- Ex: 10
  amount numeric(12, 2) not null,          -- Valor da parcela individual
  due_date date not null,                  -- Data de vencimento estimada
  invoice_month text not null,             -- Ex: '2026-04' (ano e mês da fatura)
  status text default 'pending' check (status in ('pending', 'paid')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Tabela de Faturas (Invoices)
create table if not exists public.invoices (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  card_id uuid references public.cards on delete cascade not null,
  month text not null,                     -- Ex: '2026-04'
  closing_date date not null,
  due_date date not null,
  total_amount numeric(12, 2) default 0.00,
  status text default 'open' check (status in ('open', 'closed', 'paid')),
  paid_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, card_id, month)
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) - Garante isolamento absoluto entre cada usuário
-- =========================================================================

alter table public.profiles enable row level security;
alter table public.cards enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.installments enable row level security;
alter table public.invoices enable row level security;

-- Políticas para profiles
create policy "Usuários podem ver seu próprio perfil" on public.profiles
  for select using (auth.uid() = id);

create policy "Usuários podem atualizar seu próprio perfil" on public.profiles
  for update using (auth.uid() = id);

-- Políticas para cards
create policy "Usuários gerenciam apenas seus próprios cartões" on public.cards
  for all using (auth.uid() = user_id);

-- Políticas para categories
create policy "Usuários veem categorias globais e as suas próprias" on public.categories
  for select using (user_id is null or auth.uid() = user_id);

create policy "Usuários criam/editam suas próprias categorias" on public.categories
  for all using (auth.uid() = user_id);

-- Políticas para transactions
create policy "Usuários gerenciam apenas suas próprias transações" on public.transactions
  for all using (auth.uid() = user_id);

-- Políticas para installments
create policy "Usuários gerenciam apenas suas próprias parcelas" on public.installments
  for all using (auth.uid() = user_id);

-- Políticas para invoices
create policy "Usuários gerenciam apenas suas próprias faturas" on public.invoices
  for all using (auth.uid() = user_id);

-- =========================================================================
-- TRIGGER: Criação automática de perfil ao cadastrar usuário no Supabase Auth
-- =========================================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger disparado após inserção na auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
