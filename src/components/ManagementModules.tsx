import { useEffect, useMemo, useState } from 'react';
import {
  Activity, AlertTriangle, ArrowUpRight, CalendarDays, CheckCircle2, ClipboardList,
  CreditCard, Dumbbell, HeartPulse, MessageSquareText, Plus, Save, Sparkles,
  TrendingUp, UserRoundCheck, Users, WalletCards,
} from 'lucide-react';
import { Client, SavedWorkout } from '../types';
import {
  Anamnesis, createEvaluation, createPayment, getAnamnesis, listEvaluations,
  listFeedbacks, listPayments, Payment, PhysicalEvaluation, saveAnamnesis,
  updatePaymentStatus, WorkoutFeedback,
} from '../lib/api';

type Navigate = (tab: string) => void;

const card = 'rounded-[2rem] border border-text-main/10 bg-card-bg shadow-xl shadow-black/5';
const field = 'w-full rounded-xl border border-text-main/10 bg-page-bg px-4 py-3 text-sm text-text-main outline-none transition focus:border-accent';
const label = 'mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-text-dim';

function dateLabel(value: string | null | undefined) {
  if (!value) return 'Sem data';
  return new Date(`${String(value).slice(0, 10)}T12:00:00`).toLocaleDateString('pt-BR');
}

