/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Dumbbell, 
  Zap, 
  Target, 
  TrendingUp, 
  Smartphone, 
  Users, 
  CheckCircle2, 
  ChevronRight,
  Shield,
  Clock,
  Layout
} from 'lucide-react';
import { loginWithEmail, registerWithEmail, SessionUser } from '../lib/auth';

type LandingPageProps = {
  onAuthenticated: (user: SessionUser) => void;
};

export default function LandingPage({ onAuthenticated }: LandingPageProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    try {
      const user = isRegister
        ? await registerWithEmail(fullName, email, password)
        : await loginWithEmail(email, password);
      onAuthenticated(user);
    } catch (e) {
      alert('Falha no login/cadastro. Verifique email e senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-page-bg text-text-main selection:bg-accent selection:text-black overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-[100] bg-page-bg/80 backdrop-blur-md border-b border-text-main/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-accent/10 text-accent p-2 rounded">
              <Dumbbell className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h1 className="text-xl md:text-2xl font-display font-black tracking-tighter italic">GU<span className="text-accent">FIX</span></h1>
          </div>
          
          <button 
            onClick={handleAuth}
            className="bg-text-main text-page-bg px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest hover:bg-accent transition-all transform hover:scale-105"
          >
            Acessar Sistema
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 px-4 py-1 rounded-full mb-8"
              >
                <Zap className="w-4 h-4 text-accent" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Performance Training System</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-6xl md:text-8xl font-display font-black leading-[0.85] italic uppercase tracking-tighter mb-8"
              >
                Maximize seu <br />
                <span className="text-accent">Impacto</span> Profissional
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-text-dim text-lg md:text-xl font-medium max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed italic"
              >
                A plataforma completa para Personal Trainers que buscam excelência na prescrição e gestão de consultoria. Inteligência Artificial, lógica automática e resultados reais.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
              >
                <button 
                  onClick={handleAuth}
                  className="w-full sm:w-auto bg-accent text-page-bg px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:brightness-110 transition-all shadow-2xl shadow-accent/20 flex items-center justify-center gap-3 group"
                >
                  Começar Agora
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="w-full sm:w-auto bg-text-main/5 text-text-main border border-text-main/10 px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-text-main/10 transition-all">
                  Ver Demonstração
                </button>
              </motion.div>
              
              <div className="mt-12 flex items-center gap-8 justify-center lg:justify-start opacity-40">
                <div className="text-center group hover:opacity-100 transition-opacity">
                  <span className="block text-2xl font-black italic">+500</span>
                  <span className="text-[8px] font-bold uppercase tracking-widest">Alunos Ativos</span>
                </div>
                <div className="w-px h-10 bg-text-main/20"></div>
                <div className="text-center group hover:opacity-100 transition-opacity">
                  <span className="block text-2xl font-black italic">100%</span>
                  <span className="text-[8px] font-bold uppercase tracking-widest">Cloud Ready</span>
                </div>
                <div className="w-px h-10 bg-text-main/20"></div>
                <div className="text-center group hover:opacity-100 transition-opacity">
                  <span className="block text-2xl font-black italic">24/7</span>
                  <span className="text-[8px] font-bold uppercase tracking-widest">Suporte IA</span>
                </div>
              </div>
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, type: 'spring' }}
              className="flex-1 relative"
            >
              <div className="relative bg-card-bg border border-text-main/10 rounded-[3rem] p-4 shadow-2xl overflow-hidden aspect-[4/5] max-w-md mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent pointer-events-none"></div>
                
                {/* Mock UI */}
                <div className="relative bg-page-bg h-full rounded-[2.5rem] overflow-hidden flex flex-col p-6 border border-text-main/5">
                  <div className="flex items-center justify-between mb-8">
                     <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                        <Dumbbell className="w-5 h-5 text-accent" />
                     </div>
                     <div className="flex gap-1.5 font-black text-[8px] text-accent tracking-[0.2em] italic">
                        SYSTEM ACTIVE
                        <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                     </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="h-14 bg-text-main/5 rounded-2xl border border-text-main/10 animate-shimmer"></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-24 bg-accent rounded-2xl border border-accent/20 shadow-lg shadow-accent/10"></div>
                      <div className="h-24 bg-text-main/5 rounded-2xl border border-text-main/10"></div>
                    </div>
                    <div className="h-32 bg-text-main/5 rounded-3xl border border-text-main/10"></div>
                    <div className="h-16 bg-text-main/10 rounded-2xl border border-text-main/5"></div>
                  </div>
                  
                  <div className="mt-auto pt-8">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-full bg-text-main/10"></div>
                      <div className="flex-1 space-y-2">
                         <div className="h-2 w-24 bg-text-main/20 rounded-full"></div>
                         <div className="h-2 w-16 bg-text-main/10 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative Floating Elements */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute -top-6 -right-6 bg-accent text-page-bg p-6 rounded-[2rem] shadow-2xl z-20 border-4 border-page-bg hidden lg:block"
              >
                <TrendingUp className="w-8 h-8" />
              </motion.div>
              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                className="absolute -bottom-10 -left-10 bg-text-main text-page-bg p-6 rounded-[2rem] shadow-2xl z-20 border-4 border-page-bg hidden lg:block"
              >
                <Zap className="w-8 h-8 text-accent" />
              </motion.div>
            </motion.div>
          </div>
        </div>
        
        {/* Background Gradients */}
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[150px] translate-x-1/3 translate-y-1/3 pointer-events-none"></div>
      </section>

      {/* Features Grid */}
      <section className="py-32 bg-text-main/[0.02] border-y border-text-main/5 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent mb-4 block italic">O que entregamos</span>
             <h2 className="text-5xl md:text-7xl font-display font-black italic uppercase tracking-tighter">Funcionalidades <span className="text-accent underline decoration-4 underline-offset-8">Gufix</span></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              { 
                icon: Layout, 
                title: "Prescrição Inteligente", 
                desc: "Crie fichas completas em segundos com nossa lógica automática de séries e repetições ajustadas ao objetivo." 
              },
              { 
                icon: Smartphone, 
                title: "App do Aluno", 
                desc: "Seus alunos acessam os treinos pelo celular com vídeos explicativos integrados para cada exercício." 
              },
              { 
                icon: TrendingUp, 
                title: "Dashboard Financeira", 
                desc: "Gestão completa de faturamento, custos de assinatura e lucro líquido da sua consultoria em tempo real." 
              },
              { 
                icon: Shield, 
                title: "Segurança de Dados", 
                desc: "Seus treinos e dados de alunos protegidos com tecnologia Firebase e autenticação Google segura." 
              },
              { 
                icon: Clock, 
                title: "Histórico Vitalício", 
                desc: "Acompanhe a evolução de cada aluno com acesso total a todas as sessões já prescritas e finalizadas." 
              },
              { 
                icon: Users, 
                title: "Gestão de Alunos", 
                desc: "Cadastre, edite e controle o acesso da sua base de alunos com uma interface intuitiva e brutalista." 
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="bg-card-bg border border-text-main/10 p-10 rounded-[2.5rem] hover:border-accent/40 transition-all group"
              >
                <div className="bg-text-main/5 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-accent group-hover:text-page-bg transition-colors">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-4">{feature.title}</h3>
                <p className="text-text-dim text-sm font-bold leading-relaxed opacity-60 uppercase">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing / CTA */}
      <section className="py-40 px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto bg-text-main text-page-bg rounded-[4rem] p-12 md:p-24 text-center relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          
          <div className="relative z-10">
            <h2 className="text-5xl md:text-8xl font-display font-black italic uppercase tracking-tighter mb-8 leading-[0.9]">
              Pronto para o <br /> próximo nível?
            </h2>
            <p className="text-page-bg/60 text-lg font-bold uppercase tracking-widest mb-12 italic max-w-lg mx-auto">
              Junte-se à elite dos treinadores que usam a metodologia GJ para escalar resultados.
            </p>
            
            <button 
              onClick={handleAuth}
              className="bg-accent text-page-bg px-12 py-6 rounded-2xl font-black text-lg uppercase tracking-widest hover:scale-105 transition-all shadow-3xl shadow-accent/40 flex items-center justify-center gap-3 mx-auto"
            >
              Criar minha conta grátis
              <ChevronRight className="w-6 h-6" />
            </button>
            
            <div className="mt-12 flex flex-wrap justify-center gap-8 opacity-60 uppercase font-black text-[10px] tracking-widest italic">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-accent" /> IA Integrada</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-accent" /> App do Aluno</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-accent" /> Gestão Financeira</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-text-main/5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center gap-4">
              <div className="bg-accent text-page-bg p-2 rounded">
                 <Dumbbell className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-black tracking-tighter italic">GU<span className="text-accent">FIX</span></h1>
                <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest mt-0.5">Base GJ Personal © 2026</p>
              </div>
           </div>
           
           <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-text-dim italic">
              <a href="#" className="hover:text-accent transition-colors">Termos</a>
              <a href="#" className="hover:text-accent transition-colors">Privacidade</a>
              <a href="#" className="hover:text-accent transition-colors">Contato</a>
           </div>
        </div>
      </footer>

      <div className="fixed bottom-5 right-5 z-[200] bg-card-bg border border-text-main/10 rounded-2xl p-4 w-[320px] shadow-2xl">
        <p className="text-xs font-black uppercase tracking-widest mb-3">{isRegister ? 'Criar conta' : 'Entrar'}</p>
        {isRegister && (
          <input
            className="w-full mb-2 bg-page-bg border border-text-main/10 rounded-xl px-3 py-2 text-sm"
            placeholder="Nome completo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        )}
        <input
          className="w-full mb-2 bg-page-bg border border-text-main/10 rounded-xl px-3 py-2 text-sm"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="w-full mb-3 bg-page-bg border border-text-main/10 rounded-xl px-3 py-2 text-sm"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleAuth}
          disabled={loading || !email || !password || (isRegister && !fullName)}
          className="w-full bg-accent text-page-bg py-2 rounded-xl font-black text-xs uppercase tracking-widest disabled:opacity-50"
        >
          {loading ? 'Aguarde...' : isRegister ? 'Cadastrar' : 'Entrar'}
        </button>
        <button
          onClick={() => setIsRegister((v) => !v)}
          className="w-full mt-2 text-xs text-text-dim hover:text-accent"
        >
          {isRegister ? 'Já tenho conta' : 'Criar conta'}
        </button>
      </div>
    </div>
  );
}
