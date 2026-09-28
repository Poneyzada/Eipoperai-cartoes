import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ExtractedTransaction } from "../types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formatação de Moeda Brasileira BRL
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value || 0);
}

// Formatar data YYYY-MM-DD para DD/MM/AAAA
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  if (!year || !month || !day) return dateString;
  return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
}

// Formatar mês YYYY-MM para "Setembro / 2026"
export function formatMonthYear(ym: string): string {
  if (!ym) return '';
  const [yearStr, monthStr] = ym.split('-');
  const month = parseInt(monthStr, 10) - 1;
  const year = parseInt(yearStr, 10);
  const date = new Date(year, month, 1);
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

// Obter YYYY-MM atual
export function getCurrentInvoiceMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

// Obter lista de próximos N meses a partir de um mês YYYY-MM
export function getNextMonths(startYM: string, count: number): string[] {
  const [yearStr, monthStr] = startYM.split('-');
  let y = parseInt(yearStr, 10);
  let m = parseInt(monthStr, 10); // 1-12

  const months: string[] = [];
  for (let i = 0; i < count; i++) {
    months.push(`${y}-${String(m).padStart(2, '0')}`);
    m++;
    if (m > 12) {
      m = 1;
      y++;
    }
  }
  return months;
}

// Adicionar N meses a uma string YYYY-MM
export function addMonthsToYM(ym: string, monthsToAdd: number): string {
  const [yearStr, monthStr] = ym.split('-');
  let y = parseInt(yearStr, 10);
  let m = parseInt(monthStr, 10) + monthsToAdd;

  while (m > 12) {
    m -= 12;
    y += 1;
  }
  while (m < 1) {
    m += 12;
    y -= 1;
  }
  return `${y}-${String(m).padStart(2, '0')}`;
}

// Calcular em qual mês de fatura (YYYY-MM) uma compra cai com base no dia de fechamento
export function calculateInvoiceMonth(purchaseDateStr: string, closingDay: number): string {
  const [yearStr, monthStr, dayStr] = purchaseDateStr.split('-');
  let y = parseInt(yearStr, 10);
  let m = parseInt(monthStr, 10);
  const d = parseInt(dayStr, 10);

  // Se o dia da compra for igual ou maior que o dia de fechamento, cai na fatura do mês seguinte
  if (d >= closingDay) {
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }

  return `${y}-${String(m).padStart(2, '0')}`;
}

// Calcular a data exata de vencimento para uma fatura
export function calculateDueDate(invoiceMonth: string, dueDay: number): string {
  const [yearStr, monthStr] = invoiceMonth.split('-');
  const y = parseInt(yearStr, 10);
  const m = parseInt(monthStr, 10);

  // Garantir que o dia não passe do último dia do mês (ex: 31 em fevereiro)
  const lastDayOfMonth = new Date(y, m, 0).getDate();
  const safeDay = Math.min(dueDay, lastDayOfMonth);

  return `${y}-${String(m).padStart(2, '0')}-${String(safeDay).padStart(2, '0')}`;
}

// Calcular data de fechamento para uma fatura
export function calculateClosingDate(invoiceMonth: string, closingDay: number): string {
  const [yearStr, monthStr] = invoiceMonth.split('-');
  const y = parseInt(yearStr, 10);
  const m = parseInt(monthStr, 10);

  const lastDayOfMonth = new Date(y, m, 0).getDate();
  const safeDay = Math.min(closingDay, lastDayOfMonth);

  return `${y}-${String(m).padStart(2, '0')}-${String(safeDay).padStart(2, '0')}`;
}

// Calcular o melhor dia de compra (geralmente é o próprio dia do fechamento ou 1 dia após)
export function getBestBuyDay(closingDay: number): number {
  return closingDay;
}

// Categorização preditiva baseada em inteligência de palavras-chave (estilo Monerix)
export function categorizeByDescription(desc: string): string {
  const text = desc.toLowerCase();

  if (/ifood|rappi|mcdonald|burger|bk|habib|pizz|restaurante|bar |lanch|churrasc|subway|padaria|pastel|acai|açaí|café|starbucks/i.test(text)) {
    return 'Alimentação & Delivery';
  }
  if (/uber|99app|99\*|táxi|taxi|posto|gasolina|etanol|combustiv|shell|ipiranga|petrobras|estacionamento|pedagio|sem parar|veloe|auto posto/i.test(text)) {
    return 'Transporte & Combustível';
  }
  if (/mercado|supermercado|carrefour|pao de acucar|pão de açúcar|assai|assaí|atacadao|atacadão|dia%|swift|hortifruti|oxxo/i.test(text)) {
    return 'Supermercado';
  }
  if (/netflix|spotify|amazon prime|disney|hbo|max|youtube\*|apple\.com|google\*|deezer|globo|paramount|crunchyroll|adobe|openai|chatgpt/i.test(text)) {
    return 'Assinaturas & Streaming';
  }
  if (/drogasil|droga raia|farmacia|farmácia|panvel|pague menos|drogaria|consulta|medico|médico|dentista|hospital|laboratorio|exame/i.test(text)) {
    return 'Saúde & Farmácia';
  }
  if (/steam|playstation|sony|xbox|nintendo|cinema|cinemark|ingresso|show|teatro|sympla|eventim|airbnb|booking|hotel|viagem|decolar|gol |latam|azul/i.test(text)) {
    return 'Lazer & Viagens';
  }
  if (/shopee|mercado livre|mercadolivre|amazon|shein|magalu|magazine|casas bahia|aliexpress|zara|renner|riachuelo|c&a|kabum|pichau|terabyte|nike|adidas/i.test(text)) {
    return 'Compras & Eletrônicos';
  }
  if (/enel|cpfl|sabesp|copel|cemig|claro|vivo|tim|oi|internet|condominio|condomínio|aluguel|iptu|ipva|seguro/i.test(text)) {
    return 'Contas & Moradia';
  }
  if (/curso|faculdade|universidade|escola|udemy|alura|hotmart|kiwify|livro|saraiva/i.test(text)) {
    return 'Educação';
  }

  return 'Outros';
}

// Extrator inteligente de extratos colados em texto ou CSV (estilo Monerix)
export function parseStatementText(rawText: string): ExtractedTransaction[] {
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  const results: ExtractedTransaction[] = [];
  const now = new Date();
  const currentYear = now.getFullYear();

  // Mapeamento de meses em pt-br
  const monthMap: Record<string, string> = {
    'jan': '01', 'fev': '02', 'mar': '03', 'abr': '04', 'mai': '05', 'jun': '06',
    'jul': '07', 'ago': '08', 'set': '09', 'out': '10', 'nov': '11', 'dez': '12'
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Ignorar cabeçalhos comuns ou linhas irrelevantes
    if (/data.*descricao.*valor|saldo|pagamento recebido|limite disponivel/i.test(line)) {
      continue;
    }

    // Tentar identificar valor na linha: R$ 45,90 ou 45,90 ou 1.250,00
    // Aceita também formatos com vírgula ou ponto
    const valueMatch = line.match(/(?:R\$\s*)?([0-9]{1,3}(?:\.[0-9]{3})*,\s*[0-9]{2}|[0-9]+,[0-9]{2}|[0-9]+\.[0-9]{2})/);
    if (!valueMatch) continue;

    const rawValueStr = valueMatch[1].replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
    const amount = parseFloat(rawValueStr);
    if (isNaN(amount) || amount <= 0) continue;

    // Tentar identificar data: DD/MM/YYYY, DD/MM, ou "05 SET"
    let parsedDate = `${currentYear}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // Teste 1: DD/MM/AAAA ou DD/MM
    const dateMatch1 = line.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/);
    if (dateMatch1) {
      const day = dateMatch1[1].padStart(2, '0');
      const month = dateMatch1[2].padStart(2, '0');
      let year = dateMatch1[3] ? parseInt(dateMatch1[3], 10) : currentYear;
      if (year < 100) year += 2000;
      parsedDate = `${year}-${month}-${day}`;
    } else {
      // Teste 2: "05 SET" ou "12 DEZ"
      const dateMatch2 = line.match(/(\d{1,2})\s+([a-zA-Z]{3})/);
      if (dateMatch2) {
        const day = dateMatch2[1].padStart(2, '0');
        const monthKey = dateMatch2[2].toLowerCase();
        const month = monthMap[monthKey] || String(now.getMonth() + 1).padStart(2, '0');
        parsedDate = `${currentYear}-${month}-${day}`;
      }
    }

    // Extrair descrição removendo data e valor
    let desc = line
      .replace(valueMatch[0], '')
      .replace(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/, '')
      .replace(/(\d{1,2})\s+([a-zA-Z]{3})/, '')
      .replace(/[•\-\*\|]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!desc || desc.length < 2) {
      desc = 'Compra no Cartão';
    }

    const category = categorizeByDescription(desc);

    results.push({
      id: `extracted-${Date.now()}-${i}`,
      description: desc,
      amount,
      date: parsedDate,
      suggested_category: category,
      raw_line: line,
      selected: true,
    });
  }

  return results;
}
