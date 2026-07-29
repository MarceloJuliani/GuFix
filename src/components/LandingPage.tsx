import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import {
  Activity,
  ArrowRight,
  BarChart3,
  Check,
  ChevronRight,
  CirclePlay,
  ClipboardCheck,
  CreditCard,
  Dumbbell,
  Fingerprint,
  HeartPulse,
  LineChart,
  LockKeyhole,
  LogIn,
  Menu,
  MessageCircleMore,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Target,
  UserPlus,
  Users,
  WalletCards,
  X,
  Zap,
} from 'lucide-react';
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

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.55 },
};

const features = [
  { icon: Users, title: 'Gestão de alunos', text: 'Cadastro, status, mensalidade e acompanhamento em uma visão clara.' },
  { icon: Dumbbell, title: 'Prescrição inteligente', text: 'Treinos simples ou combinados em Biplex, Triplex e Quadriplex.' },
  { icon: ClipboardCheck, title: 'Anamnese completa', text: 'Histórico, hábitos, objetivos, limitações e contexto de cada aluno.' },
  { icon: HeartPulse, title: 'Evolução física', text: 'Avaliações, medidas corporais e uma linha do tempo fácil de acompanhar.' },
  { icon: WalletCards, title: 'Financeiro centralizado', text: 'Cobranças, vencimentos e recebimentos organizados no mesmo painel.' },
  { icon: MessageCircleMore, title: 'Feedback contínuo', text: 'O retorno do aluno vira informação para ajustar o próximo treino.' },
];

const journey = [
  { number: '01', title: 'Entender', text: 'Anamnese e avaliação transformam objetivos em um ponto de partida real.' },
  { number: '02', title: 'Prescrever', text: 'O personal monta rotinas alinhadas ao nível, frequência e limitações do aluno.' },
  { number: '03', title: 'Evoluir', text: 'Treinos, feedbacks, medidas e pagamentos seguem conectados em um só lugar.' },
];

