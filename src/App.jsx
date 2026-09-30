// =====================================================================
//  MIMI DOG'S PET SHOP — Sistema de Gestão
//  Etapa 1: Login, níveis de acesso, Dashboard, Clientes, Pets e a Mimi
// =====================================================================
import React, { useState, useEffect, useMemo, useRef, useCallback, createContext, useContext } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail,
  setPersistence, browserLocalPersistence, browserSessionPersistence,
} from "firebase/auth";
import {
  getFirestore, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, getDoc, setDoc,
  getDocs, query, limit, runTransaction,
} from "firebase/firestore";

// =====================================================================
//  CONFIGURAÇÃO DO FIREBASE
//  Projeto: pet-mimi-dog. NÃO ALTERAR sem pedido do dono do sistema.
//  (Se o apiKey começar com "COLE", o sistema entra em modo de teste.)
// =====================================================================
const firebaseConfig = {
  apiKey: "AIzaSyA1HZ48hJz0FNYACwKUpSMVPSYqMgCKYbo",
  authDomain: "pet-mimi-dog.firebaseapp.com",
  projectId: "pet-mimi-dog",
  storageBucket: "pet-mimi-dog.firebasestorage.app",
  messagingSenderId: "792114716112",
  appId: "1:792114716112:web:283688e35d562ec36cedd5",
  measurementId: "G-6HW1C3R9MP",
};

const MODO_DEMO = !firebaseConfig.apiKey || firebaseConfig.apiKey.startsWith("COLE");
let fbAuth = null;
let fbDb = null;
if (!MODO_DEMO) {
  const fbApp = initializeApp(firebaseConfig);
  fbAuth = getAuth(fbApp);
  fbDb = getFirestore(fbApp);
}

const LOGO = "data:image/jpeg;base64,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";

const EMPRESA = {
  nome: "Mimi Dog's Pet Shop",
  whatsapp: "11954553032",
  endereco: "Rua Tomás Francisco Pires, 238",
};
const linkMapa = (c) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([(c || EMPRESA).endereco, c && c.cidade].filter(Boolean).join(", ") + " Mimi Dog's Pet Shop")}`;

// =====================================================================
//  UTILITÁRIOS
// =====================================================================
const soDigitos = (s) => String(s || "").replace(/\D/g, "");
const gerarId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const codigo = (prefixo, n) => `${prefixo}-${String(n).padStart(6, "0")}`;
const hojeISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const fmtData = (s) => {
  if (!s) return "—";
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s.split("-").reverse().join("/");
  const d = new Date(s);
  return isNaN(d) ? "—" : d.toLocaleDateString("pt-BR");
};
const fmtDataHora = (s) => {
  const d = new Date(s);
  return isNaN(d) ? "—" : d.toLocaleDateString("pt-BR") + " às " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
};
const fmtTel = (s) => {
  const d = soDigitos(s);
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return s || "";
};
const fmtDoc = (s) => {
  const d = soDigitos(s);
  if (d.length === 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  if (d.length === 14) return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  return s || "";
};
const idadeTexto = (nasc) => {
  if (!nasc) return "";
  const [a, m, d] = nasc.split("-").map(Number);
  const hoje = new Date();
  let meses = (hoje.getFullYear() - a) * 12 + (hoje.getMonth() + 1 - m);
  if (hoje.getDate() < d) meses -= 1;
  if (meses < 0) return "";
  if (meses < 12) return meses <= 1 ? `${Math.max(meses, 0)} mês` : `${meses} meses`;
  const anos = Math.floor(meses / 12);
  return anos === 1 ? "1 ano" : `${anos} anos`;
};
const linkWhats = (tel, msg = "") => {
  let d = soDigitos(tel);
  if (d.length === 10 || d.length === 11) d = "55" + d;
  return `https://wa.me/${d}${msg ? "?text=" + encodeURIComponent(msg) : ""}`;
};
const normalizar = (s) => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const primeiroNome = (s) => String(s || "").trim().split(" ")[0] || "";
const mesDe = (iso) => (iso ? String(iso).slice(0, 7) : "");

function comprimirImagem(file, max = 480, qualidade = 0.72) {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = () => {
      const img = new Image();
      img.onload = () => {
        const escala = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * escala);
        c.height = Math.round(img.height * escala);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL("image/jpeg", qualidade));
      };
      img.onerror = reject;
      img.src = leitor.result;
    };
    leitor.onerror = reject;
    leitor.readAsDataURL(file);
  });
}

function exportarCSV(nomeArquivo, cabecalho, linhas) {
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const conteudo = [cabecalho, ...linhas].map((l) => l.map(esc).join(";")).join("\n");
  const blob = new Blob(["\ufeff" + conteudo], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = nomeArquivo;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

// =====================================================================
//  UTILITÁRIOS EXTRAS (datas, dinheiro, horários)
// =====================================================================
const pad2 = (n) => String(n).padStart(2, "0");
const paraISO = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const dataDeISO = (iso) => new Date(`${iso}T12:00:00`);
const somaDias = (iso, n) => { const d = dataDeISO(iso); d.setDate(d.getDate() + n); return paraISO(d); };
const difDias = (a, b) => Math.round((dataDeISO(a) - dataDeISO(b)) / 86400000);
const minutosDe = (hhmm) => { const [h, m] = String(hhmm || "0:0").split(":").map(Number); return (h || 0) * 60 + (m || 0); };
const hhmmDe = (min) => `${pad2(Math.floor(min / 60))}:${pad2(min % 60)}`;
const inicioSemana = (iso) => { const d = dataDeISO(iso); const dia = d.getDay(); return somaDias(iso, dia === 0 ? -6 : 1 - dia); };
const fimDoMes = (iso) => { const d = dataDeISO(iso); return paraISO(new Date(d.getFullYear(), d.getMonth() + 1, 0, 12)); };
const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const DIAS_SEMANA_LONGO = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
const MESES_LONGO = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const fmtMoeda = (v) => (Number(v) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const paraNumero = (v) => {
  if (typeof v === "number") return isFinite(v) ? v : 0;
  const t = String(v || "").replace(/[^\d,.-]/g, "");
  if (!t) return 0;
  if (t.includes(",")) return Number(t.replace(/\./g, "").replace(",", ".")) || 0;
  return Number(t) || 0;
};
const arred = (v) => Math.round((Number(v) || 0) * 100) / 100;
const limpar = (obj) => JSON.parse(JSON.stringify(obj ?? {}));
const contem = (texto, palavra) => normalizar(texto).includes(normalizar(palavra));

function intervaloPeriodo(tipo, deCustom, ateCustom) {
  const hoje = hojeISO();
  const d = dataDeISO(hoje);
  if (tipo === "hoje") return { de: hoje, ate: hoje };
  if (tipo === "semana") { const ini = inicioSemana(hoje); return { de: ini, ate: somaDias(ini, 6) }; }
  if (tipo === "trimestre") {
    const q = Math.floor(d.getMonth() / 3) * 3;
    return { de: paraISO(new Date(d.getFullYear(), q, 1, 12)), ate: paraISO(new Date(d.getFullYear(), q + 3, 0, 12)) };
  }
  if (tipo === "ano") return { de: `${d.getFullYear()}-01-01`, ate: `${d.getFullYear()}-12-31` };
  if (tipo === "personalizado") return { de: deCustom || hoje, ate: ateCustom || hoje };
  if (tipo === "tudo") return { de: "0000-01-01", ate: "9999-12-31" };
  return { de: `${hoje.slice(0, 7)}-01`, ate: fimDoMes(hoje) };
}
const PERIODOS = [
  { id: "hoje", nome: "Hoje" }, { id: "semana", nome: "Semana" }, { id: "mes", nome: "Mês" },
  { id: "trimestre", nome: "Trimestre" }, { id: "ano", nome: "Ano" }, { id: "personalizado", nome: "Personalizado" },
];
const dentro = (iso, p) => Boolean(iso) && String(iso).slice(0, 10) >= p.de && String(iso).slice(0, 10) <= p.ate;

function baixarArquivo(nome, conteudo, tipo = "application/json") {
  const blob = new Blob([conteudo], { type: tipo });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = nome;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
async function copiarTexto(t) {
  try { await navigator.clipboard.writeText(t); return true; } catch { return false; }
}
function abrirImpressao(titulo, html) {
  const w = window.open("", "_blank");
  if (!w) { alert("Libere as janelas pop-up do navegador para gerar o PDF."); return; }
  w.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${titulo}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
*{box-sizing:border-box} body{font-family:Arial,Helvetica,sans-serif;color:#1C2A45;margin:0;padding:28px;font-size:13px}
h1,h2,h3{color:#173A7A;margin:0} .topo{display:flex;align-items:center;gap:16px;border-bottom:4px solid #F6C230;padding-bottom:14px;margin-bottom:18px}
.topo img{width:78px;height:78px;border-radius:50%} .topo .emp{flex:1} .topo .emp h1{font-size:22px} .topo .emp p{margin:2px 0;color:#5A6E92;font-size:12px}
.doc{text-align:right} .doc h2{font-size:18px} .doc p{margin:2px 0;font-size:12px}
.caixa{border:1px solid #DCE7F4;border-radius:10px;padding:12px 14px;margin-bottom:14px} .caixa h3{font-size:13px;margin-bottom:6px;text-transform:uppercase;letter-spacing:.04em}
.grade{display:grid;grid-template-columns:1fr 1fr;gap:4px 18px}
table{width:100%;border-collapse:collapse;margin-bottom:14px} th{background:#173A7A;color:#fff;text-align:left;padding:8px;font-size:12px} td{padding:8px;border-bottom:1px solid #DCE7F4}
.dir{text-align:right} .totais{margin-left:auto;width:280px} .totais div{display:flex;justify-content:space-between;padding:4px 0}
.total{font-size:17px;font-weight:bold;color:#173A7A;border-top:2px solid #173A7A;margin-top:4px;padding-top:6px !important}
.assin{display:flex;gap:40px;margin-top:50px} .assin div{flex:1;border-top:1px solid #1C2A45;padding-top:6px;text-align:center;font-size:12px}
.rodape{margin-top:30px;text-align:center;color:#5A6E92;font-size:11px}
.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px} .card{border:1px solid #DCE7F4;border-radius:8px;padding:8px} .card b{display:block;font-size:16px;color:#173A7A}
@media print{body{padding:10mm} .naoimprime{display:none}}
</style></head><body>${html}
<p class="naoimprime" style="text-align:center;margin-top:24px"><button onclick="window.print()" style="padding:10px 18px;font-size:15px;border-radius:20px;border:0;background:#F6C230;font-weight:bold;cursor:pointer">Imprimir / Salvar em PDF</button></p>
<script>setTimeout(function(){window.print()},500)</script></body></html>`);
  w.document.close();
}
const escHTML = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// =====================================================================
//  CONFIGURAÇÕES PADRÃO E MENSAGENS AUTOMÁTICAS
// =====================================================================
const MENSAGENS_PADRAO = {
  confirmacao: "Olá, {cliente}! 🐶\nO atendimento do(a) {pet} no {empresa} está marcado para {data} às {horario} ({servico}).\nQualquer coisa é só chamar! 💙",
  lembrete: "Olá, {cliente}! 🐶\nO(a) {pet} tem horário marcado no {empresa} amanhã às {horario}.\nPodemos confirmar seu atendimento?",
  proposta: "Olá, {cliente}! 🐶\nSegue a proposta {numero} do {empresa} para o(a) {pet}:\n{itens}\nTotal: {valor}\nVálida até {validade}. Podemos aprovar?",
  cobranca: "Olá, {cliente}! Tudo bem? 🐶\nPassando para lembrar do pagamento de {valor} referente a {servico}, com vencimento em {vencimento}.\nQualquer dúvida estamos à disposição!",
  pagamento: "Olá, {cliente}! 💙\nRecebemos seu pagamento de {valor} referente a {servico}. Muito obrigado pela confiança!",
  aniversario: "Parabéns, {pet}! 🎂🐶\nHoje é dia de festa! Toda a equipe do {empresa} deseja muita saúde e muitos petiscos. Um beijo no focinho!",
  retornoBanho: "Olá, {cliente}! 🛁\nJá está chegando a hora do próximo banho do(a) {pet}. Vamos agendar?",
  retornoTosa: "Olá, {cliente}! ✂️\nO pelo do(a) {pet} já deve estar crescendo! Que tal agendar a próxima tosa?",
};
const NOMES_MENSAGENS = {
  confirmacao: "Confirmação de agendamento", lembrete: "Lembrete (véspera)", proposta: "Envio de proposta",
  cobranca: "Cobrança", pagamento: "Pagamento recebido", aniversario: "Aniversário do pet",
  retornoBanho: "Retorno de banho", retornoTosa: "Retorno de tosa",
};
const CONFIG_PADRAO = {
  nome: EMPRESA.nome, cnpj: "", telefone: "", whatsapp: EMPRESA.whatsapp, email: "", endereco: EMPRESA.endereco,
  cidade: "", instagram: "", site: "", horarioTexto: "", logo: "",
  abre: "08:00", fecha: "18:00", intervalo: 30, diasAbertos: [1, 2, 3, 4, 5, 6],
  formasPagamento: ["Pix", "Dinheiro", "Cartão de débito", "Cartão de crédito", "Transferência"],
  mensagens: MENSAGENS_PADRAO, mostrarPrecosSite: false, avisoSite: "",
};
const juntarConfig = (c) => ({
  ...CONFIG_PADRAO, ...(c || {}),
  mensagens: { ...MENSAGENS_PADRAO, ...((c && c.mensagens) || {}) },
  formasPagamento: (c && Array.isArray(c.formasPagamento) && c.formasPagamento.length) ? c.formasPagamento : CONFIG_PADRAO.formasPagamento,
  diasAbertos: (c && Array.isArray(c.diasAbertos)) ? c.diasAbertos : CONFIG_PADRAO.diasAbertos,
});
const ConfigCtx = createContext(CONFIG_PADRAO);
const useConfig = () => useContext(ConfigCtx);
const montarMsg = (modelo, vars) => String(modelo || "").replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined && vars[k] !== null ? String(vars[k]) : m));
const logoDe = (config) => (config && config.logo) || LOGO;

const SERVICOS_PADRAO = [
  { nome: "Banho", preco: 0, duracao: 60, descricao: "Cuidado e higiene que seu pet precisa." },
  { nome: "Tosa", preco: 0, duracao: 90, descricao: "Estilo e conforto para o seu amigo." },
  { nome: "Hidratação", preco: 0, duracao: 30, descricao: "Pelos macios, brilhantes e saudáveis." },
  { nome: "Escovação", preco: 0, duracao: 30, descricao: "Pelos desembaraçados e sem nós." },
  { nome: "Escovação dental", preco: 0, duracao: 15, descricao: "Saúde bucal em dia." },
  { nome: "Tosa higiênica", preco: 0, duracao: 30, descricao: "Higiene nas áreas sensíveis." },
];

function horariosDoDia(config) {
  const l = [];
  const passo = Math.max(10, Number(config.intervalo) || 30);
  for (let m = minutosDe(config.abre || "08:00"); m < minutosDe(config.fecha || "18:00"); m += passo) l.push(hhmmDe(m));
  return l;
}

// =====================================================================
//  CAMADA DE DADOS (Firebase ou modo de teste no navegador)
// =====================================================================
const ouvintesDemo = {};
const demoStore = {
  chave: (n) => "mimi_demo_" + n,
  ler(n) {
    try { return JSON.parse(localStorage.getItem(this.chave(n)) || "[]"); } catch { return []; }
  },
  gravar(n, lista) {
    localStorage.setItem(this.chave(n), JSON.stringify(lista));
    (ouvintesDemo[n] || []).forEach((f) => f(lista));
  },
};

const db = {
  ouvir(col, cb) {
    if (MODO_DEMO) {
      cb(demoStore.ler(col));
      ouvintesDemo[col] = [...(ouvintesDemo[col] || []), cb];
      return () => { ouvintesDemo[col] = (ouvintesDemo[col] || []).filter((f) => f !== cb); };
    }
    return onSnapshot(collection(fbDb, col), (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => console.error("Erro ao ler " + col, err));
  },
  ouvirDoc(col, id, cb) {
    if (MODO_DEMO) {
      const k = `mimi_demo_doc_${col}__${id}`;
      const ler = () => { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch { return null; } };
      const f = () => cb(ler());
      f();
      ouvintesDemo[k] = [...(ouvintesDemo[k] || []), f];
      return () => { ouvintesDemo[k] = (ouvintesDemo[k] || []).filter((x) => x !== f); };
    }
    return onSnapshot(doc(fbDb, col, id), (s) => cb(s.exists() ? s.data() : null), (err) => { console.error(err); cb(null); });
  },
  async salvarDoc(col, id, dados) {
    const registro = limpar(dados);
    if (MODO_DEMO) {
      const k = `mimi_demo_doc_${col}__${id}`;
      let atual = {};
      try { atual = JSON.parse(localStorage.getItem(k) || "null") || {}; } catch { atual = {}; }
      localStorage.setItem(k, JSON.stringify({ ...atual, ...registro }));
      (ouvintesDemo[k] || []).forEach((f) => f());
      return;
    }
    await setDoc(doc(fbDb, col, id), registro, { merge: true });
  },
  async adicionar(col, dados) {
    const registro = limpar({ ...dados, criadoEm: dados.criadoEm || new Date().toISOString() });
    if (MODO_DEMO) {
      const id = gerarId();
      demoStore.gravar(col, [...demoStore.ler(col), { ...registro, id }]);
      return id;
    }
    const ref = await addDoc(collection(fbDb, col), registro);
    return ref.id;
  },
  async atualizar(col, id, dados) {
    const registro = limpar({ ...dados, atualizadoEm: new Date().toISOString() });
    delete registro.id;
    if (MODO_DEMO) {
      demoStore.gravar(col, demoStore.ler(col).map((r) => (r.id === id ? { ...r, ...registro } : r)));
      return;
    }
    await updateDoc(doc(fbDb, col, id), registro);
  },
  async definir(col, id, dados) {
    const registro = limpar(dados);
    if (MODO_DEMO) {
      const l = demoStore.ler(col);
      demoStore.gravar(col, l.some((r) => r.id === id) ? l.map((r) => (r.id === id ? { ...r, ...registro } : r)) : [...l, { ...registro, id }]);
      return;
    }
    await setDoc(doc(fbDb, col, id), registro, { merge: true });
  },
  async remover(col, id) {
    if (MODO_DEMO) {
      demoStore.gravar(col, demoStore.ler(col).filter((r) => r.id !== id));
      return;
    }
    await deleteDoc(doc(fbDb, col, id));
  },
  async proximoNumero(nome) {
    if (MODO_DEMO) {
      const k = "mimi_demo_contador_" + nome;
      const n = Number(localStorage.getItem(k) || 0) + 1;
      localStorage.setItem(k, String(n));
      return n;
    }
    const ref = doc(fbDb, "configuracoes", "contadores");
    return runTransaction(fbDb, async (t) => {
      const s = await t.get(ref);
      const atual = (s.exists() && s.data()[nome]) || 0;
      t.set(ref, { [nome]: atual + 1 }, { merge: true });
      return atual + 1;
    });
  },
};

async function registrarHistorico(usuario, tipo, descricao, extra = {}) {
  try {
    await db.adicionar("historico", {
      tipo, descricao, usuario: usuario?.nome || "", data: new Date().toISOString(), ...extra,
    });
  } catch (e) { console.error(e); }
}

// ---------- Dados de exemplo (somente no modo de teste) ----------
function semearDemo() {
  if (!MODO_DEMO || localStorage.getItem("mimi_demo_semeado")) return;
  const agora = new Date();
  const hoje = hojeISO();
  const mesesAtras = (m) => new Date(agora.getFullYear(), agora.getMonth() - m, 10).toISOString();
  const clientes = [
    { id: "c1", codigo: "CLI-000001", nome: "Ana Paula Ferreira", documento: "12345678909", telefone: "11987654321", whatsapp: "11987654321", email: "ana@email.com", cidade: "São Paulo", estado: "SP", bairro: "Vila Mariana", origem: "Instagram", dataCadastro: mesesAtras(4).slice(0, 10), criadoEm: mesesAtras(4) },
    { id: "c2", codigo: "CLI-000002", nome: "Carlos Eduardo Lima", telefone: "11912345678", whatsapp: "11912345678", email: "", cidade: "São Paulo", estado: "SP", bairro: "Moema", origem: "Indicação", dataCadastro: mesesAtras(2).slice(0, 10), criadoEm: mesesAtras(2) },
    { id: "c3", codigo: "CLI-000003", nome: "Juliana Martins", telefone: "11955554444", whatsapp: "", email: "ju@email.com", cidade: "Santo André", estado: "SP", origem: "Google", dataCadastro: hoje, criadoEm: agora.toISOString() },
  ];
  const mesAtual = pad2(agora.getMonth() + 1);
  const pets = [
    { id: "p1", codigo: "PET-000001", clienteId: "c1", nome: "Thor", especie: "Cão", raca: "Pug", sexo: "Macho", nascimento: `2021-${mesAtual}-15`, peso: "8,5", cor: "Abricó", porte: "Pequeno", temperamento: "Brincalhão", alergias: "Shampoo com perfume forte", criadoEm: mesesAtras(4) },
    { id: "p2", codigo: "PET-000002", clienteId: "c1", nome: "Luna", especie: "Gato", raca: "SRD", sexo: "Fêmea", nascimento: "2020-03-02", peso: "4", porte: "Pequeno", temperamento: "Medroso", criadoEm: mesesAtras(3) },
    { id: "p3", codigo: "PET-000003", clienteId: "c2", nome: "Bob", especie: "Cão", raca: "Golden Retriever", sexo: "Macho", nascimento: "2019-08-20", peso: "31", porte: "Grande", temperamento: "Dócil", cuidados: "Idoso, manusear com calma", criadoEm: mesesAtras(2) },
    { id: "p4", codigo: "PET-000004", clienteId: "c3", nome: "Pipoca", especie: "Cão", raca: "Shih Tzu", sexo: "Fêmea", nascimento: "2023-11-05", peso: "5,2", porte: "Pequeno", temperamento: "Agitado", criadoEm: agora.toISOString() },
  ];
  const servicos = [
    { id: "s1", nome: "Banho", preco: 60, duracao: 60, descricao: "Banho completo.", ativo: true },
    { id: "s2", nome: "Tosa", preco: 80, duracao: 90, descricao: "Tosa na tesoura ou máquina.", ativo: true },
    { id: "s3", nome: "Hidratação", preco: 35, duracao: 30, descricao: "Hidratação dos pelos.", ativo: true },
    { id: "s4", nome: "Escovação dental", preco: 20, duracao: 15, descricao: "Escovação dos dentes.", ativo: true },
  ];
  const profissionais = [
    { id: "f1", nome: "Bruna", funcao: "Banhista", cor: "#2A4F95", ativo: true },
    { id: "f2", nome: "Diego", funcao: "Tosador", cor: "#E3AA0B", ativo: true },
  ];
  const ag = (id, clienteId, petId, s, prof, data, hora, status) => {
    const lista = s.map((x) => servicos.find((y) => y.id === x));
    return { id, clienteId, petId, servicos: lista.map((x) => ({ id: x.id, nome: x.nome, preco: x.preco, duracao: x.duracao })), profissionalId: prof, data, hora, duracao: lista.reduce((a, x) => a + x.duracao, 0), valor: lista.reduce((a, x) => a + x.preco, 0), status, criadoEm: agora.toISOString() };
  };
  const agendamentos = [
    ag("a1", "c1", "p1", ["s1", "s3"], "f1", hoje, "09:00", "Confirmado"),
    ag("a2", "c2", "p3", ["s1"], "f1", hoje, "11:00", "Agendado"),
    ag("a3", "c3", "p4", ["s2"], "f2", hoje, "14:00", "Agendado"),
    ag("a4", "c1", "p1", ["s1"], "f1", somaDias(hoje, -20), "10:00", "Finalizado"),
    ag("a5", "c2", "p3", ["s2"], "f2", somaDias(hoje, 3), "15:00", "Agendado"),
  ];
  const contasReceber = [
    { id: "r1", clienteId: "c1", descricao: "Banho", agendamentoId: "a4", valor: 60, vencimento: somaDias(hoje, -20), formaPagamento: "Pix", pagamentos: [{ data: somaDias(hoje, -20), valor: 60, forma: "Pix" }], criadoEm: agora.toISOString() },
    { id: "r2", clienteId: "c2", descricao: "Pacote de banhos", valor: 500, vencimento: somaDias(hoje, -5), formaPagamento: "Pix", pagamentos: [{ data: somaDias(hoje, -6), valor: 300, forma: "Pix" }], criadoEm: agora.toISOString() },
  ];
  const contasPagar = [
    { id: "d1", fornecedor: "Distribuidora Pet", descricao: "Shampoos e condicionadores", categoria: "Produtos", valor: 320, vencimento: somaDias(hoje, 4), formaPagamento: "Pix", pagamentos: [], criadoEm: agora.toISOString() },
    { id: "d2", fornecedor: "Imobiliária", descricao: "Aluguel", categoria: "Aluguel", valor: 1800, vencimento: `${hoje.slice(0, 7)}-05`, formaPagamento: "Transferência", pagamentos: [{ data: `${hoje.slice(0, 7)}-05`, valor: 1800, forma: "Transferência" }], criadoEm: agora.toISOString() },
  ];
  demoStore.gravar("clientes", clientes);
  demoStore.gravar("pets", pets);
  demoStore.gravar("servicos", servicos);
  demoStore.gravar("profissionais", profissionais);
  demoStore.gravar("agendamentos", agendamentos);
  demoStore.gravar("contas_receber", contasReceber);
  demoStore.gravar("contas_pagar", contasPagar);
  demoStore.gravar("historico", [
    ...clientes.map((c) => ({ id: gerarId(), tipo: "cliente", descricao: `Cliente ${c.nome} cadastrado`, clienteId: c.id, data: c.criadoEm, usuario: "Sistema" })),
    ...pets.map((p) => ({ id: gerarId(), tipo: "pet", descricao: `Pet ${p.nome} cadastrado`, clienteId: p.clienteId, petId: p.id, data: p.criadoEm, usuario: "Sistema" })),
  ]);
  localStorage.setItem("mimi_demo_contador_clientes", "3");
  localStorage.setItem("mimi_demo_contador_pets", "4");
  localStorage.setItem("mimi_demo_semeado", "1");
}

// =====================================================================
//  LOGIN / PERMISSÕES
// =====================================================================
const MODULOS = [
  { id: "dashboard", nome: "Dashboard", curto: "Início", icone: "home" },
  { id: "clientes", nome: "Clientes", curto: "Clientes", icone: "users" },
  { id: "pets", nome: "Pets", curto: "Pets", icone: "paw" },
  { id: "agenda", nome: "Agenda", curto: "Agenda", icone: "calendar" },
  { id: "propostas", nome: "Propostas", curto: "Propostas", icone: "file" },
  { id: "financeiro", nome: "Financeiro", curto: "Financeiro", icone: "wallet" },
  { id: "marketing", nome: "Marketing", curto: "Marketing", icone: "megaphone" },
  { id: "relatorios", nome: "Relatórios", curto: "Relatórios", icone: "chart" },
  { id: "configuracoes", nome: "Configurações", curto: "Config.", icone: "gear" },
];
const PERMISSOES = {
  administrador: MODULOS.map((m) => m.id),
  funcionario: ["dashboard", "clientes", "pets", "agenda", "propostas"],
  financeiro: ["dashboard", "financeiro", "relatorios"],
};
const NOME_PAPEL = { administrador: "Administrador", funcionario: "Funcionário", financeiro: "Financeiro" };
const modulosDoUsuario = (u) => {
  if (u?.papel === "administrador") return PERMISSOES.administrador;
  return Array.isArray(u?.modulos) && u.modulos.length ? u.modulos : PERMISSOES[u?.papel] || ["dashboard"];
};

const USUARIOS_DEMO = [
  { uid: "demo-admin", nome: "Mimi Admin", email: "admin@mimidogs.com", senha: "mimi123", papel: "administrador" },
  { uid: "demo-func", nome: "Bruna Atendente", email: "funcionario@mimidogs.com", senha: "mimi123", papel: "funcionario" },
  { uid: "demo-fin", nome: "Rafael Financeiro", email: "financeiro@mimidogs.com", senha: "mimi123", papel: "financeiro" },
];

let appCadastro = null;
const autenticacao = {
  observar(cb) {
    if (MODO_DEMO) {
      const salvo = localStorage.getItem("mimi_demo_sessao") || sessionStorage.getItem("mimi_demo_sessao");
      const u = USUARIOS_DEMO.find((x) => x.uid === salvo);
      cb(u ? { uid: u.uid, nome: u.nome, email: u.email, papel: u.papel } : null);
      return () => {};
    }
    return onAuthStateChanged(fbAuth, async (user) => {
      if (!user) { cb(null); return; }
      try {
        const ref = doc(fbDb, "users", user.uid);
        const s = await getDoc(ref);
        if (s.exists()) {
          const perfil = s.data();
          cb({ uid: user.uid, email: user.email, ...perfil, bloqueado: perfil.ativo === false });
        } else {
          const existentes = await getDocs(query(collection(fbDb, "users"), limit(1)));
          const perfil = {
            nome: user.displayName || primeiroNome(user.email.split("@")[0]),
            email: user.email,
            papel: existentes.empty ? "administrador" : "funcionario",
            ativo: true,
            criadoEm: new Date().toISOString(),
          };
          await setDoc(ref, perfil);
          cb({ uid: user.uid, ...perfil });
        }
      } catch (e) {
        console.error(e);
        cb({ uid: user.uid, email: user.email, nome: primeiroNome(user.email.split("@")[0]), papel: "funcionario", erroPerfil: traduzErro(e) });
      }
    });
  },
  async entrar(email, senha, lembrar) {
    if (MODO_DEMO) {
      const u = USUARIOS_DEMO.find((x) => x.email === email.trim().toLowerCase() && x.senha === senha);
      if (!u) throw new Error("E-mail ou senha incorretos.");
      (lembrar ? localStorage : sessionStorage).setItem("mimi_demo_sessao", u.uid);
      window.location.reload();
      return;
    }
    await setPersistence(fbAuth, lembrar ? browserLocalPersistence : browserSessionPersistence);
    await signInWithEmailAndPassword(fbAuth, email.trim(), senha);
  },
  async sair() {
    if (MODO_DEMO) {
      localStorage.removeItem("mimi_demo_sessao");
      sessionStorage.removeItem("mimi_demo_sessao");
      window.location.reload();
      return;
    }
    await signOut(fbAuth);
  },
  async recuperar(email) {
    if (MODO_DEMO) return;
    await sendPasswordResetEmail(fbAuth, email.trim());
  },
  async criarUsuario(email, senha, perfil) {
    if (MODO_DEMO) throw new Error("No modo de teste não é possível criar usuários.");
    if (!appCadastro) appCadastro = initializeApp(firebaseConfig, "cadastro-usuarios");
    const authCadastro = getAuth(appCadastro);
    const cred = await createUserWithEmailAndPassword(authCadastro, email.trim(), senha);
    await setDoc(doc(fbDb, "users", cred.user.uid), limpar({ ...perfil, email: email.trim().toLowerCase(), ativo: true, criadoEm: new Date().toISOString() }));
    await signOut(authCadastro);
  },
};

function traduzErro(e) {
  const c = e?.code || "";
  if (c.includes("invalid-credential") || c.includes("wrong-password") || c.includes("user-not-found")) return "E-mail ou senha incorretos.";
  if (c.includes("configuration-not-found") || c.includes("operation-not-allowed")) return "O login por e-mail e senha ainda não foi ativado no Firebase (Authentication → Sign-in method → E-mail/senha).";
  if (c.includes("too-many-requests")) return "Muitas tentativas. Aguarde alguns minutos.";
  if (c.includes("invalid-email")) return "E-mail inválido.";
  if (c.includes("email-already-in-use")) return "Esse e-mail já tem cadastro.";
  if (c.includes("weak-password")) return "Senha fraca: use pelo menos 6 caracteres.";
  if (c.includes("permission-denied")) return "Sem permissão no banco de dados. Confira as regras do Firestore.";
  if (c.includes("network") || c.includes("unavailable")) return "Sem conexão com a internet.";
  return e?.message || "Algo deu errado. Tente novamente.";
}

// =====================================================================
//  ÍCONES
// =====================================================================
const ICONES = {
  home: ["M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"],
  users: ["M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8", "M22 21v-2a4 4 0 0 0-3-3.87", "M16 3.13a4 4 0 0 1 0 7.75"],
  calendar: ["M8 2v4", "M16 2v4", "M3 10h18", "M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"],
  file: ["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z", "M14 2v6h6", "M8 13h8", "M8 17h5"],
  wallet: ["M20 7H5a2 2 0 0 1 0-4h13v4", "M3 5v14a2 2 0 0 0 2 2h15V7", "M16 14h.01"],
  megaphone: ["M3 11v2a1 1 0 0 0 1 1h3l6 5V5L7 10H4a1 1 0 0 0-1 1z", "M16 8a5 5 0 0 1 0 8", "M19 5a9 9 0 0 1 0 14"],
  chart: ["M3 3v18h18", "M8 17v-5", "M13 17V8", "M18 17v-3"],
  gear: ["M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6", "M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"],
  search: ["M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16", "m21 21-4.3-4.3"],
  plus: ["M12 5v14", "M5 12h14"],
  x: ["M18 6 6 18", "m6 6 12 12"],
  edit: ["M12 20h9", "M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"],
  trash: ["M3 6h18", "M8 6V4h8v2", "M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"],
  whats: ["M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.5A8.5 8.5 0 1 1 21 11.5z"],
  mail: ["M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z", "m22 6-10 7L2 6"],
  download: ["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", "M7 10l5 5 5-5", "M12 15V3"],
  logout: ["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", "m16 17 5-5-5-5", "M21 12H9"],
  back: ["m15 18-6-6 6-6"],
  bell: ["M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9", "M10.3 21a1.9 1.9 0 0 0 3.4 0"],
  camera: ["M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z", "M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8"],
  menu: ["M4 6h16", "M4 12h16", "M4 18h16"],
  alert: ["M12 9v4", "M12 17h.01", "M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"],
  cake: ["M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8", "M4 16s1.5-1 4-1 4 2 6 2 4-1 4-1", "M2 21h20", "M7 8v3", "M12 8v3", "M17 8v3"],
  map: ["M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z", "M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6"],
  clock: ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20", "M12 6v6l4 2"],
  banho: ["M4 12h16", "M5 12a7 7 0 0 1 14 0", "M12 5V3", "M8 16v1", "M12 16v2", "M16 16v1", "M10 20v1", "M14 20v1"],
  tesoura: ["M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6", "M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6", "M20 4 8.1 15.9", "M14.5 14.5 20 20", "M8.1 8.1 12 12"],
  brilho: ["M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z", "M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"],
  dente: ["M7 3c-2.5 0-4 2-4 4.5 0 3 1.5 4.5 2 7 .5 3 1 6.5 3 6.5s2-4 4-4 2 4 4 4 2.5-3.5 3-6.5c.5-2.5 2-4 2-7C21 5 19.5 3 17 3c-2 0-3 1-5 1S9 3 7 3z"],
  pente: ["M4 9h16v4H4z", "M6 13v6", "M9 13v6", "M12 13v6", "M15 13v6", "M18 13v6"],
  check: ["M20 6 9 17l-5-5"],
  globo: ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20", "M2 12h20", "M12 2a15 15 0 0 1 0 20", "M12 2a15 15 0 0 0 0 20"],
  chevR: ["m9 18 6-6-6-6"],
  printer: ["M6 9V2h12v7", "M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2", "M6 14h12v8H6z"],
  copy: ["M9 9h11v11H9z", "M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"],
  send: ["m22 2-7 20-4-9-9-4z", "M22 2 11 13"],
  heart: ["M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z"],
};
function Icone({ nome, tam = 20, className = "" }) {
  if (nome === "paw") {
    return (
      <svg width={tam} height={tam} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
        <ellipse cx="12" cy="16.2" rx="5" ry="4.2" />
        <circle cx="5.6" cy="10.4" r="2.2" /><circle cx="9.6" cy="6.4" r="2.2" />
        <circle cx="14.4" cy="6.4" r="2.2" /><circle cx="18.4" cy="10.4" r="2.2" />
      </svg>
    );
  }
  return (
    <svg width={tam} height={tam} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {(ICONES[nome] || []).map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}

// =====================================================================
//  A MIMI — mascote interativa
// =====================================================================
const MimiCtx = createContext({ falar: () => {}, comemorar: () => {} });
const useMimi = () => useContext(MimiCtx);

function MimiDesenho({ modo }) {
  const dormindo = modo === "dormindo";
  return (
    <svg viewBox="0 0 130 104" className="mimi-svg" aria-hidden="true">
      <ellipse cx="62" cy="99" rx="40" ry="4" fill="rgba(15,42,92,.18)" className="mimi-sombra" />
      <g className="mimi-rabo">
        <path d="M26 52c-12-2-16-14-7-18 7-3 11 5 5 8" fill="none" stroke="#D9B283" strokeWidth="7" strokeLinecap="round" />
      </g>
      <g className="mimi-perna mimi-perna-a"><rect x="30" y="66" width="10" height="26" rx="5" fill="#D9B283" /></g>
      <g className="mimi-perna mimi-perna-b"><rect x="44" y="66" width="10" height="26" rx="5" fill="#E8C9A0" /></g>
      <g className="mimi-perna mimi-perna-b"><rect x="68" y="66" width="10" height="26" rx="5" fill="#D9B283" /></g>
      <g className="mimi-perna mimi-perna-a"><rect x="80" y="66" width="10" height="26" rx="5" fill="#E8C9A0" /></g>
      <g className="mimi-corpo">
        <ellipse cx="58" cy="60" rx="36" ry="21" fill="#E8C9A0" />
        <ellipse cx="58" cy="66" rx="26" ry="11" fill="#F3DDBD" />
      </g>
      <g className="mimi-cabeca">
        <path d="M78 30c-9-6-15 2-13 12 2 6 6 5 9 1z" fill="#3A2C26" />
        <path d="M120 30c9-6 15 2 13 12-2 6-6 5-9 1z" fill="#3A2C26" transform="translate(-22 0)" />
        <circle cx="90" cy="44" r="25" fill="#E8C9A0" />
        <path d="M80 30q10-5 20 0" stroke="#C9A06F" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M83 35q7-3 14 0" stroke="#C9A06F" strokeWidth="2" fill="none" strokeLinecap="round" />
        <ellipse cx="90" cy="54" rx="15" ry="12" fill="#3A2C26" />
        {dormindo ? (
          <g stroke="#2A1F1B" strokeWidth="2.4" fill="none" strokeLinecap="round">
            <path d="M75 43q5 4 10 0" /><path d="M95 43q5 4 10 0" />
          </g>
        ) : (
          <g className="mimi-olhos">
            <circle cx="80" cy="42" r="6" fill="#1E1714" /><circle cx="100" cy="42" r="6" fill="#1E1714" />
            <circle cx="82" cy="40" r="2" fill="#fff" /><circle cx="102" cy="40" r="2" fill="#fff" />
          </g>
        )}
        <ellipse cx="90" cy="50" rx="5.5" ry="3.8" fill="#15100E" />
        <path d="M84 56q6 4 12 0" stroke="#15100E" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        {!dormindo && <ellipse cx="90" cy="61" rx="4.5" ry="5" fill="#F07C8C" className="mimi-lingua" />}
        <path d="M68 64q22 12 44 0" stroke="#D6322B" strokeWidth="4.5" fill="none" strokeLinecap="round" />
        <circle cx="90" cy="70" r="2.8" fill="#F6C230" />
        <g className="mimi-laco">
          <path d="M90 22 76 14q-4 8 0 16z" fill="#E0322B" />
          <path d="M90 22 104 14q4 8 0 16z" fill="#E0322B" />
          <circle cx="90" cy="22" r="4.5" fill="#B8241F" />
        </g>
      </g>
      {dormindo && (
        <g className="mimi-zzz" fill="#173A7A" fontFamily="Baloo 2, sans-serif" fontWeight="800">
          <text x="108" y="18" fontSize="13">z</text>
          <text x="116" y="10" fontSize="10">z</text>
        </g>
      )}
      {modo === "feliz" && (
        <g className="mimi-coracoes" fill="#E0322B">
          <path d="M112 16c2-3 6-1 4 2l-4 4-4-4c-2-3 2-5 4-2z" />
          <path d="M60 22c1.6-2.4 5-.8 3.2 1.6L60 27l-3.2-3.4C55 21.2 58.4 19.6 60 22z" />
        </g>
      )}
    </svg>
  );
}

function MimiProvider({ ativa, dicas, children }) {
  const [modo, setModo] = useState("parada");
  const [balao, setBalao] = useState(null);
  const modoRef = useRef("parada");
  const ultimaAtividade = useRef(Date.now());
  const ultimoPasseio = useRef(Date.now());
  const intervaloPasseio = useRef(50000 + Math.random() * 40000);
  const timerBalao = useRef(null);
  const timerModo = useRef(null);
  const movimentoReduzido = useMemo(
    () => typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);

  const mudarModo = useCallback((m) => { modoRef.current = m; setModo(m); }, []);

  const falar = useCallback((texto, duracao = 6000) => {
    if (!ativa || !texto) return;
    if (modoRef.current === "passeando") mudarModo("parada");
    clearTimeout(timerBalao.current);
    setBalao({ texto, id: Date.now() });
    timerBalao.current = setTimeout(() => setBalao(null), duracao);
  }, [ativa, mudarModo]);

  const comemorar = useCallback((texto) => {
    if (!ativa) return;
    clearTimeout(timerModo.current);
    mudarModo("feliz");
    falar(texto, 4500);
    timerModo.current = setTimeout(() => mudarModo("parada"), 2000);
  }, [ativa, falar, mudarModo]);

  // Cochilo e passeios
  useEffect(() => {
    if (!ativa) return undefined;
    const aoMexer = () => {
      ultimaAtividade.current = Date.now();
      if (modoRef.current === "dormindo") {
        mudarModo("parada");
        falar("Opa! Tava só tirando um cochilo 😴", 3500);
      }
    };
    const eventos = ["pointerdown", "keydown", "scroll", "mousemove"];
    let ultimo = 0;
    const throttled = () => { const t = Date.now(); if (t - ultimo > 800) { ultimo = t; aoMexer(); } };
    eventos.forEach((e) => window.addEventListener(e, throttled, { passive: true }));
    const relogio = setInterval(() => {
      const agora = Date.now();
      if (modoRef.current !== "parada") return;
      if (agora - ultimaAtividade.current > 120000) {
        setBalao(null);
        mudarModo("dormindo");
        return;
      }
      if (!movimentoReduzido && agora - ultimoPasseio.current > intervaloPasseio.current) {
        setBalao(null);
        mudarModo("passeando");
      }
    }, 4000);
    return () => { eventos.forEach((e) => window.removeEventListener(e, throttled)); clearInterval(relogio); };
  }, [ativa, falar, mudarModo, movimentoReduzido]);

  const fimDoPasseio = (e) => {
    if (e.animationName !== "mimiPasseio") return;
    ultimoPasseio.current = Date.now();
    intervaloPasseio.current = 50000 + Math.random() * 40000;
    mudarModo("parada");
  };

  const aoClicar = () => {
    if (modoRef.current === "passeando") return;
    const lista = dicas ? dicas() : [];
    const texto = lista.length ? lista[Math.floor(Math.random() * lista.length)] : "Au au! 🐾";
    comemorar(texto);
  };

  const valor = useMemo(() => ({ falar, comemorar }), [falar, comemorar]);

  return (
    <MimiCtx.Provider value={valor}>
      {children}
      {ativa && (
        <div className={`mimi mimi-${modo}`} onAnimationEnd={fimDoPasseio}>
          {balao && modo !== "passeando" && (
            <div className="mimi-balao" key={balao.id} role="status">{balao.texto}</div>
          )}
          <button type="button" className="mimi-botao" onClick={aoClicar} aria-label="Mimi, a mascote. Toque para falar com ela">
            <div className="mimi-pula"><MimiDesenho modo={modo} /></div>
          </button>
        </div>
      )}
    </MimiCtx.Provider>
  );
}

// =====================================================================
//  COMPONENTES BÁSICOS
// =====================================================================
function Modal({ titulo, aoFechar, children, rodape, largo }) {
  useEffect(() => {
    const esc = (e) => e.key === "Escape" && aoFechar();
    window.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", esc); document.body.style.overflow = ""; };
  }, [aoFechar]);
  return (
    <div className="modal-fundo" onMouseDown={(e) => e.target === e.currentTarget && aoFechar()}>
      <div className={`modal ${largo ? "modal-largo" : ""}`} role="dialog" aria-modal="true" aria-label={titulo}>
        <div className="modal-topo">
          <h2>{titulo}</h2>
          <button className="btn-icone" onClick={aoFechar} aria-label="Fechar"><Icone nome="x" /></button>
        </div>
        <div className="modal-corpo">{children}</div>
        {rodape && <div className="modal-rodape">{rodape}</div>}
      </div>
    </div>
  );
}

function Confirmar({ titulo, texto, aoConfirmar, aoFechar, textoBotao = "Excluir" }) {
  const [ocupado, setOcupado] = useState(false);
  return (
    <Modal titulo={titulo} aoFechar={aoFechar}
      rodape={<>
        <button className="btn btn-leve" onClick={aoFechar}>Cancelar</button>
        <button className="btn btn-perigo" disabled={ocupado}
          onClick={async () => { setOcupado(true); try { await aoConfirmar(); } finally { setOcupado(false); } }}>
          {ocupado ? "Aguarde…" : textoBotao}
        </button>
      </>}>
      <p className="confirmar-texto">{texto}</p>
    </Modal>
  );
}

function Campo({ rotulo, children, largo, dica }) {
  return (
    <label className={`campo ${largo ? "campo-largo" : ""}`}>
      <span className="campo-rotulo">{rotulo}</span>
      {children}
      {dica && <span className="campo-dica">{dica}</span>}
    </label>
  );
}

function Vazio({ titulo, texto, acao }) {
  return (
    <div className="vazio">
      <div className="vazio-mimi"><MimiDesenho modo="parada" /></div>
      <h3>{titulo}</h3>
      <p>{texto}</p>
      {acao}
    </div>
  );
}

function AvatarPet({ pet, tam = 48 }) {
  if (pet?.foto) return <img src={pet.foto} alt={pet.nome} className="avatar-pet" style={{ width: tam, height: tam }} />;
  return (
    <div className="avatar-pet avatar-vazio" style={{ width: tam, height: tam }}>
      <Icone nome="paw" tam={Math.round(tam * 0.5)} />
    </div>
  );
}

function Toast({ msg }) {
  if (!msg) return null;
  return <div className={`toast toast-${msg.tipo || "ok"}`} key={msg.id}>{msg.texto}</div>;
}

// =====================================================================
//  TELA DE LOGIN
// =====================================================================
function TelaLogin() {
  const [email, setEmail] = useState(localStorage.getItem("mimi_ultimo_email") || "");
  const [senha, setSenha] = useState("");
  const [lembrar, setLembrar] = useState(true);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [ocupado, setOcupado] = useState(false);

  const entrar = async (e) => {
    e.preventDefault();
    setErro(""); setAviso("");
    if (!email || !senha) { setErro("Preencha e-mail e senha."); return; }
    setOcupado(true);
    try {
      if (lembrar) localStorage.setItem("mimi_ultimo_email", email.trim());
      else localStorage.removeItem("mimi_ultimo_email");
      await autenticacao.entrar(email, senha, lembrar);
    } catch (err) {
      setErro(traduzErro(err));
    } finally {
      setOcupado(false);
    }
  };

  const recuperar = async () => {
    setErro(""); setAviso("");
    if (!email) { setErro("Digite seu e-mail no campo acima e clique de novo em “Esqueci minha senha”."); return; }
    if (MODO_DEMO) { setAviso("No modo de teste a senha de todos os usuários é mimi123."); return; }
    try {
      await autenticacao.recuperar(email);
      setAviso("Enviamos um link para redefinir sua senha. Confira sua caixa de entrada (e o spam).");
    } catch (err) { setErro(traduzErro(err)); }
  };

  return (
    <div className="login">
      <div className="login-marca">
        <img src={LOGO} alt="Mimi Dog's Pet Shop" className="login-logo" />
        <p className="login-frase">Cuidado e carinho que seu dog merece</p>
        <div className="login-mimi"><MimiDesenho modo="parada" /></div>
      </div>
      <form className="login-form" onSubmit={entrar}>
        <h1>Bem-vindo de volta</h1>
        <p className="login-sub">Entre para cuidar da agenda e dos seus clientes de quatro patas.</p>
        <Campo rotulo="E-mail">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="voce@mimidogs.com" />
        </Campo>
        <Campo rotulo="Senha">
          <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="current-password" placeholder="Sua senha" />
        </Campo>
        <div className="login-linha">
          <label className="checar"><input type="checkbox" checked={lembrar} onChange={(e) => setLembrar(e.target.checked)} /> Lembrar acesso</label>
          <button type="button" className="link" onClick={recuperar}>Esqueci minha senha</button>
        </div>
        {erro && <div className="alerta alerta-erro">{erro}</div>}
        {aviso && <div className="alerta alerta-info">{aviso}</div>}
        <button className="btn btn-ouro btn-cheio" disabled={ocupado}>{ocupado ? "Entrando…" : "Entrar"}</button>
        <a href="#/" className="link login-site">← Voltar para o site</a>
        {MODO_DEMO && (
          <div className="demo-caixa">
            <strong>Modo de teste</strong> — os dados ficam só neste navegador. Use:
            <div>admin@mimidogs.com · funcionario@mimidogs.com · financeiro@mimidogs.com</div>
            <div>Senha: <b>mimi123</b></div>
          </div>
        )}
      </form>
    </div>
  );
}

// =====================================================================
//  REGRAS DE NEGÓCIO (agenda, financeiro, propostas)
// =====================================================================
const STATUS_AG = ["Agendado", "Confirmado", "Em atendimento", "Finalizado", "Cancelado", "Não compareceu"];
const COR_STATUS_AG = {
  "Agendado": "st-agendado", "Confirmado": "st-confirmado", "Em atendimento": "st-atendimento",
  "Finalizado": "st-finalizado", "Cancelado": "st-cancelado", "Não compareceu": "st-faltou",
};
const agAtivo = (a) => !["Cancelado", "Não compareceu"].includes(a.status);
const nomesServicos = (a) => (a.servicos || []).map((s) => s.nome).join(", ") || "—";
const fimAg = (a) => minutosDe(a.hora) + (Number(a.duracao) || 30);

function acharConflito(ag, agendamentos) {
  if (!ag.profissionalId || !ag.data || !ag.hora) return null;
  const ini = minutosDe(ag.hora);
  const fim = ini + (Number(ag.duracao) || 30);
  return agendamentos.find((o) => o.id !== ag.id && o.profissionalId === ag.profissionalId && o.data === ag.data && agAtivo(o)
    && minutosDe(o.hora) < fim && fimAg(o) > ini) || null;
}

const pagoDe = (c) => arred((c.pagamentos || []).reduce((s, p) => s + (Number(p.valor) || 0), 0));
const restanteDe = (c) => Math.max(0, arred((Number(c.valor) || 0) - pagoDe(c)));
function statusConta(c) {
  if (c.status === "Cancelado") return "Cancelado";
  const valor = Number(c.valor) || 0;
  const pago = pagoDe(c);
  if (valor > 0 && pago >= valor - 0.004) return "Pago";
  if (c.vencimento && c.vencimento < hojeISO()) return "Atrasado";
  if (pago > 0) return "Parcial";
  return "Pendente";
}
const COR_STATUS_CONTA = { Pendente: "st-agendado", Pago: "st-finalizado", Parcial: "st-atendimento", Atrasado: "st-cancelado", Cancelado: "st-faltou" };
const contaAberta = (c) => ["Pendente", "Parcial", "Atrasado"].includes(statusConta(c));

const STATUS_PROPOSTA = ["Rascunho", "Enviada", "Aguardando aprovação", "Aprovada", "Recusada", "Expirada"];
const COR_STATUS_PROPOSTA = { "Rascunho": "st-faltou", "Enviada": "st-agendado", "Aguardando aprovação": "st-atendimento", "Aprovada": "st-finalizado", "Recusada": "st-cancelado", "Expirada": "st-faltou" };
function statusProposta(p) {
  if (["Rascunho", "Enviada", "Aguardando aprovação"].includes(p.status) && p.validade && p.validade < hojeISO()) return "Expirada";
  return p.status || "Rascunho";
}
const subtotalProposta = (p) => arred((p.itens || []).reduce((s, i) => s + (Number(i.quantidade) || 0) * (Number(i.valorUnit) || 0), 0));
const totalProposta = (p) => Math.max(0, arred(subtotalProposta(p) - (Number(p.desconto) || 0)));

const temServico = (a, palavra) => (a.servicos || []).some((s) => contem(s.nome, palavra));

function varsMensagem({ config, cliente, pet, ag, extra = {} }) {
  return {
    empresa: config.nome, cliente: primeiroNome(cliente?.nome) || "", pet: pet?.nome || "seu pet",
    data: ag ? fmtData(ag.data) : "", horario: ag?.hora || "", servico: ag ? nomesServicos(ag) : "", ...extra,
  };
}

// =====================================================================
//  GRÁFICOS SIMPLES
// =====================================================================
const NOMES_MES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
function ultimosMeses(n) {
  const d = new Date();
  const l = [];
  for (let i = n - 1; i >= 0; i--) {
    const x = new Date(d.getFullYear(), d.getMonth() - i, 1, 12);
    l.push({ chave: `${x.getFullYear()}-${pad2(x.getMonth() + 1)}`, rotulo: NOMES_MES[x.getMonth()] });
  }
  return l;
}

function GraficoBarras({ rotulos, series, formatar = (v) => v, rotuloAria = "Gráfico" }) {
  const todos = series.flatMap((s) => s.valores);
  const max = Math.max(1, ...todos);
  const L = 320, A = 150, base = 124, g = L / rotulos.length;
  const n = series.length;
  const larg = n === 1 ? 20 : 13;
  return (
    <svg viewBox={`0 0 ${L} ${A}`} className="grafico" role="img" aria-label={rotuloAria}>
      {[0.25, 0.5, 0.75, 1].map((f) => <line key={f} x1="0" x2={L} y1={base - f * 104} y2={base - f * 104} stroke="#E3EDF8" strokeWidth="1" />)}
      {rotulos.map((r, i) => {
        const cx = i * g + g / 2;
        const totalLarg = n * larg + (n - 1) * 2;
        return (
          <g key={r + i}>
            {series.map((s, j) => {
              const v = s.valores[i] || 0;
              const h = (v / max) * 104;
              const x = cx - totalLarg / 2 + j * (larg + 2);
              return (
                <g key={j}>
                  <rect x={x} y={base - h} width={larg} height={Math.max(h, 1.5)} rx="4" fill={s.cor}><title>{formatar(v)}</title></rect>
                  {v > 0 && n === 1 && <text x={x + larg / 2} y={base - h - 4} textAnchor="middle" fontSize="8.5" fill="#173A7A" fontWeight="700">{formatar(v)}</text>}
                  {v > 0 && n > 1 && <text x={x + larg / 2} y={base - h - 4} textAnchor="middle" fontSize="9" fill={s.corTexto || s.cor} fontWeight="700">{formatar(v)}</text>}
                </g>
              );
            })}
            <text x={cx} y={A - 8} textAnchor="middle" fontSize="11" fill="#5A6E92">{r}</text>
          </g>
        );
      })}
    </svg>
  );
}

function BarrasHorizontais({ itens, formatar = (v) => v, vazio = "Sem dados no período." }) {
  if (!itens.length) return <p className="texto-suave">{vazio}</p>;
  const max = Math.max(1, ...itens.map((i) => i[1]));
  return (
    <div className="barras-h">
      {itens.map(([nome, n]) => (
        <div key={nome} className="barra-h">
          <span className="barra-h-nome" title={nome}>{nome}</span>
          <div className="barra-h-trilho"><div style={{ width: `${(n / max) * 100}%` }} /></div>
          <span className="barra-h-n">{formatar(n)}</span>
        </div>
      ))}
    </div>
  );
}

function SeletorPeriodo({ periodo, setPeriodo, de, setDe, ate, setAte }) {
  return (
    <div className="periodo">
      <div className="abas-mini">
        {PERIODOS.map((p) => (
          <button key={p.id} className={periodo === p.id ? "ativo" : ""} onClick={() => setPeriodo(p.id)}>{p.nome}</button>
        ))}
      </div>
      {periodo === "personalizado" && (
        <div className="periodo-datas">
          <input type="date" value={de} onChange={(e) => setDe(e.target.value)} aria-label="De" />
          <span>até</span>
          <input type="date" value={ate} onChange={(e) => setAte(e.target.value)} aria-label="Até" />
        </div>
      )}
    </div>
  );
}

// =====================================================================
//  DASHBOARD
// =====================================================================
function calcularAlertas({ clientes, pets, pedidos, agendamentos, contasReceber, propostas, pode }) {
  const alertas = [];
  const hoje = hojeISO();
  const agora = new Date();
  const minAgora = agora.getHours() * 60 + agora.getMinutes();
  const mapaPets = Object.fromEntries(pets.map((p) => [p.id, p]));

  if (pode("clientes")) {
    const novos = pedidos.filter((p) => p.status === "novo").length;
    if (novos) alertas.push({ tipo: "site", texto: `${novos} pedido${novos > 1 ? "s" : ""} de agendamento pelo site esperando resposta` });
  }
  if (pode("agenda")) {
    agendamentos.filter((a) => a.data === hoje && ["Agendado", "Confirmado"].includes(a.status)).forEach((a) => {
      const falta = minutosDe(a.hora) - minAgora;
      if (falta >= 0 && falta <= 60) alertas.push({ tipo: "retorno", texto: `${mapaPets[a.petId]?.nome || "Pet"} chega às ${a.hora} (${nomesServicos(a)})`, agId: a.id });
    });
    const amanha = somaDias(hoje, 1);
    const naoConfirmados = agendamentos.filter((a) => a.data === amanha && a.status === "Agendado").length;
    if (naoConfirmados) alertas.push({ tipo: "atencao", texto: `${naoConfirmados} agendamento${naoConfirmados > 1 ? "s" : ""} de amanhã sem confirmação — mande o lembrete`, pagina: "agenda" });
  }
  if (pode("financeiro")) {
    const atrasadas = contasReceber.filter((c) => statusConta(c) === "Atrasado");
    if (atrasadas.length) alertas.push({ tipo: "atraso", texto: `${atrasadas.length} pagamento${atrasadas.length > 1 ? "s" : ""} em atraso (${fmtMoeda(atrasadas.reduce((s, c) => s + restanteDe(c), 0))})`, pagina: "financeiro" });
    const vencendo = contasReceber.filter((c) => contaAberta(c) && c.vencimento >= hoje && c.vencimento <= somaDias(hoje, 3)).length;
    if (vencendo) alertas.push({ tipo: "atencao", texto: `${vencendo} pagamento${vencendo > 1 ? "s" : ""} pendente${vencendo > 1 ? "s" : ""} vencendo nos próximos dias`, pagina: "financeiro" });
  }
  if (pode("propostas")) {
    const aguardando = propostas.filter((p) => ["Enviada", "Aguardando aprovação"].includes(statusProposta(p))).length;
    if (aguardando) alertas.push({ tipo: "atencao", texto: `${aguardando} proposta${aguardando > 1 ? "s" : ""} aguardando aprovação`, pagina: "propostas" });
  }
  if (pode("clientes")) {
    const hojeMD = hoje.slice(5);
    pets.forEach((p) => { if (p.nascimento && p.nascimento.slice(5) === hojeMD) alertas.push({ tipo: "festa", texto: `Hoje é aniversário do ${p.nome}! 🎂`, petId: p.id }); });
    pets.forEach((p) => {
      if (!p.proximoAtendimento) return;
      const dias = difDias(p.proximoAtendimento, hoje);
      const futuro = agendamentos.some((a) => a.petId === p.id && a.data >= hoje && agAtivo(a) && a.status !== "Finalizado");
      if (futuro) return;
      if (dias >= 0 && dias <= 5) alertas.push({ tipo: "retorno", texto: `${p.nome} tem retorno de banho/tosa ${dias === 0 ? "hoje" : `em ${dias} dia${dias > 1 ? "s" : ""}`}`, petId: p.id });
      else if (dias < 0 && dias >= -20) alertas.push({ tipo: "atraso", texto: `Retorno do ${p.nome} passou há ${-dias} dia${-dias > 1 ? "s" : ""} — vale chamar o tutor`, petId: p.id });
    });
    const semRetorno = clientes.filter((c) => {
      const dele = agendamentos.filter((a) => a.clienteId === c.id);
      const ult = dele.filter((a) => a.status === "Finalizado").map((a) => a.data).sort().pop();
      const futuro = dele.some((a) => a.data >= hoje && agAtivo(a) && a.status !== "Finalizado");
      return ult && difDias(hoje, ult) > 45 && !futuro;
    });
    if (semRetorno.length) alertas.push({ tipo: "atencao", texto: `${semRetorno.length} cliente${semRetorno.length > 1 ? "s" : ""} sem retorno há mais de 45 dias`, pagina: "marketing" });
    const comAlergia = pets.filter((p) => (p.alergias || "").trim()).length;
    if (comAlergia) alertas.push({ tipo: "info", texto: `${comAlergia} pet${comAlergia > 1 ? "s" : ""} com alergia registrada — confira antes do banho` });
  }
  return alertas;
}

function Dashboard(props) {
  const { usuario, clientes, pets, pedidos, agendamentos, contasReceber, propostas, profissionais, pode, irPara, abrirPet, abrirAg, mudarStatusAg, painelPedidos } = props;
  const mimi = useMimi();
  const falou = useRef(false);
  const alertasRef = useRef([]);
  const hoje = hojeISO();
  const semana = { de: inicioSemana(hoje), ate: somaDias(inicioSemana(hoje), 6) };
  const mes = intervaloPeriodo("mes");
  const mapaCli = useMemo(() => Object.fromEntries(clientes.map((c) => [c.id, c])), [clientes]);
  const mapaPet = useMemo(() => Object.fromEntries(pets.map((p) => [p.id, p])), [pets]);

  const alertas = useMemo(() => calcularAlertas({ clientes, pets, pedidos, agendamentos, contasReceber, propostas, pode }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clientes, pets, pedidos, agendamentos, contasReceber, propostas]);
  alertasRef.current = alertas;

  useEffect(() => {
    const t = setTimeout(() => {
      if (falou.current) return;
      falou.current = true;
      const l = alertasRef.current;
      if (l.length) mimi.falar(`Psiu! ${l[0].texto}`, 7000);
      else mimi.falar(`Oi, ${primeiroNome(usuario.nome)}! Tudo tranquilo por aqui hoje 💙`, 5000);
    }, 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const agHoje = agendamentos.filter((a) => a.data === hoje).sort((a, b) => a.hora.localeCompare(b.hora));
  const agSemana = agendamentos.filter((a) => dentro(a.data, semana) && agAtivo(a)).length;
  const petsHoje = new Set(agHoje.filter((a) => a.status === "Finalizado").map((a) => a.petId)).size;
  const servicosMes = agendamentos.filter((a) => a.status === "Finalizado" && dentro(a.data, mes)).reduce((s, a) => s + (a.servicos || []).length, 0);
  const propPendentes = propostas.filter((p) => ["Rascunho", "Enviada", "Aguardando aprovação"].includes(statusProposta(p))).length;
  const aReceber = contasReceber.filter(contaAberta).reduce((s, c) => s + restanteDe(c), 0);
  const recebidoMes = contasReceber.reduce((s, c) => s + (c.pagamentos || []).filter((p) => dentro(p.data, mes)).reduce((x, p) => x + (Number(p.valor) || 0), 0), 0);
  const atrasado = contasReceber.filter((c) => statusConta(c) === "Atrasado").reduce((s, c) => s + restanteDe(c), 0);

  const meses = ultimosMeses(6);
  const faturamento = meses.map((m) => contasReceber.reduce((s, c) => s + (c.pagamentos || []).filter((p) => mesDe(p.data) === m.chave).reduce((x, p) => x + (Number(p.valor) || 0), 0), 0));
  const atendimentos = meses.map((m) => agendamentos.filter((a) => a.status === "Finalizado" && mesDe(a.data) === m.chave).length);
  const novosCli = meses.map((m) => clientes.filter((c) => mesDe(c.criadoEm) === m.chave).length);
  const novosPets = meses.map((m) => pets.filter((p) => mesDe(p.criadoEm) === m.chave).length);
  const maisFeitos = useMemo(() => {
    const cont = {};
    agendamentos.filter((a) => a.status === "Finalizado").forEach((a) => (a.servicos || []).forEach((s) => { cont[s.nome] = (cont[s.nome] || 0) + 1; }));
    return Object.entries(cont).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [agendamentos]);

  const dataHoje = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  const cartoes = [
    pode("agenda") && { v: agHoje.filter(agAtivo).length, r: "agendamentos hoje", pag: "agenda", destaque: true, icone: "calendar" },
    pode("agenda") && { v: agSemana, r: "agendamentos na semana", pag: "agenda" },
    pode("agenda") && { v: petsHoje, r: "pets atendidos hoje", pag: "agenda" },
    pode("clientes") && { v: clientes.length, r: "clientes cadastrados", pag: "clientes", destaque: !pode("agenda"), icone: "users" },
    pode("agenda") && { v: servicosMes, r: "serviços realizados no mês", pag: "relatorios" },
    pode("propostas") && { v: propPendentes, r: "propostas pendentes", pag: "propostas" },
    pode("financeiro") && { v: fmtMoeda(aReceber), r: "a receber", pag: "financeiro", destaque: !pode("agenda") && !pode("clientes"), dinheiro: true },
    pode("financeiro") && { v: fmtMoeda(recebidoMes), r: "recebido no mês", pag: "financeiro", dinheiro: true },
    pode("financeiro") && { v: fmtMoeda(atrasado), r: "em atraso", pag: "financeiro", alerta: atrasado > 0, dinheiro: true },
  ].filter(Boolean);

  return (
    <div className="pagina">
      <header className="saudacao">
        <p className="saudacao-data">{dataHoje}</p>
        <h1>Olá, {primeiroNome(usuario.nome)}! 🐶</h1>
      </header>

      <section className="numeros numeros-auto">
        {cartoes.map((c) => (
          <button key={c.r} className={`numero ${c.destaque ? "numero-destaque" : ""} ${c.alerta ? "numero-alerta" : ""} ${c.dinheiro ? "numero-dinheiro" : ""}`} onClick={() => irPara(c.pag)}>
            <span className="numero-valor">{c.v}</span>
            <span className="numero-rotulo">{c.r}</span>
            {c.icone && <Icone nome={c.icone} tam={24} className="numero-icone" />}
          </button>
        ))}
      </section>

      <div className="grade-painel">
        {painelPedidos}

        {pode("agenda") && (
          <section className="painel painel-hoje">
            <div className="painel-topo">
              <h2>Agenda de hoje</h2>
              <button className="btn btn-leve btn-peq" onClick={() => irPara("agenda")}>Ver agenda</button>
            </div>
            {agHoje.length === 0 ? <p className="texto-suave">Nenhum agendamento para hoje.</p> : (
              <div className="tabela-hoje">
                <div className="th-linha th-cab"><span>Horário</span><span>Cliente</span><span>Pet</span><span>Serviço</span><span>Status</span></div>
                {agHoje.map((a) => (
                  <div key={a.id} className="th-linha" onClick={() => abrirAg(a.id)} role="button" tabIndex={0}>
                    <span className="th-hora">{a.hora}</span>
                    <span>{mapaCli[a.clienteId]?.nome || "—"}</span>
                    <span className="th-pet">{mapaPet[a.petId]?.nome || "—"}</span>
                    <span className="texto-suave">{nomesServicos(a)}</span>
                    <span onClick={(e) => e.stopPropagation()}>
                      <select className={`status-select ${COR_STATUS_AG[a.status]}`} value={a.status} onChange={(e) => mudarStatusAg(a, e.target.value)} aria-label="Status">
                        {STATUS_AG.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <section className="painel">
          <div className="painel-topo"><h2>Avisos</h2><Icone nome="bell" /></div>
          {alertas.length === 0 ? <p className="texto-suave">Nenhum aviso agora. Tudo em ordem! 🐾</p> : (
            <ul className="lista-avisos">
              {alertas.map((a, i) => (
                <li key={i} className={`aviso aviso-${a.tipo}`}>
                  {a.petId ? <button className="link-aviso" onClick={() => abrirPet(a.petId)}>{a.texto}</button>
                    : a.agId ? <button className="link-aviso" onClick={() => abrirAg(a.agId)}>{a.texto}</button>
                      : a.pagina && pode(a.pagina) ? <button className="link-aviso" onClick={() => irPara(a.pagina)}>{a.texto}</button>
                        : <span>{a.texto}</span>}
                </li>
              ))}
            </ul>
          )}
        </section>

        {pode("financeiro") && (
          <section className="painel">
            <div className="painel-topo"><h2>Faturamento mensal</h2><Icone nome="wallet" /></div>
            <GraficoBarras rotulos={meses.map((m) => m.rotulo)} series={[{ cor: "#173A7A", valores: faturamento }]}
              formatar={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1).replace(".", ",")}k` : Math.round(v))} rotuloAria="Faturamento mensal" />
          </section>
        )}

        {pode("agenda") && (
          <section className="painel">
            <div className="painel-topo"><h2>Atendimentos por mês</h2><Icone nome="paw" /></div>
            <GraficoBarras rotulos={meses.map((m) => m.rotulo)} series={[{ cor: "#F6C230", valores: atendimentos }]} rotuloAria="Atendimentos por mês" />
          </section>
        )}

        {pode("agenda") && (
          <section className="painel">
            <div className="painel-topo"><h2>Serviços mais realizados</h2></div>
            <BarrasHorizontais itens={maisFeitos} vazio="Os serviços aparecem aqui quando os atendimentos forem finalizados." />
          </section>
        )}

        {pode("clientes") && (
          <section className="painel">
            <div className="painel-topo"><h2>Novos clientes e pets</h2></div>
            <div className="legenda">
              <span><i style={{ background: "#173A7A" }} />Clientes</span>
              <span><i style={{ background: "#F6C230" }} />Pets</span>
            </div>
            <GraficoBarras rotulos={meses.map((m) => m.rotulo)} series={[{ cor: "#173A7A", valores: novosCli }, { cor: "#F6C230", corTexto: "#9A7200", valores: novosPets }]} rotuloAria="Novos clientes e pets" />
          </section>
        )}
      </div>
      {profissionais.length === 0 && usuario.papel === "administrador" && (
        <p className="dica-config">💡 Cadastre os serviços, preços e profissionais em <button className="link" onClick={() => irPara("configuracoes")}>Configurações</button> para a agenda ficar completa.</p>
      )}
    </div>
  );
}

// =====================================================================
//  CLIENTES
// =====================================================================
const ORIGENS = ["Instagram", "WhatsApp", "Google", "Indicação", "Site", "Cliente antigo", "Outros"];
const UFS = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];
const CLIENTE_VAZIO = {
  nome: "", documento: "", nascimento: "", telefone: "", whatsapp: "", email: "", cep: "", rua: "", numero: "",
  complemento: "", bairro: "", cidade: "", estado: "SP", observacoes: "", origem: "Instagram",
};

function FormCliente({ inicial, aoFechar, aoSalvar }) {
  const [f, setF] = useState({ ...CLIENTE_VAZIO, ...(inicial || {}) });
  const [erro, setErro] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const mudar = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const editando = Boolean(inicial?.id);

  const buscarCep = async () => {
    const cep = soDigitos(f.cep);
    if (cep.length !== 8) return;
    setBuscandoCep(true);
    try {
      const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const d = await r.json();
      if (!d.erro) setF((x) => ({ ...x, rua: d.logradouro || x.rua, bairro: d.bairro || x.bairro, cidade: d.localidade || x.cidade, estado: d.uf || x.estado }));
    } catch { /* sem internet: segue manual */ }
    setBuscandoCep(false);
  };

  const salvar = async () => {
    if (!f.nome.trim()) { setErro("Informe o nome do cliente."); return; }
    if (!soDigitos(f.telefone) && !soDigitos(f.whatsapp)) { setErro("Informe pelo menos um telefone ou WhatsApp."); return; }
    setErro(""); setOcupado(true);
    try { await aoSalvar(f); } catch (e) { setErro(traduzErro(e)); setOcupado(false); }
  };

  return (
    <Modal titulo={editando ? `Editar ${inicial.codigo || "cliente"}` : "Novo cliente"} aoFechar={aoFechar} largo
      rodape={<>
        {erro && <span className="erro-rodape">{erro}</span>}
        <button className="btn btn-leve" onClick={aoFechar}>Cancelar</button>
        <button className="btn btn-ouro" onClick={salvar} disabled={ocupado}>{ocupado ? "Salvando…" : "Salvar cliente"}</button>
      </>}>
      {!editando && <p className="texto-suave form-nota">O código do cliente (CLI-000001, CLI-000002…) é gerado automaticamente ao salvar.</p>}
      <div className="fgrade">
        <Campo rotulo="Nome completo *" largo><input value={f.nome} onChange={mudar("nome")} autoFocus /></Campo>
        <Campo rotulo="CPF/CNPJ"><input value={f.documento} onChange={mudar("documento")} onBlur={() => setF((x) => ({ ...x, documento: fmtDoc(x.documento) }))} inputMode="numeric" /></Campo>
        <Campo rotulo="Data de nascimento"><input type="date" value={f.nascimento} onChange={mudar("nascimento")} /></Campo>
        <Campo rotulo="Telefone"><input value={f.telefone} onChange={mudar("telefone")} onBlur={() => setF((x) => ({ ...x, telefone: fmtTel(x.telefone) }))} inputMode="tel" placeholder="(11) 90000-0000" /></Campo>
        <Campo rotulo="WhatsApp"><input value={f.whatsapp} onChange={mudar("whatsapp")} onBlur={() => setF((x) => ({ ...x, whatsapp: fmtTel(x.whatsapp) }))} inputMode="tel" placeholder="(11) 90000-0000" /></Campo>
        <Campo rotulo="E-mail"><input type="email" value={f.email} onChange={mudar("email")} /></Campo>
        <Campo rotulo="Origem do cliente">
          <select value={f.origem} onChange={mudar("origem")}>{ORIGENS.map((o) => <option key={o}>{o}</option>)}</select>
        </Campo>
      </div>
      <h3 className="form-secao">Endereço</h3>
      <div className="fgrade">
        <Campo rotulo="CEP" dica={buscandoCep ? "Buscando endereço…" : "Preenche o endereço sozinho"}>
          <input value={f.cep} onChange={mudar("cep")} onBlur={buscarCep} inputMode="numeric" placeholder="00000-000" />
        </Campo>
        <Campo rotulo="Rua" largo><input value={f.rua} onChange={mudar("rua")} /></Campo>
        <Campo rotulo="Número"><input value={f.numero} onChange={mudar("numero")} /></Campo>
        <Campo rotulo="Complemento"><input value={f.complemento} onChange={mudar("complemento")} /></Campo>
        <Campo rotulo="Bairro"><input value={f.bairro} onChange={mudar("bairro")} /></Campo>
        <Campo rotulo="Cidade"><input value={f.cidade} onChange={mudar("cidade")} /></Campo>
        <Campo rotulo="Estado">
          <select value={f.estado} onChange={mudar("estado")}>{UFS.map((u) => <option key={u}>{u}</option>)}</select>
        </Campo>
      </div>
      <Campo rotulo="Observações" largo><textarea rows={3} value={f.observacoes} onChange={mudar("observacoes")} /></Campo>
    </Modal>
  );
}

function BotoesContato({ cliente, pequeno }) {
  const tel = cliente.whatsapp || cliente.telefone;
  const msg = `Olá, ${primeiroNome(cliente.nome)}! Aqui é do ${EMPRESA.nome} 🐶`;
  return (
    <div className="contatos">
      {soDigitos(tel) && (
        <a className={`btn btn-whats ${pequeno ? "btn-peq" : ""}`} href={linkWhats(tel, msg)} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
          <Icone nome="whats" tam={16} />{!pequeno && " WhatsApp"}
        </a>
      )}
      {cliente.email && (
        <a className={`btn btn-leve ${pequeno ? "btn-peq" : ""}`} href={`mailto:${cliente.email}`} onClick={(e) => e.stopPropagation()}>
          <Icone nome="mail" tam={16} />{!pequeno && " E-mail"}
        </a>
      )}
    </div>
  );
}

function ListaClientes({ clientes, pets, abrirCliente, novoCliente, editarCliente, excluirCliente, podeExcluir }) {
  const [busca, setBusca] = useState("");
  const [origem, setOrigem] = useState("");
  const [ordem, setOrdem] = useState("recentes");

  const lista = useMemo(() => {
    const b = normalizar(busca);
    const bd = soDigitos(busca);
    let r = clientes.filter((c) => {
      if (origem && c.origem !== origem) return false;
      if (!b) return true;
      const petsNomes = pets.filter((p) => p.clienteId === c.id).map((p) => p.nome).join(" ");
      return normalizar(`${c.nome} ${c.codigo} ${c.email} ${c.cidade} ${c.bairro} ${petsNomes}`).includes(b)
        || (bd.length >= 3 && (soDigitos(c.telefone).includes(bd) || soDigitos(c.whatsapp).includes(bd) || soDigitos(c.documento).includes(bd)));
    });
    r = [...r].sort((a, x) => ordem === "nome" ? a.nome.localeCompare(x.nome) : ordem === "codigo" ? String(a.codigo).localeCompare(String(x.codigo)) : String(x.criadoEm).localeCompare(String(a.criadoEm)));
    return r;
  }, [clientes, pets, busca, origem, ordem]);

  const exportar = () => {
    exportarCSV("clientes-mimi-dogs.csv",
      ["Código", "Nome", "CPF/CNPJ", "Nascimento", "Telefone", "WhatsApp", "E-mail", "CEP", "Rua", "Número", "Complemento", "Bairro", "Cidade", "UF", "Origem", "Cadastro", "Pets", "Observações"],
      lista.map((c) => [c.codigo, c.nome, c.documento, fmtData(c.nascimento), c.telefone, c.whatsapp, c.email, c.cep, c.rua, c.numero, c.complemento, c.bairro, c.cidade, c.estado, c.origem, fmtData(c.dataCadastro || c.criadoEm), pets.filter((p) => p.clienteId === c.id).map((p) => p.nome).join(", "), c.observacoes]));
  };

  return (
    <div className="pagina">
      <header className="pagina-topo">
        <div>
          <h1>Clientes</h1>
          <p className="texto-suave">{clientes.length} cadastrado{clientes.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="acoes-topo">
          <button className="btn btn-leve" onClick={exportar} disabled={!lista.length}><Icone nome="download" tam={18} /> Exportar</button>
          <button className="btn btn-ouro" onClick={novoCliente}><Icone nome="plus" tam={18} /> Novo cliente</button>
        </div>
      </header>

      <div className="filtros">
        <div className="busca">
          <Icone nome="search" tam={18} />
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome, código, telefone, CPF ou nome do pet" />
        </div>
        <select value={origem} onChange={(e) => setOrigem(e.target.value)} aria-label="Filtrar por origem">
          <option value="">Todas as origens</option>{ORIGENS.map((o) => <option key={o}>{o}</option>)}
        </select>
        <select value={ordem} onChange={(e) => setOrdem(e.target.value)} aria-label="Ordenar">
          <option value="recentes">Mais recentes</option><option value="nome">Nome (A-Z)</option><option value="codigo">Código</option>
        </select>
      </div>

      {clientes.length === 0 ? (
        <Vazio titulo="Nenhum cliente ainda" texto="Que tal cadastrar o primeiro tutor da família Mimi?"
          acao={<button className="btn btn-ouro" onClick={novoCliente}><Icone nome="plus" tam={18} /> Cadastrar cliente</button>} />
      ) : lista.length === 0 ? (
        <p className="texto-suave centro">Nenhum cliente encontrado com esses filtros.</p>
      ) : (
        <div className="tabela">
          <div className="tabela-cab">
            <span>Cliente</span><span>Contato</span><span>Pets</span><span>Cidade</span><span />
          </div>
          {lista.map((c) => {
            const seusPets = pets.filter((p) => p.clienteId === c.id);
            return (
              <div key={c.id} className="tabela-linha" onClick={() => abrirCliente(c.id)} role="button" tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && abrirCliente(c.id)}>
                <div className="cel-cliente">
                  <span className="codigo">{c.codigo}</span>
                  <strong>{c.nome}</strong>
                  <span className="texto-suave peq">{c.origem}</span>
                </div>
                <div className="cel-contato">{fmtTel(c.whatsapp || c.telefone) || <span className="texto-suave">—</span>}</div>
                <div className="cel-pets">
                  {seusPets.length ? (
                    <div className="pets-mini">
                      {seusPets.slice(0, 3).map((p) => <AvatarPet key={p.id} pet={p} tam={30} />)}
                      <span>{seusPets.map((p) => p.nome).join(", ")}</span>
                    </div>
                  ) : <span className="texto-suave">nenhum</span>}
                </div>
                <div className="cel-cidade">{c.cidade || "—"}</div>
                <div className="cel-acoes" onClick={(e) => e.stopPropagation()}>
                  <BotoesContato cliente={c} pequeno />
                  <button className="btn-icone" onClick={() => editarCliente(c)} aria-label={`Editar ${c.nome}`}><Icone nome="edit" tam={18} /></button>
                  {podeExcluir && <button className="btn-icone btn-icone-perigo" onClick={() => excluirCliente(c)} aria-label={`Excluir ${c.nome}`}><Icone nome="trash" tam={18} /></button>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// =====================================================================
//  PETS
// =====================================================================
const ESPECIES = ["Cão", "Gato", "Outro"];
const PORTES = ["Mini", "Pequeno", "Médio", "Grande", "Gigante"];
const TEMPERAMENTOS = ["Dócil", "Brincalhão", "Agitado", "Medroso", "Bravo"];
const PET_VAZIO = {
  clienteId: "", nome: "", foto: "", especie: "Cão", raca: "", sexo: "Macho", nascimento: "", peso: "", cor: "",
  porte: "Pequeno", temperamento: "Dócil", observacoes: "", alergias: "", cuidados: "", vacinacao: "",
  ultimoBanho: "", ultimaTosa: "", proximoAtendimento: "",
};

function FormPet({ inicial, clientes, aoFechar, aoSalvar }) {
  const [f, setF] = useState({ ...PET_VAZIO, ...(inicial || {}) });
  const [erro, setErro] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [buscaTutor, setBuscaTutor] = useState("");
  const inputFoto = useRef(null);
  const mudar = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const editando = Boolean(inicial?.id);

  const clientesFiltrados = useMemo(() => {
    const b = normalizar(buscaTutor);
    return [...clientes].filter((c) => !b || normalizar(`${c.nome} ${c.codigo}`).includes(b)).sort((a, x) => a.nome.localeCompare(x.nome));
  }, [clientes, buscaTutor]);

  const escolherFoto = async (e) => {
    const arq = e.target.files?.[0];
    if (!arq) return;
    try { const foto = await comprimirImagem(arq); setF((x) => ({ ...x, foto })); }
    catch { setErro("Não consegui ler essa imagem. Tente outra foto."); }
    e.target.value = "";
  };

  const salvar = async () => {
    if (!f.clienteId) { setErro("Escolha o tutor (cliente) do pet."); return; }
    if (!f.nome.trim()) { setErro("Informe o nome do pet."); return; }
    setErro(""); setOcupado(true);
    try { await aoSalvar(f); } catch (e) { setErro(traduzErro(e)); setOcupado(false); }
  };

  return (
    <Modal titulo={editando ? `Editar ${f.nome || "pet"}` : "Novo pet"} aoFechar={aoFechar} largo
      rodape={<>
        {erro && <span className="erro-rodape">{erro}</span>}
        <button className="btn btn-leve" onClick={aoFechar}>Cancelar</button>
        <button className="btn btn-ouro" onClick={salvar} disabled={ocupado}>{ocupado ? "Salvando…" : "Salvar pet"}</button>
      </>}>
      <div className="pet-form-topo">
        <button type="button" className="foto-pet-escolher" onClick={() => inputFoto.current?.click()}>
          {f.foto ? <img src={f.foto} alt="Foto do pet" /> : <><Icone nome="camera" tam={26} /><span>Foto</span></>}
        </button>
        <input ref={inputFoto} type="file" accept="image/*" hidden onChange={escolherFoto} />
        <div className="pet-form-principal">
          <Campo rotulo="Nome do pet *"><input value={f.nome} onChange={mudar("nome")} autoFocus={!editando} /></Campo>
          <Campo rotulo="Tutor (cliente) *">
            {clientes.length > 8 && !inicial?.clienteIdFixo && (
              <input className="mb6" value={buscaTutor} onChange={(e) => setBuscaTutor(e.target.value)} placeholder="Filtrar clientes…" />
            )}
            <select value={f.clienteId} onChange={mudar("clienteId")} disabled={Boolean(inicial?.clienteIdFixo)}>
              <option value="">Selecione…</option>
              {clientesFiltrados.map((c) => <option key={c.id} value={c.id}>{c.nome} ({c.codigo})</option>)}
            </select>
          </Campo>
          {f.foto && <button type="button" className="link peq" onClick={() => setF((x) => ({ ...x, foto: "" }))}>Remover foto</button>}
        </div>
      </div>
      <div className="fgrade">
        <Campo rotulo="Espécie"><select value={f.especie} onChange={mudar("especie")}>{ESPECIES.map((o) => <option key={o}>{o}</option>)}</select></Campo>
        <Campo rotulo="Raça"><input value={f.raca} onChange={mudar("raca")} placeholder="Ex.: Pug, SRD…" /></Campo>
        <Campo rotulo="Sexo"><select value={f.sexo} onChange={mudar("sexo")}><option>Macho</option><option>Fêmea</option></select></Campo>
        <Campo rotulo="Nascimento" dica={f.nascimento ? `Idade: ${idadeTexto(f.nascimento) || "—"}` : ""}><input type="date" value={f.nascimento} onChange={mudar("nascimento")} max={hojeISO()} /></Campo>
        <Campo rotulo="Peso (kg)"><input value={f.peso} onChange={mudar("peso")} inputMode="decimal" /></Campo>
        <Campo rotulo="Cor"><input value={f.cor} onChange={mudar("cor")} /></Campo>
        <Campo rotulo="Porte"><select value={f.porte} onChange={mudar("porte")}>{PORTES.map((o) => <option key={o}>{o}</option>)}</select></Campo>
        <Campo rotulo="Temperamento"><select value={f.temperamento} onChange={mudar("temperamento")}>{TEMPERAMENTOS.map((o) => <option key={o}>{o}</option>)}</select></Campo>
      </div>
      <h3 className="form-secao">Saúde e cuidados</h3>
      <div className="fgrade">
        <Campo rotulo="Alergias" largo dica="Aparece em vermelho na ficha do pet"><input value={f.alergias} onChange={mudar("alergias")} /></Campo>
        <Campo rotulo="Cuidados especiais" largo><input value={f.cuidados} onChange={mudar("cuidados")} /></Campo>
        <Campo rotulo="Vacinação" largo><textarea rows={2} value={f.vacinacao} onChange={mudar("vacinacao")} placeholder="Ex.: V10 em 03/2026, antirrábica em 05/2026" /></Campo>
      </div>
      <h3 className="form-secao">Banho e tosa</h3>
      <div className="fgrade">
        <Campo rotulo="Último banho"><input type="date" value={f.ultimoBanho} onChange={mudar("ultimoBanho")} /></Campo>
        <Campo rotulo="Última tosa"><input type="date" value={f.ultimaTosa} onChange={mudar("ultimaTosa")} /></Campo>
        <Campo rotulo="Próximo atendimento"><input type="date" value={f.proximoAtendimento} onChange={mudar("proximoAtendimento")} /></Campo>
      </div>
      <Campo rotulo="Observações" largo><textarea rows={3} value={f.observacoes} onChange={mudar("observacoes")} /></Campo>
    </Modal>
  );
}

function ListaPets({ pets, clientes, abrirPet, novoPet }) {
  const [busca, setBusca] = useState("");
  const [especie, setEspecie] = useState("");
  const [porte, setPorte] = useState("");
  const mapaClientes = useMemo(() => Object.fromEntries(clientes.map((c) => [c.id, c])), [clientes]);

  const lista = useMemo(() => {
    const b = normalizar(busca);
    return pets
      .filter((p) => (!especie || p.especie === especie) && (!porte || p.porte === porte))
      .filter((p) => !b || normalizar(`${p.nome} ${p.raca} ${p.codigo} ${mapaClientes[p.clienteId]?.nome || ""}`).includes(b))
      .sort((a, x) => a.nome.localeCompare(x.nome));
  }, [pets, busca, especie, porte, mapaClientes]);

  const exportar = () => {
    exportarCSV("pets-mimi-dogs.csv",
      ["Código", "Nome", "Tutor", "Espécie", "Raça", "Sexo", "Nascimento", "Idade", "Peso", "Cor", "Porte", "Temperamento", "Alergias", "Cuidados", "Vacinação", "Último banho", "Última tosa", "Próximo atendimento"],
      lista.map((p) => [p.codigo, p.nome, mapaClientes[p.clienteId]?.nome, p.especie, p.raca, p.sexo, fmtData(p.nascimento), idadeTexto(p.nascimento), p.peso, p.cor, p.porte, p.temperamento, p.alergias, p.cuidados, p.vacinacao, fmtData(p.ultimoBanho), fmtData(p.ultimaTosa), fmtData(p.proximoAtendimento)]));
  };

  return (
    <div className="pagina">
      <header className="pagina-topo">
        <div>
          <h1>Pets</h1>
          <p className="texto-suave">{pets.length} na família Mimi</p>
        </div>
        <div className="acoes-topo">
          <button className="btn btn-leve" onClick={exportar} disabled={!lista.length}><Icone nome="download" tam={18} /> Exportar</button>
          <button className="btn btn-ouro" onClick={() => novoPet()} disabled={!clientes.length}><Icone nome="plus" tam={18} /> Novo pet</button>
        </div>
      </header>
      <div className="filtros">
        <div className="busca">
          <Icone nome="search" tam={18} />
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome, raça, código ou tutor" />
        </div>
        <select value={especie} onChange={(e) => setEspecie(e.target.value)} aria-label="Filtrar espécie">
          <option value="">Todas as espécies</option>{ESPECIES.map((o) => <option key={o}>{o}</option>)}
        </select>
        <select value={porte} onChange={(e) => setPorte(e.target.value)} aria-label="Filtrar porte">
          <option value="">Todos os portes</option>{PORTES.map((o) => <option key={o}>{o}</option>)}
        </select>
      </div>

      {pets.length === 0 ? (
        <Vazio titulo="Nenhum pet por aqui" texto={clientes.length ? "Cadastre o primeiro peludo!" : "Primeiro cadastre um cliente, depois os pets dele."}
          acao={clientes.length ? <button className="btn btn-ouro" onClick={() => novoPet()}><Icone nome="plus" tam={18} /> Cadastrar pet</button> : null} />
      ) : lista.length === 0 ? (
        <p className="texto-suave centro">Nenhum pet encontrado.</p>
      ) : (
        <div className="grade-pets">
          {lista.map((p) => (
            <button key={p.id} className="cartao-pet" onClick={() => abrirPet(p.id)}>
              <div className="cartao-pet-foto">
                {p.foto ? <img src={p.foto} alt={p.nome} /> : <Icone nome="paw" tam={40} />}
                {(p.alergias || "").trim() && <span className="selo-alerta selo-canto">alergia</span>}
              </div>
              <div className="cartao-pet-info">
                <strong>{p.nome}</strong>
                <span className="texto-suave peq">{[p.raca || p.especie, idadeTexto(p.nascimento)].filter(Boolean).join(" · ")}</span>
                <span className="peq tutor">{mapaClientes[p.clienteId]?.nome || "Sem tutor"}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// =====================================================================
//  AGENDA
// =====================================================================
function SeletorCliente({ clientes, valor, aoMudar, desabilitado }) {
  const [busca, setBusca] = useState("");
  const lista = useMemo(() => {
    const b = normalizar(busca);
    const bd = soDigitos(busca);
    return [...clientes]
      .filter((c) => !b || normalizar(`${c.nome} ${c.codigo}`).includes(b) || (bd.length >= 3 && soDigitos(c.whatsapp || c.telefone).includes(bd)))
      .sort((a, x) => a.nome.localeCompare(x.nome));
  }, [clientes, busca]);
  return (
    <>
      {clientes.length > 8 && !desabilitado && (
        <input className="mb6" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar cliente por nome, código ou telefone…" />
      )}
      <select value={valor} onChange={(e) => aoMudar(e.target.value)} disabled={desabilitado}>
        <option value="">Selecione…</option>
        {lista.map((c) => <option key={c.id} value={c.id}>{c.nome} ({c.codigo})</option>)}
      </select>
    </>
  );
}

function FormAgendamento({ inicial, clientes, pets, servicos, profissionais, agendamentos, aoFechar, aoSalvar, novoPet }) {
  const config = useConfig();
  const editando = Boolean(inicial?.id);
  const profAtivos = profissionais.filter((p) => p.ativo !== false);
  const servAtivos = servicos.filter((s) => s.ativo !== false);
  const [f, setF] = useState(() => ({
    clienteId: "", petId: "", servicos: [], profissionalId: profAtivos.length === 1 ? profAtivos[0].id : "",
    data: hojeISO(), hora: "", duracao: 60, valor: 0, observacoes: "", status: "Agendado", ...(inicial || {}),
  }));
  const [valorManual, setValorManual] = useState(editando);
  const [erro, setErro] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const petsDoCliente = pets.filter((p) => p.clienteId === f.clienteId);

  useEffect(() => {
    if (f.clienteId && !f.petId && petsDoCliente.length === 1) setF((x) => ({ ...x, petId: petsDoCliente[0].id }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f.clienteId, petsDoCliente.length]);

  const alternarServico = (s) => {
    setF((x) => {
      const tem = x.servicos.some((y) => y.id === s.id);
      const lista = tem ? x.servicos.filter((y) => y.id !== s.id) : [...x.servicos, { id: s.id, nome: s.nome, preco: Number(s.preco) || 0, duracao: Number(s.duracao) || 30 }];
      const dur = lista.reduce((a, y) => a + (Number(y.duracao) || 0), 0) || 30;
      const prof = !x.profissionalId && !tem && s.profissionalId ? s.profissionalId : x.profissionalId;
      return { ...x, servicos: lista, duracao: dur, valor: valorManual ? x.valor : arred(lista.reduce((a, y) => a + (Number(y.preco) || 0), 0)), profissionalId: prof };
    });
  };

  const slots = useMemo(() => {
    const todos = horariosDoDia(config);
    return todos.map((h) => {
      const teste = { id: f.id, profissionalId: f.profissionalId, data: f.data, hora: h, duracao: f.duracao };
      const passa = minutosDe(h) + (Number(f.duracao) || 30) > minutosDe(config.fecha);
      const conflito = f.profissionalId ? acharConflito(teste, agendamentos) : null;
      const passado = f.data === hojeISO() && minutosDe(h) < new Date().getHours() * 60 + new Date().getMinutes();
      return { h, livre: !conflito && !passa, passado };
    });
  }, [config, f.id, f.profissionalId, f.data, f.duracao, agendamentos]);

  const diaFechado = f.data && !config.diasAbertos.includes(dataDeISO(f.data).getDay());

  const salvar = async () => {
    if (!f.clienteId) return setErro("1. Escolha o cliente.");
    if (!f.petId) return setErro("2. Escolha o pet.");
    if (!f.servicos.length) return setErro("3. Escolha pelo menos um serviço.");
    if (!f.data) return setErro("4. Escolha a data.");
    if (!f.hora) return setErro("5. Escolha o horário.");
    if (profAtivos.length && !f.profissionalId) return setErro("Escolha o profissional.");
    const c = acharConflito(f, agendamentos);
    if (c) {
      const cli = clientes.find((x) => x.id === c.clienteId);
      return setErro(`Conflito: ${profissionais.find((p) => p.id === f.profissionalId)?.nome || "o profissional"} já tem ${cli?.nome || "um atendimento"} das ${c.hora} às ${hhmmDe(fimAg(c))}.`);
    }
    setErro(""); setOcupado(true);
    try { await aoSalvar({ ...f, duracao: Number(f.duracao) || 30, valor: arred(paraNumero(f.valor)) }); }
    catch (e) { setErro(traduzErro(e)); setOcupado(false); }
  };

  return (
    <Modal titulo={editando ? "Editar agendamento" : "Novo agendamento"} aoFechar={aoFechar} largo
      rodape={<>
        {erro && <span className="erro-rodape">{erro}</span>}
        <button className="btn btn-leve" onClick={aoFechar}>Cancelar</button>
        <button className="btn btn-ouro" onClick={salvar} disabled={ocupado}>{ocupado ? "Salvando…" : "6. Confirmar agendamento"}</button>
      </>}>
      <div className="passos-form">
        <div className="passo-form">
          <span className="passo-num">1</span>
          <Campo rotulo="Cliente" largo>
            <SeletorCliente clientes={clientes} valor={f.clienteId} aoMudar={(v) => setF((x) => ({ ...x, clienteId: v, petId: "" }))} />
          </Campo>
        </div>
        <div className="passo-form">
          <span className="passo-num">2</span>
          <Campo rotulo="Pet" largo>
            {!f.clienteId ? <span className="texto-suave peq">Escolha o cliente primeiro.</span> : petsDoCliente.length === 0 ? (
              <span className="peq">Esse cliente ainda não tem pet. <button type="button" className="link" onClick={() => novoPet(f.clienteId)}>Cadastrar pet</button></span>
            ) : (
              <div className="escolhas">
                {petsDoCliente.map((p) => (
                  <button type="button" key={p.id} className={`escolha ${f.petId === p.id ? "marcado" : ""}`} onClick={() => setF((x) => ({ ...x, petId: p.id }))}>
                    <AvatarPet pet={p} tam={24} /> {p.nome}
                  </button>
                ))}
              </div>
            )}
            {(pets.find((p) => p.id === f.petId)?.alergias || "").trim() && (
              <div className="alerta alerta-erro"><Icone nome="alert" tam={16} /> Alergia: {pets.find((p) => p.id === f.petId).alergias}</div>
            )}
          </Campo>
        </div>
        <div className="passo-form">
          <span className="passo-num">3</span>
          <Campo rotulo="Serviços" largo>
            {servAtivos.length === 0 ? <span className="texto-suave peq">Nenhum serviço cadastrado. Um administrador pode cadastrar em Configurações → Serviços.</span> : (
              <div className="escolhas">
                {servAtivos.map((s) => (
                  <button type="button" key={s.id} className={`escolha ${f.servicos.some((y) => y.id === s.id) ? "marcado" : ""}`} onClick={() => alternarServico(s)}>
                    {s.nome} <small>{fmtMoeda(s.preco)} · {s.duracao}min</small>
                  </button>
                ))}
              </div>
            )}
          </Campo>
        </div>
        <div className="passo-form">
          <span className="passo-num">4</span>
          <div className="fgrade fgrade-cheia">
            <Campo rotulo="Data"><input type="date" value={f.data} onChange={(e) => setF((x) => ({ ...x, data: e.target.value, hora: "" }))} /></Campo>
            {profAtivos.length > 0 && (
              <Campo rotulo="Profissional">
                <select value={f.profissionalId} onChange={(e) => setF((x) => ({ ...x, profissionalId: e.target.value }))}>
                  <option value="">Selecione…</option>
                  {profAtivos.map((p) => <option key={p.id} value={p.id}>{p.nome}{p.funcao ? ` — ${p.funcao}` : ""}</option>)}
                </select>
              </Campo>
            )}
            <Campo rotulo="Duração (min)"><input type="number" min="5" step="5" value={f.duracao} onChange={(e) => setF((x) => ({ ...x, duracao: e.target.value }))} /></Campo>
            <Campo rotulo="Valor (R$)"><input value={f.valor} inputMode="decimal" onChange={(e) => { setValorManual(true); setF((x) => ({ ...x, valor: e.target.value })); }} /></Campo>
          </div>
          {diaFechado && <div className="alerta alerta-info">Atenção: esse dia está marcado como fechado nas configurações.</div>}
        </div>
        <div className="passo-form">
          <span className="passo-num">5</span>
          <Campo rotulo={`Horário${f.hora ? `: ${f.hora} às ${hhmmDe(minutosDe(f.hora) + (Number(f.duracao) || 30))}` : ""}`} largo>
            <div className="horarios">
              {slots.map((s) => (
                <button type="button" key={s.h} disabled={!s.livre && f.hora !== s.h}
                  className={`horario ${f.hora === s.h ? "marcado" : ""} ${!s.livre ? "ocupado" : ""} ${s.passado ? "passado" : ""}`}
                  onClick={() => setF((x) => ({ ...x, hora: s.h }))}>{s.h}</button>
              ))}
            </div>
            <span className="campo-dica">Horários riscados já estão ocupados para esse profissional. Outro horário: <input type="time" className="hora-livre" value={f.hora} onChange={(e) => setF((x) => ({ ...x, hora: e.target.value }))} /></span>
          </Campo>
        </div>
        <div className="fgrade">
          <Campo rotulo="Status"><select value={f.status} onChange={(e) => setF((x) => ({ ...x, status: e.target.value }))}>{STATUS_AG.map((s) => <option key={s}>{s}</option>)}</select></Campo>
          <Campo rotulo="Observações" largo><textarea rows={2} value={f.observacoes} onChange={(e) => setF((x) => ({ ...x, observacoes: e.target.value }))} /></Campo>
        </div>
      </div>
    </Modal>
  );
}

function FinalizarAtendimento({ ag, pet, aoFechar, aoConfirmar }) {
  const config = useConfig();
  const [f, setF] = useState({ observacoes: "", produtos: "", fotoAntes: "", fotoDepois: "", retornoDias: "", gerarCobranca: (Number(ag.valor) || 0) > 0, jaPago: false, forma: config.formasPagamento[0] || "Pix" });
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState("");
  const foto = (k) => async (e) => {
    const arq = e.target.files?.[0];
    if (!arq) return;
    try { const d = await comprimirImagem(arq, 420, 0.7); setF((x) => ({ ...x, [k]: d })); } catch { setErro("Não consegui ler a foto."); }
    e.target.value = "";
  };
  return (
    <Modal titulo={`Finalizar atendimento · ${pet?.nome || ""}`} aoFechar={aoFechar} largo
      rodape={<>
        {erro && <span className="erro-rodape">{erro}</span>}
        <button className="btn btn-leve" onClick={aoFechar}>Cancelar</button>
        <button className="btn btn-ouro" disabled={ocupado} onClick={async () => { setOcupado(true); try { await aoConfirmar(f); } catch (e) { setErro(traduzErro(e)); setOcupado(false); } }}>
          {ocupado ? "Salvando…" : "Finalizar"}
        </button>
      </>}>
      <p className="texto-suave">{nomesServicos(ag)} · {fmtMoeda(ag.valor)}</p>
      <div className="fgrade">
        <Campo rotulo="Observações do profissional" largo><textarea rows={2} value={f.observacoes} onChange={(e) => setF((x) => ({ ...x, observacoes: e.target.value }))} placeholder="Como o pet se comportou, pele, pelos…" /></Campo>
        <Campo rotulo="Produtos utilizados" largo><input value={f.produtos} onChange={(e) => setF((x) => ({ ...x, produtos: e.target.value }))} placeholder="Ex.: shampoo hipoalergênico, perfume X" /></Campo>
      </div>
      <div className="fotos-ad">
        {[["fotoAntes", "Foto antes"], ["fotoDepois", "Foto depois"]].map(([k, r]) => (
          <label key={k} className="foto-ad">
            {f[k] ? <img src={f[k]} alt={r} /> : <><Icone nome="camera" tam={24} /><span>{r}</span></>}
            <input type="file" accept="image/*" hidden onChange={foto(k)} />
          </label>
        ))}
      </div>
      <div className="fgrade">
        <Campo rotulo="Próximo retorno sugerido">
          <select value={f.retornoDias} onChange={(e) => setF((x) => ({ ...x, retornoDias: e.target.value }))}>
            <option value="">Não definir</option><option value="7">Em 7 dias</option><option value="15">Em 15 dias</option><option value="21">Em 21 dias</option><option value="30">Em 30 dias</option><option value="45">Em 45 dias</option>
          </select>
        </Campo>
      </div>
      {(Number(ag.valor) || 0) > 0 && !ag.contaReceberId && (
        <div className="caixa-opcao">
          <label className="checar"><input type="checkbox" checked={f.gerarCobranca} onChange={(e) => setF((x) => ({ ...x, gerarCobranca: e.target.checked }))} /> Lançar {fmtMoeda(ag.valor)} em Contas a receber</label>
          {f.gerarCobranca && (
            <div className="linha-opcao">
              <label className="checar"><input type="checkbox" checked={f.jaPago} onChange={(e) => setF((x) => ({ ...x, jaPago: e.target.checked }))} /> Cliente já pagou</label>
              {f.jaPago && <select value={f.forma} onChange={(e) => setF((x) => ({ ...x, forma: e.target.value }))}>{config.formasPagamento.map((o) => <option key={o}>{o}</option>)}</select>}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

function DetalheAgendamento({ ag, cliente, pet, profissional, aoFechar, editar, excluir, mudarStatus, finalizar, abrirCliente, podeExcluir }) {
  const config = useConfig();
  const vars = varsMensagem({ config, cliente, pet, ag });
  const tel = cliente?.whatsapp || cliente?.telefone;
  return (
    <Modal titulo="Agendamento" aoFechar={aoFechar}
      rodape={<>
        {podeExcluir && <button className="btn btn-leve btn-texto-perigo" onClick={excluir}><Icone nome="trash" tam={16} /></button>}
        <button className="btn btn-leve" onClick={editar}><Icone nome="edit" tam={16} /> Editar</button>
        {!["Finalizado", "Cancelado", "Não compareceu"].includes(ag.status) && <button className="btn btn-ouro" onClick={finalizar}><Icone nome="check" tam={16} /> Finalizar</button>}
      </>}>
      <div className="ag-det-topo">
        <AvatarPet pet={pet} tam={64} />
        <div>
          <h2>{pet?.nome || "Pet"}</h2>
          <button className="link" onClick={() => abrirCliente(cliente?.id)}>{cliente?.nome}</button>
          <p className="texto-suave peq">{DIAS_SEMANA_LONGO[dataDeISO(ag.data).getDay()]}, {fmtData(ag.data)} · {ag.hora} às {hhmmDe(fimAg(ag))}</p>
        </div>
      </div>
      {(pet?.alergias || "").trim() && <div className="alerta alerta-erro"><Icone nome="alert" tam={16} /> <b>Alergia:</b> {pet.alergias}</div>}
      {(pet?.cuidados || "").trim() && <div className="alerta alerta-info"><Icone nome="heart" tam={16} /> {pet.cuidados}</div>}
      <dl className="dados">
        <div><dt>Serviços</dt><dd>{nomesServicos(ag)}</dd></div>
        <div><dt>Valor</dt><dd>{fmtMoeda(ag.valor)}</dd></div>
        <div><dt>Profissional</dt><dd>{profissional?.nome || "—"}</dd></div>
        {ag.observacoes && <div className="dados-largo"><dt>Observações</dt><dd>{ag.observacoes}</dd></div>}
        {ag.finalizacao?.observacoes && <div className="dados-largo"><dt>Obs. do profissional</dt><dd>{ag.finalizacao.observacoes}</dd></div>}
        {ag.finalizacao?.produtos && <div className="dados-largo"><dt>Produtos</dt><dd>{ag.finalizacao.produtos}</dd></div>}
      </dl>
      {(ag.finalizacao?.fotoAntes || ag.finalizacao?.fotoDepois) && (
        <div className="fotos-ad">
          {ag.finalizacao.fotoAntes && <figure><img src={ag.finalizacao.fotoAntes} alt="Antes" /><figcaption>Antes</figcaption></figure>}
          {ag.finalizacao.fotoDepois && <figure><img src={ag.finalizacao.fotoDepois} alt="Depois" /><figcaption>Depois</figcaption></figure>}
        </div>
      )}
      <h3 className="form-secao">Status</h3>
      <div className="escolhas">
        {STATUS_AG.map((s) => (
          <button key={s} className={`escolha ${ag.status === s ? "marcado" : ""}`} onClick={() => (s === "Finalizado" && ag.status !== "Finalizado" ? finalizar() : mudarStatus(ag, s))}>{s}</button>
        ))}
      </div>
      {soDigitos(tel) && (
        <>
          <h3 className="form-secao">WhatsApp</h3>
          <div className="acoes-topo">
            <a className="btn btn-whats btn-peq" href={linkWhats(tel, montarMsg(config.mensagens.confirmacao, vars))} target="_blank" rel="noreferrer"><Icone nome="whats" tam={15} /> Confirmação</a>
            <a className="btn btn-whats btn-peq" href={linkWhats(tel, montarMsg(config.mensagens.lembrete, vars))} target="_blank" rel="noreferrer"><Icone nome="whats" tam={15} /> Lembrete</a>
          </div>
        </>
      )}
    </Modal>
  );
}

function CartaoAg({ a, cli, pet, prof, onClick, compacto, estilo }) {
  return (
    <button className={`cartao-ag ${COR_STATUS_AG[a.status]} ${compacto ? "compacto" : ""}`} onClick={onClick} style={{ ...(estilo || {}), borderLeftColor: prof?.cor || undefined }}>
      <span className="cag-hora">{a.hora}{!compacto && ` – ${hhmmDe(fimAg(a))}`}</span>
      <strong>{pet?.nome || "Pet"}</strong>
      {!compacto && <span className="cag-cli">{cli?.nome}</span>}
      <span className="cag-serv">{nomesServicos(a)}</span>
    </button>
  );
}

function Agenda({ agendamentos, clientes, pets, profissionais, novoAg, abrirAg }) {
  const config = useConfig();
  const [vista, setVista] = useState(() => (window.innerWidth < 700 ? "lista" : "dia"));
  const [dia, setDia] = useState(hojeISO());
  const [filtroProf, setFiltroProf] = useState("");
  const [mostrarCancelados, setMostrarCancelados] = useState(false);
  const mapaCli = useMemo(() => Object.fromEntries(clientes.map((c) => [c.id, c])), [clientes]);
  const mapaPet = useMemo(() => Object.fromEntries(pets.map((p) => [p.id, p])), [pets]);
  const mapaProf = useMemo(() => Object.fromEntries(profissionais.map((p) => [p.id, p])), [profissionais]);
  const visiveis = agendamentos.filter((a) => (!filtroProf || a.profissionalId === filtroProf) && (mostrarCancelados || agAtivo(a)));
  const doDia = (d) => visiveis.filter((a) => a.data === d).sort((a, b) => a.hora.localeCompare(b.hora));

  const mover = (n) => {
    if (vista === "dia") setDia(somaDias(dia, n));
    else if (vista === "semana" || vista === "lista") setDia(somaDias(dia, 7 * n));
    else { const d = dataDeISO(dia); setDia(paraISO(new Date(d.getFullYear(), d.getMonth() + n, 1, 12))); }
  };
  const dObj = dataDeISO(dia);
  const titulo = vista === "mes" ? `${MESES_LONGO[dObj.getMonth()]} de ${dObj.getFullYear()}`
    : vista === "dia" ? `${DIAS_SEMANA_LONGO[dObj.getDay()]}, ${fmtData(dia)}`
      : `${fmtData(inicioSemana(dia))} a ${fmtData(somaDias(inicioSemana(dia), 6))}`;

  // ---- Dia: colunas por profissional ----
  const PX = 1.3;
  const ini = minutosDe(config.abre);
  const fim = Math.max(minutosDe(config.fecha), ini + 60);
  const colunas = (() => {
    const profs = profissionais.filter((p) => p.ativo !== false && (!filtroProf || p.id === filtroProf));
    const cols = profs.map((p) => ({ id: p.id, nome: p.nome, cor: p.cor }));
    if (doDia(dia).some((a) => !a.profissionalId || !mapaProf[a.profissionalId])) cols.push({ id: "", nome: profs.length ? "Sem profissional" : "Atendimentos" });
    if (!cols.length) cols.push({ id: "", nome: "Atendimentos" });
    return cols;
  })();

  const semanaDias = Array.from({ length: 7 }, (_, i) => somaDias(inicioSemana(dia), i));
  const mesDias = (() => {
    const primeiro = `${dia.slice(0, 7)}-01`;
    const inicio = inicioSemana(primeiro);
    return Array.from({ length: 42 }, (_, i) => somaDias(inicio, i));
  })();
  const listaFutura = visiveis.filter((a) => a.data >= inicioSemana(dia)).sort((a, b) => `${a.data}${a.hora}`.localeCompare(`${b.data}${b.hora}`)).slice(0, 150);
  const gruposLista = listaFutura.reduce((acc, a) => { (acc[a.data] = acc[a.data] || []).push(a); return acc; }, {});

  return (
    <div className="pagina pagina-larga">
      <header className="pagina-topo">
        <div>
          <h1>Agenda</h1>
          <p className="texto-suave primeira-maiuscula">{titulo}</p>
        </div>
        <div className="acoes-topo">
          <button className="btn btn-ouro" onClick={() => novoAg({ data: dia >= hojeISO() ? dia : hojeISO() })}><Icone nome="plus" tam={18} /> Novo agendamento</button>
        </div>
      </header>
      <div className="agenda-barra">
        <div className="abas-mini">
          {[["dia", "Dia"], ["semana", "Semana"], ["mes", "Mês"], ["lista", "Lista"]].map(([id, n]) => (
            <button key={id} className={vista === id ? "ativo" : ""} onClick={() => setVista(id)}>{n}</button>
          ))}
        </div>
        <div className="navegar">
          <button className="btn-icone" onClick={() => mover(-1)} aria-label="Anterior"><Icone nome="back" /></button>
          <button className="btn btn-leve btn-peq" onClick={() => setDia(hojeISO())}>Hoje</button>
          <button className="btn-icone" onClick={() => mover(1)} aria-label="Próximo"><Icone nome="chevR" /></button>
          <input type="date" value={dia} onChange={(e) => e.target.value && setDia(e.target.value)} className="data-agenda" aria-label="Ir para data" />
        </div>
        {profissionais.length > 0 && (
          <select value={filtroProf} onChange={(e) => setFiltroProf(e.target.value)} className="filtro-prof" aria-label="Filtrar profissional">
            <option value="">Todos os profissionais</option>
            {profissionais.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
        )}
        <label className="checar peq"><input type="checkbox" checked={mostrarCancelados} onChange={(e) => setMostrarCancelados(e.target.checked)} /> Mostrar cancelados</label>
      </div>

      {vista === "dia" && (
        <div className="agenda-dia">
          <div className="ad-cab" style={{ gridTemplateColumns: `56px repeat(${colunas.length}, minmax(150px, 1fr))` }}>
            <span />
            {colunas.map((c) => <span key={c.id || "sem"} className="ad-col-nome"><i style={{ background: c.cor || "#9AAAC6" }} />{c.nome}</span>)}
          </div>
          <div className="ad-corpo" style={{ gridTemplateColumns: `56px repeat(${colunas.length}, minmax(150px, 1fr))`, height: (fim - ini) * PX }}>
            <div className="ad-horas">
              {Array.from({ length: Math.ceil((fim - ini) / 60) }, (_, i) => (
                <span key={i} style={{ top: i * 60 * PX }}>{hhmmDe(ini + i * 60)}</span>
              ))}
            </div>
            {colunas.map((c) => {
              const itens = doDia(dia).filter((a) => (c.id ? a.profissionalId === c.id : !a.profissionalId || !mapaProf[a.profissionalId]));
              return (
                <div key={c.id || "sem"} className="ad-coluna" onDoubleClick={(e) => {
                  const y = e.clientY - e.currentTarget.getBoundingClientRect().top;
                  const m = ini + Math.floor(y / PX / 30) * 30;
                  novoAg({ data: dia, hora: hhmmDe(m), profissionalId: c.id });
                }}>
                  {Array.from({ length: Math.ceil((fim - ini) / 30) }, (_, i) => <i key={i} className={`ad-linha ${i % 2 ? "meia" : ""}`} style={{ top: i * 30 * PX }} />)}
                  {itens.map((a, k) => {
                    const topo = Math.max(0, (minutosDe(a.hora) - ini) * PX);
                    const alt = Math.max(34, (Number(a.duracao) || 30) * PX - 3);
                    const sobre = itens.filter((o, j) => j < k && minutosDe(o.hora) < fimAg(a) && fimAg(o) > minutosDe(a.hora)).length;
                    return <CartaoAg key={a.id} a={a} cli={mapaCli[a.clienteId]} pet={mapaPet[a.petId]} prof={mapaProf[a.profissionalId]} onClick={() => abrirAg(a.id)}
                      estilo={{ top: topo, height: alt, left: 4 + sobre * 14, right: 4 }} />;
                  })}
                </div>
              );
            })}
          </div>
          {doDia(dia).length === 0 && <p className="texto-suave centro">Nenhum agendamento neste dia. Clique em “Novo agendamento” (ou dê dois cliques num horário).</p>}
        </div>
      )}

      {vista === "semana" && (
        <div className="agenda-semana">
          {semanaDias.map((d) => (
            <div key={d} className={`as-dia ${d === hojeISO() ? "hoje" : ""} ${!config.diasAbertos.includes(dataDeISO(d).getDay()) ? "fechado" : ""}`}>
              <button className="as-cab" onClick={() => { setDia(d); setVista("dia"); }}>
                <span>{DIAS_SEMANA[dataDeISO(d).getDay()]}</span><strong>{d.slice(8)}</strong>
              </button>
              <div className="as-lista">
                {doDia(d).map((a) => <CartaoAg key={a.id} a={a} compacto cli={mapaCli[a.clienteId]} pet={mapaPet[a.petId]} prof={mapaProf[a.profissionalId]} onClick={() => abrirAg(a.id)} />)}
                <button className="as-add" onClick={() => novoAg({ data: d })} aria-label={`Agendar em ${fmtData(d)}`}><Icone nome="plus" tam={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {vista === "mes" && (
        <div className="agenda-mes">
          {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((d) => <span key={d} className="am-cab">{d}</span>)}
          {mesDias.map((d) => {
            const itens = doDia(d);
            return (
              <button key={d} className={`am-dia ${d.slice(0, 7) !== dia.slice(0, 7) ? "fora" : ""} ${d === hojeISO() ? "hoje" : ""}`} onClick={() => { setDia(d); setVista("dia"); }}>
                <span className="am-num">{Number(d.slice(8))}</span>
                {itens.slice(0, 3).map((a) => <span key={a.id} className={`am-item ${COR_STATUS_AG[a.status]}`}>{a.hora} {mapaPet[a.petId]?.nome}</span>)}
                {itens.length > 3 && <span className="am-mais">+{itens.length - 3}</span>}
              </button>
            );
          })}
        </div>
      )}

      {vista === "lista" && (
        <div className="agenda-lista">
          {Object.keys(gruposLista).length === 0 && <p className="texto-suave centro">Nenhum agendamento a partir desta semana.</p>}
          {Object.entries(gruposLista).map(([d, itens]) => (
            <section key={d} className="al-grupo">
              <h3 className={d === hojeISO() ? "hoje" : ""}>{d === hojeISO() ? "Hoje · " : ""}{DIAS_SEMANA_LONGO[dataDeISO(d).getDay()]}, {fmtData(d)}</h3>
              {itens.map((a) => (
                <button key={a.id} className="al-item" onClick={() => abrirAg(a.id)}>
                  <span className="al-hora">{a.hora}</span>
                  <AvatarPet pet={mapaPet[a.petId]} tam={38} />
                  <span className="al-info"><strong>{mapaPet[a.petId]?.nome} · {mapaCli[a.clienteId]?.nome}</strong><span className="texto-suave peq">{nomesServicos(a)}{mapaProf[a.profissionalId] ? ` · ${mapaProf[a.profissionalId].nome}` : ""}</span></span>
                  <span className={`selo-status ${COR_STATUS_AG[a.status]}`}>{a.status}</span>
                </button>
              ))}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

// =====================================================================
//  PROPOSTAS / ORÇAMENTOS
// =====================================================================
function FormProposta({ inicial, clientes, pets, servicos, aoFechar, aoSalvar }) {
  const config = useConfig();
  const editando = Boolean(inicial?.id);
  const [f, setF] = useState(() => ({
    clienteId: "", petId: "", data: hojeISO(), validade: somaDias(hojeISO(), 15), itens: [], desconto: 0,
    formaPagamento: config.formasPagamento[0] || "", observacoes: "", status: "Rascunho", ...(inicial || {}),
  }));
  const [erro, setErro] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const petsDoCliente = pets.filter((p) => p.clienteId === f.clienteId);
  const mudarItem = (i, k, v) => setF((x) => ({ ...x, itens: x.itens.map((it, j) => (j === i ? { ...it, [k]: v } : it)) }));
  const addServico = (id) => {
    const s = servicos.find((x) => x.id === id);
    if (s) setF((x) => ({ ...x, itens: [...x.itens, { descricao: s.nome, quantidade: 1, valorUnit: Number(s.preco) || 0 }] }));
  };
  const norm = { ...f, itens: f.itens.map((i) => ({ ...i, quantidade: paraNumero(i.quantidade), valorUnit: paraNumero(i.valorUnit) })), desconto: paraNumero(f.desconto) };

  const salvar = async () => {
    if (!f.clienteId) return setErro("Escolha o cliente.");
    if (!norm.itens.length || norm.itens.some((i) => !String(i.descricao).trim())) return setErro("Adicione pelo menos um serviço com descrição.");
    setErro(""); setOcupado(true);
    try { await aoSalvar({ ...norm, total: totalProposta(norm) }); } catch (e) { setErro(traduzErro(e)); setOcupado(false); }
  };

  return (
    <Modal titulo={editando ? `Editar ${f.numero}` : "Nova proposta"} aoFechar={aoFechar} largo
      rodape={<>
        {erro && <span className="erro-rodape">{erro}</span>}
        <button className="btn btn-leve" onClick={aoFechar}>Cancelar</button>
        <button className="btn btn-ouro" onClick={salvar} disabled={ocupado}>{ocupado ? "Salvando…" : "Salvar proposta"}</button>
      </>}>
      {!editando && <p className="texto-suave form-nota">O número da proposta (PROP-000001…) é gerado ao salvar.</p>}
      <div className="fgrade">
        <Campo rotulo="Cliente *"><SeletorCliente clientes={clientes} valor={f.clienteId} aoMudar={(v) => setF((x) => ({ ...x, clienteId: v, petId: "" }))} /></Campo>
        <Campo rotulo="Pet">
          <select value={f.petId} onChange={(e) => setF((x) => ({ ...x, petId: e.target.value }))} disabled={!f.clienteId}>
            <option value="">—</option>{petsDoCliente.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
        </Campo>
        <Campo rotulo="Data"><input type="date" value={f.data} onChange={(e) => setF((x) => ({ ...x, data: e.target.value }))} /></Campo>
        <Campo rotulo="Validade"><input type="date" value={f.validade} onChange={(e) => setF((x) => ({ ...x, validade: e.target.value }))} /></Campo>
      </div>
      <h3 className="form-secao">Serviços</h3>
      <div className="itens-prop">
        {f.itens.map((it, i) => (
          <div key={i} className="item-prop">
            <input className="ip-desc" value={it.descricao} onChange={(e) => mudarItem(i, "descricao", e.target.value)} placeholder="Descrição" aria-label="Descrição" />
            <input className="ip-qtd" value={it.quantidade} onChange={(e) => mudarItem(i, "quantidade", e.target.value)} inputMode="decimal" aria-label="Quantidade" />
            <input className="ip-val" value={it.valorUnit} onChange={(e) => mudarItem(i, "valorUnit", e.target.value)} inputMode="decimal" aria-label="Valor unitário" />
            <span className="ip-tot">{fmtMoeda(paraNumero(it.quantidade) * paraNumero(it.valorUnit))}</span>
            <button className="btn-icone btn-icone-perigo" onClick={() => setF((x) => ({ ...x, itens: x.itens.filter((_, j) => j !== i) }))} aria-label="Remover"><Icone nome="x" tam={16} /></button>
          </div>
        ))}
        {f.itens.length > 0 && <div className="item-prop item-prop-cab"><span>Descrição</span><span>Qtd.</span><span>Valor unit.</span><span>Total</span><span /></div>}
        <div className="acoes-topo">
          {servicos.length > 0 && (
            <select value="" onChange={(e) => addServico(e.target.value)} className="sel-add">
              <option value="">+ Adicionar serviço cadastrado…</option>
              {servicos.filter((s) => s.ativo !== false).map((s) => <option key={s.id} value={s.id}>{s.nome} — {fmtMoeda(s.preco)}</option>)}
            </select>
          )}
          <button className="btn btn-leve btn-peq" onClick={() => setF((x) => ({ ...x, itens: [...x.itens, { descricao: "", quantidade: 1, valorUnit: 0 }] }))}><Icone nome="plus" tam={15} /> Item livre</button>
        </div>
      </div>
      <div className="fgrade">
        <Campo rotulo="Desconto (R$)"><input value={f.desconto} onChange={(e) => setF((x) => ({ ...x, desconto: e.target.value }))} inputMode="decimal" /></Campo>
        <Campo rotulo="Forma de pagamento"><select value={f.formaPagamento} onChange={(e) => setF((x) => ({ ...x, formaPagamento: e.target.value }))}>{config.formasPagamento.map((o) => <option key={o}>{o}</option>)}</select></Campo>
        <Campo rotulo="Status"><select value={f.status} onChange={(e) => setF((x) => ({ ...x, status: e.target.value }))}>{STATUS_PROPOSTA.filter((s) => s !== "Expirada").map((s) => <option key={s}>{s}</option>)}</select></Campo>
      </div>
      <div className="totais-form">
        <span>Subtotal: <b>{fmtMoeda(subtotalProposta(norm))}</b></span>
        <span>Desconto: <b>{fmtMoeda(norm.desconto)}</b></span>
        <span className="total-grande">Total: {fmtMoeda(totalProposta(norm))}</span>
      </div>
      <Campo rotulo="Observações / condições" largo><textarea rows={3} value={f.observacoes} onChange={(e) => setF((x) => ({ ...x, observacoes: e.target.value }))} /></Campo>
    </Modal>
  );
}

function imprimirProposta(p, cliente, pet, config) {
  const end = [cliente?.rua && `${cliente.rua}${cliente.numero ? ", " + cliente.numero : ""}`, cliente?.bairro, cliente?.cidade && `${cliente.cidade}/${cliente.estado || ""}`].filter(Boolean).join(" · ");
  const html = `
  <div class="topo"><img src="${logoDe(config)}"><div class="emp"><h1>${escHTML(config.nome)}</h1>
  <p>${escHTML([config.cnpj && "CNPJ " + config.cnpj, config.endereco, config.cidade].filter(Boolean).join(" · "))}</p>
  <p>${escHTML([config.whatsapp && "WhatsApp " + fmtTel(config.whatsapp), config.email, config.instagram].filter(Boolean).join(" · "))}</p></div>
  <div class="doc"><h2>PROPOSTA</h2><p><b>${escHTML(p.numero)}</b></p><p>Data: ${fmtData(p.data)}</p><p>Válida até: ${fmtData(p.validade)}</p></div></div>
  <div class="caixa"><h3>Cliente</h3><div class="grade">
  <div><b>${escHTML(cliente?.nome || "")}</b> (${escHTML(cliente?.codigo || "")})</div><div>${escHTML(fmtTel(cliente?.whatsapp || cliente?.telefone))}</div>
  <div>${escHTML(cliente?.email || "")}</div><div>${escHTML(fmtDoc(cliente?.documento))}</div>
  ${end ? `<div style="grid-column:1/-1">${escHTML(end)}</div>` : ""}
  ${pet ? `<div style="grid-column:1/-1">Pet: <b>${escHTML(pet.nome)}</b> ${escHTML([pet.especie, pet.raca, pet.porte && "porte " + pet.porte.toLowerCase()].filter(Boolean).join(" · "))}</div>` : ""}
  </div></div>
  <table><thead><tr><th>Serviço</th><th class="dir">Qtd.</th><th class="dir">Valor unit.</th><th class="dir">Total</th></tr></thead><tbody>
  ${(p.itens || []).map((i) => `<tr><td>${escHTML(i.descricao)}</td><td class="dir">${i.quantidade}</td><td class="dir">${fmtMoeda(i.valorUnit)}</td><td class="dir">${fmtMoeda(i.quantidade * i.valorUnit)}</td></tr>`).join("")}
  </tbody></table>
  <div class="totais"><div><span>Subtotal</span><span>${fmtMoeda(subtotalProposta(p))}</span></div>
  ${Number(p.desconto) ? `<div><span>Desconto</span><span>- ${fmtMoeda(p.desconto)}</span></div>` : ""}
  <div class="total"><span>Total</span><span>${fmtMoeda(totalProposta(p))}</span></div></div>
  <div class="caixa" style="margin-top:14px"><h3>Condições</h3>
  <p style="margin:0">Forma de pagamento: <b>${escHTML(p.formaPagamento || "a combinar")}</b>. Proposta válida até <b>${fmtData(p.validade)}</b>.</p>
  ${p.observacoes ? `<p style="margin:6px 0 0;white-space:pre-wrap">${escHTML(p.observacoes)}</p>` : ""}</div>
  <div class="assin"><div>${escHTML(config.nome)}</div><div>De acordo — ${escHTML(cliente?.nome || "Cliente")}</div></div>
  <p class="rodape">Obrigado pela confiança! 💙 ${escHTML(config.nome)}</p>`;
  abrirImpressao(`Proposta ${p.numero}`, html);
}

function Propostas({ propostas, clientes, pets, novaProposta, editar, excluir, mudarStatus, gerarCobranca, enviarWhats, podeExcluir }) {
  const config = useConfig();
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState("");
  const mapaCli = useMemo(() => Object.fromEntries(clientes.map((c) => [c.id, c])), [clientes]);
  const mapaPet = useMemo(() => Object.fromEntries(pets.map((p) => [p.id, p])), [pets]);
  const lista = propostas
    .filter((p) => !status || statusProposta(p) === status)
    .filter((p) => !busca || contem(`${p.numero} ${mapaCli[p.clienteId]?.nome} ${mapaPet[p.petId]?.nome}`, busca))
    .sort((a, b) => String(b.numero).localeCompare(String(a.numero)));
  const contagem = STATUS_PROPOSTA.map((s) => [s, propostas.filter((p) => statusProposta(p) === s).length]);

  return (
    <div className="pagina">
      <header className="pagina-topo">
        <div><h1>Propostas</h1><p className="texto-suave">{propostas.length} proposta{propostas.length !== 1 ? "s" : ""}</p></div>
        <div className="acoes-topo"><button className="btn btn-ouro" onClick={() => novaProposta({})}><Icone nome="plus" tam={18} /> Nova proposta</button></div>
      </header>
      <div className="chips-filtro">
        <button className={!status ? "ativo" : ""} onClick={() => setStatus("")}>Todas</button>
        {contagem.map(([s, n]) => <button key={s} className={status === s ? "ativo" : ""} onClick={() => setStatus(s)}>{s} <b>{n}</b></button>)}
      </div>
      <div className="filtros">
        <div className="busca"><Icone nome="search" tam={18} /><input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por número, cliente ou pet" /></div>
      </div>
      {propostas.length === 0 ? (
        <Vazio titulo="Nenhuma proposta ainda" texto="Monte um orçamento bonito, com o logo, e mande pelo WhatsApp."
          acao={<button className="btn btn-ouro" onClick={() => novaProposta({})}><Icone nome="plus" tam={18} /> Criar proposta</button>} />
      ) : (
        <div className="lista-cartoes">
          {lista.map((p) => {
            const st = statusProposta(p);
            const cli = mapaCli[p.clienteId];
            return (
              <div key={p.id} className="cartao-linha">
                <div className="cl-info" onClick={() => editar(p)} role="button" tabIndex={0}>
                  <div className="cl-l1"><span className="codigo">{p.numero}</span><span className={`selo-status ${COR_STATUS_PROPOSTA[st]}`}>{st}</span></div>
                  <strong>{cli?.nome || "—"}{mapaPet[p.petId] ? ` · ${mapaPet[p.petId].nome}` : ""}</strong>
                  <span className="texto-suave peq">{(p.itens || []).map((i) => i.descricao).join(", ")} · {fmtData(p.data)} · válida até {fmtData(p.validade)}</span>
                </div>
                <div className="cl-valor">{fmtMoeda(totalProposta(p))}</div>
                <div className="cl-acoes">
                  <button className="btn btn-leve btn-peq" onClick={() => imprimirProposta(p, cli, mapaPet[p.petId], config)}><Icone nome="printer" tam={15} /> PDF</button>
                  {soDigitos(cli?.whatsapp || cli?.telefone) && <button className="btn btn-whats btn-peq" onClick={() => enviarWhats(p)}><Icone nome="whats" tam={15} /> Enviar</button>}
                  {["Rascunho", "Enviada", "Aguardando aprovação", "Expirada"].includes(st) && <button className="btn btn-leve btn-peq" onClick={() => mudarStatus(p, "Aprovada")}><Icone nome="check" tam={15} /> Aprovar</button>}
                  {["Enviada", "Aguardando aprovação"].includes(st) && <button className="btn btn-leve btn-peq" onClick={() => mudarStatus(p, "Recusada")}>Recusar</button>}
                  {st === "Aprovada" && !p.contaReceberId && <button className="btn btn-ouro btn-peq" onClick={() => gerarCobranca(p)}><Icone nome="wallet" tam={15} /> Gerar cobrança</button>}
                  {podeExcluir && <button className="btn-icone btn-icone-perigo" onClick={() => excluir(p)} aria-label="Excluir"><Icone nome="trash" tam={16} /></button>}
                </div>
              </div>
            );
          })}
          {lista.length === 0 && <p className="texto-suave centro">Nenhuma proposta com esse filtro.</p>}
        </div>
      )}
    </div>
  );
}

// =====================================================================
//  FINANCEIRO
// =====================================================================
const CATEGORIAS_PAGAR = ["Produtos", "Salários", "Aluguel", "Água", "Energia", "Internet", "Marketing", "Manutenção", "Impostos", "Outros"];

function FormConta({ tipo, inicial, clientes, aoFechar, aoSalvar }) {
  const config = useConfig();
  const receber = tipo === "receber";
  const editando = Boolean(inicial?.id);
  const [f, setF] = useState(() => ({
    clienteId: "", descricao: "", propostaNumero: "", fornecedor: "", categoria: "Produtos",
    valor: "", vencimento: hojeISO(), formaPagamento: config.formasPagamento[0] || "", observacoes: "", pagamentos: [], status: "", ...(inicial || {}),
  }));
  const [jaPago, setJaPago] = useState(false);
  const [erro, setErro] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const m = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const salvar = async () => {
    const valor = arred(paraNumero(f.valor));
    if (receber && !f.clienteId && !f.descricao.trim()) return setErro("Informe o cliente ou a descrição.");
    if (!receber && !f.fornecedor.trim() && !f.descricao.trim()) return setErro("Informe o fornecedor ou a descrição.");
    if (valor <= 0) return setErro("Informe o valor.");
    if (!f.vencimento) return setErro("Informe o vencimento.");
    setErro(""); setOcupado(true);
    const pagamentos = !editando && jaPago ? [{ data: hojeISO(), valor, forma: f.formaPagamento }] : f.pagamentos || [];
    try { await aoSalvar({ ...f, valor, pagamentos }); } catch (e) { setErro(traduzErro(e)); setOcupado(false); }
  };
  const valorN = paraNumero(f.valor);
  const pago = pagoDe(f);
  return (
    <Modal titulo={`${editando ? "Editar" : "Nova"} conta a ${receber ? "receber" : "pagar"}`} aoFechar={aoFechar} largo
      rodape={<>
        {erro && <span className="erro-rodape">{erro}</span>}
        <button className="btn btn-leve" onClick={aoFechar}>Cancelar</button>
        <button className="btn btn-ouro" onClick={salvar} disabled={ocupado}>{ocupado ? "Salvando…" : "Salvar"}</button>
      </>}>
      <div className="fgrade">
        {receber ? (
          <>
            <Campo rotulo="Cliente"><SeletorCliente clientes={clientes} valor={f.clienteId} aoMudar={(v) => setF((x) => ({ ...x, clienteId: v }))} /></Campo>
            <Campo rotulo="Serviço / descrição"><input value={f.descricao} onChange={m("descricao")} /></Campo>
            <Campo rotulo="Nº da proposta"><input value={f.propostaNumero} onChange={m("propostaNumero")} placeholder="Opcional" /></Campo>
          </>
        ) : (
          <>
            <Campo rotulo="Fornecedor"><input value={f.fornecedor} onChange={m("fornecedor")} /></Campo>
            <Campo rotulo="Descrição"><input value={f.descricao} onChange={m("descricao")} /></Campo>
            <Campo rotulo="Categoria"><select value={f.categoria} onChange={m("categoria")}>{CATEGORIAS_PAGAR.map((c) => <option key={c}>{c}</option>)}</select></Campo>
          </>
        )}
        <Campo rotulo="Valor total (R$) *"><input value={f.valor} onChange={m("valor")} inputMode="decimal" placeholder="0,00" /></Campo>
        <Campo rotulo="Vencimento *"><input type="date" value={f.vencimento} onChange={m("vencimento")} /></Campo>
        <Campo rotulo="Forma de pagamento"><select value={f.formaPagamento} onChange={m("formaPagamento")}>{config.formasPagamento.map((o) => <option key={o}>{o}</option>)}</select></Campo>
        {editando && (
          <Campo rotulo="Situação">
            <select value={f.status === "Cancelado" ? "Cancelado" : ""} onChange={(e) => setF((x) => ({ ...x, status: e.target.value }))}>
              <option value="">Ativa (status automático)</option><option value="Cancelado">Cancelada</option>
            </select>
          </Campo>
        )}
      </div>
      {!editando && <label className="checar mt10"><input type="checkbox" checked={jaPago} onChange={(e) => setJaPago(e.target.checked)} /> Já foi {receber ? "recebido" : "pago"} hoje (valor total)</label>}
      {editando && (f.pagamentos || []).length > 0 && (
        <>
          <h3 className="form-secao">Pagamentos registrados</h3>
          <ul className="lista-pag">
            {f.pagamentos.map((p, i) => (
              <li key={i}><span>{fmtData(p.data)} · {p.forma}</span><b>{fmtMoeda(p.valor)}</b>
                <button className="btn-icone btn-icone-perigo" onClick={() => setF((x) => ({ ...x, pagamentos: x.pagamentos.filter((_, j) => j !== i) }))} aria-label="Remover pagamento"><Icone nome="x" tam={14} /></button></li>
            ))}
          </ul>
          <p className="peq">Valor total: <b>{fmtMoeda(valorN)}</b> · Pago: <b>{fmtMoeda(pago)}</b> · Restante: <b>{fmtMoeda(Math.max(0, valorN - pago))}</b></p>
        </>
      )}
      <Campo rotulo="Observações" largo><textarea rows={2} value={f.observacoes} onChange={m("observacoes")} /></Campo>
    </Modal>
  );
}

function RegistrarPagamento({ conta, tipo, aoFechar, aoSalvar }) {
  const config = useConfig();
  const restante = restanteDe(conta);
  const [valor, setValor] = useState(String(restante).replace(".", ","));
  const [data, setData] = useState(hojeISO());
  const [forma, setForma] = useState(conta.formaPagamento || config.formasPagamento[0] || "");
  const [erro, setErro] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const v = arred(paraNumero(valor));
  const novoRestante = Math.max(0, arred(restante - v));
  return (
    <Modal titulo={tipo === "receber" ? "Registrar recebimento" : "Registrar pagamento"} aoFechar={aoFechar}
      rodape={<>
        {erro && <span className="erro-rodape">{erro}</span>}
        <button className="btn btn-leve" onClick={aoFechar}>Cancelar</button>
        <button className="btn btn-ouro" disabled={ocupado} onClick={async () => {
          if (v <= 0) return setErro("Informe o valor.");
          if (v > restante + 0.004) return setErro(`O valor passa do restante (${fmtMoeda(restante)}).`);
          setOcupado(true);
          try { await aoSalvar({ data, valor: v, forma }); } catch (e) { setErro(traduzErro(e)); setOcupado(false); }
        }}>{ocupado ? "Salvando…" : "Confirmar"}</button>
      </>}>
      <div className="resumo-pag">
        <div><span>Valor total</span><b>{fmtMoeda(conta.valor)}</b></div>
        <div><span>Já pago</span><b>{fmtMoeda(pagoDe(conta))}</b></div>
        <div className="destaque"><span>Restante</span><b>{fmtMoeda(restante)}</b></div>
      </div>
      <div className="fgrade">
        <Campo rotulo="Valor pago agora (R$)"><input value={valor} onChange={(e) => setValor(e.target.value)} inputMode="decimal" autoFocus /></Campo>
        <Campo rotulo="Data"><input type="date" value={data} onChange={(e) => setData(e.target.value)} /></Campo>
        <Campo rotulo="Forma"><select value={forma} onChange={(e) => setForma(e.target.value)}>{config.formasPagamento.map((o) => <option key={o}>{o}</option>)}</select></Campo>
      </div>
      <p className="saldo-calc">{novoRestante > 0 ? <>Depois deste pagamento ficará faltando <b>{fmtMoeda(novoRestante)}</b> (pagamento parcial).</> : <>Com este pagamento a conta fica <b>quitada</b>. ✅</>}</p>
    </Modal>
  );
}

function Financeiro({ contasReceber, contasPagar, clientes, novaConta, editarConta, pagarConta, excluirConta, cobrar, podeExcluir }) {
  const [aba, setAba] = useState("painel");
  const [periodo, setPeriodo] = useState("mes");
  const [de, setDe] = useState(hojeISO());
  const [ate, setAte] = useState(hojeISO());
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("abertas");
  const p = intervaloPeriodo(periodo, de, ate);
  const mapaCli = useMemo(() => Object.fromEntries(clientes.map((c) => [c.id, c])), [clientes]);

  const somaPag = (contas, per) => contas.reduce((s, c) => s + (c.pagamentos || []).filter((x) => !per || dentro(x.data, per)).reduce((a, x) => a + (Number(x.valor) || 0), 0), 0);
  const entradas = somaPag(contasReceber, p);
  const saidas = somaPag(contasPagar, p);
  const saldo = somaPag(contasReceber) - somaPag(contasPagar);
  const aReceber = contasReceber.filter(contaAberta).reduce((s, c) => s + restanteDe(c), 0);
  const aPagar = contasPagar.filter(contaAberta).reduce((s, c) => s + restanteDe(c), 0);
  const atrasados = contasReceber.filter((c) => statusConta(c) === "Atrasado");
  const faturamento = contasReceber.filter((c) => c.status !== "Cancelado" && dentro(c.vencimento, p)).reduce((s, c) => s + (Number(c.valor) || 0), 0);
  const despesas = contasPagar.filter((c) => c.status !== "Cancelado" && dentro(c.vencimento, p)).reduce((s, c) => s + (Number(c.valor) || 0), 0);
  const meses = ultimosMeses(6);
  const serieE = meses.map((m) => contasReceber.reduce((s, c) => s + (c.pagamentos || []).filter((x) => mesDe(x.data) === m.chave).reduce((a, x) => a + (Number(x.valor) || 0), 0), 0));
  const serieS = meses.map((m) => contasPagar.reduce((s, c) => s + (c.pagamentos || []).filter((x) => mesDe(x.data) === m.chave).reduce((a, x) => a + (Number(x.valor) || 0), 0), 0));

  const listaDe = (contas, tipo) => contas
    .filter((c) => {
      const st = statusConta(c);
      if (filtroStatus === "abertas") return contaAberta(c);
      if (filtroStatus) return st === filtroStatus;
      return true;
    })
    .filter((c) => !busca || contem(`${tipo === "receber" ? mapaCli[c.clienteId]?.nome : c.fornecedor} ${c.descricao} ${c.propostaNumero || ""} ${c.categoria || ""}`, busca))
    .sort((a, b) => String(a.vencimento).localeCompare(String(b.vencimento)));

  const exportar = (tipo) => {
    const contas = listaDe(tipo === "receber" ? contasReceber : contasPagar, tipo);
    exportarCSV(`contas-a-${tipo}.csv`,
      tipo === "receber" ? ["Cliente", "Serviço", "Proposta", "Valor", "Vencimento", "Forma", "Status", "Pago", "Restante", "Último pagamento", "Observações"]
        : ["Fornecedor", "Descrição", "Categoria", "Valor", "Vencimento", "Forma", "Status", "Pago", "Restante", "Observações"],
      contas.map((c) => tipo === "receber"
        ? [mapaCli[c.clienteId]?.nome, c.descricao, c.propostaNumero, c.valor, fmtData(c.vencimento), c.formaPagamento, statusConta(c), pagoDe(c), restanteDe(c), fmtData((c.pagamentos || []).map((x) => x.data).sort().pop()), c.observacoes]
        : [c.fornecedor, c.descricao, c.categoria, c.valor, fmtData(c.vencimento), c.formaPagamento, statusConta(c), pagoDe(c), restanteDe(c), c.observacoes]));
  };

  const listaContas = (tipo) => {
    const contas = listaDe(tipo === "receber" ? contasReceber : contasPagar, tipo);
    const total = contas.reduce((s, c) => s + restanteDe(c), 0);
    return (
      <>
        <div className="filtros">
          <div className="busca"><Icone nome="search" tam={18} /><input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder={tipo === "receber" ? "Buscar cliente, serviço ou proposta" : "Buscar fornecedor, descrição ou categoria"} /></div>
          <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} aria-label="Status">
            <option value="abertas">Em aberto</option><option value="">Todas</option>
            {["Pendente", "Parcial", "Atrasado", "Pago", "Cancelado"].map((s) => <option key={s}>{s}</option>)}
          </select>
          <button className="btn btn-leve" onClick={() => exportar(tipo)} disabled={!contas.length}><Icone nome="download" tam={18} /> Excel</button>
          <button className="btn btn-ouro" onClick={() => novaConta(tipo)}><Icone nome="plus" tam={18} /> Nova</button>
        </div>
        <p className="texto-suave peq">{contas.length} conta{contas.length !== 1 ? "s" : ""} · saldo em aberto <b>{fmtMoeda(total)}</b></p>
        <div className="lista-cartoes">
          {contas.map((c) => {
            const st = statusConta(c);
            const cli = mapaCli[c.clienteId];
            return (
              <div key={c.id} className="cartao-linha">
                <div className="cl-info" onClick={() => editarConta(tipo, c)} role="button" tabIndex={0}>
                  <div className="cl-l1"><span className={`selo-status ${COR_STATUS_CONTA[st]}`}>{st}</span><span className="texto-suave peq">vence {fmtData(c.vencimento)}</span></div>
                  <strong>{tipo === "receber" ? (cli?.nome || c.descricao) : (c.fornecedor || c.descricao)}</strong>
                  <span className="texto-suave peq">{[c.descricao, c.categoria, c.propostaNumero, c.formaPagamento].filter(Boolean).join(" · ")}</span>
                </div>
                <div className="cl-valor">
                  {fmtMoeda(c.valor)}
                  {pagoDe(c) > 0 && st !== "Pago" && <small>pago {fmtMoeda(pagoDe(c))} · falta {fmtMoeda(restanteDe(c))}</small>}
                </div>
                <div className="cl-acoes">
                  {contaAberta(c) && <button className="btn btn-ouro btn-peq" onClick={() => pagarConta(tipo, c)}><Icone nome="check" tam={15} /> {tipo === "receber" ? "Receber" : "Pagar"}</button>}
                  {tipo === "receber" && contaAberta(c) && soDigitos(cli?.whatsapp || cli?.telefone) && <button className="btn btn-whats btn-peq" onClick={() => cobrar(c)}><Icone nome="whats" tam={15} /> Cobrar</button>}
                  {podeExcluir && <button className="btn-icone btn-icone-perigo" onClick={() => excluirConta(tipo, c)} aria-label="Excluir"><Icone nome="trash" tam={16} /></button>}
                </div>
              </div>
            );
          })}
          {contas.length === 0 && <p className="texto-suave centro">Nenhuma conta aqui.</p>}
        </div>
      </>
    );
  };

  return (
    <div className="pagina">
      <header className="pagina-topo">
        <div><h1>Financeiro</h1></div>
        <div className="abas-mini abas-grandes">
          {[["painel", "Painel"], ["receber", "Contas a receber"], ["pagar", "Contas a pagar"]].map(([id, n]) => (
            <button key={id} className={aba === id ? "ativo" : ""} onClick={() => { setAba(id); setBusca(""); setFiltroStatus("abertas"); }}>{n}</button>
          ))}
        </div>
      </header>

      {aba === "painel" && (
        <>
          <SeletorPeriodo periodo={periodo} setPeriodo={setPeriodo} de={de} setDe={setDe} ate={ate} setAte={setAte} />
          <section className="numeros numeros-auto">
            <div className="numero numero-destaque numero-dinheiro"><span className="numero-valor">{fmtMoeda(saldo)}</span><span className="numero-rotulo">saldo (tudo que entrou − saiu)</span></div>
            <div className="numero numero-dinheiro"><span className="numero-valor verde">{fmtMoeda(entradas)}</span><span className="numero-rotulo">entradas no período</span></div>
            <div className="numero numero-dinheiro"><span className="numero-valor vermelho">{fmtMoeda(saidas)}</span><span className="numero-rotulo">saídas no período</span></div>
            <button className="numero numero-dinheiro" onClick={() => setAba("receber")}><span className="numero-valor">{fmtMoeda(aReceber)}</span><span className="numero-rotulo">a receber (em aberto)</span></button>
            <button className={`numero numero-dinheiro ${atrasados.length ? "numero-alerta" : ""}`} onClick={() => { setAba("receber"); setFiltroStatus("Atrasado"); }}><span className="numero-valor">{fmtMoeda(atrasados.reduce((s, c) => s + restanteDe(c), 0))}</span><span className="numero-rotulo">atrasados ({atrasados.length})</span></button>
            <div className="numero numero-dinheiro"><span className="numero-valor">{fmtMoeda(faturamento)}</span><span className="numero-rotulo">faturamento no período</span></div>
            <div className="numero numero-dinheiro"><span className="numero-valor">{fmtMoeda(despesas)}</span><span className="numero-rotulo">despesas no período</span></div>
            <div className="numero numero-dinheiro"><span className={`numero-valor ${faturamento - despesas < 0 ? "vermelho" : "verde"}`}>{fmtMoeda(faturamento - despesas)}</span><span className="numero-rotulo">lucro estimado</span></div>
            <button className="numero numero-dinheiro" onClick={() => setAba("pagar")}><span className="numero-valor">{fmtMoeda(aPagar)}</span><span className="numero-rotulo">a pagar (em aberto)</span></button>
          </section>
          <div className="grade-painel">
            <section className="painel">
              <div className="painel-topo"><h2>Entradas x saídas</h2></div>
              <div className="legenda"><span><i style={{ background: "#1F9D6B" }} />Entradas</span><span><i style={{ background: "#E0322B" }} />Saídas</span></div>
              <GraficoBarras rotulos={meses.map((m) => m.rotulo)} series={[{ cor: "#1F9D6B", valores: serieE }, { cor: "#E0322B", valores: serieS }]}
                formatar={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1).replace(".", ",")}k` : Math.round(v))} rotuloAria="Entradas e saídas" />
            </section>
            <section className="painel">
              <div className="painel-topo"><h2>Próximos vencimentos</h2></div>
              <ul className="lista-venc">
                {[...contasReceber.map((c) => ({ ...c, _t: "receber" })), ...contasPagar.map((c) => ({ ...c, _t: "pagar" }))]
                  .filter(contaAberta).sort((a, b) => String(a.vencimento).localeCompare(String(b.vencimento))).slice(0, 8).map((c) => (
                    <li key={c._t + c.id} onClick={() => pagarConta(c._t, c)} role="button" tabIndex={0}>
                      <span className={`seta-fin ${c._t}`}>{c._t === "receber" ? "↓" : "↑"}</span>
                      <span className="lv-info"><strong>{c._t === "receber" ? (mapaCli[c.clienteId]?.nome || c.descricao) : (c.fornecedor || c.descricao)}</strong><span className="texto-suave peq">{fmtData(c.vencimento)} · {statusConta(c)}</span></span>
                      <b>{fmtMoeda(restanteDe(c))}</b>
                    </li>
                  ))}
                {![...contasReceber, ...contasPagar].some(contaAberta) && <li className="texto-suave">Nada em aberto. 🎉</li>}
              </ul>
            </section>
          </div>
        </>
      )}
      {aba === "receber" && listaContas("receber")}
      {aba === "pagar" && listaContas("pagar")}
    </div>
  );
}

// =====================================================================
//  MARKETING
// =====================================================================
const CANAIS = ["WhatsApp", "E-mail", "Site", "Instagram"];
const PUBLICOS = [
  { id: "todos", nome: "Todos os clientes" },
  { id: "caes", nome: "Tutores de cães" },
  { id: "gatos", nome: "Tutores de gatos" },
  { id: "aniversario", nome: "Pets que fazem aniversário no mês" },
  { id: "sumidos", nome: "Sem atendimento há mais de 30 dias" },
  { id: "novos", nome: "Clientes novos (este mês)" },
];
const STATUS_CAMPANHA = ["Rascunho", "Agendada", "Em envio", "Enviada"];
const MODELOS_CAMPANHA = [
  { nome: "Semana do Banho 🐶🛁", texto: "🐶💙 O seu melhor amigo merece esse carinho!\n\nA agenda da semana do {empresa} está aberta!\n\n🛁 Banho\n✂️ Tosa\n✨ Hidratação\n🦷 Escovação dental\n\nAgende agora!" },
  { nome: "Saudade do pet", texto: "Olá, {cliente}! 🐾\nEstamos com saudade do(a) {pet} aqui no {empresa}! Que tal agendar um banho cheiroso esta semana?" },
  { nome: "Aniversariantes do mês", texto: "🎂 Este mês tem aniversário do(a) {pet}! Para comemorar, venha fazer um banho especial no {empresa}. Agende pelo WhatsApp!" },
  { nome: "Horários livres", texto: "Olá, {cliente}! Abrimos novos horários para {data}. Garanta o do(a) {pet}! 🐶" },
];

function destinatarios(campanha, clientes, pets, agendamentos) {
  const hoje = hojeISO();
  const mes = hoje.slice(5, 7);
  const petsDe = (c) => pets.filter((p) => p.clienteId === c.id);
  return clientes.map((c) => {
    let seusPets = petsDe(c);
    let ok = true;
    if (campanha.publico === "caes") { seusPets = seusPets.filter((p) => p.especie === "Cão"); ok = seusPets.length > 0; }
    if (campanha.publico === "gatos") { seusPets = seusPets.filter((p) => p.especie === "Gato"); ok = seusPets.length > 0; }
    if (campanha.publico === "aniversario") { seusPets = seusPets.filter((p) => p.nascimento && p.nascimento.slice(5, 7) === mes); ok = seusPets.length > 0; }
    if (campanha.publico === "sumidos") {
      const ult = agendamentos.filter((a) => a.clienteId === c.id && a.status === "Finalizado").map((a) => a.data).sort().pop();
      ok = !ult || difDias(hoje, ult) > 30;
    }
    if (campanha.publico === "novos") ok = mesDe(c.criadoEm) === hoje.slice(0, 7);
    return ok ? { cliente: c, pet: seusPets[0] } : null;
  }).filter(Boolean);
}

function FormCampanha({ inicial, aoFechar, aoSalvar }) {
  const [f, setF] = useState(() => ({ nome: "", publico: "todos", mensagem: "", imagem: "", data: hojeISO(), horario: "10:00", canal: "WhatsApp", status: "Rascunho", enviados: [], ...(inicial || {}) }));
  const [erro, setErro] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const m = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const img = async (e) => {
    const arq = e.target.files?.[0];
    if (!arq) return;
    try { setF((x) => ({ ...x, imagem: "" })); const d = await comprimirImagem(arq, 900, 0.75); setF((x) => ({ ...x, imagem: d })); } catch { setErro("Não consegui ler a imagem."); }
    e.target.value = "";
  };
  return (
    <Modal titulo={inicial?.id ? "Editar campanha" : "Nova campanha"} aoFechar={aoFechar} largo
      rodape={<>
        {erro && <span className="erro-rodape">{erro}</span>}
        <button className="btn btn-leve" onClick={aoFechar}>Cancelar</button>
        <button className="btn btn-ouro" disabled={ocupado} onClick={async () => {
          if (!f.nome.trim()) return setErro("Dê um nome para a campanha.");
          if (!f.mensagem.trim()) return setErro("Escreva a mensagem.");
          setOcupado(true);
          try { await aoSalvar(f); } catch (e) { setErro(traduzErro(e)); setOcupado(false); }
        }}>{ocupado ? "Salvando…" : "Salvar campanha"}</button>
      </>}>
      <div className="fgrade">
        <Campo rotulo="Nome da campanha *" largo><input value={f.nome} onChange={m("nome")} placeholder="Ex.: Semana do Banho 🐶🛁" /></Campo>
        <Campo rotulo="Canal"><select value={f.canal} onChange={m("canal")}>{CANAIS.map((c) => <option key={c}>{c}</option>)}</select></Campo>
        <Campo rotulo="Público"><select value={f.publico} onChange={m("publico")}>{PUBLICOS.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}</select></Campo>
        <Campo rotulo="Data"><input type="date" value={f.data} onChange={m("data")} /></Campo>
        <Campo rotulo="Horário"><input type="time" value={f.horario} onChange={m("horario")} /></Campo>
        <Campo rotulo="Status"><select value={f.status} onChange={m("status")}>{STATUS_CAMPANHA.map((s) => <option key={s}>{s}</option>)}</select></Campo>
      </div>
      <div className="modelos">
        <span className="campo-rotulo">Usar um modelo:</span>
        {MODELOS_CAMPANHA.map((md) => <button key={md.nome} type="button" className="chip chip-botao" onClick={() => setF((x) => ({ ...x, mensagem: md.texto, nome: x.nome || md.nome }))}>{md.nome}</button>)}
      </div>
      <Campo rotulo="Mensagem *" largo dica="Palavras entre chaves são trocadas sozinhas: {cliente} {pet} {data} {horario} {servico} {empresa}">
        <textarea rows={7} value={f.mensagem} onChange={m("mensagem")} />
      </Campo>
      <div className="img-campanha">
        {f.imagem ? <img src={f.imagem} alt="Imagem da campanha" /> : null}
        <label className="btn btn-leve btn-peq"><Icone nome="camera" tam={15} /> {f.imagem ? "Trocar imagem" : "Adicionar imagem"}<input type="file" accept="image/*" hidden onChange={img} /></label>
        {f.imagem && <button className="link peq" onClick={() => setF((x) => ({ ...x, imagem: "" }))}>Remover</button>}
      </div>
    </Modal>
  );
}

function EnviarCampanha({ campanha, clientes, pets, agendamentos, aoFechar, marcarEnviado, publicarSite, concluir }) {
  const config = useConfig();
  const lista = destinatarios(campanha, clientes, pets, agendamentos);
  const enviados = new Set(campanha.enviados || []);
  const varsDe = (d) => ({ empresa: config.nome, cliente: primeiroNome(d?.cliente?.nome) || "", pet: d?.pet?.nome || "seu pet", data: fmtData(campanha.data), horario: campanha.horario || "", servico: "" });
  const textoGeral = montarMsg(campanha.mensagem, { ...varsDe(null), cliente: "", pet: "seu pet" }).replace(/Olá, !/g, "Olá!").replace(/, !/g, "!");
  const [copiado, setCopiado] = useState(false);
  const comEmail = lista.filter((d) => d.cliente.email);
  const comWhats = lista.filter((d) => soDigitos(d.cliente.whatsapp || d.cliente.telefone));

  return (
    <Modal titulo={`Enviar · ${campanha.nome}`} aoFechar={aoFechar} largo
      rodape={<><button className="btn btn-leve" onClick={aoFechar}>Fechar</button><button className="btn btn-ouro" onClick={concluir}><Icone nome="check" tam={16} /> Marcar como enviada</button></>}>
      <p className="texto-suave">Público: <b>{PUBLICOS.find((p) => p.id === campanha.publico)?.nome}</b> · {lista.length} cliente{lista.length !== 1 ? "s" : ""}</p>
      {campanha.imagem && <div className="img-campanha"><img src={campanha.imagem} alt="" /><a className="btn btn-leve btn-peq" href={campanha.imagem} download={`${campanha.nome}.jpg`}><Icone nome="download" tam={15} /> Baixar imagem</a></div>}

      {campanha.canal === "WhatsApp" && (
        <>
          <div className="alerta alerta-info">O WhatsApp não permite envio automático em massa sem um serviço pago. Toque em “Enviar” em cada cliente: a mensagem já abre prontinha, com o nome dele e do pet.</div>
          <p className="peq"><b>{[...enviados].filter((id) => comWhats.some((d) => d.cliente.id === id)).length}</b> de {comWhats.length} enviados</p>
          <ul className="lista-envio">
            {comWhats.map((d) => (
              <li key={d.cliente.id} className={enviados.has(d.cliente.id) ? "feito" : ""}>
                <span><strong>{d.cliente.nome}</strong><span className="texto-suave peq">{d.pet ? `${d.pet.nome} · ` : ""}{fmtTel(d.cliente.whatsapp || d.cliente.telefone)}</span></span>
                <a className="btn btn-whats btn-peq" href={linkWhats(d.cliente.whatsapp || d.cliente.telefone, montarMsg(campanha.mensagem, varsDe(d)))} target="_blank" rel="noreferrer" onClick={() => marcarEnviado(d.cliente.id)}>
                  {enviados.has(d.cliente.id) ? <><Icone nome="check" tam={15} /> Enviado</> : <><Icone nome="whats" tam={15} /> Enviar</>}
                </a>
              </li>
            ))}
          </ul>
          {comWhats.length === 0 && <p className="texto-suave">Nenhum cliente desse público tem WhatsApp cadastrado.</p>}
        </>
      )}
      {campanha.canal === "E-mail" && (
        <>
          <p>{comEmail.length} cliente{comEmail.length !== 1 ? "s" : ""} com e-mail. O botão abre seu programa de e-mail com todos em cópia oculta.</p>
          <a className="btn btn-ouro" href={`mailto:?bcc=${encodeURIComponent(comEmail.slice(0, 80).map((d) => d.cliente.email).join(","))}&subject=${encodeURIComponent(campanha.nome)}&body=${encodeURIComponent(textoGeral)}`}><Icone nome="mail" tam={16} /> Abrir e-mail</a>
          {comEmail.length > 80 && <p className="texto-suave peq">Para não travar, o botão leva os primeiros 80 e-mails.</p>}
        </>
      )}
      {campanha.canal === "Instagram" && (
        <>
          <p>Copie o texto e baixe a imagem para postar no Instagram.</p>
          <pre className="texto-campanha">{textoGeral}</pre>
          <button className="btn btn-ouro" onClick={async () => setCopiado(await copiarTexto(textoGeral))}><Icone nome="copy" tam={16} /> {copiado ? "Copiado!" : "Copiar texto"}</button>
        </>
      )}
      {campanha.canal === "Site" && (
        <>
          <p>Coloca a mensagem como um aviso em destaque no topo do site.</p>
          <pre className="texto-campanha">{textoGeral}</pre>
          <div className="acoes-topo">
            <button className="btn btn-ouro" onClick={() => publicarSite(textoGeral)}><Icone nome="globo" tam={16} /> Publicar no site</button>
            {config.avisoSite && <button className="btn btn-leve" onClick={() => publicarSite("")}>Tirar aviso do site</button>}
          </div>
          {config.avisoSite && <p className="texto-suave peq">Aviso atual no site: “{config.avisoSite.slice(0, 120)}{config.avisoSite.length > 120 ? "…" : ""}”</p>}
        </>
      )}
    </Modal>
  );
}

function Marketing({ campanhas, clientes, pets, agendamentos, novaCampanha, editar, enviar, excluir, podeExcluir }) {
  const config = useConfig();
  const hoje = hojeISO();
  const aniversariantes = pets.filter((p) => p.nascimento && p.nascimento.slice(5) === hoje.slice(5));
  const mapaCli = Object.fromEntries(clientes.map((c) => [c.id, c]));
  const retornos = pets.filter((p) => p.proximoAtendimento && difDias(p.proximoAtendimento, hoje) <= 3 && difDias(p.proximoAtendimento, hoje) >= -15
    && !agendamentos.some((a) => a.petId === p.id && a.data >= hoje && agAtivo(a) && a.status !== "Finalizado"));
  return (
    <div className="pagina">
      <header className="pagina-topo">
        <div><h1>Marketing</h1><p className="texto-suave">Divulgação por WhatsApp, e-mail, site e Instagram</p></div>
        <div className="acoes-topo"><button className="btn btn-ouro" onClick={() => novaCampanha({})}><Icone nome="plus" tam={18} /> Nova campanha</button></div>
      </header>
      <div className="canais">
        {[["whats", "WhatsApp", "📱"], ["mail", "E-mail", "📧"], ["globo", "Site", "🌐"], ["camera", "Instagram", "📸"]].map(([ic, n, em]) => (
          <button key={n} className="canal" onClick={() => novaCampanha({ canal: n })}><span>{em}</span><strong>{n}</strong><em>Nova campanha</em></button>
        ))}
      </div>

      {(aniversariantes.length > 0 || retornos.length > 0) && (
        <section className="painel mb16">
          <div className="painel-topo"><h2>Mensagens do dia</h2></div>
          <ul className="lista-envio">
            {aniversariantes.map((p) => {
              const c = mapaCli[p.clienteId];
              return c && soDigitos(c.whatsapp || c.telefone) ? (
                <li key={"a" + p.id}><span><strong>🎂 Aniversário do {p.nome}</strong><span className="texto-suave peq">{c.nome}</span></span>
                  <a className="btn btn-whats btn-peq" target="_blank" rel="noreferrer" href={linkWhats(c.whatsapp || c.telefone, montarMsg(config.mensagens.aniversario, varsMensagem({ config, cliente: c, pet: p })))}><Icone nome="whats" tam={15} /> Parabenizar</a></li>
              ) : null;
            })}
            {retornos.map((p) => {
              const c = mapaCli[p.clienteId];
              const tosa = p.ultimaTosa && (!p.ultimoBanho || p.ultimaTosa >= p.ultimoBanho);
              return c && soDigitos(c.whatsapp || c.telefone) ? (
                <li key={"r" + p.id}><span><strong>{tosa ? "✂️ Retorno de tosa" : "🛁 Retorno de banho"} · {p.nome}</strong><span className="texto-suave peq">{c.nome} · previsto {fmtData(p.proximoAtendimento)}</span></span>
                  <a className="btn btn-whats btn-peq" target="_blank" rel="noreferrer" href={linkWhats(c.whatsapp || c.telefone, montarMsg(tosa ? config.mensagens.retornoTosa : config.mensagens.retornoBanho, varsMensagem({ config, cliente: c, pet: p })))}><Icone nome="whats" tam={15} /> Chamar</a></li>
              ) : null;
            })}
          </ul>
        </section>
      )}

      <h2 className="subtitulo">Campanhas</h2>
      {campanhas.length === 0 ? (
        <Vazio titulo="Nenhuma campanha ainda" texto="Crie a primeira — tem modelos prontos, como a “Semana do Banho”."
          acao={<button className="btn btn-ouro" onClick={() => novaCampanha({})}><Icone nome="plus" tam={18} /> Criar campanha</button>} />
      ) : (
        <div className="grade-campanhas">
          {[...campanhas].sort((a, b) => String(b.data).localeCompare(String(a.data))).map((c) => {
            const qtd = destinatarios(c, clientes, pets, agendamentos).length;
            return (
              <div key={c.id} className="cartao-campanha">
                {c.imagem ? <img src={c.imagem} alt="" /> : <div className="cc-sem-img"><Icone nome="megaphone" tam={36} /></div>}
                <div className="cc-corpo">
                  <div className="cl-l1"><span className="chip">{c.canal}</span><span className={`selo-status ${c.status === "Enviada" ? "st-finalizado" : c.status === "Rascunho" ? "st-faltou" : "st-atendimento"}`}>{c.status}</span></div>
                  <strong>{c.nome}</strong>
                  <span className="texto-suave peq">{fmtData(c.data)} {c.horario} · {PUBLICOS.find((p) => p.id === c.publico)?.nome} ({qtd})</span>
                  <p className="cc-msg">{c.mensagem}</p>
                  <div className="cl-acoes">
                    <button className="btn btn-ouro btn-peq" onClick={() => enviar(c)}><Icone nome="send" tam={15} /> Enviar</button>
                    <button className="btn btn-leve btn-peq" onClick={() => editar(c)}><Icone nome="edit" tam={15} /> Editar</button>
                    {podeExcluir && <button className="btn-icone btn-icone-perigo" onClick={() => excluir(c)} aria-label="Excluir"><Icone nome="trash" tam={16} /></button>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// =====================================================================
//  RELATÓRIOS
// =====================================================================
function Relatorios({ clientes, pets, agendamentos, contasReceber, contasPagar, profissionais }) {
  const config = useConfig();
  const [periodo, setPeriodo] = useState("mes");
  const [de, setDe] = useState(`${hojeISO().slice(0, 7)}-01`);
  const [ate, setAte] = useState(hojeISO());
  const p = intervaloPeriodo(periodo, de, ate);
  const mapaCli = Object.fromEntries(clientes.map((c) => [c.id, c]));

  const r = useMemo(() => {
    const ags = agendamentos.filter((a) => dentro(a.data, p));
    const fin = ags.filter((a) => a.status === "Finalizado");
    const entradas = contasReceber.reduce((s, c) => s + (c.pagamentos || []).filter((x) => dentro(x.data, p)).reduce((a, x) => a + (Number(x.valor) || 0), 0), 0);
    const saidas = contasPagar.reduce((s, c) => s + (c.pagamentos || []).filter((x) => dentro(x.data, p)).reduce((a, x) => a + (Number(x.valor) || 0), 0), 0);
    const faturado = contasReceber.filter((c) => c.status !== "Cancelado" && dentro(c.vencimento, p)).reduce((s, c) => s + (Number(c.valor) || 0), 0);
    const despesas = contasPagar.filter((c) => c.status !== "Cancelado" && dentro(c.vencimento, p));
    const totalDespesas = despesas.reduce((s, c) => s + (Number(c.valor) || 0), 0);
    const porServico = {};
    fin.forEach((a) => (a.servicos || []).forEach((s) => { porServico[s.nome] = porServico[s.nome] || { qtd: 0, valor: 0 }; porServico[s.nome].qtd += 1; porServico[s.nome].valor += Number(s.preco) || 0; }));
    const porCategoria = {};
    despesas.forEach((c) => { porCategoria[c.categoria || "Outros"] = (porCategoria[c.categoria || "Outros"] || 0) + (Number(c.valor) || 0); });
    const porProf = {};
    fin.forEach((a) => { const n = profissionais.find((x) => x.id === a.profissionalId)?.nome || "Sem profissional"; porProf[n] = (porProf[n] || 0) + 1; });
    const visitas = {};
    fin.forEach((a) => { visitas[a.clienteId] = (visitas[a.clienteId] || 0) + 1; });
    const antesDoPeriodo = new Set(agendamentos.filter((a) => a.status === "Finalizado" && a.data < p.de).map((a) => a.clienteId));
    const recorrentes = Object.keys(visitas).filter((id) => visitas[id] >= 2 || antesDoPeriodo.has(id));
    const abertas = contasReceber.filter(contaAberta);
    const atrasadas = contasReceber.filter((c) => statusConta(c) === "Atrasado");
    return {
      ags, fin, entradas, saidas, faturado, totalDespesas, lucro: entradas - saidas,
      servicosRealizados: fin.reduce((s, a) => s + (a.servicos || []).length, 0),
      maisVendidos: Object.entries(porServico).sort((a, b) => b[1].qtd - a[1].qtd),
      porCategoria: Object.entries(porCategoria).sort((a, b) => b[1] - a[1]),
      porProf: Object.entries(porProf).sort((a, b) => b[1] - a[1]),
      clientesNovos: clientes.filter((c) => dentro(c.criadoEm, p)),
      petsNovos: pets.filter((x) => dentro(x.criadoEm, p)).length,
      recorrentes, petsAtendidos: new Set(fin.map((a) => a.petId)).size,
      cancelados: ags.filter((a) => a.status === "Cancelado").length,
      faltas: ags.filter((a) => a.status === "Não compareceu").length,
      abertas, totalAberto: abertas.reduce((s, c) => s + restanteDe(c), 0),
      atrasadas, totalAtrasado: atrasadas.reduce((s, c) => s + restanteDe(c), 0),
      ticket: fin.length ? fin.reduce((s, a) => s + (Number(a.valor) || 0), 0) / fin.length : 0,
    };
  }, [agendamentos, contasReceber, contasPagar, clientes, pets, profissionais, p.de, p.ate]);

  const mensal = ultimosMeses(12).map((m) => {
    const per = { de: `${m.chave}-01`, ate: fimDoMes(`${m.chave}-01`) };
    const e = contasReceber.reduce((s, c) => s + (c.pagamentos || []).filter((x) => dentro(x.data, per)).reduce((a, x) => a + (Number(x.valor) || 0), 0), 0);
    const sa = contasPagar.reduce((s, c) => s + (c.pagamentos || []).filter((x) => dentro(x.data, per)).reduce((a, x) => a + (Number(x.valor) || 0), 0), 0);
    return { mes: `${m.rotulo}/${m.chave.slice(2, 4)}`, atend: agendamentos.filter((a) => a.status === "Finalizado" && dentro(a.data, per)).length, entradas: e, saidas: sa, lucro: e - sa, novos: clientes.filter((c) => dentro(c.criadoEm, per)).length };
  });
  const nomePeriodo = `${fmtData(p.de)} a ${fmtData(p.ate)}`;

  const exportarExcel = () => {
    const linhas = [
      ["Relatório", config.nome], ["Período", nomePeriodo], [],
      ["Resumo"], ["Faturamento (recebido)", arred(r.entradas)], ["Faturado (emitido)", arred(r.faturado)], ["Despesas pagas", arred(r.saidas)], ["Lucro", arred(r.lucro)],
      ["Atendimentos finalizados", r.fin.length], ["Serviços realizados", r.servicosRealizados], ["Ticket médio", arred(r.ticket)], ["Pets atendidos", r.petsAtendidos],
      ["Clientes novos", r.clientesNovos.length], ["Clientes recorrentes", r.recorrentes.length], ["Cancelamentos", r.cancelados], ["Não comparecimentos", r.faltas],
      ["Contas a receber em aberto", arred(r.totalAberto)], ["Contas atrasadas", arred(r.totalAtrasado)], [],
      ["Serviços mais vendidos", "Quantidade", "Valor"], ...r.maisVendidos.map(([n, v]) => [n, v.qtd, arred(v.valor)]), [],
      ["Despesas por categoria", "Valor"], ...r.porCategoria.map(([n, v]) => [n, arred(v)]), [],
      ["Desempenho mensal", "Atendimentos", "Entradas", "Saídas", "Lucro", "Clientes novos"], ...mensal.map((m) => [m.mes, m.atend, arred(m.entradas), arred(m.saidas), arred(m.lucro), m.novos]), [],
      ["Contas atrasadas", "Cliente", "Vencimento", "Restante"], ...r.atrasadas.map((c) => ["", mapaCli[c.clienteId]?.nome || c.descricao, fmtData(c.vencimento), arred(restanteDe(c))]),
    ];
    exportarCSV(`relatorio-${p.de}-a-${p.ate}.csv`, linhas[0], linhas.slice(1));
  };

  const exportarPDF = () => {
    const cards = [["Faturamento", fmtMoeda(r.entradas)], ["Despesas", fmtMoeda(r.saidas)], ["Lucro", fmtMoeda(r.lucro)], ["Atendimentos", r.fin.length],
      ["Serviços", r.servicosRealizados], ["Ticket médio", fmtMoeda(r.ticket)], ["Clientes novos", r.clientesNovos.length], ["Recorrentes", r.recorrentes.length],
      ["Pets atendidos", r.petsAtendidos], ["Cancelamentos", r.cancelados], ["Não compareceram", r.faltas], ["Em atraso", fmtMoeda(r.totalAtrasado)]];
    const html = `<div class="topo"><img src="${logoDe(config)}"><div class="emp"><h1>${escHTML(config.nome)}</h1><p>Relatório de desempenho</p></div><div class="doc"><h2>RELATÓRIO</h2><p>${nomePeriodo}</p><p>Gerado em ${fmtData(hojeISO())}</p></div></div>
    <div class="cards">${cards.map(([n, v]) => `<div class="card">${n}<b>${v}</b></div>`).join("")}</div>
    <table><thead><tr><th>Serviço mais vendido</th><th class="dir">Qtd.</th><th class="dir">Valor</th></tr></thead><tbody>${r.maisVendidos.map(([n, v]) => `<tr><td>${escHTML(n)}</td><td class="dir">${v.qtd}</td><td class="dir">${fmtMoeda(v.valor)}</td></tr>`).join("") || `<tr><td colspan="3">Sem atendimentos finalizados</td></tr>`}</tbody></table>
    <table><thead><tr><th>Despesas por categoria</th><th class="dir">Valor</th></tr></thead><tbody>${r.porCategoria.map(([n, v]) => `<tr><td>${escHTML(n)}</td><td class="dir">${fmtMoeda(v)}</td></tr>`).join("") || `<tr><td colspan="2">Sem despesas</td></tr>`}</tbody></table>
    <table><thead><tr><th>Mês</th><th class="dir">Atendimentos</th><th class="dir">Entradas</th><th class="dir">Saídas</th><th class="dir">Lucro</th><th class="dir">Clientes novos</th></tr></thead><tbody>${mensal.map((m) => `<tr><td>${m.mes}</td><td class="dir">${m.atend}</td><td class="dir">${fmtMoeda(m.entradas)}</td><td class="dir">${fmtMoeda(m.saidas)}</td><td class="dir">${fmtMoeda(m.lucro)}</td><td class="dir">${m.novos}</td></tr>`).join("")}</tbody></table>
    ${r.atrasadas.length ? `<table><thead><tr><th>Conta atrasada</th><th>Vencimento</th><th class="dir">Restante</th></tr></thead><tbody>${r.atrasadas.map((c) => `<tr><td>${escHTML(mapaCli[c.clienteId]?.nome || c.descricao)}</td><td>${fmtData(c.vencimento)}</td><td class="dir">${fmtMoeda(restanteDe(c))}</td></tr>`).join("")}</tbody></table>` : ""}`;
    abrirImpressao(`Relatório ${nomePeriodo}`, html);
  };

  const cards = [
    ["Faturamento (recebido)", fmtMoeda(r.entradas), "verde"], ["Despesas pagas", fmtMoeda(r.saidas), "vermelho"], ["Lucro", fmtMoeda(r.lucro), r.lucro < 0 ? "vermelho" : "verde"],
    ["Faturado (emitido)", fmtMoeda(r.faturado)], ["Atendimentos finalizados", r.fin.length], ["Serviços realizados", r.servicosRealizados],
    ["Ticket médio", fmtMoeda(r.ticket)], ["Pets atendidos", r.petsAtendidos], ["Clientes novos", r.clientesNovos.length], ["Pets novos", r.petsNovos],
    ["Clientes recorrentes", r.recorrentes.length], ["Cancelamentos", r.cancelados], ["Não comparecimentos", r.faltas],
    ["A receber em aberto", fmtMoeda(r.totalAberto)], ["Contas atrasadas", fmtMoeda(r.totalAtrasado), r.totalAtrasado > 0 ? "vermelho" : ""],
  ];

  return (
    <div className="pagina">
      <header className="pagina-topo">
        <div><h1>Relatórios</h1><p className="texto-suave">{nomePeriodo}</p></div>
        <div className="acoes-topo">
          <button className="btn btn-leve" onClick={exportarExcel}><Icone nome="download" tam={18} /> Excel</button>
          <button className="btn btn-ouro" onClick={exportarPDF}><Icone nome="printer" tam={18} /> PDF</button>
        </div>
      </header>
      <SeletorPeriodo periodo={periodo} setPeriodo={setPeriodo} de={de} setDe={setDe} ate={ate} setAte={setAte} />
      <section className="numeros numeros-auto numeros-rel">
        {cards.map(([n, v, cor]) => <div key={n} className="numero numero-dinheiro"><span className={`numero-valor ${cor || ""}`}>{v}</span><span className="numero-rotulo">{n}</span></div>)}
      </section>
      <div className="grade-painel">
        <section className="painel"><div className="painel-topo"><h2>Serviços mais vendidos</h2></div>
          <BarrasHorizontais itens={r.maisVendidos.map(([n, v]) => [n, v.qtd])} />
        </section>
        <section className="painel"><div className="painel-topo"><h2>Despesas por categoria</h2></div>
          <BarrasHorizontais itens={r.porCategoria} formatar={fmtMoeda} vazio="Sem despesas no período." />
        </section>
        <section className="painel"><div className="painel-topo"><h2>Atendimentos por profissional</h2></div>
          <BarrasHorizontais itens={r.porProf} />
        </section>
        <section className="painel"><div className="painel-topo"><h2>Contas atrasadas</h2></div>
          {r.atrasadas.length === 0 ? <p className="texto-suave">Nenhuma conta atrasada. 🎉</p> : (
            <ul className="lista-venc">{r.atrasadas.map((c) => <li key={c.id}><span className="lv-info"><strong>{mapaCli[c.clienteId]?.nome || c.descricao}</strong><span className="texto-suave peq">venceu {fmtData(c.vencimento)}</span></span><b>{fmtMoeda(restanteDe(c))}</b></li>)}</ul>
          )}
        </section>
        <section className="painel painel-cheio">
          <div className="painel-topo"><h2>Desempenho mensal (12 meses)</h2></div>
          <div className="tabela-rolagem">
            <table className="tabela-simples">
              <thead><tr><th>Mês</th><th>Atendimentos</th><th>Entradas</th><th>Saídas</th><th>Lucro</th><th>Clientes novos</th></tr></thead>
              <tbody>{mensal.map((m) => <tr key={m.mes}><td>{m.mes}</td><td>{m.atend}</td><td>{fmtMoeda(m.entradas)}</td><td>{fmtMoeda(m.saidas)}</td><td className={m.lucro < 0 ? "vermelho" : ""}>{fmtMoeda(m.lucro)}</td><td>{m.novos}</td></tr>)}</tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

// =====================================================================
//  CONFIGURAÇÕES
// =====================================================================
function FormServico({ inicial, profissionais, aoFechar, aoSalvar }) {
  const [f, setF] = useState({ nome: "", preco: "", duracao: 60, descricao: "", profissionalId: "", ativo: true, mostrarNoSite: true, ...(inicial || {}) });
  const [erro, setErro] = useState("");
  const m = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  return (
    <Modal titulo={inicial?.id ? "Editar serviço" : "Novo serviço"} aoFechar={aoFechar}
      rodape={<>{erro && <span className="erro-rodape">{erro}</span>}<button className="btn btn-leve" onClick={aoFechar}>Cancelar</button>
        <button className="btn btn-ouro" onClick={async () => {
          if (!f.nome.trim()) return setErro("Informe o nome.");
          try { await aoSalvar({ ...f, preco: arred(paraNumero(f.preco)), duracao: Number(f.duracao) || 30 }); } catch (e) { setErro(traduzErro(e)); }
        }}>Salvar</button></>}>
      <div className="fgrade">
        <Campo rotulo="Nome *" largo><input value={f.nome} onChange={m("nome")} /></Campo>
        <Campo rotulo="Preço (R$)"><input value={f.preco} onChange={m("preco")} inputMode="decimal" /></Campo>
        <Campo rotulo="Duração (min)"><input type="number" min="5" step="5" value={f.duracao} onChange={m("duracao")} /></Campo>
        <Campo rotulo="Profissional responsável">
          <select value={f.profissionalId} onChange={m("profissionalId")}><option value="">Qualquer um</option>{profissionais.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}</select>
        </Campo>
        <Campo rotulo="Descrição" largo><textarea rows={2} value={f.descricao} onChange={m("descricao")} /></Campo>
      </div>
      <label className="checar"><input type="checkbox" checked={f.ativo !== false} onChange={(e) => setF((x) => ({ ...x, ativo: e.target.checked }))} /> Serviço ativo</label>
      <label className="checar mt10"><input type="checkbox" checked={f.mostrarNoSite !== false} onChange={(e) => setF((x) => ({ ...x, mostrarNoSite: e.target.checked }))} /> Mostrar no site</label>
    </Modal>
  );
}

function FormProfissional({ inicial, aoFechar, aoSalvar }) {
  const CORES = ["#2A4F95", "#E3AA0B", "#1F9D6B", "#C2417A", "#7A4FD1", "#E0322B", "#0E8FA8"];
  const [f, setF] = useState({ nome: "", funcao: "", telefone: "", cor: CORES[0], ativo: true, ...(inicial || {}) });
  const [erro, setErro] = useState("");
  const m = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  return (
    <Modal titulo={inicial?.id ? "Editar profissional" : "Novo profissional"} aoFechar={aoFechar}
      rodape={<>{erro && <span className="erro-rodape">{erro}</span>}<button className="btn btn-leve" onClick={aoFechar}>Cancelar</button>
        <button className="btn btn-ouro" onClick={async () => { if (!f.nome.trim()) return setErro("Informe o nome."); try { await aoSalvar(f); } catch (e) { setErro(traduzErro(e)); } }}>Salvar</button></>}>
      <div className="fgrade">
        <Campo rotulo="Nome *"><input value={f.nome} onChange={m("nome")} /></Campo>
        <Campo rotulo="Função"><input value={f.funcao} onChange={m("funcao")} placeholder="Ex.: Banhista, Tosador" /></Campo>
        <Campo rotulo="Telefone"><input value={f.telefone} onChange={m("telefone")} onBlur={() => setF((x) => ({ ...x, telefone: fmtTel(x.telefone) }))} inputMode="tel" /></Campo>
      </div>
      <span className="campo-rotulo">Cor na agenda</span>
      <div className="cores">{CORES.map((c) => <button key={c} type="button" className={`cor ${f.cor === c ? "marcado" : ""}`} style={{ background: c }} onClick={() => setF((x) => ({ ...x, cor: c }))} aria-label={`Cor ${c}`} />)}</div>
      <label className="checar mt10"><input type="checkbox" checked={f.ativo !== false} onChange={(e) => setF((x) => ({ ...x, ativo: e.target.checked }))} /> Ativo (aparece na agenda)</label>
    </Modal>
  );
}

function FormUsuario({ inicial, aoFechar, aoSalvar }) {
  const novo = !inicial?.id;
  const [f, setF] = useState({ nome: "", email: "", senha: "", papel: "funcionario", modulos: [], ativo: true, ...(inicial || {}) });
  const [erro, setErro] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const mods = f.modulos && f.modulos.length ? f.modulos : PERMISSOES[f.papel] || [];
  const alternar = (id) => setF((x) => { const atual = x.modulos && x.modulos.length ? x.modulos : PERMISSOES[x.papel] || []; return { ...x, modulos: atual.includes(id) ? atual.filter((y) => y !== id) : [...atual, id] }; });
  return (
    <Modal titulo={novo ? "Novo usuário" : `Editar ${inicial.nome}`} aoFechar={aoFechar}
      rodape={<>{erro && <span className="erro-rodape">{erro}</span>}<button className="btn btn-leve" onClick={aoFechar}>Cancelar</button>
        <button className="btn btn-ouro" disabled={ocupado} onClick={async () => {
          if (!f.nome.trim()) return setErro("Informe o nome.");
          if (novo && (!f.email.trim() || f.senha.length < 6)) return setErro("Informe e-mail e uma senha com pelo menos 6 caracteres.");
          setOcupado(true);
          try { await aoSalvar({ ...f, modulos: f.papel === "administrador" ? [] : mods }); } catch (e) { setErro(traduzErro(e)); setOcupado(false); }
        }}>{ocupado ? "Salvando…" : "Salvar"}</button></>}>
      <div className="fgrade">
        <Campo rotulo="Nome *"><input value={f.nome} onChange={(e) => setF((x) => ({ ...x, nome: e.target.value }))} /></Campo>
        {novo ? (
          <>
            <Campo rotulo="E-mail *"><input type="email" value={f.email} onChange={(e) => setF((x) => ({ ...x, email: e.target.value }))} /></Campo>
            <Campo rotulo="Senha inicial *" dica="Mínimo 6 caracteres"><input type="text" value={f.senha} onChange={(e) => setF((x) => ({ ...x, senha: e.target.value }))} /></Campo>
          </>
        ) : <Campo rotulo="E-mail"><input value={f.email} disabled /></Campo>}
        <Campo rotulo="Nível de acesso">
          <select value={f.papel} onChange={(e) => setF((x) => ({ ...x, papel: e.target.value, modulos: [] }))}>
            {Object.entries(NOME_PAPEL).map(([id, n]) => <option key={id} value={id}>{n}</option>)}
          </select>
        </Campo>
      </div>
      {f.papel !== "administrador" && (
        <>
          <h3 className="form-secao">O que essa pessoa pode acessar</h3>
          <div className="permissoes">
            {MODULOS.filter((mo) => mo.id !== "configuracoes").map((mo) => (
              <label key={mo.id} className="checar"><input type="checkbox" checked={mods.includes(mo.id)} onChange={() => alternar(mo.id)} /> {mo.nome}</label>
            ))}
          </div>
        </>
      )}
      {!novo && <label className="checar mt10"><input type="checkbox" checked={f.ativo !== false} onChange={(e) => setF((x) => ({ ...x, ativo: e.target.checked }))} /> Acesso liberado (desmarque para bloquear)</label>}
    </Modal>
  );
}

function Configuracoes({ usuario, servicos, profissionais, usuarios, dadosBackup, salvarConfig, crud, avisar }) {
  const config = useConfig();
  const [aba, setAba] = useState("empresa");
  const [emp, setEmp] = useState(config);
  const [salvando, setSalvando] = useState(false);
  const [modal, setModal] = useState(null);
  const [novaForma, setNovaForma] = useState("");
  const [msgs, setMsgs] = useState(config.mensagens);
  useEffect(() => { setEmp(config); setMsgs(config.mensagens); }, [config]);
  const m = (k) => (e) => setEmp((x) => ({ ...x, [k]: e.target.value }));

  const salvar = async (dados, texto = "Configurações salvas") => {
    setSalvando(true);
    try { await salvarConfig(dados); avisar(texto); } catch (e) { avisar(traduzErro(e), "aviso"); }
    setSalvando(false);
  };
  const trocarLogo = async (e) => {
    const arq = e.target.files?.[0];
    if (!arq) return;
    try { const d = await comprimirImagem(arq, 300, 0.85); setEmp((x) => ({ ...x, logo: d })); } catch { avisar("Não consegui ler a imagem", "aviso"); }
    e.target.value = "";
  };
  const ABAS = [["empresa", "Empresa"], ["servicos", "Serviços e preços"], ["profissionais", "Profissionais"], ["pagamentos", "Formas de pagamento"], ["mensagens", "Mensagens automáticas"], ["usuarios", "Usuários e permissões"], ["backup", "Backup"]];

  return (
    <div className="pagina">
      <header className="pagina-topo"><div><h1>Configurações</h1></div></header>
      <div className="abas-config">{ABAS.map(([id, n]) => <button key={id} className={aba === id ? "ativo" : ""} onClick={() => setAba(id)}>{n}</button>)}</div>

      {aba === "empresa" && (
        <section className="painel">
          <div className="logo-config">
            <img src={logoDe(emp)} alt="Logo" />
            <div>
              <label className="btn btn-leve btn-peq"><Icone nome="camera" tam={15} /> Trocar logo<input type="file" accept="image/*" hidden onChange={trocarLogo} /></label>
              {emp.logo && <button className="link peq" onClick={() => setEmp((x) => ({ ...x, logo: "" }))}>Voltar ao logo original</button>}
            </div>
          </div>
          <div className="fgrade">
            <Campo rotulo="Nome"><input value={emp.nome} onChange={m("nome")} /></Campo>
            <Campo rotulo="CNPJ"><input value={emp.cnpj} onChange={m("cnpj")} onBlur={() => setEmp((x) => ({ ...x, cnpj: fmtDoc(x.cnpj) }))} /></Campo>
            <Campo rotulo="Telefone"><input value={emp.telefone} onChange={m("telefone")} onBlur={() => setEmp((x) => ({ ...x, telefone: fmtTel(x.telefone) }))} /></Campo>
            <Campo rotulo="WhatsApp" dica="Usado no site e nas mensagens"><input value={emp.whatsapp} onChange={m("whatsapp")} onBlur={() => setEmp((x) => ({ ...x, whatsapp: soDigitos(x.whatsapp) }))} /></Campo>
            <Campo rotulo="E-mail"><input value={emp.email} onChange={m("email")} /></Campo>
            <Campo rotulo="Instagram"><input value={emp.instagram} onChange={m("instagram")} placeholder="@mimidogspetshop" /></Campo>
            <Campo rotulo="Site"><input value={emp.site} onChange={m("site")} /></Campo>
            <Campo rotulo="Endereço" largo><input value={emp.endereco} onChange={m("endereco")} /></Campo>
            <Campo rotulo="Bairro / cidade"><input value={emp.cidade} onChange={m("cidade")} placeholder="Ex.: Vila Mariana, São Paulo - SP" /></Campo>
            <Campo rotulo="Horário de funcionamento (texto do site)" largo><input value={emp.horarioTexto} onChange={m("horarioTexto")} placeholder="Ex.: Segunda a sábado, das 8h às 18h" /></Campo>
          </div>
          <h3 className="form-secao">Horários da agenda</h3>
          <div className="fgrade">
            <Campo rotulo="Abre às"><input type="time" value={emp.abre} onChange={m("abre")} /></Campo>
            <Campo rotulo="Fecha às"><input type="time" value={emp.fecha} onChange={m("fecha")} /></Campo>
            <Campo rotulo="Intervalo entre horários">
              <select value={emp.intervalo} onChange={(e) => setEmp((x) => ({ ...x, intervalo: Number(e.target.value) }))}>{[15, 20, 30, 45, 60].map((n) => <option key={n} value={n}>{n} minutos</option>)}</select>
            </Campo>
          </div>
          <span className="campo-rotulo">Dias de funcionamento</span>
          <div className="escolhas mt6">
            {DIAS_SEMANA.map((d, i) => (
              <button key={d} type="button" className={`escolha ${emp.diasAbertos.includes(i) ? "marcado" : ""}`}
                onClick={() => setEmp((x) => ({ ...x, diasAbertos: x.diasAbertos.includes(i) ? x.diasAbertos.filter((y) => y !== i) : [...x.diasAbertos, i].sort() }))}>{d}</button>
            ))}
          </div>
          <label className="checar mt10"><input type="checkbox" checked={Boolean(emp.mostrarPrecosSite)} onChange={(e) => setEmp((x) => ({ ...x, mostrarPrecosSite: e.target.checked }))} /> Mostrar preços dos serviços no site</label>
          <Campo rotulo="Aviso em destaque no site (deixe vazio para não mostrar)" largo><textarea rows={2} value={emp.avisoSite} onChange={m("avisoSite")} /></Campo>
          <div className="acoes-fim"><button className="btn btn-ouro" disabled={salvando} onClick={() => salvar({ ...emp, mensagens: undefined, formasPagamento: undefined })}>{salvando ? "Salvando…" : "Salvar dados da empresa"}</button></div>
        </section>
      )}

      {aba === "servicos" && (
        <section className="painel">
          <div className="painel-topo"><h2>Serviços</h2><button className="btn btn-ouro btn-peq" onClick={() => setModal({ tipo: "servico", dados: {} })}><Icone nome="plus" tam={15} /> Serviço</button></div>
          {servicos.length === 0 && (
            <div className="alerta alerta-info">Nenhum serviço cadastrado. <button className="link" onClick={async () => { for (const s of SERVICOS_PADRAO) await crud.salvar("servicos", { ...s, ativo: true, mostrarNoSite: true }); avisar("Serviços padrão criados — ajuste os preços!"); }}>Criar os serviços padrão (Banho, Tosa, Hidratação…)</button></div>
          )}
          <ul className="lista-config">
            {[...servicos].sort((a, b) => a.nome.localeCompare(b.nome)).map((s) => (
              <li key={s.id} className={s.ativo === false ? "inativo" : ""}>
                <span><strong>{s.nome}</strong><span className="texto-suave peq">{s.duracao} min{s.profissionalId ? ` · ${profissionais.find((p) => p.id === s.profissionalId)?.nome || ""}` : ""}{s.ativo === false ? " · inativo" : ""}{s.mostrarNoSite === false ? " · fora do site" : ""}</span></span>
                <b>{fmtMoeda(s.preco)}</b>
                <button className="btn-icone" onClick={() => setModal({ tipo: "servico", dados: s })} aria-label="Editar"><Icone nome="edit" tam={16} /></button>
                <button className="btn-icone btn-icone-perigo" onClick={() => crud.excluir("servicos", s, s.nome)} aria-label="Excluir"><Icone nome="trash" tam={16} /></button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {aba === "profissionais" && (
        <section className="painel">
          <div className="painel-topo"><h2>Profissionais</h2><button className="btn btn-ouro btn-peq" onClick={() => setModal({ tipo: "prof", dados: {} })}><Icone nome="plus" tam={15} /> Profissional</button></div>
          <p className="texto-suave peq">Cada profissional vira uma coluna na agenda do dia. O sistema não deixa marcar dois atendimentos no mesmo horário para a mesma pessoa.</p>
          <ul className="lista-config">
            {profissionais.map((p) => (
              <li key={p.id} className={p.ativo === false ? "inativo" : ""}>
                <span className="bolinha" style={{ background: p.cor }} />
                <span><strong>{p.nome}</strong><span className="texto-suave peq">{[p.funcao, fmtTel(p.telefone), p.ativo === false && "inativo"].filter(Boolean).join(" · ")}</span></span>
                <button className="btn-icone" onClick={() => setModal({ tipo: "prof", dados: p })} aria-label="Editar"><Icone nome="edit" tam={16} /></button>
                <button className="btn-icone btn-icone-perigo" onClick={() => crud.excluir("profissionais", p, p.nome)} aria-label="Excluir"><Icone nome="trash" tam={16} /></button>
              </li>
            ))}
          </ul>
          {profissionais.length === 0 && <p className="texto-suave">Nenhum profissional ainda.</p>}
        </section>
      )}

      {aba === "pagamentos" && (
        <section className="painel">
          <div className="painel-topo"><h2>Formas de pagamento</h2></div>
          <div className="escolhas">
            {emp.formasPagamento.map((fp) => (
              <span key={fp} className="escolha marcado">{fp} <button onClick={() => setEmp((x) => ({ ...x, formasPagamento: x.formasPagamento.filter((y) => y !== fp) }))} aria-label={`Remover ${fp}`}>×</button></span>
            ))}
          </div>
          <div className="linha-add">
            <input value={novaForma} onChange={(e) => setNovaForma(e.target.value)} placeholder="Nova forma (ex.: Vale)" />
            <button className="btn btn-leve" onClick={() => { if (novaForma.trim()) { setEmp((x) => ({ ...x, formasPagamento: [...x.formasPagamento, novaForma.trim()] })); setNovaForma(""); } }}>Adicionar</button>
          </div>
          <div className="acoes-fim"><button className="btn btn-ouro" disabled={salvando} onClick={() => salvar({ formasPagamento: emp.formasPagamento })}>Salvar formas de pagamento</button></div>
        </section>
      )}

      {aba === "mensagens" && (
        <section className="painel">
          <p className="texto-suave peq">Palavras entre chaves são trocadas sozinhas: {"{cliente} {pet} {data} {horario} {servico} {valor} {vencimento} {numero} {itens} {validade} {empresa}"}</p>
          {Object.keys(MENSAGENS_PADRAO).map((k) => (
            <Campo key={k} rotulo={NOMES_MENSAGENS[k]} largo>
              <textarea rows={3} value={msgs[k]} onChange={(e) => setMsgs((x) => ({ ...x, [k]: e.target.value }))} />
              <button type="button" className="link peq alinhar-dir" onClick={() => setMsgs((x) => ({ ...x, [k]: MENSAGENS_PADRAO[k] }))}>Restaurar padrão</button>
            </Campo>
          ))}
          <div className="acoes-fim"><button className="btn btn-ouro" disabled={salvando} onClick={() => salvar({ mensagens: msgs }, "Mensagens salvas")}>Salvar mensagens</button></div>
        </section>
      )}

      {aba === "usuarios" && (
        <section className="painel">
          <div className="painel-topo"><h2>Usuários</h2>{!MODO_DEMO && <button className="btn btn-ouro btn-peq" onClick={() => setModal({ tipo: "usuario", dados: {} })}><Icone nome="plus" tam={15} /> Usuário</button>}</div>
          {MODO_DEMO && <div className="alerta alerta-info">No modo de teste os usuários são fixos. Com o Firebase configurado, você cria e edita usuários aqui.</div>}
          <ul className="lista-config">
            {usuarios.map((u) => (
              <li key={u.id || u.uid} className={u.ativo === false ? "inativo" : ""}>
                <span className="menu-avatar pequeno">{primeiroNome(u.nome).slice(0, 1).toUpperCase()}</span>
                <span><strong>{u.nome}{(u.id || u.uid) === usuario.uid ? " (você)" : ""}</strong><span className="texto-suave peq">{u.email} · {NOME_PAPEL[u.papel] || u.papel}{u.ativo === false ? " · bloqueado" : ""}</span></span>
                {!MODO_DEMO && (u.id || u.uid) !== usuario.uid && <button className="btn-icone" onClick={() => setModal({ tipo: "usuario", dados: u })} aria-label="Editar"><Icone nome="edit" tam={16} /></button>}
                {!MODO_DEMO && <button className="btn btn-leve btn-peq" onClick={async () => { try { await autenticacao.recuperar(u.email); avisar(`Link de nova senha enviado para ${u.email}`); } catch (e) { avisar(traduzErro(e), "aviso"); } }}>Redefinir senha</button>}
              </li>
            ))}
          </ul>
          <p className="texto-suave peq">Para tirar o acesso de alguém, edite e desmarque “Acesso liberado”. Administradores têm acesso a tudo.</p>
        </section>
      )}

      {aba === "backup" && (
        <section className="painel">
          <h2>Backup dos dados</h2>
          <p>Seus dados ficam guardados na nuvem do Firebase (Google). Mesmo assim, é bom baixar uma cópia de vez em quando e guardar no computador ou no Google Drive.</p>
          <button className="btn btn-ouro" onClick={() => { baixarArquivo(`backup-mimi-dogs-${hojeISO()}.json`, JSON.stringify({ geradoEm: new Date().toISOString(), config, ...dadosBackup }, null, 2)); avisar("Backup baixado"); }}>
            <Icone nome="download" tam={18} /> Baixar backup completo
          </button>
          <p className="texto-suave peq mt10">A Mimi pode ser ligada e desligada no botão da patinha, no canto da tela.</p>
        </section>
      )}

      {modal?.tipo === "servico" && <FormServico inicial={modal.dados} profissionais={profissionais} aoFechar={() => setModal(null)} aoSalvar={async (d) => { await crud.salvar("servicos", d); setModal(null); avisar("Serviço salvo"); }} />}
      {modal?.tipo === "prof" && <FormProfissional inicial={modal.dados} aoFechar={() => setModal(null)} aoSalvar={async (d) => { await crud.salvar("profissionais", d); setModal(null); avisar("Profissional salvo"); }} />}
      {modal?.tipo === "usuario" && <FormUsuario inicial={modal.dados} aoFechar={() => setModal(null)} aoSalvar={async (d) => {
        if (d.id) { const { id, senha, uid, ...resto } = d; await db.definir("users", id, resto); }
        else { const { senha, email, ...perfil } = d; await autenticacao.criarUsuario(email, senha, perfil); }
        setModal(null); avisar("Usuário salvo");
      }} />}
    </div>
  );
}

// =====================================================================
//  PESQUISA GLOBAL
// =====================================================================
function BuscaGlobal({ clientes, pets, abrirCliente, abrirPet, podeClientes }) {
  const [texto, setTexto] = useState("");
  const [aberta, setAberta] = useState(false);
  const caixa = useRef(null);
  useEffect(() => {
    const fora = (e) => caixa.current && !caixa.current.contains(e.target) && setAberta(false);
    document.addEventListener("pointerdown", fora);
    return () => document.removeEventListener("pointerdown", fora);
  }, []);
  const b = normalizar(texto);
  const bd = soDigitos(texto);
  const rc = !b || !podeClientes ? [] : clientes.filter((c) => normalizar(`${c.nome} ${c.codigo} ${c.email}`).includes(b)
    || (bd.length >= 3 && (soDigitos(c.whatsapp).includes(bd) || soDigitos(c.telefone).includes(bd)))).slice(0, 5);
  const rp = !b || !podeClientes ? [] : pets.filter((p) => normalizar(`${p.nome} ${p.codigo} ${p.raca}`).includes(b)).slice(0, 5);
  const escolher = (fn) => { fn(); setTexto(""); setAberta(false); };
  return (
    <div className="busca-global" ref={caixa}>
      <Icone nome="search" tam={18} />
      <input value={texto} onChange={(e) => { setTexto(e.target.value); setAberta(true); }} onFocus={() => setAberta(true)}
        placeholder="Pesquisar clientes e pets…" aria-label="Pesquisa global" />
      {aberta && b && (
        <div className="busca-resultados">
          {rc.length === 0 && rp.length === 0 && <p className="texto-suave peq pad">Nada encontrado.</p>}
          {rc.length > 0 && <p className="busca-grupo">Clientes</p>}
          {rc.map((c) => (
            <button key={c.id} onClick={() => escolher(() => abrirCliente(c.id))}>
              <Icone nome="users" tam={16} /><span>{c.nome}</span><span className="codigo">{c.codigo}</span>
            </button>
          ))}
          {rp.length > 0 && <p className="busca-grupo">Pets</p>}
          {rp.map((p) => (
            <button key={p.id} onClick={() => escolher(() => abrirPet(p.id))}>
              <Icone nome="paw" tam={16} /><span>{p.nome}</span><span className="texto-suave peq">{p.raca}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// =====================================================================
//  FICHA DO CLIENTE (linha do tempo completa)
// =====================================================================
function DetalheCliente({ cliente, pets, historico, agendamentos, propostas, contasReceber, pode, voltar, editar, excluir, novoPet, abrirPet, abrirAg, novoAg, novaProposta, editarProposta, pagarConta, podeExcluir }) {
  const seusPets = pets.filter((p) => p.clienteId === cliente.id);
  const mapaPet = Object.fromEntries(pets.map((p) => [p.id, p]));
  const hoje = hojeISO();
  const ags = agendamentos.filter((a) => a.clienteId === cliente.id).sort((a, b) => `${b.data}${b.hora}`.localeCompare(`${a.data}${a.hora}`));
  const proximos = ags.filter((a) => a.data >= hoje && agAtivo(a) && a.status !== "Finalizado").reverse();
  const feitos = ags.filter((a) => a.status === "Finalizado");
  const props = propostas.filter((p) => p.clienteId === cliente.id).sort((a, b) => String(b.numero).localeCompare(String(a.numero)));
  const contas = contasReceber.filter((c) => c.clienteId === cliente.id).sort((a, b) => String(b.vencimento).localeCompare(String(a.vencimento)));
  const totalGasto = contas.reduce((s, c) => s + pagoDe(c), 0);
  const emAberto = contas.filter(contaAberta).reduce((s, c) => s + restanteDe(c), 0);
  const linhaTempo = [
    ...historico.filter((h) => h.clienteId === cliente.id).map((h) => ({ data: h.data, texto: h.descricao, quem: h.usuario })),
    ...feitos.map((a) => ({ data: `${a.data}T${a.hora}:00`, texto: `🛁 ${mapaPet[a.petId]?.nome || "Pet"}: ${nomesServicos(a)}` })),
  ].sort((a, b) => String(b.data).localeCompare(String(a.data))).slice(0, 40);
  const endereco = [cliente.rua && `${cliente.rua}${cliente.numero ? ", " + cliente.numero : ""}`, cliente.complemento, cliente.bairro, cliente.cidade && `${cliente.cidade}${cliente.estado ? "/" + cliente.estado : ""}`, cliente.cep].filter(Boolean).join(" · ");

  return (
    <div className="pagina">
      <button className="voltar" onClick={voltar}><Icone nome="back" tam={18} /> Clientes</button>
      <header className="cliente-cab">
        <div>
          <span className="codigo codigo-grande">{cliente.codigo}</span>
          <h1>{cliente.nome}</h1>
          <p className="texto-suave">Cliente desde {fmtData(cliente.dataCadastro || cliente.criadoEm)} · veio pelo {cliente.origem || "—"}</p>
        </div>
        <div className="acoes-topo">
          <BotoesContato cliente={cliente} />
          {pode("agenda") && <button className="btn btn-ouro" onClick={() => novoAg({ clienteId: cliente.id })}><Icone nome="calendar" tam={18} /> Agendar</button>}
          <button className="btn btn-leve" onClick={editar}><Icone nome="edit" tam={18} /> Editar</button>
          {podeExcluir && <button className="btn btn-leve btn-texto-perigo" onClick={excluir} aria-label="Excluir cliente"><Icone nome="trash" tam={18} /></button>}
        </div>
      </header>

      <div className="mini-resumo">
        <div><b>{feitos.length}</b><span>atendimentos</span></div>
        <div><b>{proximos.length}</b><span>agendados</span></div>
        {pode("financeiro") && <div><b>{fmtMoeda(totalGasto)}</b><span>já pago</span></div>}
        {pode("financeiro") && <div className={emAberto > 0 ? "alerta-num" : ""}><b>{fmtMoeda(emAberto)}</b><span>em aberto</span></div>}
      </div>

      <div className="trilha">
        <section className="trilha-passo">
          <h2>Cliente</h2>
          <dl className="dados">
            <div><dt>WhatsApp</dt><dd>{fmtTel(cliente.whatsapp) || "—"}</dd></div>
            <div><dt>Telefone</dt><dd>{fmtTel(cliente.telefone) || "—"}</dd></div>
            <div><dt>E-mail</dt><dd>{cliente.email || "—"}</dd></div>
            <div><dt>CPF/CNPJ</dt><dd>{fmtDoc(cliente.documento) || "—"}</dd></div>
            <div><dt>Nascimento</dt><dd>{fmtData(cliente.nascimento)}</dd></div>
            <div className="dados-largo"><dt>Endereço</dt><dd>{endereco || "—"}</dd></div>
          </dl>
        </section>

        <section className="trilha-passo">
          <div className="painel-topo">
            <h2>Pets ({seusPets.length})</h2>
            <button className="btn btn-ouro btn-peq" onClick={novoPet}><Icone nome="plus" tam={16} /> Pet</button>
          </div>
          {seusPets.length === 0 ? <p className="texto-suave">Nenhum pet cadastrado para este cliente.</p> : (
            <div className="pets-cliente">
              {seusPets.map((p) => (
                <button key={p.id} className="pet-linha" onClick={() => abrirPet(p.id)}>
                  <AvatarPet pet={p} tam={46} />
                  <div>
                    <strong>{p.nome}</strong>
                    <span className="texto-suave peq">{[p.especie, p.raca, idadeTexto(p.nascimento)].filter(Boolean).join(" · ")}</span>
                  </div>
                  {(p.alergias || "").trim() && <span className="selo-alerta">alergia</span>}
                </button>
              ))}
            </div>
          )}
        </section>

        {pode("agenda") && (
          <section className="trilha-passo">
            <h2>Agendamentos</h2>
            {proximos.length === 0 ? <p className="texto-suave">Nenhum agendamento futuro.</p> : (
              <ul className="lista-mini">
                {proximos.map((a) => (
                  <li key={a.id} onClick={() => abrirAg(a.id)} role="button" tabIndex={0}>
                    <span>{fmtData(a.data)} {a.hora}</span><span>{mapaPet[a.petId]?.nome} · {nomesServicos(a)}</span><span className={`selo-status ${COR_STATUS_AG[a.status]}`}>{a.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {pode("agenda") && (
          <section className="trilha-passo">
            <h2>Serviços realizados</h2>
            {feitos.length === 0 ? <p className="texto-suave">Ainda sem atendimentos finalizados.</p> : (
              <ul className="lista-mini">
                {feitos.slice(0, 15).map((a) => (
                  <li key={a.id} onClick={() => abrirAg(a.id)} role="button" tabIndex={0}>
                    <span>{fmtData(a.data)}</span><span>{mapaPet[a.petId]?.nome} · {nomesServicos(a)}</span><b>{fmtMoeda(a.valor)}</b>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {pode("propostas") && (
          <section className="trilha-passo">
            <div className="painel-topo"><h2>Propostas</h2><button className="btn btn-leve btn-peq" onClick={() => novaProposta({ clienteId: cliente.id })}><Icone nome="plus" tam={15} /> Proposta</button></div>
            {props.length === 0 ? <p className="texto-suave">Nenhuma proposta.</p> : (
              <ul className="lista-mini">
                {props.map((p) => (
                  <li key={p.id} onClick={() => editarProposta(p)} role="button" tabIndex={0}>
                    <span className="codigo">{p.numero}</span><span>{fmtData(p.data)} · {fmtMoeda(totalProposta(p))}</span><span className={`selo-status ${COR_STATUS_PROPOSTA[statusProposta(p)]}`}>{statusProposta(p)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {pode("financeiro") && (
          <section className="trilha-passo">
            <h2>Pagamentos</h2>
            {contas.length === 0 ? <p className="texto-suave">Nenhum lançamento.</p> : (
              <ul className="lista-mini">
                {contas.map((c) => (
                  <li key={c.id} onClick={() => contaAberta(c) && pagarConta("receber", c)} role="button" tabIndex={0}>
                    <span>{fmtData(c.vencimento)}</span><span>{c.descricao || "—"} · {fmtMoeda(c.valor)}{pagoDe(c) > 0 && statusConta(c) !== "Pago" ? ` (falta ${fmtMoeda(restanteDe(c))})` : ""}</span>
                    <span className={`selo-status ${COR_STATUS_CONTA[statusConta(c)]}`}>{statusConta(c)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        <section className="trilha-passo">
          <h2>Observações</h2>
          <p className="observacoes">{cliente.observacoes || <span className="texto-suave">Sem observações.</span>}</p>
        </section>

        <section className="trilha-passo">
          <h2>Linha do tempo</h2>
          {linhaTempo.length === 0 ? <p className="texto-suave">Sem registros ainda.</p> : (
            <ol className="linha-tempo">
              {linhaTempo.map((h, i) => (
                <li key={i}><span className="lt-data">{fmtDataHora(h.data)}</span><span>{h.texto}{h.quem ? <span className="texto-suave"> — {h.quem}</span> : null}</span></li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}

// =====================================================================
//  FICHA DO PET
// =====================================================================
function FichaPet({ pet, cliente, historico, agendamentos, profissionais, pode, aoFechar, editar, excluir, abrirCliente, abrirAg, novoAg, podeExcluir }) {
  const config = useConfig();
  const atend = agendamentos.filter((a) => a.petId === pet.id && a.status === "Finalizado").sort((a, b) => `${b.data}${b.hora}`.localeCompare(`${a.data}${a.hora}`));
  const proximo = agendamentos.filter((a) => a.petId === pet.id && a.data >= hojeISO() && agAtivo(a) && a.status !== "Finalizado").sort((a, b) => `${a.data}${a.hora}`.localeCompare(`${b.data}${b.hora}`))[0];
  const registros = historico.filter((h) => h.petId === pet.id && h.tipo !== "atendimento").sort((a, b) => String(b.data).localeCompare(String(a.data)));
  const tel = cliente?.whatsapp || cliente?.telefone;
  const vars = varsMensagem({ config, cliente, pet });
  return (
    <Modal titulo={`Ficha · ${pet.codigo || ""}`} aoFechar={aoFechar} largo
      rodape={<>
        {podeExcluir && <button className="btn btn-leve btn-texto-perigo" onClick={excluir}><Icone nome="trash" tam={18} /> Excluir</button>}
        {pode("agenda") && <button className="btn btn-leve" onClick={() => novoAg({ clienteId: pet.clienteId, petId: pet.id })}><Icone nome="calendar" tam={18} /> Agendar</button>}
        <button className="btn btn-ouro" onClick={editar}><Icone nome="edit" tam={18} /> Editar</button>
      </>}>
      <div className="ficha">
        <div className="ficha-foto">
          {pet.foto ? <img src={pet.foto} alt={pet.nome} /> : <div className="ficha-foto-vazia"><Icone nome="paw" tam={64} /></div>}
        </div>
        <div className="ficha-cab">
          <h2>{pet.nome}</h2>
          <p>{[pet.especie, pet.raca, pet.sexo].filter(Boolean).join(" · ")}</p>
          {cliente && <button className="link" onClick={() => abrirCliente(cliente.id)}>Tutor: {cliente.nome} ({cliente.codigo})</button>}
          <div className="ficha-chips">
            {pet.nascimento && <span className="chip">{idadeTexto(pet.nascimento)}</span>}
            {pet.peso && <span className="chip">{pet.peso} kg</span>}
            {pet.porte && <span className="chip">Porte {pet.porte.toLowerCase()}</span>}
            {pet.temperamento && <span className="chip chip-ouro">{pet.temperamento}</span>}
          </div>
        </div>
      </div>
      {(pet.alergias || "").trim() && <div className="alerta alerta-erro"><Icone nome="alert" tam={18} /> <b>Alergia:</b> {pet.alergias}</div>}
      {(pet.cuidados || "").trim() && <div className="alerta alerta-info"><Icone nome="heart" tam={18} /> <b>Cuidados especiais:</b> {pet.cuidados}</div>}
      {proximo && <div className="alerta alerta-info"><Icone nome="calendar" tam={18} /> Próximo horário: <b>{fmtData(proximo.data)} às {proximo.hora}</b> ({nomesServicos(proximo)})</div>}

      <dl className="dados dados-ficha">
        <div><dt>Nascimento</dt><dd>{fmtData(pet.nascimento)}</dd></div>
        <div><dt>Cor</dt><dd>{pet.cor || "—"}</dd></div>
        <div><dt>Último banho</dt><dd>{fmtData(pet.ultimoBanho)}</dd></div>
        <div><dt>Última tosa</dt><dd>{fmtData(pet.ultimaTosa)}</dd></div>
        <div><dt>Próximo atendimento</dt><dd>{fmtData(pet.proximoAtendimento)}</dd></div>
        <div className="dados-largo"><dt>Vacinação</dt><dd>{pet.vacinacao || "—"}</dd></div>
        <div className="dados-largo"><dt>Observações</dt><dd>{pet.observacoes || "—"}</dd></div>
      </dl>

      {soDigitos(tel) && (
        <div className="acoes-topo mt10">
          <a className="btn btn-whats btn-peq" target="_blank" rel="noreferrer" href={linkWhats(tel, montarMsg(config.mensagens.retornoBanho, vars))}><Icone nome="whats" tam={15} /> Retorno de banho</a>
          <a className="btn btn-whats btn-peq" target="_blank" rel="noreferrer" href={linkWhats(tel, montarMsg(config.mensagens.retornoTosa, vars))}><Icone nome="whats" tam={15} /> Retorno de tosa</a>
          <a className="btn btn-whats btn-peq" target="_blank" rel="noreferrer" href={linkWhats(tel, montarMsg(config.mensagens.aniversario, vars))}><Icone nome="whats" tam={15} /> Aniversário</a>
        </div>
      )}

      <h3 className="form-secao">Histórico de atendimentos</h3>
      {atend.length === 0 ? <p className="texto-suave peq">Nenhum atendimento finalizado ainda. Quando um atendimento da agenda for finalizado, ele aparece aqui com observações, produtos e fotos.</p> : (
        <ol className="hist-pet">
          {atend.map((a) => (
            <li key={a.id} onClick={() => abrirAg(a.id)} role="button" tabIndex={0}>
              <div className="hp-topo"><b>{fmtData(a.data)}</b><span>{nomesServicos(a)}</span><span className="texto-suave peq">{profissionais.find((p) => p.id === a.profissionalId)?.nome || ""}</span></div>
              {a.finalizacao?.observacoes && <p className="peq">💬 {a.finalizacao.observacoes}</p>}
              {a.finalizacao?.produtos && <p className="peq">🧴 {a.finalizacao.produtos}</p>}
              {(a.finalizacao?.fotoAntes || a.finalizacao?.fotoDepois) && (
                <div className="hp-fotos">
                  {a.finalizacao.fotoAntes && <figure><img src={a.finalizacao.fotoAntes} alt="Antes" /><figcaption>Antes</figcaption></figure>}
                  {a.finalizacao.fotoDepois && <figure><img src={a.finalizacao.fotoDepois} alt="Depois" /><figcaption>Depois</figcaption></figure>}
                </div>
              )}
            </li>
          ))}
        </ol>
      )}
      {registros.length > 0 && (
        <>
          <h3 className="form-secao">Alterações na ficha</h3>
          <ol className="linha-tempo">
            {registros.slice(0, 10).map((h) => <li key={h.id}><span className="lt-data">{fmtDataHora(h.data)}</span><span>{h.descricao}</span></li>)}
          </ol>
        </>
      )}
    </Modal>
  );
}

// =====================================================================
//  PEDIDOS DE AGENDAMENTO QUE CHEGAM PELO SITE
// =====================================================================
function PainelPedidos({ pedidos, clientes, mudarStatus, cadastrar, agendar }) {
  const config = useConfig();
  const hoje = hojeISO();
  const lista = pedidos
    .filter((p) => p.status === "novo" || (p.status === "confirmado" && (p.data || "") >= hoje))
    .sort((a, b) => (a.status === b.status ? `${a.data}${a.horario}`.localeCompare(`${b.data}${b.horario}`) : a.status === "novo" ? -1 : 1));
  if (!lista.length) return null;
  const clientePorTel = Object.fromEntries(clientes.map((c) => [soDigitos(c.whatsapp || c.telefone), c]).filter(([k]) => k));
  return (
    <section className="painel painel-pedidos">
      <div className="painel-topo"><h2>Pedidos pelo site</h2><Icone nome="globo" /></div>
      <ul className="pedidos">
        {lista.map((p) => {
          const cli = clientePorTel[soDigitos(p.whatsapp)];
          const msg = `Olá, ${primeiroNome(p.nome)}! Aqui é do ${config.nome} 🐶\nRecebemos seu pedido de ${(p.servicos || []).join(", ")} para o(a) ${p.pet} no dia ${fmtData(p.data)} às ${p.horario}. Podemos confirmar?`;
          return (
            <li key={p.id} className={`pedido pedido-${p.status}`}>
              <div className="pedido-info">
                <div className="pedido-linha1"><strong>{p.nome}</strong><span className={`chip ${p.status === "novo" ? "chip-ouro" : ""}`}>{p.status}</span>{cli && <span className="chip">cliente {cli.codigo}</span>}</div>
                <span>🐾 {p.pet}{p.especie ? ` (${p.especie}${p.porte ? ", " + p.porte.toLowerCase() : ""})` : ""} · {(p.servicos || []).join(", ")}</span>
                <span className="texto-suave peq">📅 {fmtData(p.data)} às {p.horario} · {fmtTel(p.whatsapp)}</span>
                {p.observacoes && <span className="texto-suave peq">“{p.observacoes}”</span>}
              </div>
              <div className="pedido-acoes">
                <a className="btn btn-whats btn-peq" href={linkWhats(p.whatsapp, msg)} target="_blank" rel="noreferrer"><Icone nome="whats" tam={15} /> WhatsApp</a>
                {cli ? <button className="btn btn-ouro btn-peq" onClick={() => agendar(p, cli)}><Icone nome="calendar" tam={15} /> Agendar</button>
                  : <button className="btn btn-ouro btn-peq" onClick={() => cadastrar(p)}><Icone nome="plus" tam={15} /> Cadastrar cliente</button>}
                <button className="btn-icone" title="Arquivar pedido" aria-label="Arquivar pedido" onClick={() => mudarStatus(p, "arquivado")}><Icone nome="x" tam={16} /></button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// =====================================================================
//  ESTRUTURA PRINCIPAL (menu, topo, botão + Novo, janelas)
// =====================================================================
function Sistema({ usuario }) {
  const [dados, setDados] = useState({ clientes: [], pets: [], historico: [], pedidos_site: [], servicos: [], profissionais: [], agendamentos: [], propostas: [], contas_receber: [], contas_pagar: [], campanhas: [], users: [] });
  const [configBruta, setConfigBruta] = useState(null);
  const config = useMemo(() => juntarConfig(configBruta), [configBruta]);
  const [pagina, setPagina] = useState("dashboard");
  const [clienteAberto, setClienteAberto] = useState(null);
  const [petAberto, setPetAberto] = useState(null);
  const [agAberto, setAgAberto] = useState(null);
  const [janela, setJanela] = useState(null); // { tipo, dados }
  const [confirmacao, setConfirmacao] = useState(null);
  const [whatsPos, setWhatsPos] = useState(null);
  const [menuMovel, setMenuMovel] = useState(false);
  const [fabAberto, setFabAberto] = useState(false);
  const [toast, setToast] = useState(null);
  const mimi = useMimi();

  const permitidos = modulosDoUsuario(usuario);
  const pode = useCallback((m) => permitidos.includes(m), [permitidos]);
  const podeExcluir = usuario.papel === "administrador";
  const { clientes, pets, historico, servicos, profissionais, agendamentos, propostas, campanhas } = dados;
  const pedidos = dados.pedidos_site;
  const contasReceber = dados.contas_receber;
  const contasPagar = dados.contas_pagar;

  useEffect(() => {
    const cols = ["clientes", "pets", "historico", "pedidos_site", "servicos", "profissionais", "agendamentos", "propostas", "contas_receber", "contas_pagar", "campanhas"];
    if (usuario.papel === "administrador") cols.push("users");
    const subs = cols.map((c) => db.ouvir(c, (l) => setDados((d) => ({ ...d, [c]: l }))));
    subs.push(db.ouvirDoc("configuracoes", "empresa", setConfigBruta));
    return () => subs.forEach((u) => u());
  }, [usuario.papel]);

  const avisar = useCallback((texto, tipo = "ok") => {
    setToast({ texto, tipo, id: Date.now() });
    setTimeout(() => setToast(null), 3400);
  }, []);
  const erroSalvar = (e) => avisar(traduzErro(e), "aviso");

  const irPara = (id) => {
    if (!pode(id)) return;
    setPagina(id); setClienteAberto(null); setMenuMovel(false); setFabAberto(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const abrirCliente = (id) => { if (!id || !pode("clientes")) return; setPetAberto(null); setAgAberto(null); setPagina("clientes"); setClienteAberto(id); setMenuMovel(false); window.scrollTo({ top: 0 }); };
  const abrirPet = (id) => setPetAberto(id);
  const abrirAg = (id) => setAgAberto(id);
  const abrir = (tipo, d = {}) => { setFabAberto(false); setJanela({ tipo, dados: d }); };
  const fechar = () => setJanela(null);
  const mapaCli = useMemo(() => Object.fromEntries(clientes.map((c) => [c.id, c])), [clientes]);
  const mapaPet = useMemo(() => Object.fromEntries(pets.map((p) => [p.id, p])), [pets]);

  const confirmarExclusao = (titulo, texto, acao) => setConfirmacao({ titulo, texto, acao: async () => { try { await acao(); setConfirmacao(null); } catch (e) { erroSalvar(e); } } });

  // ---------------- CLIENTES E PETS ----------------
  const salvarCliente = async (dadosForm) => {
    const { _pedidoId, _agendarDepois, ...d } = dadosForm;
    let id = d.id;
    if (d.id) {
      const { id: _i, ...resto } = d;
      await db.atualizar("clientes", d.id, resto);
      await registrarHistorico(usuario, "cliente", "Dados do cliente atualizados", { clienteId: d.id });
      avisar("Cliente atualizado");
      mimi.comemorar("Prontinho, atualizei os dados! ✅");
    } else {
      const n = await db.proximoNumero("clientes");
      const novo = { ...d, codigo: codigo("CLI", n), dataCadastro: hojeISO() };
      id = await db.adicionar("clientes", novo);
      await registrarHistorico(usuario, "cliente", `Cliente ${novo.nome} cadastrado (${novo.codigo})`, { clienteId: id });
      avisar(`Cliente ${novo.codigo} cadastrado`);
      mimi.comemorar(`Oba! ${primeiroNome(novo.nome)} agora faz parte da família Mimi! 🎉`);
    }
    if (_pedidoId) { try { await db.atualizar("pedidos_site", _pedidoId, { clienteId: id }); } catch (e) { console.error(e); } }
    fechar();
    if (_agendarDepois) setTimeout(() => abrir("pet", { clienteId: id, clienteIdFixo: true, nome: _agendarDepois.pet || "", especie: _agendarDepois.especie || "Cão", porte: _agendarDepois.porte || "Pequeno", _pedido: _agendarDepois }), 50);
  };

  const salvarPet = async (dadosForm) => {
    const { clienteIdFixo, _pedido, ...p } = dadosForm;
    let id = p.id;
    if (p.id) {
      const { id: _i, ...resto } = p;
      await db.atualizar("pets", p.id, resto);
      await registrarHistorico(usuario, "pet", `Ficha do ${resto.nome} atualizada`, { clienteId: resto.clienteId, petId: p.id });
      avisar("Pet atualizado");
      mimi.comemorar(`Ficha do ${resto.nome} atualizada! 🐾`);
    } else {
      const n = await db.proximoNumero("pets");
      const novo = { ...p, codigo: codigo("PET", n) };
      id = await db.adicionar("pets", novo);
      await registrarHistorico(usuario, "pet", `Pet ${novo.nome} cadastrado (${novo.codigo})`, { clienteId: novo.clienteId, petId: id });
      avisar(`${novo.nome} cadastrado`);
      mimi.comemorar(`Au au! Bem-vindo, ${novo.nome}! 🐶💙`);
    }
    fechar();
    if (_pedido && pode("agenda")) setTimeout(() => agendarPedido(_pedido, { id: p.clienteId }, id), 50);
  };

  const excluirCliente = (c) => {
    const n = pets.filter((p) => p.clienteId === c.id).length;
    confirmarExclusao("Excluir cliente?", `Isso vai apagar ${c.nome} (${c.codigo})${n ? ` e ${n === 1 ? "o pet dele" : `os ${n} pets dele`}` : ""}. Agendamentos e contas continuam guardados. Essa ação não pode ser desfeita.`, async () => {
      for (const p of pets.filter((x) => x.clienteId === c.id)) await db.remover("pets", p.id);
      await db.remover("clientes", c.id);
      await registrarHistorico(usuario, "exclusao", `Cliente ${c.nome} (${c.codigo}) excluído`);
      setClienteAberto(null);
      avisar("Cliente excluído");
    });
  };
  const excluirPet = (p) => confirmarExclusao("Excluir pet?", `Isso vai apagar a ficha de ${p.nome} (${p.codigo}). Essa ação não pode ser desfeita.`, async () => {
    await db.remover("pets", p.id);
    await registrarHistorico(usuario, "exclusao", `Pet ${p.nome} (${p.codigo}) excluído`, { clienteId: p.clienteId });
    setPetAberto(null);
    avisar("Pet excluído");
  });
  const novoPet = (clienteId) => {
    if (!clientes.length) { avisar("Cadastre um cliente antes do pet", "aviso"); return; }
    abrir("pet", clienteId ? { clienteId, clienteIdFixo: true } : {});
  };

  // ---------------- AGENDA ----------------
  const novoAg = (d = {}) => {
    if (!clientes.length) { avisar("Cadastre um cliente primeiro", "aviso"); abrir("cliente"); return; }
    abrir("agendamento", d);
  };
  const salvarAg = async (d) => {
    const { _pedidoId, ...ag } = d;
    const cli = mapaCli[ag.clienteId];
    const pet = mapaPet[ag.petId];
    if (ag.id) {
      const { id, ...resto } = ag;
      await db.atualizar("agendamentos", id, resto);
      await registrarHistorico(usuario, "agenda", `Agendamento de ${pet?.nome} alterado para ${fmtData(ag.data)} ${ag.hora}`, { clienteId: ag.clienteId, petId: ag.petId });
      avisar("Agendamento atualizado");
    } else {
      const id = await db.adicionar("agendamentos", { ...ag, criadoPor: usuario.nome || "" });
      await registrarHistorico(usuario, "agenda", `Agendado: ${pet?.nome} — ${nomesServicos(ag)} em ${fmtData(ag.data)} às ${ag.hora}`, { clienteId: ag.clienteId, petId: ag.petId, agendamentoId: id });
      if (_pedidoId) { try { await db.atualizar("pedidos_site", _pedidoId, { status: "agendado", agendamentoId: id }); } catch (e) { console.error(e); } }
      mimi.comemorar(`Anotado! ${pet?.nome || "O pet"} vem ${ag.data === hojeISO() ? "hoje" : `dia ${fmtData(ag.data)}`} às ${ag.hora} 📅`);
      const tel = cli?.whatsapp || cli?.telefone;
      if (soDigitos(tel)) {
        setWhatsPos({ titulo: "Agendamento salvo! 🎉", texto: `Quer enviar a confirmação para ${primeiroNome(cli.nome)} pelo WhatsApp?`, link: linkWhats(tel, montarMsg(config.mensagens.confirmacao, varsMensagem({ config, cliente: cli, pet, ag }))) });
      } else avisar("Agendamento salvo");
    }
    fechar();
  };
  const mudarStatusAg = async (a, status) => {
    if (status === "Finalizado") { setAgAberto(null); abrir("finalizar", a); return; }
    try {
      await db.atualizar("agendamentos", a.id, { status });
      await registrarHistorico(usuario, "agenda", `${mapaPet[a.petId]?.nome}: status ${status}`, { clienteId: a.clienteId, petId: a.petId });
      avisar(`Status: ${status}`);
      if (status === "Em atendimento") mimi.falar(`Hora do banho do ${mapaPet[a.petId]?.nome || "pet"}! 🛁`, 4000);
    } catch (e) { erroSalvar(e); }
  };
  const finalizarAg = async (a, f) => {
    const pet = mapaPet[a.petId];
    const finalizacao = { observacoes: f.observacoes, produtos: f.produtos, fotoAntes: f.fotoAntes, fotoDepois: f.fotoDepois, em: new Date().toISOString(), por: usuario.nome || "" };
    let contaReceberId = a.contaReceberId || "";
    if (f.gerarCobranca && !a.contaReceberId && (Number(a.valor) || 0) > 0) {
      contaReceberId = await db.adicionar("contas_receber", {
        clienteId: a.clienteId, petId: a.petId, agendamentoId: a.id, descricao: `${nomesServicos(a)} — ${pet?.nome || ""}`,
        valor: Number(a.valor) || 0, vencimento: a.data, formaPagamento: f.forma,
        pagamentos: f.jaPago ? [{ data: hojeISO(), valor: Number(a.valor) || 0, forma: f.forma }] : [],
      });
    }
    await db.atualizar("agendamentos", a.id, { status: "Finalizado", finalizacao, contaReceberId });
    if (pet) {
      const atual = {};
      if (temServico(a, "banho")) atual.ultimoBanho = a.data;
      if (temServico(a, "tosa")) atual.ultimaTosa = a.data;
      if (f.retornoDias) atual.proximoAtendimento = somaDias(a.data, Number(f.retornoDias));
      if (Object.keys(atual).length) await db.atualizar("pets", pet.id, atual);
    }
    await registrarHistorico(usuario, "atendimento", `Atendimento finalizado: ${pet?.nome} — ${nomesServicos(a)}`, { clienteId: a.clienteId, petId: a.petId, agendamentoId: a.id });
    fechar();
    avisar("Atendimento finalizado");
    mimi.comemorar(`${pet?.nome || "O pet"} tá cheiroso e feliz! ✨🐶`);
  };
  const excluirAg = (a) => confirmarExclusao("Excluir agendamento?", `Isso apaga o agendamento de ${mapaPet[a.petId]?.nome || "pet"} em ${fmtData(a.data)} às ${a.hora}. Se o cliente só desmarcou, prefira mudar o status para “Cancelado”.`, async () => {
    await db.remover("agendamentos", a.id);
    await registrarHistorico(usuario, "exclusao", `Agendamento de ${mapaPet[a.petId]?.nome} em ${fmtData(a.data)} excluído`, { clienteId: a.clienteId });
    setAgAberto(null);
    avisar("Agendamento excluído");
  });
  const agendarPedido = (pd, cli, petIdNovo) => {
    const petsCli = pets.filter((p) => p.clienteId === cli.id);
    const pet = petIdNovo ? { id: petIdNovo } : petsCli.find((p) => contem(p.nome, pd.pet)) || (petsCli.length === 1 ? petsCli[0] : null);
    const servs = servicos.filter((s) => (pd.servicos || []).some((n) => contem(s.nome, n) || contem(n, s.nome)))
      .map((s) => ({ id: s.id, nome: s.nome, preco: Number(s.preco) || 0, duracao: Number(s.duracao) || 30 }));
    if (!pet && !petsCli.length) {
      abrir("pet", { clienteId: cli.id, clienteIdFixo: true, nome: pd.pet || "", especie: pd.especie || "Cão", porte: pd.porte || "Pequeno", _pedido: pd });
      return;
    }
    abrir("agendamento", {
      clienteId: cli.id, petId: pet?.id || "", servicos: servs, data: pd.data, hora: pd.horario,
      duracao: servs.reduce((a, s) => a + s.duracao, 0) || 60, valor: arred(servs.reduce((a, s) => a + s.preco, 0)),
      observacoes: [pd.observacoes, "Pedido pelo site"].filter(Boolean).join(" · "), status: "Confirmado", _pedidoId: pd.id,
    });
  };

  // ---------------- PROPOSTAS ----------------
  const salvarProposta = async (p) => {
    if (p.id) {
      const { id, ...resto } = p;
      await db.atualizar("propostas", id, resto);
      avisar(`Proposta ${p.numero} salva`);
    } else {
      const n = await db.proximoNumero("propostas");
      const numero = codigo("PROP", n);
      await db.adicionar("propostas", { ...p, numero, criadoPor: usuario.nome || "" });
      await registrarHistorico(usuario, "proposta", `Proposta ${numero} criada (${fmtMoeda(totalProposta(p))})`, { clienteId: p.clienteId, petId: p.petId });
      avisar(`Proposta ${numero} criada`);
      mimi.comemorar("Proposta prontinha! Já pode gerar o PDF ou mandar no WhatsApp 📄");
    }
    fechar();
  };
  const mudarStatusProposta = async (p, status) => {
    try {
      await db.atualizar("propostas", p.id, { status });
      await registrarHistorico(usuario, "proposta", `Proposta ${p.numero}: ${status}`, { clienteId: p.clienteId });
      avisar(`Proposta ${status.toLowerCase()}`);
      if (status === "Aprovada") mimi.comemorar("Proposta aprovada! 🎉 Que tal já gerar a cobrança?");
    } catch (e) { erroSalvar(e); }
  };
  const enviarProposta = async (p) => {
    const cli = mapaCli[p.clienteId];
    const pet = mapaPet[p.petId];
    const itens = (p.itens || []).map((i) => `• ${i.descricao}${Number(i.quantidade) !== 1 ? ` (${i.quantidade}x)` : ""} — ${fmtMoeda(i.quantidade * i.valorUnit)}`).join("\n");
    const msg = montarMsg(config.mensagens.proposta, { ...varsMensagem({ config, cliente: cli, pet }), numero: p.numero, itens, valor: fmtMoeda(totalProposta(p)), validade: fmtData(p.validade) });
    window.open(linkWhats(cli?.whatsapp || cli?.telefone, msg), "_blank");
    if (p.status === "Rascunho") { try { await db.atualizar("propostas", p.id, { status: "Aguardando aprovação" }); } catch (e) { console.error(e); } }
  };
  const gerarCobrancaProposta = async (p) => {
    try {
      const id = await db.adicionar("contas_receber", {
        clienteId: p.clienteId, petId: p.petId || "", descricao: (p.itens || []).map((i) => i.descricao).join(", "), propostaNumero: p.numero,
        valor: totalProposta(p), vencimento: hojeISO(), formaPagamento: p.formaPagamento || "", pagamentos: [],
      });
      await db.atualizar("propostas", p.id, { contaReceberId: id });
      avisar("Cobrança lançada em Contas a receber");
    } catch (e) { erroSalvar(e); }
  };

  // ---------------- FINANCEIRO ----------------
  const colConta = (tipo) => (tipo === "receber" ? "contas_receber" : "contas_pagar");
  const salvarConta = async (tipo, c) => {
    if (c.id) { const { id, ...resto } = c; await db.atualizar(colConta(tipo), id, resto); }
    else await db.adicionar(colConta(tipo), c);
    await registrarHistorico(usuario, "financeiro", `Conta a ${tipo} ${c.id ? "alterada" : "lançada"}: ${c.descricao || c.fornecedor || ""} ${fmtMoeda(c.valor)}`, { clienteId: c.clienteId || "" });
    avisar(c.id ? "Conta atualizada" : "Conta lançada");
    fechar();
  };
  const registrarPagamento = async (tipo, conta, pag) => {
    const pagamentos = [...(conta.pagamentos || []), pag];
    await db.atualizar(colConta(tipo), conta.id, { pagamentos, dataPagamento: pag.data });
    const nova = { ...conta, pagamentos };
    await registrarHistorico(usuario, "financeiro", `${tipo === "receber" ? "Recebido" : "Pago"} ${fmtMoeda(pag.valor)} (${pag.forma}) — ${conta.descricao || conta.fornecedor || ""}`, { clienteId: conta.clienteId || "" });
    fechar();
    if (tipo === "receber") {
      mimi.comemorar(restanteDe(nova) > 0 ? `Recebido! Ainda faltam ${fmtMoeda(restanteDe(nova))} 💰` : "Conta quitada! 💰✨");
      const cli = mapaCli[conta.clienteId];
      const tel = cli?.whatsapp || cli?.telefone;
      if (soDigitos(tel)) setWhatsPos({ titulo: "Pagamento registrado ✅", texto: `Enviar agradecimento para ${primeiroNome(cli.nome)}?`, link: linkWhats(tel, montarMsg(config.mensagens.pagamento, { ...varsMensagem({ config, cliente: cli }), valor: fmtMoeda(pag.valor), servico: conta.descricao || "atendimento" })) });
      else avisar("Pagamento registrado");
    } else avisar("Pagamento registrado");
  };
  const cobrar = (c) => {
    const cli = mapaCli[c.clienteId];
    window.open(linkWhats(cli?.whatsapp || cli?.telefone, montarMsg(config.mensagens.cobranca, { ...varsMensagem({ config, cliente: cli }), valor: fmtMoeda(restanteDe(c)), servico: c.descricao || "atendimento", vencimento: fmtData(c.vencimento) })), "_blank");
  };
  const excluirConta = (tipo, c) => confirmarExclusao("Excluir conta?", `Apagar ${c.descricao || c.fornecedor || "esta conta"} de ${fmtMoeda(c.valor)}? Se só não vai mais acontecer, prefira editar e marcar como cancelada.`, async () => {
    await db.remover(colConta(tipo), c.id);
    await registrarHistorico(usuario, "exclusao", `Conta a ${tipo} excluída: ${c.descricao || c.fornecedor || ""} ${fmtMoeda(c.valor)}`);
    avisar("Conta excluída");
  });

  // ---------------- MARKETING ----------------
  const salvarCampanha = async (c) => {
    if (c.id) { const { id, ...resto } = c; await db.atualizar("campanhas", id, resto); } else await db.adicionar("campanhas", c);
    avisar("Campanha salva");
    fechar();
  };
  const publicarSite = async (texto) => {
    try { await db.salvarDoc("configuracoes", "empresa", { avisoSite: texto }); avisar(texto ? "Aviso publicado no site" : "Aviso removido do site"); } catch (e) { erroSalvar(e); }
  };

  // ---------------- CONFIGURAÇÕES ----------------
  const crud = {
    salvar: async (col, d) => { if (d.id) { const { id, ...resto } = d; await db.atualizar(col, id, resto); } else await db.adicionar(col, d); },
    excluir: (col, d, nome) => confirmarExclusao("Excluir?", `Apagar “${nome}”? Agendamentos antigos continuam guardados.`, async () => { await db.remover(col, d.id); avisar("Excluído"); }),
  };

  // ---------------- MONTAGEM DA TELA ----------------
  const clienteSel = clientes.find((c) => c.id === clienteAberto);
  const petSel = pets.find((p) => p.id === petAberto);
  const agSel = agendamentos.find((a) => a.id === agAberto);

  let conteudo = null;
  if (!pode(pagina)) conteudo = <Vazio titulo="Sem acesso" texto="Seu usuário não tem permissão para essa área. Fale com o administrador." />;
  else if (pagina === "dashboard") conteudo = (
    <Dashboard usuario={usuario} clientes={clientes} pets={pets} pedidos={pedidos} agendamentos={agendamentos} contasReceber={contasReceber} propostas={propostas} profissionais={profissionais}
      pode={pode} irPara={irPara} abrirPet={abrirPet} abrirAg={abrirAg} mudarStatusAg={mudarStatusAg}
      painelPedidos={pode("clientes") ? (
        <PainelPedidos pedidos={pedidos} clientes={clientes}
          mudarStatus={async (pd, status) => { try { await db.atualizar("pedidos_site", pd.id, { status }); avisar("Pedido arquivado"); } catch (e) { erroSalvar(e); } }}
          cadastrar={(pd) => abrir("cliente", { nome: pd.nome, whatsapp: pd.whatsapp, origem: "Site", observacoes: pd.observacoes || "", _pedidoId: pd.id, _agendarDepois: pode("agenda") ? pd : null })}
          agendar={agendarPedido} />
      ) : null} />
  );
  else if (pagina === "clientes" && clienteSel) conteudo = (
    <DetalheCliente cliente={clienteSel} pets={pets} historico={historico} agendamentos={agendamentos} propostas={propostas} contasReceber={contasReceber} pode={pode}
      voltar={() => setClienteAberto(null)} editar={() => abrir("cliente", clienteSel)} excluir={() => excluirCliente(clienteSel)}
      novoPet={() => novoPet(clienteSel.id)} abrirPet={abrirPet} abrirAg={abrirAg} novoAg={novoAg}
      novaProposta={(d) => abrir("proposta", d)} editarProposta={(p) => abrir("proposta", p)} pagarConta={(t, c) => abrir("pagamento", { tipo: t, conta: c })} podeExcluir={podeExcluir} />
  );
  else if (pagina === "clientes") conteudo = (
    <ListaClientes clientes={clientes} pets={pets} abrirCliente={abrirCliente} novoCliente={() => abrir("cliente")}
      editarCliente={(c) => abrir("cliente", c)} excluirCliente={excluirCliente} podeExcluir={podeExcluir} />
  );
  else if (pagina === "pets") conteudo = <ListaPets pets={pets} clientes={clientes} abrirPet={abrirPet} novoPet={novoPet} />;
  else if (pagina === "agenda") conteudo = <Agenda agendamentos={agendamentos} clientes={clientes} pets={pets} profissionais={profissionais} novoAg={novoAg} abrirAg={abrirAg} />;
  else if (pagina === "propostas") conteudo = (
    <Propostas propostas={propostas} clientes={clientes} pets={pets} novaProposta={(d) => abrir("proposta", d)} editar={(p) => abrir("proposta", p)}
      excluir={(p) => confirmarExclusao("Excluir proposta?", `Apagar a proposta ${p.numero}?`, async () => { await db.remover("propostas", p.id); avisar("Proposta excluída"); })}
      mudarStatus={mudarStatusProposta} gerarCobranca={gerarCobrancaProposta} enviarWhats={enviarProposta} podeExcluir={podeExcluir} />
  );
  else if (pagina === "financeiro") conteudo = (
    <Financeiro contasReceber={contasReceber} contasPagar={contasPagar} clientes={clientes}
      novaConta={(tipo) => abrir("conta", { tipo, conta: {} })} editarConta={(tipo, c) => abrir("conta", { tipo, conta: c })}
      pagarConta={(tipo, c) => abrir("pagamento", { tipo, conta: c })} excluirConta={excluirConta} cobrar={cobrar} podeExcluir={podeExcluir} />
  );
  else if (pagina === "marketing") conteudo = (
    <Marketing campanhas={campanhas} clientes={clientes} pets={pets} agendamentos={agendamentos} novaCampanha={(d) => abrir("campanha", d)}
      editar={(c) => abrir("campanha", c)} enviar={(c) => abrir("enviarCampanha", c)} podeExcluir={podeExcluir}
      excluir={(c) => confirmarExclusao("Excluir campanha?", `Apagar a campanha “${c.nome}”?`, async () => { await db.remover("campanhas", c.id); avisar("Campanha excluída"); })} />
  );
  else if (pagina === "relatorios") conteudo = <Relatorios clientes={clientes} pets={pets} agendamentos={agendamentos} contasReceber={contasReceber} contasPagar={contasPagar} profissionais={profissionais} />;
  else if (pagina === "configuracoes") conteudo = (
    <Configuracoes usuario={usuario} servicos={servicos} profissionais={profissionais}
      usuarios={MODO_DEMO ? USUARIOS_DEMO.map((u) => ({ ...u, id: u.uid })) : dados.users}
      dadosBackup={{ clientes, pets, servicos, profissionais, agendamentos, propostas, contas_receber: contasReceber, contas_pagar: contasPagar, campanhas, pedidos_site: pedidos, historico }}
      salvarConfig={(d) => db.salvarDoc("configuracoes", "empresa", d)} crud={crud} avisar={avisar} />
  );

  const modulosMenu = MODULOS.filter((m) => pode(m.id));
  const navInferior = modulosMenu.filter((m) => ["dashboard", "clientes", "agenda", "pets", "financeiro", "relatorios"].includes(m.id)).slice(0, 4);
  const itensNovo = [
    pode("clientes") && { rotulo: "Novo cliente", icone: "users", acao: () => abrir("cliente") },
    pode("pets") && { rotulo: "Novo pet", icone: "paw", acao: () => { setFabAberto(false); novoPet(); } },
    pode("agenda") && { rotulo: "Novo agendamento", icone: "calendar", acao: () => { setFabAberto(false); novoAg(); } },
    pode("propostas") && { rotulo: "Nova proposta", icone: "file", acao: () => abrir("proposta") },
    pode("financeiro") && { rotulo: "Novo lançamento financeiro", icone: "wallet", acao: () => abrir("conta", { tipo: "receber", conta: {} }) },
    pode("financeiro") && { rotulo: "Nova despesa", icone: "wallet", acao: () => abrir("conta", { tipo: "pagar", conta: {} }) },
  ].filter(Boolean);
  const qtdAvisos = pedidos.filter((p) => p.status === "novo").length + (pode("financeiro") ? contasReceber.filter((c) => statusConta(c) === "Atrasado").length : 0);
  const J = janela;

  return (
    <ConfigCtx.Provider value={config}>
      <div className="app">
        <aside className={`menu-lateral ${menuMovel ? "aberto" : ""}`}>
          <div className="menu-marca">
            <img src={logoDe(config)} alt="" />
            <div><strong>Mimi Dog's</strong><span>Pet Shop</span></div>
          </div>
          <nav className="menu-nav">
            {modulosMenu.map((m) => (
              <button key={m.id} className={`menu-item ${pagina === m.id ? "ativo" : ""}`} onClick={() => irPara(m.id)}>
                <Icone nome={m.icone} tam={20} /><span>{m.nome}</span>
              </button>
            ))}
          </nav>
          <a className="menu-item menu-site" href="#/" target="_blank" rel="noreferrer"><Icone nome="globo" tam={20} /><span>Ver o site</span></a>
          <div className="menu-usuario">
            <div className="menu-avatar">{primeiroNome(usuario.nome).slice(0, 1).toUpperCase()}</div>
            <div className="menu-usuario-info"><strong>{usuario.nome}</strong><span>{NOME_PAPEL[usuario.papel] || usuario.papel}</span></div>
            <button className="btn-icone claro" onClick={() => autenticacao.sair()} aria-label="Sair"><Icone nome="logout" tam={18} /></button>
          </div>
        </aside>
        {menuMovel && <div className="menu-fundo" onClick={() => setMenuMovel(false)} />}

        <main className="principal">
          <div className="topo">
            <button className="btn-icone so-movel" onClick={() => setMenuMovel(true)} aria-label="Abrir menu"><Icone nome="menu" /></button>
            <img src={logoDe(config)} alt="" className="topo-logo so-movel" />
            <BuscaGlobal clientes={clientes} pets={pets} abrirCliente={abrirCliente} abrirPet={abrirPet} podeClientes={pode("clientes")} />
            <button className="btn-icone sino" onClick={() => irPara("dashboard")} aria-label={`${qtdAvisos} avisos`}>
              <Icone nome="bell" />{qtdAvisos > 0 && <span className="sino-num">{qtdAvisos}</span>}
            </button>
          </div>
          {MODO_DEMO && <div className="faixa-demo">Modo de teste: os dados ficam só neste navegador.</div>}
          {usuario.erroPerfil && <div className="alerta alerta-erro">Não consegui ler seu perfil no banco de dados: {usuario.erroPerfil}</div>}
          {conteudo}
        </main>

        <nav className="nav-inferior">
          {navInferior.map((m) => (
            <button key={m.id} className={pagina === m.id ? "ativo" : ""} onClick={() => irPara(m.id)}><Icone nome={m.icone} tam={22} /><span>{m.curto}</span></button>
          ))}
          <button onClick={() => setMenuMovel(true)}><Icone nome="menu" tam={22} /><span>Mais</span></button>
        </nav>

        {itensNovo.length > 0 && (
          <div className={`fab ${fabAberto ? "aberto" : ""}`}>
            {fabAberto && (
              <div className="fab-menu">
                {itensNovo.map((it) => <button key={it.rotulo} onClick={it.acao}><Icone nome={it.icone} tam={18} /><span>{it.rotulo}</span></button>)}
              </div>
            )}
            <button className="fab-botao" onClick={() => setFabAberto((x) => !x)} aria-expanded={fabAberto}><Icone nome={fabAberto ? "x" : "plus"} tam={22} /><span>Novo</span></button>
          </div>
        )}
        {fabAberto && <div className="fab-fundo" onClick={() => setFabAberto(false)} />}

        {petSel && !J && (
          <FichaPet pet={petSel} cliente={mapaCli[petSel.clienteId]} historico={historico} agendamentos={agendamentos} profissionais={profissionais} pode={pode}
            aoFechar={() => setPetAberto(null)} editar={() => abrir("pet", petSel)} excluir={() => excluirPet(petSel)}
            abrirCliente={abrirCliente} abrirAg={(id) => { setPetAberto(null); abrirAg(id); }} novoAg={(d) => { setPetAberto(null); novoAg(d); }} podeExcluir={podeExcluir} />
        )}
        {agSel && !J && !petSel && (
          <DetalheAgendamento ag={agSel} cliente={mapaCli[agSel.clienteId]} pet={mapaPet[agSel.petId]} profissional={profissionais.find((p) => p.id === agSel.profissionalId)}
            aoFechar={() => setAgAberto(null)} editar={() => { setAgAberto(null); abrir("agendamento", agSel); }} excluir={() => excluirAg(agSel)}
            mudarStatus={mudarStatusAg} finalizar={() => { setAgAberto(null); abrir("finalizar", agSel); }} abrirCliente={abrirCliente} podeExcluir={podeExcluir} />
        )}

        {J?.tipo === "cliente" && <FormCliente inicial={J.dados} aoFechar={fechar} aoSalvar={salvarCliente} />}
        {J?.tipo === "pet" && <FormPet inicial={J.dados} clientes={clientes} aoFechar={fechar} aoSalvar={salvarPet} />}
        {J?.tipo === "agendamento" && <FormAgendamento inicial={J.dados} clientes={clientes} pets={pets} servicos={servicos} profissionais={profissionais} agendamentos={agendamentos} aoFechar={fechar} aoSalvar={salvarAg} novoPet={(cid) => abrir("pet", { clienteId: cid, clienteIdFixo: true })} />}
        {J?.tipo === "finalizar" && <FinalizarAtendimento ag={J.dados} pet={mapaPet[J.dados.petId]} aoFechar={fechar} aoConfirmar={(f) => finalizarAg(J.dados, f)} />}
        {J?.tipo === "proposta" && <FormProposta inicial={J.dados} clientes={clientes} pets={pets} servicos={servicos} aoFechar={fechar} aoSalvar={salvarProposta} />}
        {J?.tipo === "conta" && <FormConta tipo={J.dados.tipo} inicial={J.dados.conta} clientes={clientes} aoFechar={fechar} aoSalvar={(c) => salvarConta(J.dados.tipo, c)} />}
        {J?.tipo === "pagamento" && <RegistrarPagamento conta={J.dados.conta} tipo={J.dados.tipo} aoFechar={fechar} aoSalvar={(p) => registrarPagamento(J.dados.tipo, J.dados.conta, p)} />}
        {J?.tipo === "campanha" && <FormCampanha inicial={J.dados} aoFechar={fechar} aoSalvar={salvarCampanha} />}
        {J?.tipo === "enviarCampanha" && (() => {
          const camp = campanhas.find((c) => c.id === J.dados.id) || J.dados;
          return <EnviarCampanha campanha={camp} clientes={clientes} pets={pets} agendamentos={agendamentos} aoFechar={fechar} publicarSite={publicarSite}
            marcarEnviado={async (cid) => { try { await db.atualizar("campanhas", camp.id, { enviados: [...new Set([...(camp.enviados || []), cid])], status: "Em envio" }); } catch (e) { console.error(e); } }}
            concluir={async () => { try { await db.atualizar("campanhas", camp.id, { status: "Enviada" }); avisar("Campanha marcada como enviada"); mimi.comemorar("Campanha no ar! 📣"); fechar(); } catch (e) { erroSalvar(e); } }} />;
        })()}

        {whatsPos && (
          <Modal titulo={whatsPos.titulo} aoFechar={() => setWhatsPos(null)}
            rodape={<><button className="btn btn-leve" onClick={() => setWhatsPos(null)}>Agora não</button>
              <a className="btn btn-whats" href={whatsPos.link} target="_blank" rel="noreferrer" onClick={() => setWhatsPos(null)}><Icone nome="whats" tam={18} /> Enviar no WhatsApp</a></>}>
            <p>{whatsPos.texto}</p>
          </Modal>
        )}
        {confirmacao && <Confirmar titulo={confirmacao.titulo} texto={confirmacao.texto} aoConfirmar={confirmacao.acao} aoFechar={() => setConfirmacao(null)} />}
        <Toast msg={toast} />
      </div>
    </ConfigCtx.Provider>
  );
}

// =====================================================================
//  SITE PÚBLICO
// =====================================================================
const SERVICOS_SITE = [
  { nome: "Banho", icone: "banho", texto: "Cuidado e higiene que seu pet precisa, com carinho do começo ao fim." },
  { nome: "Tosa", icone: "tesoura", texto: "Estilo e conforto para o seu amigo ficar lindo e à vontade." },
  { nome: "Hidratação", icone: "brilho", texto: "Pelos macios, brilhantes e saudáveis." },
  { nome: "Escovação de dentes", icone: "dente", texto: "Saúde bucal em dia para um sorriso feliz." },
  { nome: "Escovação", icone: "pente", texto: "Pelos desembaraçados e sem nós, com toda a calma." },
  { nome: "Tosa higiênica", icone: "tesoura", texto: "Higiene nas áreas sensíveis para mais conforto no dia a dia." },
];

function AgendarSite({ aoFechar, servicoInicial, servicos }) {
  const mimi = useMimi();
  const config = useConfig();
  const [f, setF] = useState({ nome: "", whatsapp: "", pet: "", especie: "Cão", porte: "Pequeno", servicos: servicoInicial ? [servicoInicial] : [], data: "", horario: "", observacoes: "" });
  const [erro, setErro] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [enviado, setEnviado] = useState(null);
  const mudar = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const alternarServico = (n) => setF((x) => ({ ...x, servicos: x.servicos.includes(n) ? x.servicos.filter((s) => s !== n) : [...x.servicos, n] }));

  const enviar = async () => {
    if (!f.nome.trim()) return setErro("Conta pra gente o seu nome 😊");
    if (soDigitos(f.whatsapp).length < 10) return setErro("Informe um WhatsApp com DDD.");
    if (!f.pet.trim()) return setErro("Qual é o nome do seu pet?");
    if (!f.servicos.length) return setErro("Escolha pelo menos um serviço.");
    if (!f.data) return setErro("Escolha o dia.");
    if (f.data < hojeISO()) return setErro("Escolha um dia a partir de hoje.");
    if (!config.diasAbertos.includes(dataDeISO(f.data).getDay())) return setErro("Nesse dia não abrimos. Escolha outro dia 😊");
    if (!f.horario) return setErro("Escolha o horário.");
    setErro(""); setOcupado(true);
    let salvo = false;
    try {
      const gravacao = db.adicionar("pedidos_site", { ...f, nome: f.nome.trim(), pet: f.pet.trim(), whatsapp: fmtTel(f.whatsapp), status: "novo", origem: "site" });
      const limite = new Promise((_, rej) => setTimeout(() => rej(new Error("tempo esgotado")), 8000));
      await Promise.race([gravacao, limite]);
      salvo = true;
    } catch (e) { console.error("Não foi possível salvar o pedido", e); }
    const msg = `Olá! Gostaria de agendar no ${config.nome} 🐶\nNome: ${f.nome.trim()}\nPet: ${f.pet.trim()} (${f.especie}, porte ${f.porte.toLowerCase()})\nServiço: ${f.servicos.join(", ")}\nData: ${fmtData(f.data)} às ${f.horario}${f.observacoes ? `\nObs.: ${f.observacoes}` : ""}`;
    setEnviado({ salvo, msg });
    setOcupado(false);
    mimi.comemorar(`Oba! Já tô esperando o ${f.pet.trim()} com muito carinho! 🛁`);
  };

  if (enviado) {
    return (
      <Modal titulo="Pedido recebido!" aoFechar={aoFechar}
        rodape={<button className="btn btn-leve" onClick={aoFechar}>Fechar</button>}>
        <div className="site-sucesso">
          <div className="site-sucesso-mimi"><MimiDesenho modo="feliz" /></div>
          {enviado.salvo ? (
            <p>Recebemos seu pedido. Vamos te chamar no WhatsApp para <b>confirmar o horário</b>. Se quiser agilizar, envie também por lá:</p>
          ) : (
            <p>Para concluir, <b>envie seu pedido pelo WhatsApp</b> que a gente confirma o horário rapidinho:</p>
          )}
          <a className="btn btn-whats btn-cheio" href={linkWhats(config.whatsapp, enviado.msg)} target="_blank" rel="noreferrer">
            <Icone nome="whats" tam={18} /> Enviar pelo WhatsApp
          </a>
        </div>
      </Modal>
    );
  }

  return (
    <Modal titulo="Agende seu horário" aoFechar={aoFechar} largo
      rodape={<>
        {erro && <span className="erro-rodape">{erro}</span>}
        <button className="btn btn-leve" onClick={aoFechar}>Cancelar</button>
        <button className="btn btn-ouro" onClick={enviar} disabled={ocupado}>{ocupado ? "Enviando…" : "Confirmar pedido"}</button>
      </>}>
      <div className="fgrade">
        <Campo rotulo="Seu nome *"><input value={f.nome} onChange={mudar("nome")} autoComplete="name" /></Campo>
        <Campo rotulo="WhatsApp *"><input value={f.whatsapp} onChange={mudar("whatsapp")} onBlur={() => setF((x) => ({ ...x, whatsapp: fmtTel(x.whatsapp) }))} inputMode="tel" autoComplete="tel" placeholder="(11) 90000-0000" /></Campo>
        <Campo rotulo="Nome do pet *"><input value={f.pet} onChange={mudar("pet")} /></Campo>
        <Campo rotulo="Espécie"><select value={f.especie} onChange={mudar("especie")}>{ESPECIES.map((o) => <option key={o}>{o}</option>)}</select></Campo>
        <Campo rotulo="Porte"><select value={f.porte} onChange={mudar("porte")}>{PORTES.map((o) => <option key={o}>{o}</option>)}</select></Campo>
      </div>
      <h3 className="form-secao">Serviços *</h3>
      <div className="site-escolhas">
        {servicos.map((s) => (
          <button type="button" key={s.nome} className={`site-escolha ${f.servicos.includes(s.nome) ? "marcado" : ""}`} onClick={() => alternarServico(s.nome)} aria-pressed={f.servicos.includes(s.nome)}>
            <Icone nome={s.icone} tam={18} />{s.nome}
          </button>
        ))}
      </div>
      <h3 className="form-secao">Quando?</h3>
      <div className="fgrade">
        <Campo rotulo="Dia *"><input type="date" value={f.data} min={hojeISO()} onChange={mudar("data")} /></Campo>
        <Campo rotulo="Horário *">
          <select value={f.horario} onChange={mudar("horario")}>
            <option value="">Escolha…</option>{horariosDoDia(config).map((h) => <option key={h}>{h}</option>)}
          </select>
        </Campo>
      </div>
      <Campo rotulo="Algo que a gente precise saber?" largo><textarea rows={2} value={f.observacoes} onChange={mudar("observacoes")} placeholder="Ex.: tem alergia, fica nervoso com secador…" /></Campo>
      <p className="texto-suave peq">O horário é confirmado pela nossa equipe pelo WhatsApp.</p>
    </Modal>
  );
}

function Site({ servicos: servicosDb }) {
  const config = useConfig();
  const servicos = servicosDoSite(servicosDb);
  const [agendar, setAgendar] = useState(null);
  const irPara = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  const abrirAgenda = (servico) => setAgendar({ servico: servico || "" });
  const msgWhats = `Olá! Vim pelo site do ${config.nome} 🐶`;

  return (
    <div className="site">
      <header className="site-topo">
        <button className="site-marca" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <img src={logoDe(config)} alt="" />
          <span><strong>Mimi Dog's</strong><em>Pet Shop</em></span>
        </button>
        <nav className="site-nav">
          <button onClick={() => irPara("servicos")}>Serviços</button>
          <button onClick={() => irPara("sobre")}>Sobre</button>
          <button onClick={() => irPara("contato")}>Contato</button>
        </nav>
        <button className="btn btn-ouro" onClick={() => abrirAgenda()}>Agendar horário</button>
      </header>

      {config.avisoSite && <div className="site-aviso">{config.avisoSite}</div>}
      <section className="site-hero">
        <div className="site-bolhas" aria-hidden="true"><i /><i /><i /><i /><i /></div>
        <div className="site-hero-texto">
          <span className="site-selo">Agenda da semana aberta!</span>
          <h1>Cuidado e carinho que seu dog merece</h1>
          <p>Banho, tosa, hidratação e escovação com muito amor. Aqui seu pet sai sempre limpo, cheiroso e feliz.</p>
          <div className="site-hero-acoes">
            <button className="btn btn-ouro btn-grande" onClick={() => abrirAgenda()}><Icone nome="calendar" tam={20} /> Agende seu horário</button>
            <a className="btn btn-contorno btn-grande" href={linkWhats(config.whatsapp, msgWhats)} target="_blank" rel="noreferrer"><Icone nome="whats" tam={20} /> {fmtTel(config.whatsapp)}</a>
          </div>
        </div>
        <div className="site-hero-logo"><img src={logoDe(config)} alt="Logo Mimi Dog's Pet Shop" /></div>
        <svg className="site-onda" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true"><path d="M0 40c240 40 480 40 720 20s480-50 720-10v30H0z" fill="var(--ceu)" /></svg>
      </section>

      <section className="site-secao" id="servicos">
        <h2 className="site-titulo">Nossos serviços</h2>
        <p className="site-sub">Toque em um serviço para já pedir o seu horário.</p>
        <div className="site-servicos">
          {servicos.map((s) => (
            <button key={s.nome} className="site-servico" onClick={() => abrirAgenda(s.nome)}>
              <span className="site-servico-icone"><Icone nome={s.icone} tam={30} /></span>
              <strong>{s.nome}</strong>
              <span>{s.texto}</span>
              {config.mostrarPrecosSite && s.preco > 0 && <span className="site-preco">{fmtMoeda(s.preco)}</span>}
              <em>Agendar <Icone nome="back" tam={14} className="seta" /></em>
            </button>
          ))}
        </div>
      </section>

      <section className="site-faixa">
        <p>Agende já e dê ao seu pet o melhor cuidado!</p>
        <button className="btn btn-marinho btn-grande" onClick={() => abrirAgenda()}>Quero agendar</button>
      </section>

      <section className="site-secao site-sobre" id="sobre">
        <div className="site-sobre-texto">
          <h2 className="site-titulo">Aqui ele é tratado com muito amor</h2>
          <p>No Mimi Dog's cada pet é recebido pelo nome, com calma e carinho. A gente conhece as manias, os medos e as alergias de cada um, porque tudo fica anotado na ficha dele.</p>
          <ul className="site-diferenciais">
            <li><span><Icone nome="heart" tam={20} /></span><div><strong>Atendimento com amor</strong>Seu pet é tratado como parte da família.</div></li>
            <li><span><Icone nome="paw" tam={20} /></span><div><strong>Ficha de cada pet</strong>Alergias e cuidados especiais sempre à mão da equipe.</div></li>
            <li><span><Icone nome="whats" tam={20} /></span><div><strong>Tudo pelo WhatsApp</strong>Confirmação do horário e avisos direto no seu celular.</div></li>
          </ul>
        </div>
        <div className="site-passos">
          <h3>Como funciona</h3>
          <ol>
            <li><span><b>Escolha</b> o serviço, o dia e o horário aqui no site.</span></li>
            <li><span><b>A gente confirma</b> pelo WhatsApp.</span></li>
            <li><span><b>Traga seu pet</b> e deixe o resto com a gente.</span></li>
          </ol>
          <button className="btn btn-ouro btn-cheio" onClick={() => abrirAgenda()}>Começar agendamento</button>
        </div>
      </section>

      <section className="site-secao" id="contato">
        <h2 className="site-titulo">Venha nos visitar</h2>
        <div className="site-contatos">
          <a className="site-contato" href={linkWhats(config.whatsapp, msgWhats)} target="_blank" rel="noreferrer">
            <span className="site-contato-icone"><Icone nome="whats" tam={26} /></span>
            <div><em>Agende já!</em><strong>{fmtTel(config.whatsapp)}</strong></div>
          </a>
          <a className="site-contato" href={linkMapa(config)} target="_blank" rel="noreferrer">
            <span className="site-contato-icone"><Icone nome="map" tam={26} /></span>
            <div><em>Localização</em><strong>{config.endereco}</strong>{config.cidade && <span className="site-horario">{config.cidade}</span>}</div>
          </a>
          <div className="site-contato">
            <span className="site-contato-icone"><Icone nome="heart" tam={26} /></span>
            <div><em>Atendimento</em><strong>{config.horarioTexto || "com muito amor"}</strong></div>
          </div>
        </div>
      </section>

      <footer className="site-rodape">
        <img src={logoDe(config)} alt="" />
        <p className="site-obrigado">Obrigado pela confiança! 💙</p>
        <p className="site-rodape-info">{config.nome} · {config.endereco} · {fmtTel(config.whatsapp)}</p>
        {config.instagram && <a className="site-area" href={`https://instagram.com/${config.instagram.replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//, "")}`} target="_blank" rel="noreferrer">Instagram {config.instagram}</a>}
        <a href="#/sistema" className="site-area">Área do pet shop</a>
      </footer>

      <a className="site-whats-flutuante" href={linkWhats(config.whatsapp, msgWhats)} target="_blank" rel="noreferrer" aria-label="Falar no WhatsApp">
        <Icone nome="whats" tam={28} />
      </a>

      {agendar && <AgendarSite servicos={servicos} servicoInicial={agendar.servico} aoFechar={() => setAgendar(null)} />}
    </div>
  );
}

const DICAS_SITE = () => [
  "Oi! Eu sou a Mimi 🐶 Quer agendar um banho? É só tocar em “Agendar horário”!",
  "Toque em qualquer serviço e eu já deixo ele marcadinho pra você 🛁",
  "A confirmação do horário chega pelo WhatsApp, rapidinho 📱",
  "Seu pet tem alergia? Conta pra gente no agendamento que a gente anota tudo 💙",
  "Au au! Aqui todo mundo sai cheiroso e feliz ✨",
];
const lerRota = () => (window.location.hash.startsWith("#/sistema") ? "sistema" : "site");

const iconeServico = (nome) => {
  const n = normalizar(nome);
  if (n.includes("dent")) return "dente";
  if (n.includes("tosa")) return "tesoura";
  if (n.includes("hidrat")) return "brilho";
  if (n.includes("escov")) return "pente";
  if (n.includes("banho")) return "banho";
  return "paw";
};
function servicosDoSite(servicosDb) {
  const ativos = (servicosDb || []).filter((s) => s.ativo !== false && s.mostrarNoSite !== false);
  if (!ativos.length) return SERVICOS_SITE;
  return [...ativos].sort((a, b) => (Number(a.ordem) || 0) - (Number(b.ordem) || 0) || a.nome.localeCompare(b.nome)).map((s) => {
    const padrao = SERVICOS_SITE.find((x) => normalizar(x.nome) === normalizar(s.nome));
    return { nome: s.nome, icone: iconeServico(s.nome), texto: s.descricao || padrao?.texto || "", preco: Number(s.preco) || 0 };
  });
}

// =====================================================================
//  APP
// =====================================================================
export default function App() {
  const [usuario, setUsuario] = useState(undefined);
  const [mimiAtiva, setMimiAtiva] = useState(() => {
    const salvo = localStorage.getItem("mimi_mascote");
    if (salvo !== null) return salvo === "1";
    return !(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  });
  const [rota, setRota] = useState(lerRota);
  const [configSite, setConfigSite] = useState(null);
  const [servicosSite, setServicosSite] = useState([]);
  const dadosDicas = useRef({ clientes: 0, pets: 0 });

  useEffect(() => {
    const aoMudar = () => { setRota(lerRota()); window.scrollTo({ top: 0 }); };
    window.addEventListener("hashchange", aoMudar);
    return () => window.removeEventListener("hashchange", aoMudar);
  }, []);

  useEffect(() => {
    if (!document.getElementById("mimi-fontes")) {
      const l = document.createElement("link");
      l.id = "mimi-fontes";
      l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Figtree:wght@400;500;600;700&display=swap";
      document.head.appendChild(l);
    }
    semearDemo();
    return autenticacao.observar(setUsuario);
  }, []);

  useEffect(() => {
    document.title = rota === "site" ? "Mimi Dog's Pet Shop · Banho e tosa com carinho" : "Mimi Dog's · Sistema";
    if (rota !== "site") return undefined;
    const u1 = db.ouvirDoc("configuracoes", "empresa", setConfigSite);
    const u2 = db.ouvir("servicos", setServicosSite);
    return () => { u1(); u2(); };
  }, [rota]);

  useEffect(() => {
    if (!usuario || rota !== "sistema" || usuario.bloqueado) return undefined;
    const u1 = db.ouvir("clientes", (l) => { dadosDicas.current.clientes = l.length; });
    const u2 = db.ouvir("pets", (l) => { dadosDicas.current.pets = l.length; });
    return () => { u1(); u2(); };
  }, [usuario, rota]);

  const alternarMimi = () => {
    setMimiAtiva((x) => { localStorage.setItem("mimi_mascote", x ? "0" : "1"); return !x; });
  };

  const dicas = useCallback(() => {
    const { clientes, pets } = dadosDicas.current;
    return [
      `Já somos ${clientes} cliente${clientes !== 1 ? "s" : ""} e ${pets} pet${pets !== 1 ? "s" : ""} na família Mimi! 💙`,
      "Toque em “+ Novo” pra cadastrar rapidinho 🐾",
      "Pet com alergia aparece com aviso vermelho na ficha. Sempre confira!",
      "Aniversário de pet é ótima desculpa pra mandar um carinho no WhatsApp 🎂",
      "Dica: a busca lá em cima acha cliente pelo telefone também 🔎",
      "Na agenda do dia, dois cliques num horário já abrem um agendamento 📅",
      "Finalizou o banho? Tira foto de antes e depois, fica lindo na ficha! 📸",
      "Se eu estiver atrapalhando, é só me desligar no botão da patinha 🐶",
      "Au au! Hoje é dia de deixar muito pet cheiroso! 🛁",
    ];
  }, []);

  const botaoMimi = (
    <button className={`mimi-alternar ${mimiAtiva ? "ligada" : ""}`} onClick={alternarMimi}
      aria-label={mimiAtiva ? "Esconder a Mimi" : "Mostrar a Mimi"} title={mimiAtiva ? "Esconder a Mimi" : "Mostrar a Mimi"}>
      <Icone nome="paw" tam={18} />
    </button>
  );

  if (rota === "site") {
    return (
      <>
        <style>{CSS}</style>
        <ConfigCtx.Provider value={juntarConfig(configSite)}>
          <div className="site-raiz">
            <MimiProvider ativa={mimiAtiva} dicas={DICAS_SITE}>
              <Site servicos={servicosSite} />
              {botaoMimi}
            </MimiProvider>
          </div>
        </ConfigCtx.Provider>
      </>
    );
  }

  if (usuario === undefined) {
    return (<><style>{CSS}</style><div className="carregando"><img src={LOGO} alt="Carregando" /></div></>);
  }

  if (usuario && usuario.bloqueado) {
    return (
      <>
        <style>{CSS}</style>
        <div className="carregando">
          <div className="bloqueado">
            <img src={LOGO} alt="" />
            <h1>Acesso desativado</h1>
            <p>Seu usuário foi desativado pelo administrador do sistema.</p>
            <button className="btn btn-ouro" onClick={() => autenticacao.sair()}>Sair</button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      {usuario ? (
        <MimiProvider ativa={mimiAtiva} dicas={dicas}>
          <Sistema usuario={usuario} />
          {botaoMimi}
        </MimiProvider>
      ) : (
        <TelaLogin />
      )}
    </>
  );
}

// =====================================================================
//  ESTILOS
// =====================================================================
const CSS = `
:root{
  --ceu:#D4E6F8; --ceu-2:#E8F2FC; --marinho:#173A7A; --marinho-2:#0F2A5C; --marinho-3:#2A4F95;
  --ouro:#F6C230; --ouro-2:#E3AA0B; --ouro-claro:#FFF3CC; --vermelho:#E0322B; --vermelho-claro:#FDE8E6;
  --verde:#1F9D6B; --texto:#1C2A45; --suave:#5A6E92; --linha:#DCE7F4; --branco:#fff;
  --raio:18px; --raio-p:12px; --sombra:0 6px 22px rgba(23,58,122,.08); --sombra-forte:0 14px 40px rgba(15,42,92,.18);
  --fonte-titulo:'Baloo 2', 'Trebuchet MS', system-ui, sans-serif; --fonte:'Figtree', system-ui, -apple-system, 'Segoe UI', sans-serif;
  --menu:256px;
}
*{box-sizing:border-box}
html,body{margin:0}
body{font-family:var(--fonte);color:var(--texto);background:var(--ceu);-webkit-font-smoothing:antialiased;font-size:15px;line-height:1.5}
button,input,select,textarea{font:inherit;color:inherit}
button{cursor:pointer;background:none;border:0;padding:0}
h1,h2,h3{font-family:var(--fonte-titulo);color:var(--marinho);margin:0;line-height:1.15}
h1{font-size:30px;font-weight:800}
h2{font-size:19px;font-weight:700}
h3{font-size:16px;font-weight:700}
a{color:inherit}
.texto-suave{color:var(--suave)}
.peq{font-size:13px}
.centro{text-align:center;padding:30px 0}
.pad{padding:10px 14px;margin:0}
.mb6{margin-bottom:6px}

/* ---------- botões ---------- */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:10px 16px;border-radius:999px;font-weight:700;font-size:14px;text-decoration:none;transition:transform .15s, box-shadow .15s, background .15s;white-space:nowrap;border:1.5px solid transparent}
.btn:active{transform:scale(.97)}
.btn:disabled{opacity:.5;cursor:not-allowed}
.btn-ouro{background:var(--ouro);color:var(--marinho-2);box-shadow:0 3px 0 var(--ouro-2)}
.btn-ouro:hover:not(:disabled){background:#FFCD45}
.btn-leve{background:var(--branco);color:var(--marinho);border-color:var(--linha)}
.btn-leve:hover:not(:disabled){border-color:var(--marinho-3)}
.btn-perigo{background:var(--vermelho);color:#fff}
.btn-texto-perigo{color:var(--vermelho)}
.btn-whats{background:#E3F7EC;color:#137A4B;border-color:#BDEBD1}
.btn-whats:hover{background:#D2F2E0}
.btn-peq{padding:6px 10px;font-size:13px}
.btn-cheio{width:100%;padding:13px;font-size:16px}
.btn-icone{display:inline-grid;place-items:center;width:36px;height:36px;border-radius:50%;color:var(--marinho);transition:background .15s}
.btn-icone:hover{background:var(--ceu-2)}
.btn-icone-perigo{color:var(--vermelho)}
.btn-icone-perigo:hover{background:var(--vermelho-claro)}
.btn-icone.claro{color:#fff}
.btn-icone.claro:hover{background:rgba(255,255,255,.12)}
.link{color:var(--marinho-3);font-weight:600;text-decoration:underline;text-underline-offset:3px}

/* ---------- campos ---------- */
.campo{display:flex;flex-direction:column;gap:5px;min-width:0}
.campo-largo{grid-column:1/-1}
.campo-rotulo{font-size:13px;font-weight:600;color:var(--marinho)}
.campo-dica{font-size:12px;color:var(--suave)}
input,select,textarea{width:100%;padding:11px 13px;border:1.5px solid var(--linha);border-radius:var(--raio-p);background:#fff;outline:none;transition:border .15s, box-shadow .15s}
input:focus,select:focus,textarea:focus{border-color:var(--marinho-3);box-shadow:0 0 0 3px rgba(42,79,149,.14)}
select:disabled{background:var(--ceu-2)}
textarea{resize:vertical}
input[type=checkbox]{width:18px;height:18px;accent-color:var(--marinho)}
.fgrade{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:14px;margin-bottom:6px}
.form-secao{margin:20px 0 10px;font-size:15px;color:var(--marinho-3)}
.form-nota{margin:0 0 14px}
.alerta{display:flex;gap:8px;align-items:flex-start;padding:11px 14px;border-radius:var(--raio-p);font-size:14px;margin:10px 0}
.alerta svg{flex-shrink:0;margin-top:1px}
.alerta-erro{background:var(--vermelho-claro);color:#A3211B}
.alerta-info{background:var(--ceu-2);color:var(--marinho)}
.chip{display:inline-block;padding:4px 10px;border-radius:999px;background:var(--ceu-2);color:var(--marinho);font-size:12.5px;font-weight:600}
.chip-ouro{background:var(--ouro-claro);color:#7A5A00}
.codigo{font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:12px;font-weight:700;color:var(--marinho-3);background:var(--ceu-2);padding:2px 7px;border-radius:6px;width:fit-content}
.codigo-grande{font-size:13px;padding:3px 9px}
.selo-alerta{background:var(--vermelho);color:#fff;font-size:11px;font-weight:700;padding:2px 8px;border-radius:999px}

/* ---------- carregando ---------- */
.carregando{min-height:100vh;display:grid;place-items:center}
.carregando img{width:120px;border-radius:50%;animation:pulsar 1.2s ease-in-out infinite}
@keyframes pulsar{50%{transform:scale(1.06)}}

/* ---------- login ---------- */
.login{min-height:100vh;display:grid;grid-template-columns:1.05fr 1fr}
.login-marca{background:var(--marinho);position:relative;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;color:#fff}
.login-marca::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 50% 38%, rgba(246,194,48,.18), transparent 55%)}
.login-logo{width:min(300px,62%);border-radius:50%;position:relative;box-shadow:0 0 0 10px rgba(255,255,255,.06), var(--sombra-forte)}
.login-frase{font-family:var(--fonte-titulo);font-size:26px;font-weight:700;color:var(--ouro);text-align:center;margin:26px 0 0;position:relative;max-width:360px;line-height:1.2}
.login-mimi{width:130px;position:absolute;bottom:18px;right:28px}
.login-form{display:flex;flex-direction:column;justify-content:center;gap:16px;padding:48px min(8vw,90px);max-width:560px;width:100%;margin:0 auto}
.login-form h1{font-size:34px}
.login-sub{margin:-8px 0 8px;color:var(--suave)}
.login-linha{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;font-size:14px}
.checar{display:flex;align-items:center;gap:8px;cursor:pointer}
.demo-caixa{background:var(--ouro-claro);border-radius:var(--raio-p);padding:12px 14px;font-size:13px;color:#5C4400;line-height:1.6}
.demo-caixa div{word-break:break-word}

/* ---------- estrutura ---------- */
.app{min-height:100vh}
.menu-lateral{position:fixed;inset:0 auto 0 0;width:var(--menu);background:var(--marinho);color:#fff;display:flex;flex-direction:column;padding:18px 12px;z-index:60}
.menu-marca{display:flex;align-items:center;gap:10px;padding:4px 8px 18px}
.menu-marca img{width:48px;height:48px;border-radius:50%;box-shadow:0 0 0 3px var(--ouro)}
.menu-marca strong{display:block;font-family:var(--fonte-titulo);font-size:20px;color:var(--ouro);line-height:1}
.menu-marca span{font-size:12.5px;color:#B9CBEA;letter-spacing:.02em}
.menu-nav{display:flex;flex-direction:column;gap:2px;flex:1;overflow-y:auto}
.menu-item{display:flex;align-items:center;gap:12px;padding:11px 12px;border-radius:12px;color:#D5E1F5;font-weight:600;text-align:left;transition:background .15s,color .15s}
.menu-item:hover{background:rgba(255,255,255,.08);color:#fff}
.menu-item.ativo{background:var(--ouro);color:var(--marinho-2)}
.menu-item em{margin-left:auto;font-style:normal;font-size:10px;font-weight:600;opacity:.6;white-space:nowrap}
.menu-item span{white-space:nowrap}
.menu-usuario{display:flex;align-items:center;gap:10px;padding:12px 8px 4px;border-top:1px solid rgba(255,255,255,.12);margin-top:10px}
.menu-avatar{width:36px;height:36px;border-radius:50%;background:var(--ouro);color:var(--marinho-2);display:grid;place-items:center;font-weight:800;font-family:var(--fonte-titulo);flex-shrink:0}
.menu-usuario-info{flex:1;min-width:0}
.menu-usuario-info strong{display:block;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.menu-usuario-info span{font-size:12px;color:#B9CBEA}
.principal{margin-left:var(--menu);padding:0 32px 130px;min-width:0}
.topo{position:sticky;top:0;z-index:30;display:flex;align-items:center;gap:10px;padding:14px 0;background:linear-gradient(var(--ceu) 75%, rgba(212,230,248,0))}
.topo-logo{width:38px;height:38px;border-radius:50%}
.so-movel{display:none}
.faixa-demo{background:var(--ouro-claro);color:#5C4400;border-radius:var(--raio-p);padding:8px 14px;font-size:13px;margin-bottom:14px}
.pagina{max-width:1180px;animation:entrar .25s ease-out}
@keyframes entrar{from{opacity:0;transform:translateY(6px)}}
.pagina-topo{display:flex;justify-content:space-between;align-items:flex-end;gap:14px;flex-wrap:wrap;margin:6px 0 18px}
.acoes-topo{display:flex;gap:8px;flex-wrap:wrap;align-items:center}

/* busca global */
.busca-global{position:relative;flex:1;max-width:460px;display:flex;align-items:center;gap:8px;background:#fff;border-radius:999px;padding:0 14px;box-shadow:var(--sombra);color:var(--suave)}
.busca-global input{border:0;box-shadow:none !important;padding:11px 0;background:transparent}
.busca-resultados{position:absolute;top:calc(100% + 8px);left:0;right:0;background:#fff;border-radius:16px;box-shadow:var(--sombra-forte);padding:6px;max-height:360px;overflow:auto;color:var(--texto)}
.busca-resultados button{display:flex;align-items:center;gap:10px;width:100%;padding:9px 10px;border-radius:10px;text-align:left}
.busca-resultados button:hover{background:var(--ceu-2)}
.busca-resultados button span:nth-child(2){flex:1}
.busca-grupo{font-size:11.5px;font-weight:700;color:var(--suave);margin:8px 10px 2px}

/* ---------- dashboard ---------- */
.saudacao{margin:6px 0 20px}
.saudacao h1{font-size:36px}
.saudacao-data{margin:0;color:var(--suave);font-weight:600}
.saudacao-data::first-letter{text-transform:uppercase}
.numeros{display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr;gap:14px;margin-bottom:18px}
.numero{position:relative;background:#fff;border-radius:var(--raio);padding:18px 18px 16px;display:flex;flex-direction:column;text-align:left;box-shadow:var(--sombra);overflow:hidden}
button.numero{transition:transform .15s}
button.numero:hover{transform:translateY(-2px)}
.numero-valor{font-family:var(--fonte-titulo);font-size:40px;font-weight:800;color:var(--marinho);line-height:1}
.numero-rotulo{color:var(--suave);font-size:14px;margin-top:6px}
.numero-icone{position:absolute;right:16px;top:16px;color:var(--ouro)}
.numero-destaque{background:var(--marinho)}
.numero-destaque .numero-valor{color:var(--ouro);font-size:52px}
.numero-destaque .numero-rotulo{color:#C9D8F0}
.grade-painel{display:grid;grid-template-columns:1.25fr 1fr;gap:16px}
.painel{background:#fff;border-radius:var(--raio);padding:20px;box-shadow:var(--sombra);min-width:0}
.painel-topo{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:12px;color:var(--ouro-2)}
.painel-agenda{background:linear-gradient(135deg,#fff 60%,var(--ouro-claro))}
.agenda-embreve p{margin:0 0 8px}
.lista-avisos{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px}
.aviso{padding:10px 12px 10px 38px;border-radius:12px;background:var(--ceu-2);font-size:14px;position:relative}
.aviso::before{position:absolute;left:12px;top:9px;font-size:15px}
.aviso-festa::before{content:"🎂"}
.aviso-retorno::before{content:"🛁"}
.aviso-atraso{background:var(--vermelho-claro);color:#8E1C17}
.aviso-atraso::before{content:"🔔"}
.aviso-atencao::before{content:"⚠️"}
.aviso-site{background:var(--ouro-claro)}
.aviso-site::before{content:"🌐"}
.aviso-info::before{content:"💡"}
.link-aviso{text-align:left;font-weight:600;color:inherit}
.link-aviso:hover{text-decoration:underline}
.legenda{display:flex;gap:16px;font-size:13px;color:var(--suave);margin:-4px 0 6px}
.legenda i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:6px}
.grafico{width:100%;height:auto;display:block}
.barras-h{display:flex;flex-direction:column;gap:9px}
.barra-h{display:grid;grid-template-columns:110px 1fr 28px;align-items:center;gap:10px;font-size:14px}
.barra-h-nome{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.barra-h-trilho{height:10px;background:var(--ceu-2);border-radius:99px;overflow:hidden}
.barra-h-trilho div{height:100%;background:var(--marinho-3);border-radius:99px}
.barra-h-n{font-weight:700;color:var(--marinho);text-align:right}
.especies{display:flex;gap:6px;flex-wrap:wrap;margin-top:16px}

/* ---------- listas ---------- */
.filtros{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px}
.filtros select{width:auto;min-width:170px;border-radius:999px}
.busca{flex:1;min-width:240px;display:flex;align-items:center;gap:8px;background:#fff;border:1.5px solid var(--linha);border-radius:999px;padding:0 14px;color:var(--suave)}
.busca:focus-within{border-color:var(--marinho-3)}
.busca input{border:0;box-shadow:none !important;padding:10px 0}
.tabela{background:#fff;border-radius:var(--raio);box-shadow:var(--sombra);overflow:hidden}
.tabela-cab,.tabela-linha{display:grid;grid-template-columns:2fr 1.2fr 1.8fr 1fr auto;gap:14px;align-items:center;padding:12px 18px}
.tabela-cab{font-size:12.5px;font-weight:700;color:var(--suave);background:var(--ceu-2)}
.tabela-linha{border-top:1px solid var(--linha);cursor:pointer;transition:background .12s}
.tabela-linha:hover{background:#F7FAFE}
.cel-cliente{display:flex;flex-direction:column;gap:2px;min-width:0}
.cel-cliente strong{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cel-acoes{display:flex;align-items:center;gap:4px;justify-content:flex-end}
.contatos{display:flex;gap:6px}
.pets-mini{display:flex;align-items:center;gap:4px;min-width:0}
.pets-mini .avatar-pet{margin-right:-10px;border:2px solid #fff}
.pets-mini span{margin-left:14px;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.avatar-pet{border-radius:50%;object-fit:cover;flex-shrink:0}
.avatar-vazio{display:grid;place-items:center;background:var(--ceu-2);color:var(--marinho-3)}

/* detalhe cliente */
.voltar{display:inline-flex;align-items:center;gap:4px;color:var(--marinho-3);font-weight:700;margin:4px 0 12px}
.cliente-cab{display:flex;justify-content:space-between;align-items:flex-end;gap:14px;flex-wrap:wrap;margin-bottom:20px}
.cliente-cab h1{margin:8px 0 2px}
.cliente-cab p{margin:0}
.trilha{position:relative;padding-left:28px}
.trilha::before{content:"";position:absolute;left:9px;top:10px;bottom:10px;width:2px;background:repeating-linear-gradient(var(--marinho-3) 0 6px, transparent 6px 12px);opacity:.35}
.trilha-passo{position:relative;background:#fff;border-radius:var(--raio);padding:18px 20px;margin-bottom:12px;box-shadow:var(--sombra)}
.trilha-passo::before{content:"";position:absolute;left:-25px;top:22px;width:14px;height:14px;border-radius:50%;background:var(--ouro);box-shadow:0 0 0 3px var(--ceu)}
.trilha-passo h2{margin-bottom:10px}
.trilha-futuro{background:transparent;box-shadow:none;border:1.5px dashed #B8CDE8}
.trilha-futuro::before{background:#B8CDE8}
.trilha-futuro h2{color:var(--suave)}
.trilha-futuro p{margin:0}
.dados{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px 18px;margin:0}
.dados dt{font-size:12.5px;color:var(--suave);font-weight:600}
.dados dd{margin:2px 0 0;font-weight:600;word-break:break-word}
.dados-largo{grid-column:1/-1}
.observacoes{margin:0;white-space:pre-wrap}
.pets-cliente{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px}
.pet-linha{display:flex;align-items:center;gap:12px;padding:10px;border-radius:14px;border:1.5px solid var(--linha);text-align:left;transition:border .15s}
.pet-linha:hover{border-color:var(--marinho-3)}
.pet-linha > div:not(.avatar-pet){display:flex;flex-direction:column;flex:1;min-width:0}
.linha-tempo{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px}
.linha-tempo li{display:grid;grid-template-columns:150px 1fr;gap:10px;font-size:14px}
.lt-data{color:var(--suave);font-size:13px}

/* pets */
.grade-pets{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:14px}
.cartao-pet{background:#fff;border-radius:var(--raio);overflow:hidden;box-shadow:var(--sombra);text-align:left;transition:transform .15s, box-shadow .15s;display:flex;flex-direction:column}
.cartao-pet:hover{transform:translateY(-3px);box-shadow:var(--sombra-forte)}
.cartao-pet-foto{position:relative;aspect-ratio:1/0.85;background:var(--ceu-2);display:grid;place-items:center;color:#9DB8DE}
.cartao-pet-foto img{width:100%;height:100%;object-fit:cover}
.selo-canto{position:absolute;top:10px;right:10px}
.cartao-pet-info{padding:12px 14px 14px;display:flex;flex-direction:column;gap:2px}
.cartao-pet-info strong{font-family:var(--fonte-titulo);font-size:19px;color:var(--marinho);line-height:1.1}
.tutor{color:var(--marinho-3);font-weight:600;margin-top:4px}
.pet-form-topo{display:flex;gap:16px;align-items:flex-start;margin-bottom:14px}
.foto-pet-escolher{width:112px;height:112px;border-radius:50%;flex-shrink:0;background:var(--ceu-2);border:2px dashed #A9C3E6;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;color:var(--marinho-3);font-size:13px;font-weight:600;overflow:hidden}
.foto-pet-escolher img{width:100%;height:100%;object-fit:cover}
.pet-form-principal{flex:1;display:flex;flex-direction:column;gap:12px;min-width:0}
.ficha{display:flex;gap:20px;align-items:center;margin-bottom:10px;padding:12px 0 0 12px}
.ficha-foto{width:150px;height:150px;border-radius:50%;overflow:hidden;flex-shrink:0;box-shadow:0 0 0 5px var(--ouro), 0 0 0 10px var(--marinho)}
.ficha-foto img{width:100%;height:100%;object-fit:cover}
.ficha-foto-vazia{width:100%;height:100%;display:grid;place-items:center;background:var(--ceu-2);color:#9DB8DE}
.ficha-cab h2{font-size:32px}
.ficha-cab p{margin:2px 0 6px;color:var(--suave)}
.ficha-chips{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}
.dados-ficha{margin-top:14px;background:var(--ceu-2);border-radius:var(--raio-p);padding:14px}

/* vazio e em breve */
.vazio,.embreve{text-align:center;padding:40px 20px;background:#fff;border-radius:var(--raio);box-shadow:var(--sombra);display:flex;flex-direction:column;align-items:center;gap:8px}
.vazio p,.embreve p{margin:0 0 8px;color:var(--suave);max-width:460px}
.vazio-mimi,.embreve-mimi{width:130px}

/* ---------- modal ---------- */
.modal-fundo{position:fixed;inset:0;background:rgba(15,42,92,.42);backdrop-filter:blur(3px);z-index:100;display:grid;place-items:center;padding:20px;animation:fade .15s}
@keyframes fade{from{opacity:0}}
.modal{background:#fff;border-radius:22px;width:min(520px,100%);max-height:calc(100vh - 40px);display:flex;flex-direction:column;box-shadow:var(--sombra-forte);animation:subir .2s ease-out}
.modal-largo{width:min(780px,100%)}
@keyframes subir{from{transform:translateY(14px);opacity:.6}}
.modal-topo{display:flex;justify-content:space-between;align-items:center;padding:18px 22px 10px}
.modal-corpo{padding:6px 22px 18px;overflow-y:auto}
.modal-rodape{display:flex;justify-content:flex-end;align-items:center;gap:10px;padding:14px 22px;border-top:1px solid var(--linha);flex-wrap:wrap}
.erro-rodape{color:var(--vermelho);font-size:14px;font-weight:600;margin-right:auto}
.confirmar-texto{margin:0 0 6px}

/* ---------- botão + Novo ---------- */
.fab{position:fixed;right:26px;bottom:26px;z-index:70;display:flex;flex-direction:column;align-items:flex-end;gap:10px}
.fab-botao{display:flex;align-items:center;gap:6px;background:var(--ouro);color:var(--marinho-2);font-weight:800;font-family:var(--fonte-titulo);font-size:17px;padding:12px 20px 12px 16px;border-radius:999px;box-shadow:0 4px 0 var(--ouro-2), var(--sombra-forte);transition:transform .15s}
.fab-botao:active{transform:translateY(2px)}
.fab-menu{background:#fff;border-radius:18px;padding:6px;box-shadow:var(--sombra-forte);display:flex;flex-direction:column;min-width:250px;animation:subir .18s ease-out}
.fab-menu button{display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:12px;font-weight:600;color:var(--marinho);text-align:left}
.fab-menu button:hover:not(:disabled){background:var(--ceu-2)}
.fab-menu button:disabled{color:#9AAAC6;cursor:default}
.fab-menu em{margin-left:auto;font-style:normal;font-size:11px}
.fab-fundo{position:fixed;inset:0;z-index:65}
.toast{position:fixed;left:50%;top:18px;transform:translateX(-50%);z-index:200;background:var(--marinho);color:#fff;padding:11px 18px;border-radius:999px;font-weight:600;box-shadow:var(--sombra-forte);animation:toast .25s ease-out}
.toast-aviso{background:var(--ouro);color:var(--marinho-2)}
@keyframes toast{from{transform:translate(-50%,-12px);opacity:0}}
.nav-inferior{display:none}
.menu-fundo{display:none}

/* ---------- MIMI ---------- */
.mimi{--mimi-x:calc(var(--menu) + 16px);position:fixed;left:var(--mimi-x);bottom:10px;width:96px;z-index:55;pointer-events:none}
.mimi-botao{display:block;width:100%;pointer-events:auto;filter:drop-shadow(0 4px 6px rgba(15,42,92,.12))}
.mimi-svg{width:100%;height:auto;display:block;overflow:visible}
.mimi-rabo{transform-origin:24px 50px;animation:rabo 1.6s ease-in-out infinite}
.mimi-olhos{transform-origin:90px 42px;animation:piscar 5s infinite}
.mimi-cabeca{transform-origin:90px 60px;animation:cabeca 4s ease-in-out infinite}
.mimi-perna{transform-box:fill-box;transform-origin:50% 10%}
.mimi-lingua{transform-origin:90px 57px;animation:lingua 1.4s ease-in-out infinite}
.mimi-balao{position:absolute;bottom:calc(100% + 4px);left:0;width:max-content;max-width:min(260px,calc(100vw - 40px));background:#fff;color:var(--marinho);font-weight:600;font-size:14px;line-height:1.35;padding:10px 14px;border-radius:16px 16px 16px 4px;box-shadow:var(--sombra-forte);border:2px solid var(--ouro);pointer-events:auto;animation:balao .3s cubic-bezier(.3,1.5,.6,1)}
@keyframes balao{from{transform:scale(.6) translateY(10px);opacity:0}}
@keyframes rabo{0%,100%{transform:rotate(0)}50%{transform:rotate(-14deg)}}
@keyframes piscar{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.1)}}
@keyframes cabeca{0%,100%{transform:rotate(0)}50%{transform:rotate(-3deg)}}
@keyframes lingua{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.15)}}
.mimi-passeando{pointer-events:none;animation:mimiPasseio 16s linear forwards}
.mimi-passeando .mimi-botao{pointer-events:none}
.mimi-passeando .mimi-perna-a{animation:pernaA .42s ease-in-out infinite}
.mimi-passeando .mimi-perna-b{animation:pernaB .42s ease-in-out infinite}
.mimi-passeando .mimi-pula{animation:trote .42s ease-in-out infinite}
.mimi-passeando .mimi-rabo{animation-duration:.5s}
@keyframes mimiPasseio{
  0%{transform:translateX(0)}
  56%{transform:translateX(calc(100vw - var(--mimi-x) + 40px))}
  56.01%{transform:translateX(calc(-1 * var(--mimi-x) - 140px))}
  100%{transform:translateX(0)}
}
@keyframes pernaA{0%,100%{transform:rotate(18deg)}50%{transform:rotate(-18deg)}}
@keyframes pernaB{0%,100%{transform:rotate(-18deg)}50%{transform:rotate(18deg)}}
@keyframes trote{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
.mimi-feliz .mimi-pula{animation:pulo .5s ease-out 3}
.mimi-feliz .mimi-rabo{animation-duration:.22s}
.mimi-coracoes{animation:subirCoracao 1.4s ease-out forwards}
@keyframes pulo{0%,100%{transform:translateY(0)}40%{transform:translateY(-16px)}}
@keyframes subirCoracao{from{opacity:0;transform:translateY(8px)}30%{opacity:1}to{opacity:0;transform:translateY(-14px)}}
.mimi-dormindo .mimi-pula{animation:respirar 3s ease-in-out infinite;transform-origin:50% 100%}
.mimi-dormindo .mimi-rabo,.mimi-dormindo .mimi-cabeca{animation:none}
.mimi-dormindo .mimi-cabeca{transform:rotate(8deg) translateY(4px)}
.mimi-zzz text{animation:zzz 2.4s ease-in-out infinite}
.mimi-zzz text:nth-child(2){animation-delay:.8s}
@keyframes respirar{0%,100%{transform:scaleY(1)}50%{transform:scaleY(.96)}}
@keyframes zzz{0%{opacity:0;transform:translate(0,6px)}40%{opacity:1}100%{opacity:0;transform:translate(6px,-8px)}}
.vazio-mimi .mimi-rabo,.embreve-mimi .mimi-rabo{animation:rabo 1.6s ease-in-out infinite}
.mimi-alternar{position:fixed;right:26px;bottom:88px;z-index:56;width:40px;height:40px;border-radius:50%;background:#fff;color:#9AAAC6;display:grid;place-items:center;box-shadow:var(--sombra)}
.mimi-alternar.ligada{color:var(--ouro-2)}
.login-mimi .mimi-svg{filter:drop-shadow(0 6px 10px rgba(0,0,0,.25))}


/* ---------- pedidos do site (painel) ---------- */
.painel-pedidos{grid-column:1/-1;border:2px solid var(--ouro)}
.pedidos{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px}
.pedido{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;padding:12px 14px;border-radius:14px;background:var(--ceu-2)}
.pedido-novo{background:var(--ouro-claro)}
.pedido-info{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1 1 280px}
.pedido-linha1{display:flex;align-items:center;gap:8px}
.pedido-acoes{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.pedidos-nota{margin:12px 0 0}
.menu-site{margin-top:6px;border:1px dashed rgba(255,255,255,.25);text-decoration:none}
.login-site{align-self:center;font-size:14px}

/* ---------- SITE ---------- */
.site{background:var(--ceu);min-height:100vh}
.site-topo{position:sticky;top:0;z-index:40;display:flex;align-items:center;gap:18px;padding:10px max(20px,calc((100vw - 1180px)/2));background:rgba(23,58,122,.97);backdrop-filter:blur(6px);box-shadow:0 4px 18px rgba(15,42,92,.2)}
.site-marca{display:flex;align-items:center;gap:10px;color:#fff;text-align:left}
.site-marca img{width:46px;height:46px;border-radius:50%;box-shadow:0 0 0 3px var(--ouro)}
.site-marca strong{display:block;font-family:var(--fonte-titulo);font-size:21px;color:var(--ouro);line-height:1}
.site-marca em{font-style:normal;font-size:12.5px;color:#B9CBEA}
.site-nav{display:flex;gap:4px;margin-left:auto}
.site-nav button{color:#D5E1F5;font-weight:600;padding:8px 12px;border-radius:999px}
.site-nav button:hover{background:rgba(255,255,255,.1);color:#fff}
.btn-grande{padding:14px 22px;font-size:16px}
.btn-contorno{border-color:rgba(255,255,255,.55);color:#fff}
.btn-contorno:hover{background:rgba(255,255,255,.1)}
.btn-marinho{background:var(--marinho);color:#fff;box-shadow:0 3px 0 var(--marinho-2)}
.site-hero{position:relative;overflow:hidden;background:var(--marinho);color:#fff;display:grid;grid-template-columns:1.2fr 1fr;align-items:center;gap:40px;padding:70px max(24px,calc((100vw - 1180px)/2)) 120px}
.site-hero::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 78% 45%, rgba(246,194,48,.2), transparent 45%)}
.site-hero-texto{position:relative;z-index:1}
.site-selo{display:inline-block;background:var(--vermelho);color:#fff;font-family:var(--fonte-titulo);font-weight:800;font-size:17px;padding:4px 16px;border-radius:999px;transform:rotate(-2deg)}
.site-hero h1{color:#fff;font-size:clamp(38px,5.6vw,66px);font-weight:800;line-height:1.02;margin:18px 0 16px;max-width:12ch}
.site-hero p{font-size:19px;color:#D5E1F5;max-width:46ch;margin:0 0 28px}
.site-hero-acoes{display:flex;gap:12px;flex-wrap:wrap}
.site-hero-logo{position:relative;z-index:1;display:flex;justify-content:center}
.site-hero-logo img{width:min(400px,100%);border-radius:50%;box-shadow:0 0 0 12px rgba(255,255,255,.07),0 0 0 24px rgba(255,255,255,.04),var(--sombra-forte);animation:flutuar 6s ease-in-out infinite}
@keyframes flutuar{50%{transform:translateY(-10px) rotate(-1.5deg)}}
.site-onda{position:absolute;left:0;right:0;bottom:-1px;width:100%;height:80px}
.site-bolhas{position:absolute;inset:0;pointer-events:none}
.site-bolhas i{position:absolute;border-radius:50%;border:2px solid rgba(255,255,255,.22);background:radial-gradient(circle at 30% 30%, rgba(255,255,255,.35), transparent 60%)}
.site-bolhas i:nth-child(1){width:46px;height:46px;left:6%;top:16%}
.site-bolhas i:nth-child(2){width:24px;height:24px;left:44%;top:12%}
.site-bolhas i:nth-child(3){width:60px;height:60px;right:4%;top:10%}
.site-bolhas i:nth-child(4){width:30px;height:30px;left:50%;bottom:22%}
.site-bolhas i:nth-child(5){width:18px;height:18px;right:12%;bottom:28%}
.site-secao{padding:70px max(24px,calc((100vw - 1180px)/2))}
.site-titulo{font-size:clamp(30px,4vw,44px);font-weight:800}
.site-sub{color:var(--suave);font-size:17px;margin:6px 0 30px}
.site-servicos{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.site-servico{background:#fff;border-radius:22px;padding:26px 24px 22px;text-align:left;display:flex;flex-direction:column;gap:6px;box-shadow:var(--sombra);transition:transform .18s, box-shadow .18s}
.site-servico:hover{transform:translateY(-4px);box-shadow:var(--sombra-forte)}
.site-servico-icone{width:62px;height:62px;border-radius:50%;background:var(--marinho);color:#fff;display:grid;place-items:center;margin-bottom:8px;box-shadow:0 0 0 5px var(--ceu-2)}
.site-servico strong{font-family:var(--fonte-titulo);font-size:23px;color:var(--marinho);line-height:1.1}
.site-servico > span:not(.site-servico-icone){color:var(--suave)}
.site-servico em{margin-top:8px;font-style:normal;font-weight:700;color:var(--ouro-2);display:inline-flex;align-items:center;gap:4px}
.site-servico .seta{transform:rotate(180deg)}
.site-faixa{background:var(--ouro);display:flex;align-items:center;justify-content:center;gap:24px;flex-wrap:wrap;padding:30px 24px;text-align:center}
.site-faixa p{margin:0;font-family:var(--fonte-titulo);font-weight:800;font-size:clamp(22px,3vw,32px);color:var(--marinho-2);line-height:1.1}
.site-sobre{display:grid;grid-template-columns:1.3fr 1fr;gap:40px;align-items:start}
.site-sobre-texto > p{font-size:18px;color:var(--texto);max-width:56ch;margin:14px 0 24px}
.site-diferenciais{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:16px}
.site-diferenciais li{display:flex;gap:14px;align-items:flex-start}
.site-diferenciais li > span{width:44px;height:44px;border-radius:14px;background:var(--ouro);color:var(--marinho-2);display:grid;place-items:center;flex-shrink:0}
.site-diferenciais strong{display:block;font-family:var(--fonte-titulo);font-size:19px;color:var(--marinho);line-height:1.2}
.site-diferenciais div{color:var(--suave)}
.site-passos{background:#fff;border-radius:24px;padding:28px;box-shadow:var(--sombra);border:2px dashed #A9C3E6}
.site-passos h3{font-size:24px;margin-bottom:12px}
.site-passos ol{margin:0 0 22px;padding:0;list-style:none;counter-reset:passo;display:flex;flex-direction:column;gap:14px}
.site-passos li{counter-increment:passo;display:flex;gap:12px;align-items:flex-start;font-size:16px}
.site-passos li::before{content:counter(passo);width:30px;height:30px;border-radius:50%;background:var(--marinho);color:var(--ouro);font-family:var(--fonte-titulo);font-weight:800;display:grid;place-items:center;flex-shrink:0}
.site-contatos{display:grid;grid-template-columns:repeat(3,1fr);gap:0;margin-top:26px;background:var(--marinho);border-radius:28px;padding:10px;box-shadow:var(--sombra-forte)}
.site-contato{display:flex;align-items:center;gap:14px;padding:18px 20px;color:#fff;text-decoration:none;border-radius:20px;transition:background .15s}
a.site-contato:hover{background:rgba(255,255,255,.07)}
.site-contato + .site-contato{border-left:1px solid rgba(255,255,255,.15)}
.site-contato-icone{width:54px;height:54px;border-radius:50%;background:var(--ouro);color:var(--marinho-2);display:grid;place-items:center;flex-shrink:0}
.site-contato em{display:block;font-style:normal;font-family:var(--fonte-titulo);font-weight:700;color:var(--ouro);font-size:16px;line-height:1.1}
.site-contato strong{font-size:17px;line-height:1.25}
.site-rodape{background:var(--marinho-2);color:#B9CBEA;text-align:center;padding:40px 20px 110px;display:flex;flex-direction:column;align-items:center;gap:8px}
.site-rodape img{width:70px;border-radius:50%;box-shadow:0 0 0 3px var(--ouro)}
.site-obrigado{font-family:var(--fonte-titulo);font-size:26px;color:#fff;margin:8px 0 0}
.site-rodape-info{margin:0;font-size:14px}
.site-area{color:#7F97C4;font-size:13px;margin-top:10px}
.site-whats-flutuante{position:fixed;right:22px;bottom:22px;z-index:70;width:60px;height:60px;border-radius:50%;background:#25D366;color:#fff;display:grid;place-items:center;box-shadow:0 8px 24px rgba(0,0,0,.25);transition:transform .15s}
.site-whats-flutuante:hover{transform:scale(1.06)}
.site-raiz .mimi{--mimi-x:16px;bottom:14px}
.site-raiz .mimi-alternar{right:32px;bottom:94px}
.site-escolhas{display:flex;flex-wrap:wrap;gap:8px}
.site-escolha{display:inline-flex;align-items:center;gap:6px;padding:9px 14px;border-radius:999px;border:1.5px solid var(--linha);background:#fff;font-weight:600;color:var(--marinho);transition:all .15s}
.site-escolha.marcado{background:var(--marinho);border-color:var(--marinho);color:#fff}
.site-sucesso{display:flex;flex-direction:column;align-items:center;text-align:center;gap:10px;padding-bottom:6px}
.site-sucesso-mimi{width:140px}
.site-sucesso p{margin:0 0 6px;font-size:16px}
@media (max-width:980px){
  .site-servicos{grid-template-columns:1fr 1fr}
  .site-sobre{grid-template-columns:1fr}
  .site-contatos{grid-template-columns:1fr}
  .site-contato + .site-contato{border-left:0;border-top:1px solid rgba(255,255,255,.15)}
}
@media (max-width:760px){
  .site-nav{display:none}
  .site-topo{justify-content:space-between;padding:8px 14px}
  .site-topo .btn{padding:9px 14px;font-size:14px}
  .site-marca img{width:40px;height:40px}
  .site-marca strong{font-size:18px}
  .site-hero{grid-template-columns:1fr;text-align:center;padding:36px 20px 100px;gap:24px}
  .site-hero-logo{order:-1}
  .site-hero-logo img{width:200px}
  .site-hero h1{margin:14px auto 12px}
  .site-hero p{margin:0 auto 24px;font-size:17px}
  .site-hero-acoes{justify-content:center}
  .site-hero-acoes .btn{flex:1 1 100%}
  .site-secao{padding:50px 18px}
  .site-servicos{grid-template-columns:1fr;gap:12px}
  .site-servico{flex-direction:row;flex-wrap:wrap;align-items:center;column-gap:14px;padding:18px}
  .site-servico-icone{margin:0;width:52px;height:52px}
  .site-servico strong{flex:1}
  .site-servico > span:not(.site-servico-icone){flex-basis:100%}
  .site-servico em{margin-top:2px}
  .site-raiz .mimi{bottom:12px;width:74px}
  .site-raiz .mimi-alternar{right:28px;bottom:92px}
}


/* ---------- geral novos ---------- */
.mt6{margin-top:6px}.mt10{margin-top:10px}.mb16{margin-bottom:16px}
.verde{color:var(--verde) !important}.vermelho{color:var(--vermelho) !important}
.primeira-maiuscula::first-letter{text-transform:uppercase}
.pagina-larga{max-width:none}
.subtitulo{font-size:22px;margin:22px 0 12px}
.alinhar-dir{align-self:flex-end}
.acoes-fim{display:flex;justify-content:flex-end;margin-top:16px}
.dica-config{margin-top:16px;color:var(--suave)}
.abas-mini{display:inline-flex;background:#fff;border-radius:999px;padding:4px;box-shadow:var(--sombra);gap:2px;flex-wrap:wrap}
.abas-mini button{padding:7px 14px;border-radius:999px;font-weight:700;font-size:13.5px;color:var(--suave)}
.abas-mini button.ativo{background:var(--marinho);color:#fff}
.abas-grandes button{padding:9px 16px;font-size:14px}
.periodo{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:16px}
.periodo-datas{display:flex;align-items:center;gap:8px}
.periodo-datas input{width:auto}
.chips-filtro{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}
.chips-filtro button{padding:6px 12px;border-radius:999px;background:#fff;font-weight:600;font-size:13px;color:var(--marinho);border:1.5px solid var(--linha)}
.chips-filtro button b{margin-left:4px;color:var(--suave)}
.chips-filtro button.ativo{background:var(--marinho);color:#fff;border-color:var(--marinho)}
.chips-filtro button.ativo b{color:var(--ouro)}
.chip-botao{cursor:pointer;border:0}
.chip-botao:hover{background:var(--ouro-claro)}
.selo-status{display:inline-block;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;white-space:nowrap}
.st-agendado{background:#E6EEFB;color:#2A4F95}
.st-confirmado{background:#DDF3E8;color:#157A50}
.st-atendimento{background:var(--ouro-claro);color:#7A5A00}
.st-finalizado{background:#173A7A;color:#fff}
.st-cancelado{background:var(--vermelho-claro);color:#A3211B}
.st-faltou{background:#EEF1F6;color:#6A7894}
.numeros-auto{grid-template-columns:repeat(auto-fill,minmax(170px,1fr))}
.numeros-auto .numero-destaque{grid-column:span 2}
.numero-dinheiro .numero-valor{font-size:26px}
.numero-destaque.numero-dinheiro .numero-valor{font-size:34px}
.numero-alerta{box-shadow:inset 0 0 0 2px var(--vermelho),var(--sombra)}
.numero-alerta .numero-valor{color:var(--vermelho)}
.numeros-rel .numero{padding:14px 16px}
.painel-cheio,.painel-hoje{grid-column:1/-1}
.tabela-hoje{display:flex;flex-direction:column}
.th-linha{display:grid;grid-template-columns:70px 1.2fr 1fr 1.4fr 170px;gap:10px;align-items:center;padding:9px 6px;border-top:1px solid var(--linha);cursor:pointer;font-size:14px}
.th-linha:hover{background:#F7FAFE}
.th-cab{border-top:0;font-size:12.5px;font-weight:700;color:var(--suave);cursor:default}
.th-cab:hover{background:none}
.th-hora{font-family:var(--fonte-titulo);font-weight:800;color:var(--marinho);font-size:17px}
.th-pet{font-weight:700}
.status-select{padding:6px 10px;border-radius:999px;font-weight:700;font-size:12.5px;border:0}
.sino{position:relative;background:#fff;box-shadow:var(--sombra);flex-shrink:0}
.sino-num{position:absolute;top:-3px;right:-3px;background:var(--vermelho);color:#fff;font-size:10.5px;font-weight:800;min-width:18px;height:18px;border-radius:9px;display:grid;place-items:center;padding:0 4px}
.lista-venc{list-style:none;margin:0;padding:0;display:flex;flex-direction:column}
.lista-venc li{display:flex;align-items:center;gap:10px;padding:9px 4px;border-top:1px solid var(--linha);cursor:pointer}
.lista-venc li:first-child{border-top:0}
.lv-info{flex:1;display:flex;flex-direction:column;min-width:0}
.seta-fin{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;font-weight:800;flex-shrink:0}
.seta-fin.receber{background:#DDF3E8;color:var(--verde)}
.seta-fin.pagar{background:var(--vermelho-claro);color:var(--vermelho)}
.lista-cartoes{display:flex;flex-direction:column;gap:10px}
.cartao-linha{background:#fff;border-radius:var(--raio);box-shadow:var(--sombra);padding:14px 16px;display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.cl-info{flex:1 1 260px;display:flex;flex-direction:column;gap:3px;min-width:0;cursor:pointer}
.cl-l1{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.cl-valor{font-family:var(--fonte-titulo);font-weight:800;font-size:21px;color:var(--marinho);display:flex;flex-direction:column;align-items:flex-end;line-height:1.1}
.cl-valor small{font-family:var(--fonte);font-weight:600;font-size:12px;color:#7A5A00}
.cl-acoes{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.mini-resumo{display:flex;gap:10px;flex-wrap:wrap;margin:-6px 0 18px}
.mini-resumo div{background:#fff;border-radius:14px;padding:10px 16px;box-shadow:var(--sombra);display:flex;flex-direction:column}
.mini-resumo b{font-family:var(--fonte-titulo);font-size:20px;color:var(--marinho);line-height:1.1}
.mini-resumo span{font-size:12.5px;color:var(--suave)}
.mini-resumo .alerta-num b{color:var(--vermelho)}
.lista-mini{list-style:none;margin:0;padding:0;display:flex;flex-direction:column}
.lista-mini li{display:grid;grid-template-columns:130px 1fr auto;gap:10px;align-items:center;padding:8px 4px;border-top:1px solid var(--linha);font-size:14px;cursor:pointer}
.lista-mini li:first-child{border-top:0}
.lista-mini li:hover{background:#F7FAFE}

/* ---------- formulário de agendamento ---------- */
.passos-form{display:flex;flex-direction:column;gap:16px}
.passo-form{display:flex;gap:12px;align-items:flex-start}
.passo-form > .campo,.passo-form > .fgrade{flex:1}
.passo-form > div:not(.passo-num){flex:1}
.passo-num{width:28px;height:28px;border-radius:50%;background:var(--marinho);color:var(--ouro);font-family:var(--fonte-titulo);font-weight:800;display:grid;place-items:center;flex-shrink:0;margin-top:22px}
.fgrade-cheia{margin-bottom:0}
.escolhas{display:flex;flex-wrap:wrap;gap:8px}
.escolha{display:inline-flex;align-items:center;gap:6px;padding:8px 13px;border-radius:999px;border:1.5px solid var(--linha);background:#fff;font-weight:600;color:var(--marinho);font-size:14px;transition:all .12s}
.escolha small{font-weight:500;color:var(--suave);font-size:12px}
.escolha:hover{border-color:var(--marinho-3)}
.escolha.marcado{background:var(--marinho);border-color:var(--marinho);color:#fff}
.escolha.marcado small{color:#C9D8F0}
.escolha button{color:inherit;font-weight:800;margin-left:4px}
.horarios{display:grid;grid-template-columns:repeat(auto-fill,minmax(66px,1fr));gap:6px}
.horario{padding:8px 0;border-radius:10px;border:1.5px solid var(--linha);background:#fff;font-weight:700;font-size:13.5px;color:var(--marinho)}
.horario:hover:not(:disabled){border-color:var(--marinho-3)}
.horario.marcado{background:var(--ouro);border-color:var(--ouro-2);color:var(--marinho-2)}
.horario.ocupado{background:#F1F4F9;color:#B2BDD0;text-decoration:line-through;cursor:not-allowed}
.horario.passado:not(.marcado){opacity:.55}
.hora-livre{width:auto;padding:4px 8px;display:inline-block;margin-left:4px}
.caixa-opcao{background:var(--ceu-2);border-radius:var(--raio-p);padding:12px 14px;margin-top:14px;display:flex;flex-direction:column;gap:10px}
.linha-opcao{display:flex;gap:12px;align-items:center;flex-wrap:wrap}
.linha-opcao select{width:auto}
.fotos-ad{display:flex;gap:12px;flex-wrap:wrap;margin:12px 0}
.foto-ad{width:140px;height:140px;border-radius:16px;border:2px dashed #A9C3E6;background:var(--ceu-2);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;color:var(--marinho-3);font-weight:600;font-size:13px;cursor:pointer;overflow:hidden}
.foto-ad img,.fotos-ad figure img{width:100%;height:100%;object-fit:cover}
.fotos-ad figure{margin:0;width:140px}
.fotos-ad figure img{height:140px;border-radius:14px}
.fotos-ad figcaption{text-align:center;font-size:12.5px;color:var(--suave)}
.ag-det-topo{display:flex;gap:14px;align-items:center;margin-bottom:10px}
.ag-det-topo h2{font-size:24px}
.ag-det-topo p{margin:2px 0 0}

/* ---------- agenda ---------- */
.agenda-barra{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px}
.navegar{display:flex;align-items:center;gap:4px;background:#fff;border-radius:999px;padding:3px 6px;box-shadow:var(--sombra)}
.data-agenda{width:auto;border:0;padding:6px;box-shadow:none !important}
.filtro-prof{width:auto;border-radius:999px}
.agenda-dia{background:#fff;border-radius:var(--raio);box-shadow:var(--sombra);overflow-x:auto;padding-bottom:10px}
.ad-cab,.ad-corpo{display:grid;min-width:max-content}
.ad-cab{position:sticky;top:0;background:#fff;z-index:2;border-bottom:1px solid var(--linha)}
.ad-col-nome{padding:12px 10px;font-weight:700;color:var(--marinho);display:flex;align-items:center;gap:8px;border-left:1px solid var(--linha)}
.ad-col-nome i{width:10px;height:10px;border-radius:50%}
.ad-corpo{position:relative;margin-top:8px}
.ad-horas{position:relative}
.ad-horas span{position:absolute;right:8px;transform:translateY(-50%);font-size:11.5px;color:var(--suave);font-weight:600}
.ad-coluna{position:relative;border-left:1px solid var(--linha)}
.ad-linha{position:absolute;left:0;right:0;border-top:1px solid #E8EFF8}
.ad-linha.meia{border-top-style:dashed;border-color:#F0F4FA}
.cartao-ag{position:absolute;text-align:left;border-radius:10px;padding:5px 8px;display:flex;flex-direction:column;overflow:hidden;border-left:4px solid var(--marinho-3);font-size:12.5px;line-height:1.25;box-shadow:0 2px 6px rgba(15,42,92,.08);transition:transform .12s}
.cartao-ag:hover{transform:scale(1.01);z-index:3}
.cartao-ag strong{font-size:13.5px}
.cag-hora{font-weight:700;font-size:11.5px;opacity:.85}
.cag-cli,.cag-serv{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cartao-ag.compacto{position:static;width:100%;padding:6px 8px}
.agenda-semana{display:grid;grid-template-columns:repeat(7,minmax(130px,1fr));gap:8px;overflow-x:auto}
.as-dia{background:#fff;border-radius:16px;box-shadow:var(--sombra);min-height:260px;display:flex;flex-direction:column}
.as-dia.hoje{box-shadow:0 0 0 2px var(--ouro),var(--sombra)}
.as-dia.fechado{background:#F3F6FA}
.as-cab{display:flex;flex-direction:column;align-items:center;padding:10px 0 6px;color:var(--suave);font-weight:700;font-size:12.5px}
.as-cab strong{font-family:var(--fonte-titulo);font-size:24px;color:var(--marinho);line-height:1}
.as-lista{display:flex;flex-direction:column;gap:6px;padding:6px;flex:1}
.as-add{margin-top:auto;border:1.5px dashed #C8D8EE;border-radius:10px;padding:6px;color:#9AAAC6;display:grid;place-items:center}
.as-add:hover{border-color:var(--marinho-3);color:var(--marinho-3)}
.agenda-mes{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px}
.am-cab{text-align:center;font-weight:700;font-size:12.5px;color:var(--suave);padding:4px 0}
.am-dia{background:#fff;border-radius:12px;min-height:96px;padding:6px;text-align:left;display:flex;flex-direction:column;gap:3px;box-shadow:var(--sombra);overflow:hidden}
.am-dia.fora{opacity:.45}
.am-dia.hoje{box-shadow:0 0 0 2px var(--ouro),var(--sombra)}
.am-num{font-family:var(--fonte-titulo);font-weight:800;color:var(--marinho)}
.am-item{font-size:11px;border-radius:6px;padding:1px 5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.am-mais{font-size:11px;color:var(--suave);font-weight:700}
.agenda-lista{display:flex;flex-direction:column;gap:16px}
.al-grupo h3{font-size:15px;color:var(--marinho-3);margin-bottom:8px}
.al-grupo h3::first-letter{text-transform:uppercase}
.al-grupo h3.hoje{color:var(--ouro-2)}
.al-item{width:100%;display:flex;align-items:center;gap:12px;background:#fff;border-radius:16px;box-shadow:var(--sombra);padding:10px 14px;margin-bottom:8px;text-align:left}
.al-hora{font-family:var(--fonte-titulo);font-weight:800;font-size:18px;color:var(--marinho);width:52px}
.al-info{flex:1;display:flex;flex-direction:column;min-width:0}
.al-info strong{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

/* ---------- propostas / financeiro ---------- */
.itens-prop{display:flex;flex-direction:column;gap:8px;margin-bottom:12px}
.item-prop{display:grid;grid-template-columns:1fr 70px 110px 110px 36px;gap:8px;align-items:center}
.item-prop-cab{order:-1;font-size:12px;font-weight:700;color:var(--suave)}
.ip-tot{font-weight:700;text-align:right}
.sel-add{width:auto;flex:1;min-width:220px}
.totais-form{display:flex;justify-content:flex-end;align-items:baseline;gap:18px;flex-wrap:wrap;margin:10px 0 14px;padding:12px 16px;background:var(--ceu-2);border-radius:var(--raio-p)}
.total-grande{font-family:var(--fonte-titulo);font-size:24px;font-weight:800;color:var(--marinho)}
.resumo-pag{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px}
.resumo-pag div{background:var(--ceu-2);border-radius:12px;padding:10px 12px;display:flex;flex-direction:column}
.resumo-pag span{font-size:12.5px;color:var(--suave)}
.resumo-pag b{font-family:var(--fonte-titulo);font-size:19px;color:var(--marinho)}
.resumo-pag .destaque{background:var(--ouro-claro)}
.saldo-calc{background:#F7FAFE;border-radius:12px;padding:10px 14px;margin:12px 0 0}
.lista-pag{list-style:none;margin:0 0 8px;padding:0}
.lista-pag li{display:flex;align-items:center;gap:10px;padding:6px 0;border-top:1px solid var(--linha)}
.lista-pag li span{flex:1}

/* ---------- marketing ---------- */
.canais{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px}
.canal{background:#fff;border-radius:var(--raio);box-shadow:var(--sombra);padding:16px;display:flex;flex-direction:column;align-items:flex-start;gap:2px;text-align:left;transition:transform .15s}
.canal:hover{transform:translateY(-2px)}
.canal span{font-size:26px}
.canal strong{font-family:var(--fonte-titulo);font-size:19px;color:var(--marinho)}
.canal em{font-style:normal;font-size:13px;color:var(--ouro-2);font-weight:700}
.grade-campanhas{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px}
.cartao-campanha{background:#fff;border-radius:var(--raio);box-shadow:var(--sombra);overflow:hidden;display:flex;flex-direction:column}
.cartao-campanha > img{width:100%;height:150px;object-fit:cover}
.cc-sem-img{height:90px;display:grid;place-items:center;background:linear-gradient(135deg,var(--marinho),var(--marinho-3));color:var(--ouro)}
.cc-corpo{padding:14px;display:flex;flex-direction:column;gap:6px;flex:1}
.cc-msg{margin:0;font-size:13.5px;color:var(--suave);white-space:pre-wrap;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.modelos{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin:14px 0}
.img-campanha{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:12px 0}
.img-campanha img{max-width:180px;max-height:140px;border-radius:12px;object-fit:cover}
.lista-envio{list-style:none;margin:0;padding:0;display:flex;flex-direction:column}
.lista-envio li{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 2px;border-top:1px solid var(--linha)}
.lista-envio li:first-child{border-top:0}
.lista-envio li > span{display:flex;flex-direction:column;min-width:0}
.lista-envio li.feito{opacity:.6}
.texto-campanha{white-space:pre-wrap;background:var(--ceu-2);border-radius:12px;padding:12px;font-family:var(--fonte);font-size:14px}

/* ---------- relatórios ---------- */
.tabela-rolagem{overflow-x:auto}
.tabela-simples{width:100%;border-collapse:collapse;font-size:14px;min-width:560px}
.tabela-simples th{text-align:left;font-size:12.5px;color:var(--suave);padding:8px;border-bottom:2px solid var(--linha)}
.tabela-simples td{padding:8px;border-bottom:1px solid var(--linha)}

/* ---------- configurações ---------- */
.abas-config{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px}
.abas-config button{padding:9px 14px;border-radius:12px;background:#fff;font-weight:700;color:var(--marinho);box-shadow:var(--sombra);font-size:14px}
.abas-config button.ativo{background:var(--marinho);color:#fff}
.logo-config{display:flex;align-items:center;gap:16px;margin-bottom:16px}
.logo-config img{width:84px;height:84px;border-radius:50%;object-fit:cover;box-shadow:0 0 0 3px var(--ouro)}
.logo-config div{display:flex;flex-direction:column;gap:6px;align-items:flex-start}
.lista-config{list-style:none;margin:0;padding:0;display:flex;flex-direction:column}
.lista-config li{display:flex;align-items:center;gap:10px;padding:10px 4px;border-top:1px solid var(--linha)}
.lista-config li:first-child{border-top:0}
.lista-config li > span:not(.bolinha):not(.menu-avatar){flex:1;display:flex;flex-direction:column;min-width:0}
.lista-config li.inativo{opacity:.55}
.bolinha{width:14px;height:14px;border-radius:50%;flex-shrink:0}
.menu-avatar.pequeno{width:32px;height:32px;font-size:14px}
.cores{display:flex;gap:8px;margin:6px 0 4px}
.cor{width:30px;height:30px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 1px var(--linha)}
.cor.marcado{box-shadow:0 0 0 3px var(--marinho)}
.permissoes{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px}
.linha-add{display:flex;gap:8px;margin-top:12px;max-width:420px}
.hist-pet{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px}
.hist-pet li{background:var(--ceu-2);border-radius:14px;padding:10px 12px;cursor:pointer}
.hist-pet p{margin:4px 0 0}
.hp-topo{display:flex;gap:10px;align-items:baseline;flex-wrap:wrap}
.hp-fotos{display:flex;gap:8px;margin-top:8px}
.hp-fotos figure{margin:0;width:96px}
.hp-fotos img{width:96px;height:96px;object-fit:cover;border-radius:10px}
.hp-fotos figcaption{font-size:11.5px;text-align:center;color:var(--suave)}
.bloqueado{background:#fff;border-radius:24px;padding:32px;text-align:center;box-shadow:var(--sombra-forte);max-width:380px;display:flex;flex-direction:column;align-items:center;gap:10px}
.bloqueado img{width:90px;border-radius:50%;animation:none}
.site-aviso{background:var(--vermelho);color:#fff;text-align:center;padding:10px 16px;font-weight:700;white-space:pre-wrap}
.site-horario{margin:6px 0 0;color:#B9CBEA;font-size:14px}
.site-preco{font-family:var(--fonte-titulo);font-weight:800;color:var(--marinho-3);font-size:18px}

/* ---------- responsivo ---------- */
@media (max-width:1100px){
  .numeros{grid-template-columns:1fr 1fr}
  .grade-painel{grid-template-columns:1fr}
}
@media (max-width:899px){
  :root{--menu:0px}
  .menu-lateral{transform:translateX(-105%);transition:transform .25s ease;width:280px;z-index:120;box-shadow:var(--sombra-forte)}
  .menu-lateral.aberto{transform:none}
  .menu-fundo{display:block;position:fixed;inset:0;background:rgba(15,42,92,.4);z-index:110}
  .principal{margin-left:0;padding:0 14px 170px}
  .so-movel{display:inline-grid}
  .busca-global{max-width:none}
  h1{font-size:26px}
  .saudacao h1{font-size:30px}
  .nav-inferior{display:flex;position:fixed;left:0;right:0;bottom:0;z-index:80;background:var(--marinho);padding:6px 6px calc(6px + env(safe-area-inset-bottom));justify-content:space-around;box-shadow:0 -6px 20px rgba(15,42,92,.18)}
  .nav-inferior button{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;color:#B9CBEA;font-size:11px;font-weight:600;padding:6px 2px;border-radius:12px}
  .nav-inferior button.ativo{color:var(--ouro)}
  .fab{right:14px;bottom:calc(80px + env(safe-area-inset-bottom))}
  .mimi-alternar{right:14px;bottom:calc(140px + env(safe-area-inset-bottom))}
  .mimi{--mimi-x:10px;width:78px;bottom:calc(68px + env(safe-area-inset-bottom))}
  .tabela{background:transparent;box-shadow:none;display:flex;flex-direction:column;gap:10px}
  .tabela-cab{display:none}
  .tabela-linha{grid-template-columns:1fr auto;grid-template-areas:"cli acoes" "contato contato" "pets pets";background:#fff;border:0;border-radius:var(--raio);box-shadow:var(--sombra);gap:8px}
  .cel-cliente{grid-area:cli}.cel-contato{grid-area:contato;font-size:14px}.cel-pets{grid-area:pets}.cel-cidade{display:none}.cel-acoes{grid-area:acoes;align-self:start}
  .login{grid-template-columns:1fr}
  .login-marca{padding:34px 20px 26px}
  .login-logo{width:170px}
  .login-frase{font-size:20px;margin-top:14px}
  .login-mimi{display:none}
  .login-form{padding:26px 20px 40px}
  .modal-fundo{padding:0;place-items:end stretch}
  .modal,.modal-largo{width:100%;max-height:92vh;border-radius:22px 22px 0 0}
  .modal-rodape{padding-bottom:calc(14px + env(safe-area-inset-bottom))}
  .ficha{flex-direction:column;text-align:center;padding:12px 0 0}
  .dados{grid-template-columns:1fr 1fr}
  .ficha-chips{justify-content:center}
  .linha-tempo li{grid-template-columns:1fr;gap:0}
  .filtros select{flex:1;min-width:140px}
  .trilha{padding-left:20px}
  .trilha-passo::before{left:-19px}
  .trilha::before{left:5px}
}
@media (max-width:520px){
  .numeros{gap:8px;grid-template-columns:repeat(3,1fr)}
  .numero{padding:12px}
  .numero-valor{font-size:28px}
  .numero-rotulo{font-size:12.5px;line-height:1.3}
  .numero:not(.numero-destaque) .numero-icone{display:none}
  .numero-destaque{grid-column:1/-1}
  .numero-destaque .numero-valor{font-size:44px}
  .pet-form-topo{flex-direction:column;align-items:center}
  .pet-form-principal{width:100%}
  .grade-pets{grid-template-columns:1fr 1fr;gap:10px}
  .acoes-topo .btn{flex:1}
  .acoes-topo .btn-texto-perigo{flex:0 0 auto}
}

@media (max-width:899px){
  .th-linha{grid-template-columns:52px 1fr 130px;grid-template-areas:"h c s" "h p s";row-gap:0}
  .th-linha > span:nth-child(1){grid-area:h}.th-linha > span:nth-child(2){grid-area:c}.th-linha > span:nth-child(3){grid-area:p}.th-linha > span:nth-child(4){display:none}.th-linha > span:nth-child(5){grid-area:s}
  .th-cab{display:none}
  .canais{grid-template-columns:1fr 1fr}
  .numeros-auto{grid-template-columns:1fr 1fr}
  .numeros-auto .numero-destaque{grid-column:1/-1}
  .numero-dinheiro .numero-valor{font-size:21px}
  .item-prop{grid-template-columns:1fr 60px 90px 34px}
  .item-prop .ip-tot{display:none}
  .item-prop-cab span:nth-child(4){display:none}
  .lista-mini li{grid-template-columns:1fr auto;}
  .lista-mini li > span:nth-child(2){grid-column:1/-1;order:3;font-size:13px;color:var(--suave)}
  .agenda-semana{grid-template-columns:repeat(7,minmax(150px,1fr))}
  .am-dia{min-height:64px}
  .am-item{display:none}
  .am-dia:has(.am-item)::after{content:"";width:6px;height:6px;border-radius:50%;background:var(--ouro-2)}
  .resumo-pag b{font-size:16px}
  .passo-num{margin-top:22px;width:24px;height:24px;font-size:13px}
  .cl-valor{align-items:flex-start}
}
@media (prefers-reduced-motion:reduce){
  *,*::before,*::after{animation-duration:.01ms !important;animation-iteration-count:1 !important;transition-duration:.01ms !important}
}
`;
