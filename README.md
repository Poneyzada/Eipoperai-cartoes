# Monerix Card PWA 💳

Gerenciador inteligente de múltiplos cartões de crédito, controle de faturas, projeção de compras parceladas e categorização automática de extratos bancários (inspirado no aplicativo **Monerix** demonstrado por **Enzo Barbatto**).

---

## 🚀 Funcionalidades

- **📱 PWA 100% Instalável (Mobile First):** Funciona como app nativo no celular (Android e iOS) ou computador, com suporte offline, ícones e tela cheia.
- **💳 Gestão Multi-Cartão:** Cadastro de múltiplos cartões (Nubank, Inter, Itaú, C6, XP, Bradesco, Santander, BTG) com visual 3D realista, chip, gradiente oficial e bandeiras.
- **🎯 Regra do Melhor Dia de Compra:** Cálculo dinâmico das datas de fechamento e vencimento de fatura, indicando o melhor dia para comprar e ganhar até 40 dias de prazo.
- **📊 Projeção de Parcelamentos Futuros:** Ao lançar uma compra parcelada (ex: 10x de R$ 120,00), o app projeta e distribui automaticamente as parcelas nos meses seguintes. Gráfico visual de barras dos próximos 6 a 12 meses.
- **✨ Importador de Extrato Inteligente (Monerix):** Cole o texto da fatura copiado do app do seu banco ou extrato. O algoritmo identifica automaticamente data, estabelecimento, valor em R$ e sugere a categoria por palavras-chave em lote.
- **🔐 Autenticação & Nuvem (Supabase + PostgreSQL):** Pronto para uso com amigos! Cada usuário possui seus próprios cartões e faturas isolados por **Row Level Security (RLS)**.
- **⚡ Modo Local / Offline:** Funciona imediatamente sem depender de cadastro inicial, já carregando dados de demonstração realistas.

---

## 🛠️ Como Rodar o Projeto

1. Certifique-se de ter o **Node.js** instalado.
2. Na pasta do projeto, execute:
```bash
npm install
npm run dev
```
3. Abra o navegador no endereço exibido (geralmente `http://localhost:5173`).

---

## 📲 Como Instalar no Celular (PWA)

- **Android (Chrome):** Acesse a URL do app, clique no banner *"Instale o Monerix no seu Celular"* ou no menu de 3 pontos do Chrome e selecione **"Adicionar à tela inicial"** ou **"Instalar aplicativo"**.
- **iPhone (Safari):** Abra o link no Safari, toque no botão de compartilhar (ícone com a seta para cima) e selecione **"Adicionar à Tela de Início"**.

---

## 🗄️ Como Conectar ao Supabase (PostgreSQL) para Multi-Usuário

Se você e seus amigos forem usar juntos na nuvem:

1. Crie uma conta gratuita em [supabase.com](https://supabase.com) e crie um novo projeto.
2. No menu lateral do Supabase, clique em **SQL Editor** > **New Query**.
3. Copie o conteúdo do arquivo [`supabase/schema.sql`](./supabase/schema.sql) e clique em **Run**. Ele criará todas as tabelas e políticas de segurança (RLS).
4. No Supabase, vá em **Project Settings** > **API** e copie:
   - **Project URL**
   - **anon public key**
5. Abra o arquivo `.env` deste projeto e preencha:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```
6. Pronto! Agora o botão *"Entrar / Criar Conta"* sincronizará os dados com o seu banco de dados PostgreSQL.
