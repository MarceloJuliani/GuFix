import { motion } from 'motion/react';
import { useState } from 'react';
import { Dumbbell, Fingerprint, LogIn, UserPlus } from 'lucide-react';
import {
  SessionUser,
  loginWithEmail,
  registerWithEmail,
  hasBiometricSupport,
  isBiometricEnabled,
  loginWithBiometrics,
  enableBiometricLogin,
} from '../lib/auth';

type LandingPageProps = {
  onAuthenticated: (user: SessionUser) => void;
};

export default function LandingPage({ onAuthenticated }: LandingPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const biometricSupported = hasBiometricSupport();
  const biometricEnabled = isBiometricEnabled();

  const handleAuth = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const user = isRegister
        ? await registerWithEmail(fullName, email, password)
        : await loginWithEmail(email, password);
      onAuthenticated(user);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Falha no login/cadastro.');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const user = await loginWithBiometrics(email);
      onAuthenticated(user);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Falha na autenticacao biometrica.');
    } finally {
      setLoading(false);
    }
  };

  const handleEnableBiometric = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const user = isRegister
        ? await registerWithEmail(fullName, email, password)
        : await loginWithEmail(email, password);
      await enableBiometricLogin(user);
      setSuccessMsg('Biometria ativada neste dispositivo.');
      onAuthenticated(user);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Nao foi possivel ativar a biometria.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100svh] bg-page-bg text-text-main selection:bg-accent selection:text-black overflow-x-hidden overflow-y-auto flex items-center justify-center p-3 sm:p-6">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(var(--accent-rgb),0.12),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(var(--accent-rgb),0.08),transparent_35%)]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-[28rem] bg-card-bg border border-text-main/10 rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-8 shadow-2xl"
      >
        <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-accent/10 text-accent p-2 rounded">
              <Dumbbell className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-black tracking-tighter italic">GU<span className="text-accent">FIX</span></h1>
          </div>
          <span className="shrink-0 text-[9px] sm:text-[10px] uppercase font-black tracking-[0.12em] sm:tracking-[0.2em] text-text-dim">Acesso Seguro</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter mb-2">{isRegister ? 'Criar Conta' : 'Entrar'}</h2>
        <p className="text-[10px] sm:text-xs font-bold text-text-dim uppercase tracking-[0.12em] sm:tracking-widest mb-5 sm:mb-6">Use usuario e senha para acessar</p>

        <div className="space-y-3">
          {isRegister && (
            <input
              className="w-full bg-page-bg border border-text-main/10 rounded-lg sm:rounded-xl px-3 sm:px-4 py-3 text-sm"
              placeholder="Nome completo"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          )}
          <input
            className="w-full bg-page-bg border border-text-main/10 rounded-lg sm:rounded-xl px-3 sm:px-4 py-3 text-sm"
            placeholder="Usuario (email)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            className="w-full bg-page-bg border border-text-main/10 rounded-lg sm:rounded-xl px-3 sm:px-4 py-3 text-sm"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {errorMsg && <p className="mt-4 break-words text-[10px] sm:text-xs font-bold uppercase tracking-[0.08em] sm:tracking-widest text-red-500">{errorMsg}</p>}
        {successMsg && <p className="mt-4 break-words text-[10px] sm:text-xs font-bold uppercase tracking-[0.08em] sm:tracking-widest text-accent">{successMsg}</p>}

        <div className="mt-5 sm:mt-6 space-y-3">
          <button
            onClick={handleAuth}
            disabled={loading || !email || !password || (isRegister && !fullName)}
            className="w-full min-h-12 bg-accent text-page-bg py-3 rounded-lg sm:rounded-xl font-black text-[11px] sm:text-xs uppercase tracking-[0.08em] sm:tracking-widest disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isRegister ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            {loading ? 'Aguarde...' : isRegister ? 'Cadastrar' : 'Entrar'}
          </button>

          <button
            onClick={handleBiometricLogin}
            disabled={loading || !biometricSupported || (!biometricEnabled && !email)}
            className="w-full min-h-12 bg-text-main/5 border border-text-main/10 text-text-main py-3 rounded-lg sm:rounded-xl font-black text-[11px] sm:text-xs uppercase tracking-[0.08em] sm:tracking-widest disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <Fingerprint className="w-4 h-4" />
            Entrar com Biometria
          </button>

          <button
            onClick={handleEnableBiometric}
            disabled={loading || !biometricSupported || !email || !password || (isRegister && !fullName)}
            className="w-full min-h-12 bg-card-bg border border-accent/40 text-accent py-3 rounded-lg sm:rounded-xl font-black text-[11px] sm:text-xs uppercase tracking-[0.08em] sm:tracking-widest disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <Fingerprint className="w-4 h-4" />
            Ativar Biometria neste Dispositivo
          </button>

          {!biometricSupported && (
            <p className="text-[10px] text-text-dim uppercase tracking-widest">Biometria indisponivel neste navegador/dispositivo.</p>
          )}
        </div>

        <button onClick={() => setIsRegister((v) => !v)} className="w-full mt-4 text-xs text-text-dim hover:text-accent">
          {isRegister ? 'Ja tenho conta' : 'Criar conta'}
        </button>
      </motion.div>
    </div>
  );
}
