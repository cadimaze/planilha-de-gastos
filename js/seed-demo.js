/*
 * Seed de dados fictícios — ferramenta de teste (não é carregada pelo index.html).
 *
 * Gera um cenário completo em uma planilha descartável: transações do mês atual e
 * dos 3 meses anteriores, parcelamentos (inclusive com parcelas futuras), lançamentos
 * recorrentes, carteiras VA/VR, cartões de crédito/débito com saldo importado,
 * assinaturas em BRL e USD, investimentos e gastos planejados do simulador.
 *
 * Todo documento criado recebe `seedTag: 'demo'` para que a limpeza remova apenas
 * o que foi semeado aqui. Se as regras do Firestore rejeitarem o campo extra, o
 * seed cai automaticamente para o modo sem marca e usa os IDs salvos no localStorage.
 */

const SEED_TAG  = 'demo';
const SEED_COLS = ['transactions', 'planned', 'recorrentes', 'cartoes', 'assinaturas', 'investimentos'];
const LS_PREFIX = 'seed_demo_ids_';

// ── Datas ───────────────────────────────────────────────────────────────────
const NOW = new Date();
const pad = n => String(n).padStart(2, '0');

function monthStart(offset) {
  return new Date(NOW.getFullYear(), NOW.getMonth() + offset, 1);
}

