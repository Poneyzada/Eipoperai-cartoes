import * as XLSX from 'xlsx';
import { ExtractedTransaction } from '../types';
import { categorizeByDescription, parseStatementText } from './utils';

// Função para converter data de vários formatos para YYYY-MM-DD
function normalizeDate(raw: any): string {
  const today = new Date();
  const currentYear = today.getFullYear();

  if (!raw) {
    return today.toISOString().split('T')[0];
  }

  // Se já for Date object do JS
  if (raw instanceof Date && !isNaN(raw.getTime())) {
    const y = raw.getFullYear();
    const m = String(raw.getMonth() + 1).padStart(2, '0');
    const d = String(raw.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  const str = String(raw).trim();

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }

  // DD/MM/YYYY ou DD/MM/YY
  const dmy = str.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/);
  if (dmy) {
    const d = dmy[1].padStart(2, '0');
    const m = dmy[2].padStart(2, '0');
    let y = dmy[3] ? parseInt(dmy[3], 10) : currentYear;
    if (y < 100) y += 2000;
    return `${y}-${m}-${d}`;
  }

  // Formato OFX: YYYYMMDD ou YYYYMMDDHHMMSS
  const ofxDate = str.match(/^(\d{4})(\d{2})(\d{2})/);
  if (ofxDate) {
    return `${ofxDate[1]}-${ofxDate[2]}-${ofxDate[3]}`;
  }

  return today.toISOString().split('T')[0];
}

// Limpar e converter valor numérico
function normalizeAmount(raw: any): number {
  if (typeof raw === 'number') {
    return Math.abs(raw);
  }
  if (!raw) return 0;

  const str = String(raw)
    .replace(/R\$/g, '')
    .replace(/\s/g, '')
    .trim();

  // Tratamento brasileiro: 1.234,56 ou 1234,56 ou 1234.56
  let cleanStr = str;
  if (cleanStr.includes(',') && cleanStr.includes('.')) {
    // 1.250,50 -> remove ponto, troca virgula por ponto
    cleanStr = cleanStr.replace(/\./g, '').replace(',', '.');
  } else if (cleanStr.includes(',')) {
    cleanStr = cleanStr.replace(',', '.');
  }

  const num = parseFloat(cleanStr);
  return isNaN(num) ? 0 : Math.abs(num);
}

// 1. Processar arquivo Excel (.xlsx, .xls)
export async function parseExcelFile(file: File): Promise<ExtractedTransaction[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
  
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  if (!jsonData || jsonData.length === 0) return [];

  // Descobrir índices das colunas (data, descrição/estabelecimento, valor)
  let dateCol = -1;
  let descCol = -1;
  let amountCol = -1;

  // Analisar as primeiras 5 linhas para encontrar o cabeçalho
  let headerRowIndex = 0;
  for (let r = 0; r < Math.min(jsonData.length, 6); r++) {
    const row = jsonData[r];
    if (!row || !Array.isArray(row)) continue;

    for (let c = 0; c < row.length; c++) {
      const cell = String(row[c] || '').toLowerCase().trim();
      if (/data|date|dt/i.test(cell) && dateCol === -1) dateCol = c;
      if (/descri|hist|estabelec|local|detalhe|loja|item|memo/i.test(cell) && descCol === -1) descCol = c;
      if (/valor|amount|val|preço|preco/i.test(cell) && amountCol === -1) amountCol = c;
    }

    if (dateCol !== -1 && (descCol !== -1 || amountCol !== -1)) {
      headerRowIndex = r;
      break;
    }
  }

  // Se não achou colunas específicas por nome, usar estratégia de inferência de conteúdo
  if (dateCol === -1 || amountCol === -1) {
    dateCol = 0;
    descCol = 1;
    amountCol = 2;
  }

  const transactions: ExtractedTransaction[] = [];

  for (let r = headerRowIndex + 1; r < jsonData.length; r++) {
    const row = jsonData[r];
    if (!row || !Array.isArray(row) || row.length === 0) continue;

    const rawDate = row[dateCol];
    const rawDesc = descCol !== -1 ? row[descCol] : 'Compra';
    const rawAmount = row[amountCol];

    const amount = normalizeAmount(rawAmount);
    if (amount <= 0) continue;

    const date = normalizeDate(rawDate);
    const description = String(rawDesc || 'Compra no Cartão').trim();
    const suggested_category = categorizeByDescription(description);

    transactions.push({
      id: `xlsx-${Date.now()}-${r}`,
      description,
      amount,
      date,
      suggested_category,
      raw_line: row.join(' | '),
      selected: true,
    });
  }

  return transactions;
}