export default function LandingPage({ onAuthenticated }: LandingPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const biometricSupported = hasBiometricSupport();
  const biometricEnabled = isBiometricEnabled();

  useEffect(() => {
    document.body.style.overflow = isAuthOpen || isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isAuthOpen, isMobileMenuOpen]);

  const openAuth = (register = false) => {
    setIsRegister(register);
    setErrorMsg('');
    setSuccessMsg('');
    setIsMobileMenuOpen(false);
    setIsAuthOpen(true);
  };

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
      setErrorMsg(error instanceof Error ? error.message : 'Falha no login ou cadastro.');
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
      setErrorMsg(error instanceof Error ? error.message : 'Falha na autenticação biométrica.');
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
      setErrorMsg(error instanceof Error ? error.message : 'Não foi possível ativar a biometria.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="marketing-site min-h-[100svh] overflow-x-hidden bg-[#f6f8f2] text-[#071d2d] selection:bg-[#b9ff3f] selection:text-[#071d2d]">
      <header className="sticky top-0 z-40 border-b border-[#092a40]/10 bg-[#f6f8f2]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[4.75rem] max-w-[82rem] items-center justify-between px-5 lg:px-8">
          <a href="#inicio" className="flex items-center gap-3" aria-label="GuFix - Início">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#092a40] text-[#b9ff3f]"><Dumbbell className="h-5 w-5" /></span>
            <span className="text-2xl font-black italic tracking-[-0.08em] text-[#092a40]">GU<span className="text-[#5b36f2]">FIX</span></span>
          </a>

          <nav className="hidden items-center gap-8 lg:flex">
            <a className="marketing-nav" href="#recursos">Recursos</a>
            <a className="marketing-nav" href="#metodo">Como funciona</a>
            <a className="marketing-nav" href="#personal">Personal</a>
            <a className="marketing-nav" href="#aplicativo">Aplicativo</a>
          </nav>

          <div className="hidden items-center gap-3 sm:flex">
            <button onClick={() => openAuth(false)} className="rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-[#092a40] transition hover:bg-[#092a40]/5">Entrar</button>
            <button onClick={() => openAuth(true)} className="rounded-full bg-[#092a40] px-6 py-3 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:-translate-y-0.5 hover:bg-[#123d58]">Começar agora</button>
          </div>

          <button onClick={() => setIsMobileMenuOpen(true)} className="grid h-11 w-11 place-items-center rounded-full border border-[#092a40]/15 sm:hidden" aria-label="Abrir menu"><Menu className="h-5 w-5" /></button>
        </div>
      </header>

      <main>
        <section id="inicio" className="relative overflow-hidden bg-[#092a40] text-white">
          <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:48px_48px]" />
          <div className="absolute -right-32 top-16 h-96 w-96 rounded-full bg-[#5b36f2]/35 blur-[90px]" />
          <div className="relative mx-auto grid min-h-[46rem] max-w-[82rem] items-center gap-12 px-5 py-20 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-24">
            <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.65 }} className="min-w-0">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#b9ff3f]/30 bg-[#b9ff3f]/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#b9ff3f]">
                <Sparkles className="h-4 w-4" /> Consultoria e tecnologia fitness
              </div>
              <h1 className="max-w-4xl text-[clamp(2.65rem,7vw,6.6rem)] font-black uppercase italic leading-[0.84] tracking-[-0.075em]">
                <span className="max-sm:block">Mais </span><span>resultado.</span><br /><span className="text-[#b9ff3f]">Menos improviso.</span>
              </h1>
              <p className="mt-8 max-w-xl text-base font-medium leading-relaxed text-white/70 md:text-xl">
                Marcelo Juliani e GuFix conectam prescrição, acompanhamento e evolução em uma experiência completa para personal e aluno.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <button onClick={() => openAuth(true)} className="group flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#b9ff3f] px-7 text-xs font-black uppercase tracking-[0.14em] text-[#071d2d] transition hover:-translate-y-1">
                  Quero começar <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </button>
                <a href="#recursos" className="flex min-h-14 items-center justify-center gap-3 rounded-full border border-white/20 px-7 text-xs font-black uppercase tracking-[0.14em] text-white transition hover:bg-white/10">
                  <CirclePlay className="h-4 w-4" /> Conhecer o GuFix
                </a>
              </div>
              <div className="mt-12 grid max-w-xl grid-cols-3 gap-4 border-t border-white/15 pt-7">
                {[['4', 'Métodos de treino'], ['1', 'Painel integrado'], ['24/7', 'Acesso ao app']].map(([value, label]) => (
                  <div key={label}><p className="text-2xl font-black text-[#b9ff3f] md:text-3xl">{value}</p><p className="mt-1 text-[9px] font-black uppercase tracking-[0.12em] text-white/45">{label}</p></div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }} className="relative mx-auto w-full max-w-[34rem]">
              <div className="absolute -left-8 top-20 hidden rounded-2xl bg-white p-4 text-[#071d2d] shadow-2xl md:block">
                <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#b9ff3f]"><LineChart className="h-5 w-5" /></span><div><p className="text-[9px] font-black uppercase tracking-widest text-[#567080]">Evolução</p><p className="text-sm font-black">Acompanhamento real</p></div></div>
              </div>
              <div className="absolute -right-4 bottom-24 z-20 hidden rounded-2xl bg-[#5b36f2] p-4 text-white shadow-2xl md:block">
                <div className="flex items-center gap-3"><Check className="h-5 w-5" /><div><p className="text-[9px] font-black uppercase tracking-widest text-white/60">Treino</p><p className="text-sm font-black">Prescrição enviada</p></div></div>
              </div>
              <div className="mx-auto w-[82%] rotate-[3deg] rounded-[3rem] border-[10px] border-[#06131d] bg-[#f6f8f2] p-3 shadow-[0_45px_90px_rgba(0,0,0,.45)]">
                <div className="overflow-hidden rounded-[2.1rem] bg-[#f6f8f2] text-[#071d2d]">
                  <div className="flex items-center justify-between bg-[#b9ff3f] px-5 py-5"><div><p className="text-[9px] font-black uppercase tracking-widest opacity-55">Olá, atleta</p><p className="text-lg font-black">Seu treino de hoje</p></div><span className="grid h-10 w-10 place-items-center rounded-full bg-[#092a40] text-white"><Zap className="h-5 w-5" /></span></div>
                  <div className="space-y-3 p-4">
                    <div className="rounded-2xl bg-[#092a40] p-5 text-white"><p className="text-[9px] font-black uppercase tracking-widest text-[#b9ff3f]">Treino A</p><p className="mt-2 text-2xl font-black uppercase italic">Empurrar</p><div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full w-3/4 rounded-full bg-[#b9ff3f]" /></div><p className="mt-2 text-[9px] font-bold text-white/50">6 exercícios · Biplex</p></div>
                    {['Supino reto', 'Desenvolvimento', 'Tríceps corda'].map((item, index) => <div key={item} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#edf2e7] text-xs font-black">0{index + 1}</span><div className="flex-1"><p className="text-xs font-black">{item}</p><p className="text-[9px] font-bold text-[#78909e]">4 séries · 10 repetições</p></div><ChevronRight className="h-4 w-4 text-[#78909e]" /></div>)}
                    <button className="w-full rounded-2xl bg-[#5b36f2] py-4 text-[10px] font-black uppercase tracking-widest text-white">Iniciar treino</button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="border-b border-[#092a40]/10 bg-[#b9ff3f]">
          <div className="mx-auto flex max-w-[82rem] flex-wrap items-center justify-center gap-x-12 gap-y-4 px-5 py-5 text-[10px] font-black uppercase tracking-[0.16em] text-[#092a40] lg:justify-between lg:px-8">
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Dados no MySQL</span>
            <span className="flex items-center gap-2"><Smartphone className="h-4 w-4" /> Web, Android e iOS</span>
            <span className="flex items-center gap-2"><Fingerprint className="h-4 w-4" /> Acesso com biometria</span>
            <span className="flex items-center gap-2"><Activity className="h-4 w-4" /> Evolução acompanhada</span>
          </div>
        </section>

        <section id="recursos" className="mx-auto max-w-[82rem] px-5 py-24 lg:px-8 lg:py-32">
          <motion.div {...reveal} className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
            <div><p className="marketing-eyebrow">Uma plataforma, toda a rotina</p><h2 className="marketing-title">Tudo o que o acompanhamento precisa.</h2></div>
            <p className="max-w-2xl text-base font-medium leading-relaxed text-[#4f6978] lg:ml-auto lg:text-lg">Da primeira conversa ao pagamento, cada etapa fica organizada para o personal ganhar tempo e o aluno entender sua evolução.</p>
          </motion.div>
          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.article key={feature.title} {...reveal} transition={{ duration: 0.5, delay: index * 0.05 }} className="group rounded-[2rem] border border-[#092a40]/10 bg-white p-7 shadow-[0_20px_60px_rgba(9,42,64,.06)] transition hover:-translate-y-1 hover:border-[#5b36f2]/40">
                <div className="mb-10 flex items-start justify-between"><span className="grid h-13 w-13 place-items-center rounded-2xl bg-[#edf2e7] text-[#5b36f2] transition group-hover:bg-[#5b36f2] group-hover:text-white"><feature.icon className="h-6 w-6" /></span><span className="text-xs font-black text-[#092a40]/20">0{index + 1}</span></div>
                <h3 className="text-xl font-black uppercase italic tracking-tight">{feature.title}</h3><p className="mt-3 text-sm font-medium leading-relaxed text-[#607785]">{feature.text}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section id="personal" className="bg-[#092a40] py-24 text-white lg:py-32">
          <div className="mx-auto grid max-w-[82rem] gap-14 px-5 lg:grid-cols-2 lg:items-center lg:px-8">
            <motion.div {...reveal} className="relative min-h-[32rem] overflow-hidden rounded-[2.5rem] bg-[#5b36f2] p-7 md:p-10">
              <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full border-[70px] border-[#b9ff3f]/25" />
              <div className="relative flex h-full min-h-[27rem] flex-col justify-between">
                <div className="flex items-center justify-between"><span className="rounded-full border border-white/25 px-4 py-2 text-[9px] font-black uppercase tracking-[0.18em]">Marcelo Juliani</span><Target className="h-9 w-9 text-[#b9ff3f]" /></div>
                <div><p className="text-sm font-black uppercase tracking-[0.16em] text-[#b9ff3f]">Acompanhamento humano</p><p className="mt-4 text-[clamp(2.5rem,5vw,4.6rem)] font-black uppercase italic leading-[.9] tracking-[-.06em]">Estratégia antes de intensidade.</p></div>
              </div>
            </motion.div>
            <motion.div {...reveal}>
              <p className="marketing-eyebrow text-[#b9ff3f]">Personal + plataforma</p>
              <h2 className="mt-4 text-4xl font-black uppercase italic leading-[.92] tracking-[-.05em] md:text-6xl">Tecnologia sem perder o contato.</h2>
              <p className="mt-7 max-w-xl text-base font-medium leading-relaxed text-white/65 md:text-lg">O GuFix organiza os dados, mas as decisões continuam humanas. Cada prescrição considera objetivo, histórico, rotina, evolução e feedback do aluno.</p>
              <div className="mt-9 space-y-4">
                {['Treino adaptado ao momento de cada aluno', 'Avaliação e progresso reunidos no mesmo histórico', 'Comunicação direta entre personal e aluno'].map((item) => <div key={item} className="flex items-center gap-4 border-b border-white/10 pb-4"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#b9ff3f] text-[#092a40]"><Check className="h-4 w-4" /></span><p className="text-sm font-bold">{item}</p></div>)}
              </div>
              <a href="mailto:mjuliani25@gmail.com" className="mt-9 inline-flex items-center gap-3 rounded-full bg-white px-7 py-4 text-xs font-black uppercase tracking-widest text-[#092a40]">Falar com Marcelo <ArrowRight className="h-4 w-4" /></a>
            </motion.div>
          </div>
        </section>

        <section id="metodo" className="mx-auto max-w-[82rem] px-5 py-24 lg:px-8 lg:py-32">
          <motion.div {...reveal} className="max-w-3xl"><p className="marketing-eyebrow">Jornada simples</p><h2 className="marketing-title">Do primeiro dado ao próximo resultado.</h2></motion.div>
          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {journey.map((item, index) => <motion.article key={item.number} {...reveal} transition={{ duration: 0.5, delay: index * 0.08 }} className="relative overflow-hidden rounded-[2rem] bg-[#eaf0e4] p-8"><p className="text-5xl font-black italic tracking-tighter text-[#5b36f2]">{item.number}</p><h3 className="mt-14 text-2xl font-black uppercase italic">{item.title}</h3><p className="mt-3 text-sm font-medium leading-relaxed text-[#607785]">{item.text}</p></motion.article>)}
          </div>
        </section>

        <section id="aplicativo" className="overflow-hidden bg-[#dfe8f0] py-24 lg:py-32">
          <div className="mx-auto grid max-w-[82rem] gap-14 px-5 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:px-8">
            <motion.div {...reveal}>
              <p className="marketing-eyebrow">Onde você estiver</p><h2 className="marketing-title">Um sistema. Todas as telas.</h2>
              <p className="mt-6 max-w-xl text-base font-medium leading-relaxed text-[#4f6978]">A mesma conta acompanha personal e aluno no navegador, Android e iOS, com interface adaptada para cada tamanho de tela.</p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {[{ icon: BarChart3, title: 'Painel web', text: 'Gestão completa no computador.' }, { icon: Smartphone, title: 'App nativo', text: 'Treino e acompanhamento no bolso.' }, { icon: Fingerprint, title: 'Biometria', text: 'Acesso rápido no dispositivo.' }, { icon: LockKeyhole, title: 'Sessão protegida', text: 'Dados conectados à API GuFix.' }].map((item) => <div key={item.title} className="rounded-2xl bg-white/70 p-5"><item.icon className="h-5 w-5 text-[#5b36f2]" /><p className="mt-4 text-sm font-black uppercase">{item.title}</p><p className="mt-1 text-xs font-medium text-[#607785]">{item.text}</p></div>)}
              </div>
              <div className="mt-8 flex flex-wrap gap-3"><span className="rounded-xl bg-[#092a40] px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white">Android</span><span className="rounded-xl bg-[#092a40] px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white">iOS</span><span className="rounded-xl border border-[#092a40]/15 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-[#092a40]">Web App</span></div>
            </motion.div>
            <motion.div {...reveal} className="grid grid-cols-2 gap-4">
              <div className="mt-14 space-y-4"><AppPreview icon={Users} label="Alunos" value="Gestão completa" accent /><AppPreview icon={CreditCard} label="Financeiro" value="Receita organizada" /></div>
              <div className="space-y-4"><AppPreview icon={Dumbbell} label="Prescrição" value="Métodos GuFix" /><AppPreview icon={LineChart} label="Evolução" value="Histórico visual" accent /></div>
            </motion.div>
          </div>
        </section>

        <section className="mx-auto max-w-[82rem] px-5 py-24 lg:px-8 lg:py-32">
          <motion.div {...reveal} className="relative overflow-hidden rounded-[2.75rem] bg-[#5b36f2] px-6 py-16 text-center text-white md:px-12 md:py-24">
            <div className="absolute left-0 top-0 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#b9ff3f]/25 blur-2xl" />
            <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#b9ff3f]">Sua próxima fase começa aqui</p>
            <h2 className="mx-auto mt-5 max-w-4xl text-4xl font-black uppercase italic leading-[.9] tracking-[-.05em] md:text-7xl">Treino profissional merece gestão profissional.</h2>
            <p className="mx-auto mt-6 max-w-xl text-sm font-medium leading-relaxed text-white/70 md:text-base">Crie sua conta, organize seus alunos e leve o acompanhamento para web, Android e iOS.</p>
            <button onClick={() => openAuth(true)} className="mt-8 inline-flex min-h-14 items-center gap-3 rounded-full bg-[#b9ff3f] px-8 text-xs font-black uppercase tracking-widest text-[#071d2d]">Criar minha conta <ArrowRight className="h-4 w-4" /></button>
          </motion.div>
        </section>
      </main>

      <footer className="bg-[#06131d] text-white">
        <div className="mx-auto grid max-w-[82rem] gap-10 px-5 py-14 md:grid-cols-[1.2fr_.8fr_.8fr] lg:px-8">
          <div><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#b9ff3f] text-[#092a40]"><Dumbbell className="h-5 w-5" /></span><span className="text-2xl font-black italic tracking-[-.08em]">GU<span className="text-[#b9ff3f]">FIX</span></span></div><p className="mt-5 max-w-sm text-sm font-medium leading-relaxed text-white/50">Consultoria, prescrição e gestão fitness conectadas por Marcelo Juliani.</p></div>
          <div><p className="text-[10px] font-black uppercase tracking-widest text-[#b9ff3f]">Navegação</p><div className="mt-5 space-y-3 text-sm font-bold text-white/65"><a className="block hover:text-white" href="#recursos">Recursos</a><a className="block hover:text-white" href="#personal">Personal</a><a className="block hover:text-white" href="#aplicativo">Aplicativo</a></div></div>
          <div><p className="text-[10px] font-black uppercase tracking-widest text-[#b9ff3f]">Contato</p><a href="mailto:mjuliani25@gmail.com" className="mt-5 block break-all text-sm font-bold text-white/65 hover:text-white">mjuliani25@gmail.com</a><button onClick={() => openAuth(false)} className="mt-5 text-xs font-black uppercase tracking-widest text-white">Acessar sistema →</button></div>
        </div>
        <div className="border-t border-white/10 px-5 py-6 text-center text-[9px] font-black uppercase tracking-[.15em] text-white/30">© {new Date().getFullYear()} GuFix · Marcelo Juliani</div>
      </footer>

      <AnimatePresence>
        {isMobileMenuOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-[#092a40] p-5 text-white sm:hidden"><div className="flex items-center justify-between"><span className="text-2xl font-black italic">GU<span className="text-[#b9ff3f]">FIX</span></span><button onClick={() => setIsMobileMenuOpen(false)} className="grid h-11 w-11 place-items-center rounded-full border border-white/20"><X className="h-5 w-5" /></button></div><div className="mt-16 space-y-5 text-3xl font-black uppercase italic"><a onClick={() => setIsMobileMenuOpen(false)} className="block" href="#recursos">Recursos</a><a onClick={() => setIsMobileMenuOpen(false)} className="block" href="#metodo">Como funciona</a><a onClick={() => setIsMobileMenuOpen(false)} className="block" href="#personal">Personal</a><a onClick={() => setIsMobileMenuOpen(false)} className="block" href="#aplicativo">Aplicativo</a></div><div className="absolute bottom-8 left-5 right-5 grid gap-3"><button onClick={() => openAuth(false)} className="rounded-full border border-white/20 py-4 text-xs font-black uppercase tracking-widest">Entrar</button><button onClick={() => openAuth(true)} className="rounded-full bg-[#b9ff3f] py-4 text-xs font-black uppercase tracking-widest text-[#092a40]">Começar agora</button></div></motion.div>}
      </AnimatePresence>

      <AnimatePresence>
        {isAuthOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-[#06131d]/80 p-3 backdrop-blur-md sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsAuthOpen(false); }}>
            <motion.div initial={{ opacity: 0, y: 24, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: .98 }} className="my-auto w-full max-w-[29rem] rounded-[2rem] bg-white p-5 text-[#071d2d] shadow-2xl sm:p-8">
              <div className="flex items-center justify-between"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#092a40] text-[#b9ff3f]"><Dumbbell className="h-5 w-5" /></span><span className="text-xl font-black italic tracking-[-.06em]">GU<span className="text-[#5b36f2]">FIX</span></span></div><button onClick={() => setIsAuthOpen(false)} className="grid h-10 w-10 place-items-center rounded-full bg-[#edf2e7]" aria-label="Fechar"><X className="h-4 w-4" /></button></div>
              <p className="mt-8 text-[10px] font-black uppercase tracking-[.18em] text-[#5b36f2]">Acesso seguro</p><h2 className="mt-2 text-3xl font-black uppercase italic tracking-[-.05em]">{isRegister ? 'Criar sua conta' : 'Boas-vindas de volta'}</h2><p className="mt-2 text-sm font-medium text-[#607785]">{isRegister ? 'Comece a organizar sua consultoria.' : 'Entre para acessar seus treinos e alunos.'}</p>
              <div className="mt-7 space-y-3">
                {isRegister && <input className="marketing-field" placeholder="Nome completo" value={fullName} onChange={(e) => setFullName(e.target.value)} />}
                <input className="marketing-field" type="email" placeholder="Seu e-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
                <input className="marketing-field" type="password" placeholder="Sua senha" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') handleAuth(); }} />
              </div>
              {errorMsg && <p className="mt-4 break-words text-[10px] font-black uppercase tracking-wider text-red-600">{errorMsg}</p>}
              {successMsg && <p className="mt-4 break-words text-[10px] font-black uppercase tracking-wider text-emerald-600">{successMsg}</p>}
              <div className="mt-6 space-y-3">
                <button onClick={handleAuth} disabled={loading || !email || !password || (isRegister && !fullName)} className="flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#5b36f2] px-5 text-xs font-black uppercase tracking-widest text-white disabled:opacity-45">{isRegister ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}{loading ? 'Aguarde...' : isRegister ? 'Criar conta' : 'Entrar no GuFix'}</button>
                {!isRegister && <button onClick={handleBiometricLogin} disabled={loading || !biometricSupported || (!biometricEnabled && !email)} className="flex min-h-13 w-full items-center justify-center gap-2 rounded-xl border border-[#092a40]/15 bg-[#edf2e7] px-5 text-xs font-black uppercase tracking-widest disabled:opacity-40"><Fingerprint className="h-4 w-4" />Entrar com biometria</button>}
                <button onClick={handleEnableBiometric} disabled={loading || !biometricSupported || !email || !password || (isRegister && !fullName)} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#5b36f2]/25 px-4 text-[10px] font-black uppercase tracking-widest text-[#5b36f2] disabled:opacity-40"><Fingerprint className="h-4 w-4" />Ativar biometria neste dispositivo</button>
              </div>
              <button onClick={() => { setIsRegister((value) => !value); setErrorMsg(''); }} className="mt-5 w-full text-xs font-bold text-[#607785] hover:text-[#5b36f2]">{isRegister ? 'Já tenho uma conta' : 'Ainda não tenho conta'}</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AppPreview({ icon: Icon, label, value, accent = false }: { icon: typeof Users; label: string; value: string; accent?: boolean }) {
  return <div className={`min-h-56 rounded-[2rem] p-6 shadow-xl ${accent ? 'bg-[#5b36f2] text-white' : 'bg-white text-[#092a40]'}`}><div className={`grid h-12 w-12 place-items-center rounded-2xl ${accent ? 'bg-[#b9ff3f] text-[#092a40]' : 'bg-[#edf2e7] text-[#5b36f2]'}`}><Icon className="h-6 w-6" /></div><p className={`mt-12 text-[9px] font-black uppercase tracking-[.16em] ${accent ? 'text-[#b9ff3f]' : 'text-[#607785]'}`}>{label}</p><p className="mt-2 text-2xl font-black uppercase italic leading-none">{value}</p></div>;
}