function money(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function CoachDashboard({
  clients, workouts, finishedCount, onNavigate,
}: {
  clients: Client[];
  workouts: SavedWorkout[];
  finishedCount: number;
  onNavigate: Navigate;
}) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [feedbacks, setFeedbacks] = useState<WorkoutFeedback[]>([]);

  useEffect(() => {
    Promise.all([listPayments(), listFeedbacks()])
      .then(([paymentData, feedbackData]) => {
        setPayments(paymentData);
        setFeedbacks(feedbackData);
      })
      .catch(() => undefined);
  }, []);

  const pending = payments.filter((item) => item.status === 'Pendente' || item.status === 'Atrasado');
  const received = payments.filter((item) => item.status === 'Pago').reduce((sum, item) => sum + item.amount, 0);
  const activeClients = clients.filter((item) => item.status === 'Ativo').length;

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2.5rem] border border-accent/20 bg-card-bg p-6 md:p-10">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-accent">
              <Sparkles className="h-4 w-4" /> Central de performance
            </div>
            <h2 className="max-w-3xl text-4xl font-black uppercase italic leading-[0.9] tracking-tighter md:text-6xl">
              Sua consultoria em <span className="text-accent">movimento</span>
            </h2>
            <p className="mt-4 max-w-xl text-sm font-medium text-text-dim md:text-base">
              Alunos, prescrições, evolução e recebimentos em um só painel.
            </p>
          </div>
          <button onClick={() => onNavigate('sistema')} className="flex items-center justify-center gap-3 rounded-2xl bg-accent px-6 py-4 text-xs font-black uppercase tracking-widest text-page-bg">
            <Plus className="h-4 w-4" /> Prescrever treino
          </button>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { icon: Users, label: 'Alunos ativos', value: String(activeClients), note: `${clients.length} cadastrados` },
          { icon: Dumbbell, label: 'Treinos salvos', value: String(workouts.length), note: `${finishedCount} concluídos` },
          { icon: WalletCards, label: 'Recebido', value: money(received), note: `${pending.length} cobranças abertas` },
          { icon: MessageSquareText, label: 'Feedbacks', value: String(feedbacks.length), note: 'últimos registros' },
        ].map((item) => (
          <article key={item.label} className={`${card} p-4 md:p-6`}>
            <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <item.icon className="h-5 w-5" />
            </div>
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-text-dim">{item.label}</p>
            <p className="mt-2 text-2xl font-black tracking-tight md:text-3xl">{item.value}</p>
            <p className="mt-1 text-[10px] font-bold text-text-dim/60">{item.note}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { id: 'alunos', icon: UserRoundCheck, title: 'Alunos', text: 'Cadastro, acesso e acompanhamento.' },
          { id: 'anamnese', icon: ClipboardList, title: 'Anamnese', text: 'Saúde, hábitos, histórico e objetivos.' },
          { id: 'avaliacoes', icon: HeartPulse, title: 'Avaliações', text: 'Medidas corporais e evolução.' },
          { id: 'financeiro', icon: CreditCard, title: 'Financeiro', text: 'Mensalidades e inadimplência.' },
        ].map((item) => (
          <button key={item.id} onClick={() => onNavigate(item.id)} className={`${card} group p-6 text-left transition hover:-translate-y-1 hover:border-accent/40`}>
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-text-main/5 text-accent transition group-hover:bg-accent group-hover:text-page-bg">
                <item.icon className="h-6 w-6" />
              </div>
              <ArrowUpRight className="h-5 w-5 text-text-dim/30 group-hover:text-accent" />
            </div>
            <h3 className="mt-7 text-xl font-black uppercase italic tracking-tight">{item.title}</h3>
            <p className="mt-2 text-xs font-medium leading-relaxed text-text-dim">{item.text}</p>
          </button>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <div className={`${card} p-6`}>
          <div className="mb-5 flex items-center justify-between">
            <div><p className="text-[10px] font-black uppercase tracking-widest text-accent">Relacionamento</p><h3 className="text-xl font-black uppercase italic">Feedback recente</h3></div>
            <MessageSquareText className="h-5 w-5 text-accent" />
          </div>
          <div className="space-y-3">
            {feedbacks.slice(0, 4).map((item) => (
              <div key={item.id} className="flex items-center gap-4 rounded-2xl bg-page-bg p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 font-black text-accent">{item.rating}</div>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-black">{item.clientName}</p><p className="truncate text-xs text-text-dim">{item.comment || 'Treino avaliado sem comentário.'}</p></div>
                <span className="text-[9px] font-bold text-text-dim/50">{dateLabel(item.createdAt)}</span>
              </div>
            ))}
            {feedbacks.length === 0 && <p className="rounded-2xl border border-dashed border-text-main/10 p-6 text-center text-xs font-bold text-text-dim">Os feedbacks dos alunos aparecerão aqui.</p>}
          </div>
        </div>
        <div className={`${card} p-6`}>
          <p className="text-[10px] font-black uppercase tracking-widest text-accent">Atenção</p>
          <h3 className="text-xl font-black uppercase italic">Próximas ações</h3>
          <div className="mt-5 space-y-3">
            {pending.slice(0, 4).map((item) => (
              <button key={item.id} onClick={() => onNavigate('financeiro')} className="flex w-full items-center gap-3 rounded-2xl bg-page-bg p-4 text-left">
                <AlertTriangle className={`h-5 w-5 ${item.status === 'Atrasado' ? 'text-red-500' : 'text-amber-500'}`} />
                <div className="min-w-0 flex-1"><p className="truncate text-xs font-black">{item.clientName}</p><p className="text-[10px] text-text-dim">Vence {dateLabel(item.dueDate)}</p></div>
                <span className="text-xs font-black">{money(item.amount)}</span>
              </button>
            ))}
            {pending.length === 0 && <div className="flex items-center gap-3 rounded-2xl bg-emerald-500/10 p-4 text-emerald-500"><CheckCircle2 className="h-5 w-5" /><span className="text-xs font-black">Nenhuma pendência financeira.</span></div>}
          </div>
        </div>
      </section>
    </div>
  );
}

const emptyAnamnesis = (clientId = ''): Anamnesis => ({
  clientId, goal: '', medicalConditions: '', medications: '', injuries: '',
  experienceLevel: 'Iniciante', weeklyFrequency: 3, sleepHours: null,
  stressLevel: 5, notes: '',
});

export function AnamnesisView({ clients }: { clients: Client[] }) {
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [form, setForm] = useState<Anamnesis>(emptyAnamnesis(clientId));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!clientId) return;
    getAnamnesis(clientId).then((data) => setForm(data || emptyAnamnesis(clientId))).catch(() => setForm(emptyAnamnesis(clientId)));
  }, [clientId]);

  const set = (key: keyof Anamnesis, value: string | number | null) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async () => {
    if (!clientId) return;
    setSaving(true);
    try { setForm(await saveAnamnesis(clientId, form)); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-5">
      <ModuleTitle eyebrow="Saúde e contexto" title="Anamnese do aluno" icon={ClipboardList} />
      <div className={`${card} p-5 md:p-8`}>
        <label className={label}>Aluno</label>
        <select className={field} value={clientId} onChange={(e) => setClientId(e.target.value)}><option value="">Selecione</option>{clients.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
      </div>
      {clientId && <div className={`${card} grid gap-5 p-5 md:grid-cols-2 md:p-8`}>
        <TextArea title="Objetivo principal" value={form.goal} onChange={(v) => set('goal', v)} />
        <TextArea title="Condições médicas" value={form.medicalConditions} onChange={(v) => set('medicalConditions', v)} />
        <TextArea title="Medicamentos" value={form.medications} onChange={(v) => set('medications', v)} />
        <TextArea title="Lesões e limitações" value={form.injuries} onChange={(v) => set('injuries', v)} />
        <div><label className={label}>Nível de experiência</label><select className={field} value={form.experienceLevel} onChange={(e) => set('experienceLevel', e.target.value)}><option>Iniciante</option><option>Intermediário</option><option>Avançado</option></select></div>
        <div><label className={label}>Treinos por semana</label><input className={field} type="number" min="1" max="7" value={form.weeklyFrequency} onChange={(e) => set('weeklyFrequency', Number(e.target.value))} /></div>
        <div><label className={label}>Horas de sono</label><input className={field} type="number" step="0.5" value={form.sleepHours ?? ''} onChange={(e) => set('sleepHours', e.target.value ? Number(e.target.value) : null)} /></div>
        <div><label className={label}>Estresse (0 a 10)</label><input className={field} type="range" min="0" max="10" value={form.stressLevel ?? 5} onChange={(e) => set('stressLevel', Number(e.target.value))} /><p className="mt-2 text-center text-sm font-black text-accent">{form.stressLevel ?? 5}</p></div>
        <div className="md:col-span-2"><TextArea title="Observações do personal" value={form.notes} onChange={(v) => set('notes', v)} /></div>
        <button onClick={submit} disabled={saving} className="flex items-center justify-center gap-2 rounded-2xl bg-accent px-6 py-4 text-xs font-black uppercase tracking-widest text-page-bg md:col-span-2"><Save className="h-4 w-4" />{saving ? 'Salvando...' : 'Salvar anamnese'}</button>
      </div>}
    </div>
  );
}

export function EvaluationsView({ clients }: { clients: Client[] }) {
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [items, setItems] = useState<PhysicalEvaluation[]>([]);
  const [form, setForm] = useState<any>({ evaluationDate: new Date().toISOString().slice(0, 10) });
  const reload = () => clientId && listEvaluations(clientId).then(setItems);
  useEffect(reload, [clientId]);
  const set = (key: string, value: string) => setForm((current: any) => ({ ...current, [key]: value }));
  const save = async () => { await createEvaluation({ ...form, clientId }); setForm({ evaluationDate: new Date().toISOString().slice(0, 10) }); reload(); };
  const latest = items[0];
  const bmi = latest?.weight && latest?.height ? latest.weight / Math.pow(latest.height / 100, 2) : null;

  return <div className="space-y-5">
    <ModuleTitle eyebrow="Métricas e evolução" title="Avaliação física" icon={HeartPulse} />
    <div className="grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
      <div className={`${card} p-5 md:p-7`}>
        <label className={label}>Aluno</label><select className={field} value={clientId} onChange={(e) => setClientId(e.target.value)}><option value="">Selecione</option>{clients.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
        <div className="mt-5 grid grid-cols-2 gap-3">
          {[['weight', 'Peso (kg)'], ['height', 'Altura (cm)'], ['bodyFat', 'Gordura (%)'], ['waist', 'Cintura (cm)'], ['hip', 'Quadril (cm)'], ['chest', 'Peitoral (cm)'], ['arm', 'Braço (cm)'], ['thigh', 'Coxa (cm)']].map(([key, title]) => <div key={key}><label className={label}>{title}</label><input className={field} type="number" step="0.1" value={form[key] || ''} onChange={(e) => set(key, e.target.value)} /></div>)}
        </div>
        <div className="mt-3"><label className={label}>Data</label><input className={field} type="date" value={form.evaluationDate} onChange={(e) => set('evaluationDate', e.target.value)} /></div>
        <button disabled={!clientId} onClick={save} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-4 text-xs font-black uppercase tracking-widest text-page-bg"><Plus className="h-4 w-4" />Registrar avaliação</button>
      </div>
      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <Metric title="Peso atual" value={latest?.weight ? `${latest.weight} kg` : '--'} icon={Activity} />
          <Metric title="IMC" value={bmi ? bmi.toFixed(1) : '--'} icon={TrendingUp} />
          <Metric title="Gordura" value={latest?.bodyFat ? `${latest.bodyFat}%` : '--'} icon={HeartPulse} />
        </div>
        <div className={`${card} p-5 md:p-7`}><h3 className="text-lg font-black uppercase italic">Linha do tempo</h3><div className="mt-5 space-y-3">{items.map((item) => <div key={item.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl bg-page-bg p-4"><CalendarDays className="h-5 w-5 text-accent" /><div><p className="text-xs font-black">{dateLabel(item.evaluationDate)}</p><p className="text-[10px] text-text-dim">Cintura {item.waist || '--'} cm · Quadril {item.hip || '--'} cm</p></div><p className="text-sm font-black">{item.weight || '--'} kg</p></div>)}{items.length === 0 && <p className="text-xs font-bold text-text-dim">Nenhuma avaliação registrada.</p>}</div></div>
      </div>
    </div>
  </div>;
}

export function FinanceView({ clients }: { clients: Client[] }) {
  const [items, setItems] = useState<Payment[]>([]);
  const [form, setForm] = useState<any>({ clientId: clients[0]?.id || '', description: 'Mensalidade', amount: '', dueDate: new Date().toISOString().slice(0, 10), paymentMethod: 'Pix' });
  const reload = () => listPayments().then(setItems);
  useEffect(reload, []);
  const received = useMemo(() => items.filter((x) => x.status === 'Pago').reduce((sum, x) => sum + x.amount, 0), [items]);
  const pending = useMemo(() => items.filter((x) => x.status === 'Pendente' || x.status === 'Atrasado').reduce((sum, x) => sum + x.amount, 0), [items]);
  const save = async () => { await createPayment({ ...form, amount: Number(form.amount) }); setForm((current: any) => ({ ...current, amount: '' })); reload(); };

  return <div className="space-y-5">
    <ModuleTitle eyebrow="Receita e recorrência" title="Financeiro" icon={WalletCards} />
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3"><Metric title="Recebido" value={money(received)} icon={CheckCircle2} /><Metric title="Em aberto" value={money(pending)} icon={CalendarDays} /><Metric title="Alunos pagantes" value={String(new Set(items.map((x) => x.clientId)).size)} icon={Users} /></div>
    <div className="grid gap-5 lg:grid-cols-[.7fr_1.3fr]">
      <div className={`${card} space-y-4 p-5 md:p-7`}><h3 className="text-lg font-black uppercase italic">Nova cobrança</h3>
        <div><label className={label}>Aluno</label><select className={field} value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}>{clients.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
        <div><label className={label}>Descrição</label><input className={field} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-3"><div><label className={label}>Valor</label><input className={field} type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div><div><label className={label}>Vencimento</label><input className={field} type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></div></div>
        <button disabled={!form.clientId || !form.amount} onClick={save} className="w-full rounded-2xl bg-accent px-5 py-4 text-xs font-black uppercase tracking-widest text-page-bg">Criar cobrança</button>
      </div>
      <div className={`${card} overflow-hidden p-5 md:p-7`}><h3 className="mb-5 text-lg font-black uppercase italic">Cobranças</h3><div className="space-y-3">{items.map((item) => <div key={item.id} className="flex flex-col gap-3 rounded-2xl bg-page-bg p-4 sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><p className="truncate text-sm font-black">{item.clientName}</p><p className="text-[10px] text-text-dim">{item.description} · {dateLabel(item.dueDate)}</p></div><p className="text-sm font-black">{money(item.amount)}</p><select className="rounded-xl border border-text-main/10 bg-card-bg px-3 py-2 text-xs font-black" value={item.status} onChange={async (e) => { await updatePaymentStatus(item.id, e.target.value as Payment['status']); reload(); }}><option>Pendente</option><option>Pago</option><option>Atrasado</option><option>Cancelado</option></select></div>)}{items.length === 0 && <p className="text-xs font-bold text-text-dim">Nenhuma cobrança cadastrada.</p>}</div></div>
    </div>
  </div>;
}

function ModuleTitle({ eyebrow, title, icon: Icon }: { eyebrow: string; title: string; icon: typeof Activity }) {
  return <div className={`${card} flex items-center gap-4 p-5 md:p-7`}><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-page-bg"><Icon className="h-7 w-7" /></div><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-accent">{eyebrow}</p><h2 className="text-2xl font-black uppercase italic tracking-tight md:text-3xl">{title}</h2></div></div>;
}

function TextArea({ title, value, onChange }: { title: string; value: string; onChange: (value: string) => void }) {
  return <div><label className={label}>{title}</label><textarea className={`${field} min-h-28 resize-y`} value={value || ''} onChange={(e) => onChange(e.target.value)} /></div>;
}

function Metric({ title, value, icon: Icon }: { title: string; value: string; icon: typeof Activity }) {
  return <div className={`${card} p-4 md:p-5`}><Icon className="mb-4 h-5 w-5 text-accent" /><p className="text-[9px] font-black uppercase tracking-widest text-text-dim">{title}</p><p className="mt-1 text-xl font-black tracking-tight md:text-2xl">{value}</p></div>;
}
