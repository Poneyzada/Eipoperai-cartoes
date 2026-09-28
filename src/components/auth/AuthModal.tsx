import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useApp } from '../../hooks/useAppContext';
import { X, User, Lock, Mail, ShieldCheck, Database, LogOut, RefreshCw, Key } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, isDemo, isConfigured, signIn, signUp, signOut, enableDemoMode } = useAuth();
  const { resetToDemoData } = useApp();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) {
          setErrorMsg(error.message || 'Erro ao entrar. Verifique email e senha.');
        } else {
          setSuccessMsg('Login realizado com sucesso!');
          setTimeout(() => onClose(), 800);
        }
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          setErrorMsg(error.message || 'Erro ao criar conta.');
        } else {
          setSuccessMsg('Conta criada! Verifique seu email ou entre normalmente.');
          setTimeout(() => onClose(), 1200);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  const handleResetData = async () => {
    if (confirm('Deseja resetar todos os dados e restaurar os exemplos iniciais de cartões e faturas?')) {
      await resetToDemoData();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md glass-panel rounded-2xl p-6 shadow-2xl border border-slate-700/80 max-h-[90vh] overflow-y-auto">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Minha Conta & Nuvem</h2>
              <p className="text-xs text-slate-400">Supabase Auth e Modo Multi-Usuário</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status de Conexão com Supabase */}
        <div className="my-4 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              Banco de Dados PostgreSQL:
            </span>
            <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
              isConfigured ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
            }`}>
              {isConfigured ? 'Supabase Conectado' : 'Modo Local / Demo'}
            </span>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            {isConfigured 
              ? 'Seus cartões e faturas são sincronizados com segurança na sua nuvem Supabase, protegidos por RLS.'
              : 'O app está rodando localmente no seu dispositivo. Para ativar sincronização na nuvem com amigos, preencha o arquivo .env com sua URL e Chave do Supabase.'}
          </p>
        </div>

        {/* Se usuário já estiver logado (e não for demo) */}
        {!isDemo && user ? (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
              <p className="text-slate-400">Conectado como:</p>
              <p className="font-bold text-base text-white">{user.full_name}</p>
              <p className="text-slate-400 font-mono text-[11px]">{user.email}</p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleSignOut}
                className="flex-1 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sair da Conta
              </button>
            </div>
          </div>
        ) : (
          /* Formulário de Login / Cadastro */
          <div className="space-y-4 pt-1">
            
            {/* Tabs Login vs Cadastro */}
            <div className="grid grid-cols-2 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => { setMode('signin'); setErrorMsg(''); }}
                className={`py-2 rounded-lg transition-colors ${
                  mode === 'signin' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setErrorMsg(''); }}
                className={`py-2 rounded-lg transition-colors ${
                  mode === 'signup' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Criar Conta
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === 'signup' && (
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1">Seu Nome</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ex: Carlos Silva"
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seuemail@exemplo.com"
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Senha</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs shadow-lg glow-indigo transition-all disabled:opacity-50 mt-2"
              >
                {loading ? 'Processando...' : mode === 'signin' ? 'Acessar App' : 'Cadastrar Conta'}
              </button>
            </form>
          </div>
        )}

        {/* Opção para restaurar dados de exemplo */}
        <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <button
            type="button"
            onClick={handleResetData}
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Restaurar Dados de Exemplo
          </button>
        </div>

      </div>
    </div>
  );
};
