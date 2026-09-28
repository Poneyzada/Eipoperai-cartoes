import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../hooks/useAppContext';
import { formatCurrency, formatDate, parseStatementText } from '../../lib/utils';
import { parseExcelFile, parseOfxContent, parseCsvContent } from '../../lib/fileParser';
import { ExtractedTransaction } from '../../types';
import { 
  X, 
  Upload, 
  Sparkles, 
  CheckSquare, 
  Square, 
  ArrowRight, 
  FileSpreadsheet, 
  FileText, 
  Clipboard, 
  FileUp, 
  AlertCircle 
} from 'lucide-react';

interface StatementImporterProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_STATEMENTS = `02/09 Supermercado Carrefour R$ 389,40
03/09 Uber *trip R$ 27,90
04/09 iFood *Burgers R$ 68,50
05/09 Drogasil Farmacia R$ 115,20
06/09 Netflix.com R$ 55,90
07/09 Posto Shell Combustivel R$ 250,00
08/09 Amazon.com.br R$ 149,99`;

export const StatementImporter: React.FC<StatementImporterProps> = ({
  isOpen,
  onClose,
}) => {
  const { cards, categories, importTransactions } = useApp();

  const [inputMode, setInputMode] = useState<'file' | 'text'>('file');
  const [rawText, setRawText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extracted, setExtracted] = useState<ExtractedTransaction[]>([]);
  const [targetCardId, setTargetCardId] = useState(cards[0]?.id || '');
  const [step, setStep] = useState<'input' | 'review'>('input');
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Garantir que um cartão válido esteja sempre selecionado
  useEffect(() => {
    if (cards.length > 0 && (!targetCardId || !cards.some(c => c.id === targetCardId))) {
      setTargetCardId(cards[0].id);
    }
  }, [cards, targetCardId, isOpen]);

  // Processar arquivo
  const processFile = async (file: File) => {
    setLoading(true);
    setErrorMessage('');
    try {
      const fileName = file.name.toLowerCase();
      let items: ExtractedTransaction[] = [];

      if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        items = await parseExcelFile(file);
      } else if (fileName.endsWith('.ofx')) {
        const text = await file.text();
        items = parseOfxContent(text);
      } else if (fileName.endsWith('.csv')) {
        const text = await file.text();
        items = parseCsvContent(text);
      } else {
        // Tentar como texto puro
        const text = await file.text();
        items = parseStatementText(text);
      }

      if (items.length === 0) {
        setErrorMessage('Nenhuma compra foi identificada neste arquivo. Verifique se o formato contém colunas de data, estabelecimento e valor.');
      } else {
        setExtracted(items);
        setStep('review');
      }
    } catch (err: any) {
      console.error('Error parsing file:', err);
      setErrorMessage(`Erro ao ler arquivo: ${err.message || 'Formato não reconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      processFile(file);
    }
  };

  // Processar texto colado
  const handleProcessText = () => {
    if (!rawText.trim()) return;
    const items = parseStatementText(rawText);
    if (items.length === 0) {
      setErrorMessage('Nenhuma compra foi identificada no texto colado. Tente o exemplo para ver o formato aceito.');
      return;
    }
    setExtracted(items);
    setStep('review');
  };

  const handleLoadSample = () => {
    setRawText(SAMPLE_STATEMENTS);
    setInputMode('text');
  };

  const toggleSelect = (id: string) => {
    setExtracted(prev =>
      prev.map(item => item.id === id ? { ...item, selected: !item.selected } : item)
    );
  };

  const toggleSelectAll = () => {
    const allSelected = extracted.every(e => e.selected);
    setExtracted(prev => prev.map(e => ({ ...e, selected: !allSelected })));
  };

  const updateItemCategory = (id: string, newCat: string) => {
    setExtracted(prev =>
      prev.map(item => item.id === id ? { ...item, suggested_category: newCat } : item)
    );
  };

  const handleConfirmImport = async () => {
    const selectedItems = extracted.filter(e => e.selected);
    if (selectedItems.length === 0) return;

    setLoading(true);
    try {
      const effectiveCardId = (targetCardId && cards.some(c => c.id === targetCardId))
        ? targetCardId
        : (cards[0]?.id || 'card-nubank');

      await importTransactions(effectiveCardId, selectedItems);
      onClose();
      // Reset
      setRawText('');
      setSelectedFile(null);
      setExtracted([]);
      setStep('input');
    } catch (err: any) {
      console.error('Error importing:', err);
      setErrorMessage(`Erro ao importar: ${err?.message || 'Falha ao salvar'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const totalSelectedAmount = extracted
    .filter(e => e.selected)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const autoCategorizedCount = extracted
    .filter(e => e.suggested_category && e.suggested_category !== 'Outros').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl glass-panel rounded-2xl p-6 shadow-2xl border border-amber-500/25 max-h-[90vh] flex flex-col">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Importar Extrato Bancário</h2>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-2 py-0.5 rounded-full border border-amber-500/40">
                  Eipô Peraí AI
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Suba o arquivo do seu banco (Excel, CSV, OFX) ou cole o texto da fatura
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Passo 1: Seleção de Origem (Arquivo vs Texto) */}
        {step === 'input' && (
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            
            {/* Seleção do Cartão de Destino */}
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Importar faturas para qual cartão?
              </label>
              <select
                value={targetCardId}
                onChange={(e) => setTargetCardId(e.target.value)}
                className="w-full bg-[#0d0d10] border border-amber-500/20 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
              >
                {cards.map(c => (
                  <option key={c.id} value={c.id}>
                    💳 {c.name} ({c.bank} - final {c.last_four})
                  </option>
                ))}
              </select>
            </div>

            {/* Alternador de Modo: Arquivo vs Colar Texto */}
            <div className="grid grid-cols-2 p-1 bg-zinc-950 rounded-xl border border-zinc-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => { setInputMode('file'); setErrorMessage(''); }}
                className={`py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                  inputMode === 'file'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-extrabold shadow glow-gold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                Subir Arquivo (Excel / CSV / OFX)
              </button>

              <button
                type="button"
                onClick={() => { setInputMode('text'); setErrorMessage(''); }}
                className={`py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                  inputMode === 'text'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-extrabold shadow glow-gold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Clipboard className="w-4 h-4" />
                Copiar e Colar Texto
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* OPÇÃO 1: SUBIR ARQUIVO (.XLSX, .CSV, .OFX) */}
            {inputMode === 'file' && (
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv,.ofx,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                    dragActive
                      ? 'border-amber-400 bg-amber-500/10'
                      : 'border-zinc-800 hover:border-amber-500/40 bg-zinc-950/60 hover:bg-zinc-900/50'
                  }`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-md glow-gold">
                    <FileUp className="w-7 h-7" />
                  </div>

                  <div>
                    <p className="font-extrabold text-sm text-white">
                      Arraste e solte o arquivo aqui ou <span className="text-amber-400 underline">clique para selecionar</span>
                    </p>
                    <p className="text-xs text-zinc-400 mt-1">
                      Suporta <strong>Excel (.xlsx, .xls)</strong>, <strong>CSV (.csv)</strong>, <strong>OFX (.ofx)</strong> ou <strong>TXT</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-zinc-500 pt-1">
                    <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">Nubank</span>
                    <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">Itaú</span>
                    <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">Inter</span>
                    <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">Bradesco</span>
                    <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">C6 / XP</span>
                  </div>
                </div>

                {loading && (
                  <p className="text-xs text-center text-amber-400 font-semibold animate-pulse">
                    Processando planilha e categorizando despesas...
                  </p>
                )}
              </div>
            )}

            {/* OPÇÃO 2: COPIAR E COLAR TEXTO */}
            {inputMode === 'text' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-zinc-300">
                    Cole o texto copiado do app do seu banco:
                  </label>
                  <button
                    type="button"
                    onClick={handleLoadSample}
                    className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    Carregar Exemplo Realista
                  </button>
                </div>

                <textarea
                  rows={8}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Exemplo:&#10;05/09 Uber *trip R$ 24,90&#10;06/09 iFood *Restaurante R$ 48,00&#10;07/09 Supermercado Carrefour R$ 280,50"
                  className="w-full bg-zinc-950 font-mono text-xs text-zinc-200 border border-zinc-800 rounded-xl p-3 focus:outline-none focus:border-amber-400 resize-none"
                />

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm text-zinc-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={!rawText.trim() || loading}
                    onClick={handleProcessText}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-black text-xs font-black shadow-lg glow-gold transition-all disabled:opacity-40"
                  >
                    Analisar e Categorizar
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Passo 2: Conferência e Seleção em Lote */}
        {step === 'review' && (
          <div className="flex-1 overflow-hidden flex flex-col pt-2">
            
            {/* Banner Informativo de Auto-Categorização */}
            <div className="mb-3 p-3 rounded-xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/5 border border-amber-500/30 flex items-center justify-between gap-3 flex-shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-500/30">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-amber-300">
                    Categorias Selecionadas Automaticamente!
                  </p>
                  <p className="text-[11px] text-zinc-300">
                    O Eipô Peraí já classificou {autoCategorizedCount} de {extracted.length} compras. Só altere no menu se quiser trocar alguma.
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex-shrink-0">
                {Math.round((autoCategorizedCount / Math.max(extracted.length, 1)) * 100)}% Auto
              </span>
            </div>

            <div className="flex items-center justify-between pb-3 text-xs text-zinc-300 flex-shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="flex items-center gap-1.5 font-bold hover:text-amber-300 transition-colors"
                >
                  {extracted.every(e => e.selected) ? (
                    <CheckSquare className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Square className="w-4 h-4 text-zinc-500" />
                  )}
                  Selecionar Todos ({extracted.length})
                </button>
              </div>

              <div>
                Total Selecionado: <strong className="text-amber-300 font-extrabold text-sm">{formatCurrency(totalSelectedAmount)}</strong>
              </div>
            </div>

            {/* Tabela de Revisão com scroll */}
            <div className="flex-1 overflow-y-auto border border-zinc-800 rounded-xl bg-zinc-950/70 divide-y divide-zinc-800/80">
              {extracted.map((item) => {
                const isAuto = item.suggested_category && item.suggested_category !== 'Outros';
                return (
                  <div
                    key={item.id}
                    className={`p-3 flex items-center justify-between gap-3 text-xs transition-colors ${
                      item.selected ? 'bg-amber-500/5' : 'opacity-40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => toggleSelect(item.id)}
                        className="text-zinc-400 hover:text-amber-300 flex-shrink-0"
                      >
                        {item.selected ? (
                          <CheckSquare className="w-4 h-4 text-amber-400" />
                        ) : (
                          <Square className="w-4 h-4 text-zinc-600" />
                        )}
                      </button>
                      <div className="truncate">
                        <p className="font-bold text-white truncate">{item.description}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-[10px] text-zinc-400">{formatDate(item.date)}</p>
                          {isAuto ? (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/25">
                              <Sparkles className="w-2.5 h-2.5 text-amber-400" /> Auto
                            </span>
                          ) : (
                            <span className="inline-flex text-[9px] font-semibold text-zinc-500 bg-zinc-800/50 px-1.5 py-0.2 rounded">
                              Outros
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-shrink-0">
                      {/* Seletor da Categoria Sugerida */}
                      <select
                        value={item.suggested_category}
                        onChange={(e) => updateItemCategory(item.id, e.target.value)}
                        className={`text-[11px] rounded-lg px-2 py-1 max-w-[145px] focus:outline-none focus:border-amber-400 transition-colors ${
                          isAuto
                            ? 'bg-zinc-900/90 border border-amber-500/40 text-amber-200 font-medium'
                            : 'bg-zinc-900 border border-zinc-700 text-zinc-400'
                        }`}
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>

                      <span className="font-black text-amber-300 text-right min-w-[80px]">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer de Ação */}
            <div className="flex items-center justify-between pt-4 mt-2 border-t border-zinc-800 flex-shrink-0">
              <button
                type="button"
                onClick={() => setStep('input')}
                className="text-xs text-zinc-400 hover:text-white"
              >
                Voltar e Escolher Outro Arquivo
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs text-zinc-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={loading || extracted.filter(e => e.selected).length === 0}
                  onClick={handleConfirmImport}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-black text-xs font-black shadow-lg glow-gold transition-all disabled:opacity-40"
                >
                  {loading ? 'Importando...' : `Confirmar Importação (${extracted.filter(e => e.selected).length})`}
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
