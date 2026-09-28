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

// Categorização preditiva baseada em inteligência de palavras-chave brasileiras (estilo Monerix)
export function categorizeByDescription(desc: string): string {
  // Limpar prefixos comuns de maquininhas e adquirentes
  let text = desc
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove acentos para busca precisa
    .replace(/^(pag\*|pg\*|mp\*|stone\*|cielo\*|rede\*|sumup\*|getnet\*|dl\*|paypal\*)/gi, '')
    .trim();

  // 1. Alimentação & Delivery
  if (
    /ifood|rappi|ze delivery|ze\*|delivery|aiqfome|mcdonald|mc donald|burger king|burguer|burger|bk\b|habib|subway|bobs|popeyes|kfc|giraffas|spoleto|outback|coco bambu|madero|paris 6|restaurante|churrasc|pizz|choperia|cervejaria|adega|bar\b|boteco|bistro|padaria|panificadora|panif|confeitaria|doceria|cafe\b|cafeteria|starbucks|cacau show|kopenhagen|sorvete|gelato|bacio di latte|pastel|lanchonete|lanch|acai|sushi|temaki|oriental|poke|yakisoba|espeto|fogao/i.test(
      text
    )
  ) {
    return 'Alimentação & Delivery';
  }

  // 2. Supermercado & Atacado
  if (
    /mercado|supermercado|superm|hipermercado|mercearia|hortifruti|sacolao|quitanda|oxxo|dia%|swift|carrefour|pao de acucar|extra\b|assai|atacadao|sams club|costco|big\b|bompreco|guanabara|muffato|condor|zaffari|prezunic|supernosso|savegnago|tenda atacado|spani|makro|nagumo|covabra|bahamas|supermercados bh|da terra/i.test(
      text
    )
  ) {
    return 'Supermercado';
  }

  // 3. Transporte & Combustível
  if (
    /uber|99app|99\*|99 tecnologia|cabify|indrive|taxi|metro|cptm|onibus|bilhete unico|buser|posto|gasolina|etanol|combustiv|abastece|shell|ipiranga|petrobras|br mania|raizen|lubrax|ale combustiveis|estacionamento|estac|valet|garagem|pedagio|sem parar|semparar|veloe|conectcar|taggy|move mais|autopass|ecovias|autoban|oficina|mecanic|auto peca|pneus|lava rapido|lava jato/i.test(
      text
    )
  ) {
    return 'Transporte & Combustível';
  }

  // 4. Assinaturas & Streaming
  if (
    /netflix|spotify|amazon prime|prime video|disney|star\+|hbo|max\.com|max\b|youtube|globoplay|globo play|deezer|apple music|paramount|crunchyroll|telecine|tidal|apple\.com|itunes|google\*|google play|google storage|google cloud|openai|chatgpt|anthropic|claude|adobe|canva|notion|figma|github|cursor|dropbox|icloud|microsoft|office 365|midjourney|freepik/i.test(
      text
    )
  ) {
    return 'Assinaturas & Streaming';
  }

  // 5. Saúde & Farmácia
  if (
    /drogasil|droga raia|drogaria|panvel|pague menos|pacheco|sao paulo|ultrafarma|farmacia|manipulacao|farma|consulta|medico|clinica|hospital|laboratorio|fleury|delboni|lavoisier|dasa|exame|dentista|odont|ortodontia|psicolog|terapia|fisioterap|oftalmo|otica|lentes/i.test(
      text
    )
  ) {
    return 'Saúde & Farmácia';
  }

  // 6. Lazer, Viagens & Fitness
  if (
    /steam|playstation|psn|sony play|xbox|nintendo|epic games|blizzard|riot games|roblox|cinema|cinemark|cinepolis|kinoplex|ingresso\.com|sympla|eventim|ticket360|blueticket|show|teatro|parque|beto carrero|beach park|latam|gol\b|voegol|azul\b|voeazul|avianca|decolar|123milhas|maxmilhas|cvc|viajanet|airbnb|booking|hotel|pousada|resort|hostel|smart fit|smartfit|bluefit|bodytech|bio ritmo|academia|gym|crossfit|ironberg|jiujitsu/i.test(
      text
    )
  ) {
    return 'Lazer & Viagens';
  }

  // 7. Compras, Eletrônicos & Educação/Livros
  if (
    /shopee|mercado livre|mercadolivre|mercado pago|amazon|shein|aliexpress|ali express|magalu|magazine luiza|casas bahia|americanas|submarino|shoptime|olx|enjoei|kabum|pichau|terabyte|dell|samsung|apple store|fast shop|kalunga|lenovo|motorola|xiaomi|eletronico|informatica|zara|renner|riachuelo|c&a|cea\b|marisa|hering|amaro|centauro|decathlon|nike|adidas|puma|arezzo|schutz|netshoes|leroy merlin|telhanorte|tok&stok|camicado|mobly|saraiva|livraria|leitura|udemy|alura|hotmart|kiwify|eduzz|curso|faculdade|escola|petz|cobasi|pet shop/i.test(
      text
    )
  ) {
    return 'Compras & Eletrônicos';
  }

  // 8. Contas & Moradia
  if (
    /enel|cpfl|sabesp|copel|cemig|light|energisa|sanepar|copasa|embasa|comgas|naturgy|coelba|claro|vivo|tim\b|oi\b|telecom|internet|fibra|condominio|aluguel|quinto andar|imobiliaria|iptu|ipva|seguro auto|porto seguro/i.test(
      text
    )
  ) {
    return 'Contas & Moradia';
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