function mKey(offset) {
  const d = monthStart(offset);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

// Data no mês `offset`. No mês corrente o dia é limitado a hoje, senão o filtro
// de dia padrão do dashboard esconderia os lançamentos recém-criados.
function dStr(offset, day) {
  const d       = monthStart(offset);
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  let use = Math.min(day, lastDay);
  if (offset === 0) use = Math.min(use, NOW.getDate());
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(use)}`;
}

function genGroupId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ── Dataset ─────────────────────────────────────────────────────────────────
// Meses semeados: -3, -2, -1 e 0 (corrente).
const MONTHS = [-3, -2, -1, 0];

// Variação por mês para os lançamentos que mudam de valor.
const MONTHLY_TWEAK = {
  '-3': { mercado: 612.40, luz: 168.30, uber: 82.50,  restaurante: 118.00 },
  '-2': { mercado: 689.90, luz: 204.10, uber: 96.70,  restaurante: 142.60 },
  '-1': { mercado: 574.25, luz: 187.45, uber: 71.20,  restaurante: 96.80  },
  '0':  { mercado: 655.10, luz: 195.80, uber: 104.30, restaurante: 131.40 },
};

// Lançamentos pontuais, por mês (não se repetem todo mês).
const ONE_OFFS = {
  '-3': [
    { type: 'income',  description: 'Venda de bicicleta antiga', amount: 320.00,  date: 18, category: 'Venda',      notes: 'Vendida no marketplace' },
    { type: 'expense', description: 'Óculos de grau',            amount: 480.00,  date: 22, category: 'Saúde',      notes: '' },
  ],
  '-2': [
    { type: 'expense', description: 'Manutenção do carro',       amount: 890.00,  date: 14, category: 'Transporte', notes: 'Troca de pastilhas e óleo' },
    { type: 'expense', description: 'Presente de aniversário',   amount: 210.00,  date: 24, category: 'Outros',     notes: '' },
  ],
  '-1': [
    { type: 'income',  description: 'Bônus semestral',           amount: 2500.00, date: 20, category: 'Bônus',      notes: 'PLR' },
    { type: 'expense', description: 'Dentista — canal',          amount: 1200.00, date: 11, category: 'Saúde',      notes: 'Pago à vista com desconto' },
  ],
  '0': [
    { type: 'income',  description: 'Reembolso de viagem',       amount: 180.00,  date: 9,  category: 'Reembolso',  notes: 'Hotel do evento' },
    { type: 'expense', description: 'Ingresso show',             amount: 260.00,  date: 13, category: 'Lazer',      notes: '' },
  ],
};

// Freelances só em alguns meses.
const FREELA = { '-3': 1200.00, '-2': 0, '-1': 1500.00, '0': 900.00 };

// Cartões — os IDs são gerados antes para poderem ser referenciados nas transações.
const CARDS = [
  { key: 'nubank', name: 'Nubank',            type: 'credito', color: '#7c3aed', closingDay: 28, dueDay: 5  },
  { key: 'inter',  name: 'Inter Gold',        type: 'credito', color: '#b45309', closingDay: 20, dueDay: 28 },
  { key: 'bb',     name: 'Banco do Brasil',   type: 'debito',  color: '#1e3a8a', closingDay: null, dueDay: null },
];

const ASSINATURAS = [
  { name: 'Netflix',         category: 'streaming', amount: 55.90, currency: 'BRL' },
  { name: 'Spotify Família', category: 'musica',    amount: 34.90, currency: 'BRL' },
  { name: 'ChatGPT Plus',    category: 'ia',        amount: 20.00, currency: 'USD' },
  { name: 'GitHub Copilot',  category: 'software',  amount: 10.00, currency: 'USD' },
  { name: 'Xbox Game Pass',  category: 'jogos',     amount: 44.99, currency: 'BRL' },
  { name: 'Jornal digital',  category: 'noticias',  amount: 19.90, currency: 'BRL' },
  { name: 'Gympass Silver',  category: 'saude',     amount: 99.90, currency: 'BRL' },
  { name: 'iCloud 200GB',    category: 'outros',    amount:  8.90, currency: 'BRL' },
];

const INVESTIMENTOS = [
  { type: 'Tesouro Selic',        description: 'Reserva de emergência', amount: 1000.00, offset: -3, day: 7,  currency: 'BRL', notes: 'Aporte mensal automático' },
  { type: 'CDB',                  description: 'CDB 110% CDI',          amount:  800.00, offset: -2, day: 7,  currency: 'BRL', notes: '' },
  { type: 'Fundo Imobiliário',    description: 'HGLG11',                amount:  500.00, offset: -2, day: 15, currency: 'BRL', notes: '' },
  { type: 'Ações',                description: 'ITSA4',                 amount:  650.00, offset: -1, day: 10, currency: 'BRL', notes: '' },
  { type: 'ETF',                  description: 'IVVB11',                amount:  400.00, offset: -1, day: 18, currency: 'BRL', notes: '' },
  { type: 'Câmbio Internacional', description: 'Conta em dólar',        amount:  200.00, offset: -1, day: 25, currency: 'USD', notes: 'Compra de USD' },
  { type: 'Criptomoedas',         description: 'Bitcoin',               amount:  150.00, offset:  0, day: 6,  currency: 'USD', notes: 'DCA mensal' },
  { type: 'Poupança',             description: 'Poupança do banco',     amount:  300.00, offset:  0, day: 8,  currency: 'BRL', notes: '' },
  { type: 'Previdência Privada',  description: 'PGBL',                  amount:  250.00, offset:  0, day: 12, currency: 'BRL', notes: '' },
];

const RECORRENTES = [
  { type: 'income',  description: 'Aluguel da kitnet',  amount: 1100.00, day: 10, category: 'Aluguel Recebido', notes: 'Inquilino paga por Pix', active: true,  startOffset: -3 },
  { type: 'expense', description: 'Internet fibra 500MB', amount: 129.90, day: 15, category: 'Serviços',        notes: '',                       active: true,  startOffset: -3 },
  { type: 'expense', description: 'Academia',            amount:   99.90, day:  8, category: 'Saúde',           notes: 'Plano anual parcelado',  active: true,  startOffset: -2 },
  { type: 'expense', description: 'Plano de celular',    amount:   59.90, day: 20, category: 'Serviços',        notes: 'Cancelado — inativo',    active: false, startOffset: -3 },
];

const PLANEJADOS = [
  { description: 'Reforma da cozinha',   paymentType: 'lump',        totalAmount: 8500.00, installments: 1,  startOffset: 2, installmentAmounts: null },
  { description: 'Viagem para Portugal', paymentType: 'installment', totalAmount: 9500.00, installments: 10, startOffset: 1, installmentAmounts: null },
  { description: 'Troca do notebook',    paymentType: 'installment', totalAmount: 4500.00, installments: 5,  startOffset: 3, installmentAmounts: [1500, 800, 800, 800, 600] },
];

// ── Construção dos documentos ───────────────────────────────────────────────
function buildTransactions(cardIds) {
  const tx = [];
  const push = t => tx.push({
    type: t.type, description: t.description, amount: t.amount, date: t.date,
    category: t.category, notes: t.notes || '', cardId: t.cardId || null,
    currency: t.currency || 'BRL',
    groupId: t.groupId || null,
    installmentNumber: t.installmentNumber || null,
    totalInstallments: t.totalInstallments || null,
  });

  MONTHS.forEach(off => {
    const k = String(off);
    const v = MONTHLY_TWEAK[k];

    // Entradas
    push({ type: 'income', description: 'Salário',           amount: 6800.00, date: dStr(off, 5), category: 'Salário',          notes: 'Líquido em conta' });
    push({ type: 'income', description: 'Vale Alimentação',  amount:  750.00, date: dStr(off, 5), category: 'Vale Alimentação', notes: 'Crédito do benefício' });
    push({ type: 'income', description: 'Vale Refeição',     amount:  600.00, date: dStr(off, 5), category: 'Vale Refeição',    notes: 'Crédito do benefício' });
    if (FREELA[k] > 0) {
      push({ type: 'income', description: 'Freelance — landing page', amount: FREELA[k], date: dStr(off, 12), category: 'Freelance', notes: 'Projeto avulso' });
    }
    push({ type: 'income', description: 'Dividendos recebidos', amount: 87.35, date: dStr(off, 16), category: 'Investimentos', notes: 'FIIs e ações' });

    // Saídas — conta corrente
    push({ type: 'expense', description: 'Aluguel',              amount: 1850.00, date: dStr(off, 5),  category: 'Moradia',    notes: '', cardId: cardIds.bb });
    push({ type: 'expense', description: 'Supermercado do mês',  amount: v.mercado, date: dStr(off, 6), category: 'Alimentação', notes: '', cardId: cardIds.bb });
    push({ type: 'expense', description: 'Conta de luz',         amount: v.luz,   date: dStr(off, 12), category: 'Moradia',    notes: '' });
    push({ type: 'expense', description: 'Corridas de app',      amount: v.uber,  date: dStr(off, 17), category: 'Transporte', notes: '' });
    push({ type: 'expense', description: 'Farmácia',             amount: 75.40,   date: dStr(off, 19), category: 'Saúde',      notes: '' });
    push({ type: 'expense', description: 'Curso de inglês',      amount: 189.90,  date: dStr(off, 10), category: 'Educação',   notes: '' });

    // Saídas — cartão de crédito
    push({ type: 'expense', description: 'Jantar em restaurante', amount: v.restaurante, date: dStr(off, 21), category: 'Alimentação',    notes: '', cardId: cardIds.nubank });
    push({ type: 'expense', description: 'Cinema',                amount: 62.00,         date: dStr(off, 23), category: 'Entretenimento', notes: '', cardId: cardIds.nubank });
    push({ type: 'expense', description: 'Camiseta',              amount: 119.00,        date: dStr(off, 14), category: 'Vestuário',      notes: '', cardId: cardIds.inter });
    push({ type: 'expense', description: 'Domínio .com anual',    amount: 12.99,         date: dStr(off, 4),  category: 'Tecnologia',     notes: 'Cobrado em dólar', cardId: cardIds.inter, currency: 'USD' });

    // Carteiras VA / VR
    push({ type: 'expense', description: 'Mercado com o VA',   amount: 482.30, date: dStr(off, 7),  category: 'Alimentação (VA)', notes: '' });
    push({ type: 'expense', description: 'Feira da semana',    amount: 138.60, date: dStr(off, 20), category: 'Alimentação (VA)', notes: '' });
    push({ type: 'expense', description: 'Almoços da semana',  amount: 320.00, date: dStr(off, 8),  category: 'Refeição (VR)',    notes: '' });
    push({ type: 'expense', description: 'Almoço com o time',  amount:  96.50, date: dStr(off, 22), category: 'Refeição (VR)',    notes: '' });

    (ONE_OFFS[k] || []).forEach(o => push({ ...o, date: dStr(off, o.date) }));
  });

  // Parcelamentos — atravessam meses passados e futuros
  const parcelados = [
    { desc: 'Notebook Dell',      n: 6, valor: 583.33, startOffset: -1, category: 'Tecnologia', cardId: cardIds.nubank },
    { desc: 'Passagem aérea',     n: 4, valor: 420.00, startOffset:  0, category: 'Lazer',      cardId: cardIds.inter  },
    { desc: 'Colchão ortopédico', n: 3, valor: 366.60, startOffset: -2, category: 'Moradia',    cardId: cardIds.nubank },
  ];
  parcelados.forEach(p => {
    const groupId = genGroupId();
    for (let i = 0; i < p.n; i++) {
      push({
        type: 'expense',
        description: `${p.desc} (${i + 1}/${p.n})`,
        amount: p.valor,
        date: dStr(p.startOffset + i, 15),
        category: p.category,
        notes: '',
        cardId: p.cardId,
        groupId,
        installmentNumber: i + 1,
        totalInstallments: p.n,
      });
    }
  });

  // Saldo importado dos cartões de crédito (mesma forma que UICartoes gera)
  [
    { cardId: cardIds.nubank, offset: -2, amount: 1240.55 },
    { cardId: cardIds.nubank, offset: -1, amount:  980.20 },
    { cardId: cardIds.inter,  offset: -1, amount:  436.70 },
  ].forEach(imp => push({
    type: 'expense', description: 'Saldo importado', category: 'Outros',
    cardId: imp.cardId, amount: imp.amount, date: dStr(imp.offset, 1), notes: '',
  }));

  return tx;
}

// ── Infra de escrita ────────────────────────────────────────────────────────
const logEl = () => document.getElementById('log');

function log(msg) {
  const el = logEl();
  if (!el) return;
  el.textContent += `\n${msg}`;
  el.scrollTop = el.scrollHeight;
}

function clearLog(msg) {
  const el = logEl();
  if (el) el.textContent = msg;
}

const Seed = {
  planilhas: [],
  useTag: true,

  colRef(planilhaId, name) {
    return db.collection('planilhas').doc(planilhaId).collection(name);
  },

  // Descobre se as regras do Firestore aceitam o campo extra `seedTag`.
  async probeTag(planilhaId) {
    const ref = this.colRef(planilhaId, 'transactions').doc();
    try {
      await ref.set({
        type: 'expense', description: '__seed_probe__', amount: 0.01,
        date: dStr(0, 1), category: 'Outros', notes: '', seedTag: SEED_TAG,
      });
      await ref.delete();
      return true;
    } catch (e) {
      try { await ref.delete(); } catch (_) { /* já falhou na escrita */ }
      return false;
    }
  },

  _rememberIds(planilhaId, col, ids) {
    const key = LS_PREFIX + planilhaId;
    let store = {};
    try { store = JSON.parse(localStorage.getItem(key) || '{}'); } catch (_) {}
    store[col] = [...(store[col] || []), ...ids];
    try { localStorage.setItem(key, JSON.stringify(store)); } catch (_) {}
  },

  async writeAll(planilhaId, col, docs) {
    const colRef = this.colRef(planilhaId, col);
    const refs   = docs.map(() => colRef.doc());
    for (let i = 0; i < docs.length; i += 400) {
      const batch = db.batch();
      docs.slice(i, i + 400).forEach((data, j) => {
        const payload = { ...data, createdAt: firebase.firestore.FieldValue.serverTimestamp() };
        if (this.useTag) payload.seedTag = SEED_TAG;
        batch.set(refs[i + j], payload);
      });
      await batch.commit();
    }
    this._rememberIds(planilhaId, col, refs.map(r => r.id));
    log(`  ✓ ${col}: ${docs.length} documento(s)`);
    return refs.map(r => r.id);
  },

  async run(planilhaId) {
    clearLog('Iniciando seed...');

    this.useTag = await this.probeTag(planilhaId);
    log(this.useTag
      ? 'Marca seedTag aceita pelas regras — limpeza seletiva disponível.'
      : 'Regras recusaram o campo seedTag; usando os IDs salvos neste navegador para a limpeza.');

    // 1. Cartões primeiro — as transações referenciam os IDs gerados.
    const cardDocs = CARDS.map(c => ({ name: c.name, type: c.type, color: c.color, closingDay: c.closingDay, dueDay: c.dueDay }));
    const cardIds  = {};
    const created  = await this.writeAll(planilhaId, 'cartoes', cardDocs);
    CARDS.forEach((c, i) => { cardIds[c.key] = created[i]; });

    // 2. Transações (avulsas, VA/VR, parceladas e saldo importado)
    await this.writeAll(planilhaId, 'transactions', buildTransactions(cardIds));

    // 3. Recorrentes
    await this.writeAll(planilhaId, 'recorrentes', RECORRENTES.map(r => ({
      type: r.type, description: r.description, amount: r.amount, day: r.day,
      category: r.category, notes: r.notes, active: r.active, startDate: mKey(r.startOffset),
    })));

    // 4. Assinaturas
    await this.writeAll(planilhaId, 'assinaturas', ASSINATURAS.map(a => ({ ...a })));

    // 5. Investimentos
    await this.writeAll(planilhaId, 'investimentos', INVESTIMENTOS.map(i => ({
      type: i.type, description: i.description, amount: i.amount,
      date: dStr(i.offset, i.day), notes: i.notes, currency: i.currency,
    })));

    // 6. Gastos planejados (simulador)
    await this.writeAll(planilhaId, 'planned', PLANEJADOS.map(p => ({
      description: p.description, totalAmount: p.totalAmount, paymentType: p.paymentType,
      installments: p.installments, startDate: dStr(p.startOffset, 1),
      installmentAmounts: p.installmentAmounts,
    })));

    log('\nConcluído. Abra o Hive, selecione a planilha e navegue pelas abas.');
  },

  async wipe(planilhaId) {
    clearLog('Removendo dados fictícios...');
    let total = 0;

    for (const col of SEED_COLS) {
      const colRef = this.colRef(planilhaId, col);
      const refs   = new Map();

      try {
        const snap = await colRef.where('seedTag', '==', SEED_TAG).get();
        snap.docs.forEach(d => refs.set(d.id, d.ref));
      } catch (e) {
        log(`  ! consulta por seedTag falhou em ${col}: ${e.message}`);
      }

      let store = {};
      try { store = JSON.parse(localStorage.getItem(LS_PREFIX + planilhaId) || '{}'); } catch (_) {}
      (store[col] || []).forEach(id => { if (!refs.has(id)) refs.set(id, colRef.doc(id)); });

      const list = [...refs.values()];
      for (let i = 0; i < list.length; i += 400) {
        const batch = db.batch();
        list.slice(i, i + 400).forEach(ref => batch.delete(ref));
        await batch.commit();
      }
      total += list.length;
      log(`  ✓ ${col}: ${list.length} removido(s)`);
    }

    try { localStorage.removeItem(LS_PREFIX + planilhaId); } catch (_) {}
    log(`\nConcluído. ${total} documento(s) removido(s).`);
  },
};

// ── UI ──────────────────────────────────────────────────────────────────────
function el(id) { return document.getElementById(id); }

function escHtml(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function selectedPlanilha() {
  const id = el('planilha-select')?.value;
  return Seed.planilhas.find(p => p.id === id) || null;
}

function syncButtons() {
  const p    = selectedPlanilha();
  const typed = el('confirm-name')?.value?.trim();
  const ok    = !!p && typed === p.name;
  el('btn-seed').disabled = !ok;
  el('btn-wipe').disabled = !ok;
  el('planilha-hint').textContent = p
    ? (ok ? 'Nome confirmado — os botões estão liberados.' : `Digite exatamente: ${p.name}`)
    : 'Nenhuma planilha encontrada nesta conta.';
}

async function loadPlanilhas() {
  const snap = await db.collection('planilhas')
    .where('memberIds', 'array-contains', auth.currentUser.uid)
    .get();
  Seed.planilhas = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  const sel = el('planilha-select');
  sel.innerHTML = Seed.planilhas
    .map(p => `<option value="${escHtml(p.id)}">${escHtml(p.name)}</option>`).join('');

  // Pré-seleciona a planilha de testes, se existir.
  const testes = Seed.planilhas.find(p => /teste/i.test(p.name || ''));
  if (testes) sel.value = testes.id;
  syncButtons();
}

function busy(state) {
  ['btn-seed', 'btn-wipe'].forEach(id => { el(id).disabled = state; });
  if (!state) syncButtons();
}

document.addEventListener('DOMContentLoaded', () => {
  el('btn-login').addEventListener('click', async () => {
    try {
      await auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    } catch (e) {
      if (e.code !== 'auth/popup-closed-by-user') alert('Erro ao entrar: ' + (e.message || e));
    }
  });

  el('btn-logout').addEventListener('click', () => auth.signOut());
  el('planilha-select').addEventListener('change', syncButtons);
  el('confirm-name').addEventListener('input', syncButtons);

  el('btn-seed').addEventListener('click', async () => {
    const p = selectedPlanilha();
    if (!p) return;
    if (!confirm(`Popular "${p.name}" com dados fictícios?`)) return;
    busy(true);
    try { await Seed.run(p.id); }
    catch (e) { log('\nERRO: ' + (e.message || e)); console.error(e); }
    busy(false);
  });

  el('btn-wipe').addEventListener('click', async () => {
    const p = selectedPlanilha();
    if (!p) return;
    if (!confirm(`Remover de "${p.name}" todos os documentos marcados como fictícios?`)) return;
    busy(true);
    try { await Seed.wipe(p.id); }
    catch (e) { log('\nERRO: ' + (e.message || e)); console.error(e); }
    busy(false);
  });

  auth.onAuthStateChanged(async user => {
    el('sec-login').classList.toggle('hidden', !!user);
    el('sec-panel').classList.toggle('hidden', !user);
    if (!user) return;
    el('user-email').textContent = user.email || user.displayName || '';
    try { await loadPlanilhas(); }
    catch (e) { log('Erro ao carregar planilhas: ' + (e.message || e)); }
  });
});