// 2. Processar arquivo OFX (padrão de bancos brasileiros)
export function parseOfxContent(ofxText: string): ExtractedTransaction[] {
  const transactions: ExtractedTransaction[] = [];
  
  // Pegar todos os blocos <STMTTRN> ... </STMTTRN>
  const trnRegex = /<STMTTRN>([\s\S]*?)(?:<\/STMTTRN>|<STMTTRN>|$)/gi;
  let match;
  let idx = 0;

  while ((match = trnRegex.exec(ofxText)) !== null) {
    const block = match[1];
    idx++;

    // Extrair data: <DTPOSTED>20260905
    const dtMatch = block.match(/<DTPOSTED>([^\r\n<]+)/i);
    // Extrair valor: <TRNAMT>-149.90
    const amtMatch = block.match(/<TRNAMT>([^\r\n<]+)/i);
    // Extrair descrição: <MEMO> ou <NAME>
    const memoMatch = block.match(/<(?:MEMO|NAME)>([^\r\n<]+)/i);

    if (amtMatch) {
      const amount = normalizeAmount(amtMatch[1]);
      if (amount <= 0) continue;

      const date = normalizeDate(dtMatch ? dtMatch[1] : null);
      const description = (memoMatch ? memoMatch[1].trim() : 'Compra Cartão') || 'Compra Cartão';
      const category = categorizeByDescription(description);

      transactions.push({
        id: `ofx-${Date.now()}-${idx}`,
        description,
        amount,
        date,
        suggested_category: category,
        raw_line: block.replace(/\s+/g, ' ').trim(),
        selected: true,
      });
    }
  }

  return transactions;
}

// 3. Processar arquivo CSV
export function parseCsvContent(csvText: string): ExtractedTransaction[] {
  const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length === 0) return [];

  // Detectar delimitador: ponto e vírgula ';' ou vírgula ','
  const firstLine = lines[0];
  const delimiter = (firstLine.match(/;/g) || []).length >= (firstLine.match(/,/g) || []).length ? ';' : ',';

  const transactions: ExtractedTransaction[] = [];
  
  // Testar se primeira linha é cabeçalho
  let startIndex = 0;
  let dateCol = 0;
  let descCol = 1;
  let amountCol = 2;

  const headerParts = firstLine.split(delimiter).map(p => p.toLowerCase().replace(/"/g, '').trim());
  for (let c = 0; c < headerParts.length; c++) {
    if (/data|date/i.test(headerParts[c])) dateCol = c;
    if (/descri|hist|loja|memo|item|estabelecimento/i.test(headerParts[c])) descCol = c;
    if (/valor|amount|val/i.test(headerParts[c])) amountCol = c;
  }

  if (/data|date|valor|descri/i.test(firstLine)) {
    startIndex = 1;
  }

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    const parts = line.split(delimiter).map(p => p.replace(/^"|"$/g, '').trim());
    if (parts.length < 2) continue;

    const rawAmount = parts[amountCol] || parts[parts.length - 1];
    const amount = normalizeAmount(rawAmount);
    if (amount <= 0) continue;

    const rawDate = parts[dateCol] || parts[0];
    const date = normalizeDate(rawDate);
    const description = parts[descCol] || 'Compra Cartão';
    const category = categorizeByDescription(description);

    transactions.push({
      id: `csv-${Date.now()}-${i}`,
      description,
      amount,
      date,
      suggested_category: category,
      raw_line: line,
      selected: true,
    });
  }

  // Se por acaso o CSV estiver em formato livre sem delimitador fixo, fallback para parseStatementText
  if (transactions.length === 0) {
    return parseStatementText(csvText);
  }

  return transactions;
}
