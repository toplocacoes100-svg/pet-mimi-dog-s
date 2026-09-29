// =====================================================================
//  MIMI DOG'S PET SHOP — Sistema de Gestão
//  Etapa 1: Login, níveis de acesso, Dashboard, Clientes, Pets e a Mimi
// =====================================================================
import React, { useState, useEffect, useMemo, useRef, useCallback, createContext, useContext } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail,
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
const linkMapa = () => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(EMPRESA.endereco + " Mimi Dog's Pet Shop")}`;

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
  async adicionar(col, dados) {
    const registro = { ...dados, criadoEm: dados.criadoEm || new Date().toISOString() };
    if (MODO_DEMO) {
      const id = gerarId();
      demoStore.gravar(col, [...demoStore.ler(col), { ...registro, id }]);
      return id;
    }
    const ref = await addDoc(collection(fbDb, col), registro);
    return ref.id;
  },
  async atualizar(col, id, dados) {
    const registro = { ...dados, atualizadoEm: new Date().toISOString() };
    delete registro.id;
    if (MODO_DEMO) {
      demoStore.gravar(col, demoStore.ler(col).map((r) => (r.id === id ? { ...r, ...registro } : r)));
      return;
    }
    await updateDoc(doc(fbDb, col, id), registro);
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
  const mesesAtras = (m) => new Date(agora.getFullYear(), agora.getMonth() - m, 10).toISOString();
  const clientes = [
    { id: "c1", codigo: "CLI-000001", nome: "Ana Paula Ferreira", documento: "12345678909", telefone: "11987654321", whatsapp: "11987654321", email: "ana@email.com", cidade: "São Paulo", estado: "SP", bairro: "Vila Mariana", origem: "Instagram", dataCadastro: mesesAtras(4).slice(0, 10), criadoEm: mesesAtras(4) },
    { id: "c2", codigo: "CLI-000002", nome: "Carlos Eduardo Lima", telefone: "11912345678", whatsapp: "11912345678", email: "", cidade: "São Paulo", estado: "SP", bairro: "Moema", origem: "Indicação", dataCadastro: mesesAtras(2).slice(0, 10), criadoEm: mesesAtras(2) },
    { id: "c3", codigo: "CLI-000003", nome: "Juliana Martins", telefone: "11955554444", whatsapp: "", email: "ju@email.com", cidade: "Santo André", estado: "SP", origem: "Google", dataCadastro: hojeISO(), criadoEm: agora.toISOString() },
  ];
  const mesAtual = String(agora.getMonth() + 1).padStart(2, "0");
  const pets = [
    { id: "p1", codigo: "PET-000001", clienteId: "c1", nome: "Thor", especie: "Cão", raca: "Pug", sexo: "Macho", nascimento: `2021-${mesAtual}-15`, peso: "8,5", cor: "Abricó", porte: "Pequeno", temperamento: "Brincalhão", alergias: "Shampoo com perfume forte", ultimoBanho: hojeISO(), criadoEm: mesesAtras(4) },
    { id: "p2", codigo: "PET-000002", clienteId: "c1", nome: "Luna", especie: "Gato", raca: "SRD", sexo: "Fêmea", nascimento: "2020-03-02", peso: "4", porte: "Pequeno", temperamento: "Medroso", criadoEm: mesesAtras(3) },
    { id: "p3", codigo: "PET-000003", clienteId: "c2", nome: "Bob", especie: "Cão", raca: "Golden Retriever", sexo: "Macho", nascimento: "2019-08-20", peso: "31", porte: "Grande", temperamento: "Dócil", cuidados: "Idoso, manusear com calma", criadoEm: mesesAtras(2) },
    { id: "p4", codigo: "PET-000004", clienteId: "c3", nome: "Pipoca", especie: "Cão", raca: "Shih Tzu", sexo: "Fêmea", nascimento: "2023-11-05", peso: "5,2", porte: "Pequeno", temperamento: "Agitado", criadoEm: agora.toISOString() },
  ];
  demoStore.gravar("clientes", clientes);
  demoStore.gravar("pets", pets);
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
  { id: "agenda", nome: "Agenda", curto: "Agenda", icone: "calendar", etapa: 2 },
  { id: "propostas", nome: "Propostas", curto: "Propostas", icone: "file", etapa: 3 },
  { id: "financeiro", nome: "Financeiro", curto: "Financeiro", icone: "wallet", etapa: 3 },
  { id: "marketing", nome: "Marketing", curto: "Marketing", icone: "megaphone", etapa: 4 },
  { id: "relatorios", nome: "Relatórios", curto: "Relatórios", icone: "chart", etapa: 4 },
  { id: "configuracoes", nome: "Configurações", curto: "Config.", icone: "gear", etapa: 4 },
];
const PERMISSOES = {
  administrador: MODULOS.map((m) => m.id),
  funcionario: ["dashboard", "clientes", "pets", "agenda", "propostas"],
  financeiro: ["dashboard", "financeiro", "relatorios"],
};
const NOME_PAPEL = { administrador: "Administrador", funcionario: "Funcionário", financeiro: "Financeiro" };
const modulosDoUsuario = (u) => (Array.isArray(u?.modulos) && u.modulos.length ? u.modulos : PERMISSOES[u?.papel] || ["dashboard"]);

const USUARIOS_DEMO = [
  { uid: "demo-admin", nome: "Mimi Admin", email: "admin@mimidogs.com", senha: "mimi123", papel: "administrador" },
  { uid: "demo-func", nome: "Bruna Atendente", email: "funcionario@mimidogs.com", senha: "mimi123", papel: "funcionario" },
  { uid: "demo-fin", nome: "Rafael Financeiro", email: "financeiro@mimidogs.com", senha: "mimi123", papel: "financeiro" },
];

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
          cb({ uid: user.uid, email: user.email, ...s.data() });
        } else {
          const existentes = await getDocs(query(collection(fbDb, "users"), limit(1)));
          const perfil = {
            nome: user.displayName || primeiroNome(user.email.split("@")[0]),
            email: user.email,
            papel: existentes.empty ? "administrador" : "funcionario",
            criadoEm: new Date().toISOString(),
          };
          await setDoc(ref, perfil);
          cb({ uid: user.uid, ...perfil });
        }
      } catch (e) {
        console.error(e);
        cb({ uid: user.uid, email: user.email, nome: primeiroNome(user.email.split("@")[0]), papel: "funcionario" });
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
};

const traduzErro = (e) => {
  const c = e?.code || "";
  if (c.includes("invalid-credential") || c.includes("wrong-password") || c.includes("user-not-found")) return "E-mail ou senha incorretos.";
  if (c.includes("too-many-requests")) return "Muitas tentativas. Aguarde alguns minutos.";
  if (c.includes("invalid-email")) return "E-mail inválido.";
  if (c.includes("network")) return "Sem conexão com a internet.";
  return e?.message || "Algo deu errado. Tente novamente.";
};

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
//  DASHBOARD
// =====================================================================
const NOMES_MES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function GraficoBarras({ dados }) {
  const max = Math.max(1, ...dados.flatMap((d) => [d.a, d.b]));
  const L = 320, A = 150, base = 124, larguraGrupo = L / dados.length;
  return (
    <svg viewBox={`0 0 ${L} ${A}`} className="grafico" role="img" aria-label="Novos clientes e pets por mês">
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line key={f} x1="0" x2={L} y1={base - f * 104} y2={base - f * 104} stroke="#E3EDF8" strokeWidth="1" />
      ))}
      {dados.map((d, i) => {
        const x = i * larguraGrupo + larguraGrupo / 2;
        const ha = (d.a / max) * 104, hb = (d.b / max) * 104;
        return (
          <g key={d.rotulo}>
            <rect x={x - 15} y={base - ha} width="13" height={Math.max(ha, 1.5)} rx="4" fill="#173A7A" />
            <rect x={x + 2} y={base - hb} width="13" height={Math.max(hb, 1.5)} rx="4" fill="#F6C230" />
            {d.a > 0 && <text x={x - 8.5} y={base - ha - 4} textAnchor="middle" fontSize="9" fill="#173A7A" fontWeight="700">{d.a}</text>}
            {d.b > 0 && <text x={x + 8.5} y={base - hb - 4} textAnchor="middle" fontSize="9" fill="#9A7200" fontWeight="700">{d.b}</text>}
            <text x={x} y={A - 8} textAnchor="middle" fontSize="11" fill="#5A6E92">{d.rotulo}</text>
          </g>
        );
      })}
    </svg>
  );
}

function calcularAlertas(clientes, pets, pedidos = []) {
  const alertas = [];
  const novos = pedidos.filter((p) => p.status === "novo").length;
  if (novos) alertas.push({ tipo: "site", texto: `${novos} pedido${novos > 1 ? "s" : ""} de agendamento pelo site esperando resposta` });
  const mesAtual = String(new Date().getMonth() + 1).padStart(2, "0");
  const hojeMD = hojeISO().slice(5);
  pets.forEach((p) => {
    if (p.nascimento && p.nascimento.slice(5) === hojeMD) alertas.push({ tipo: "festa", texto: `Hoje é aniversário do ${p.nome}! 🎂`, petId: p.id });
  });
  pets.forEach((p) => {
    if (p.proximoAtendimento) {
      const dias = Math.round((new Date(p.proximoAtendimento + "T12:00") - new Date(hojeISO() + "T12:00")) / 86400000);
      if (dias >= 0 && dias <= 3) alertas.push({ tipo: "retorno", texto: `${p.nome} tem retorno de banho/tosa ${dias === 0 ? "hoje" : `em ${dias} dia${dias > 1 ? "s" : ""}`}`, petId: p.id });
      else if (dias < 0 && dias >= -15) alertas.push({ tipo: "atraso", texto: `Retorno do ${p.nome} passou há ${-dias} dia${-dias > 1 ? "s" : ""} — vale chamar o tutor`, petId: p.id });
    }
  });
  const aniversariantes = pets.filter((p) => p.nascimento && p.nascimento.slice(5, 7) === mesAtual && p.nascimento.slice(5) !== hojeMD);
  if (aniversariantes.length) alertas.push({ tipo: "festa", texto: `${aniversariantes.length} pet${aniversariantes.length > 1 ? "s fazem" : " faz"} aniversário este mês` });
  const semWhats = clientes.filter((c) => !soDigitos(c.whatsapp) && !soDigitos(c.telefone));
  if (semWhats.length) alertas.push({ tipo: "atencao", texto: `${semWhats.length} cliente${semWhats.length > 1 ? "s" : ""} sem telefone/WhatsApp cadastrado` });
  const comAlergia = pets.filter((p) => (p.alergias || "").trim());
  if (comAlergia.length) alertas.push({ tipo: "atencao", texto: `${comAlergia.length} pet${comAlergia.length > 1 ? "s" : ""} com alergia registrada — confira antes do banho` });
  return alertas;
}

function Dashboard({ usuario, clientes, pets, pedidos, irPara, abrirPet, painelPedidos }) {
  const mimi = useMimi();
  const falou = useRef(false);
  const alertasRef = useRef([]);
  const mesAtual = hojeISO().slice(0, 7);
  const novosClientesMes = clientes.filter((c) => mesDe(c.criadoEm) === mesAtual).length;
  const novosPetsMes = pets.filter((p) => mesDe(p.criadoEm) === mesAtual).length;
  const alertas = useMemo(() => calcularAlertas(clientes, pets, pedidos), [clientes, pets, pedidos]);

  const serie = useMemo(() => {
    const d = new Date();
    const lista = [];
    for (let i = 5; i >= 0; i--) {
      const x = new Date(d.getFullYear(), d.getMonth() - i, 1);
      const chave = `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}`;
      lista.push({
        rotulo: NOMES_MES[x.getMonth()],
        a: clientes.filter((c) => mesDe(c.criadoEm) === chave).length,
        b: pets.filter((p) => mesDe(p.criadoEm) === chave).length,
      });
    }
    return lista;
  }, [clientes, pets]);

  const origens = useMemo(() => {
    const cont = {};
    clientes.forEach((c) => { const o = c.origem || "Outros"; cont[o] = (cont[o] || 0) + 1; });
    return Object.entries(cont).sort((a, b) => b[1] - a[1]);
  }, [clientes]);

  const especies = useMemo(() => {
    const cont = {};
    pets.forEach((p) => { const e = p.especie || "Outro"; cont[e] = (cont[e] || 0) + 1; });
    return Object.entries(cont).sort((a, b) => b[1] - a[1]);
  }, [pets]);

  alertasRef.current = alertas;
  useEffect(() => {
    // A Mimi comenta o primeiro aviso logo depois que o painel abre
    const t = setTimeout(() => {
      if (falou.current) return;
      falou.current = true;
      const lista = alertasRef.current;
      if (lista.length) mimi.falar(`Psiu! ${lista[0].texto}`, 7000);
      else mimi.falar(`Oi, ${primeiroNome(usuario.nome)}! Tudo tranquilo por aqui hoje 💙`, 5000);
    }, 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dataHoje = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  const maxOrigem = Math.max(1, ...origens.map((o) => o[1]));

  return (
    <div className="pagina">
      <header className="saudacao">
        <div>
          <p className="saudacao-data">{dataHoje}</p>
          <h1>Olá, {primeiroNome(usuario.nome)}! 🐶</h1>
        </div>
      </header>

      <section className="numeros">
        <button className="numero numero-destaque" onClick={() => irPara("clientes")}>
          <span className="numero-valor">{clientes.length}</span>
          <span className="numero-rotulo">clientes cadastrados</span>
          <Icone nome="users" tam={26} className="numero-icone" />
        </button>
        <button className="numero" onClick={() => irPara("pets")}>
          <span className="numero-valor">{pets.length}</span>
          <span className="numero-rotulo">pets na família Mimi</span>
          <Icone nome="paw" tam={26} className="numero-icone" />
        </button>
        <div className="numero">
          <span className="numero-valor">{novosClientesMes}</span>
          <span className="numero-rotulo">novos clientes este mês</span>
        </div>
        <div className="numero">
          <span className="numero-valor">{novosPetsMes}</span>
          <span className="numero-rotulo">novos pets este mês</span>
        </div>
      </section>

      <div className="grade-painel">
        {painelPedidos}
        <section className="painel painel-agenda">
          <div className="painel-topo"><h2>Agenda de hoje</h2><Icone nome="calendar" /></div>
          <div className="agenda-embreve">
            <p>A agenda com horários, status do atendimento e lembretes por WhatsApp chega na <b>etapa 2</b>.</p>
            <p className="texto-suave">Quando ela entrar, os agendamentos do dia aparecem aqui: horário, cliente, pet, serviço e status.</p>
          </div>
        </section>

        <section className="painel">
          <div className="painel-topo"><h2>Avisos</h2><Icone nome="bell" /></div>
          {alertas.length === 0 ? (
            <p className="texto-suave">Nenhum aviso agora. Tudo em ordem! 🐾</p>
          ) : (
            <ul className="lista-avisos">
              {alertas.map((a, i) => (
                <li key={i} className={`aviso aviso-${a.tipo}`}>
                  {a.petId ? <button className="link-aviso" onClick={() => abrirPet(a.petId)}>{a.texto}</button> : <span>{a.texto}</span>}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="painel painel-grafico">
          <div className="painel-topo">
            <h2>Crescimento nos últimos 6 meses</h2>
          </div>
          <div className="legenda">
            <span><i style={{ background: "#173A7A" }} />Clientes</span>
            <span><i style={{ background: "#F6C230" }} />Pets</span>
          </div>
          <GraficoBarras dados={serie} />
        </section>

        <section className="painel">
          <div className="painel-topo"><h2>De onde vêm os clientes</h2></div>
          {origens.length === 0 ? <p className="texto-suave">Cadastre clientes para ver as origens.</p> : (
            <div className="barras-h">
              {origens.map(([nome, n]) => (
                <div key={nome} className="barra-h">
                  <span className="barra-h-nome">{nome}</span>
                  <div className="barra-h-trilho"><div style={{ width: `${(n / maxOrigem) * 100}%` }} /></div>
                  <span className="barra-h-n">{n}</span>
                </div>
              ))}
            </div>
          )}
          {especies.length > 0 && (
            <div className="especies">
              {especies.map(([e, n]) => <span key={e} className="chip">{e}: {n}</span>)}
            </div>
          )}
        </section>
      </div>
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

function DetalheCliente({ cliente, pets, historico, voltar, editar, excluir, novoPet, abrirPet, podeExcluir }) {
  const seusPets = pets.filter((p) => p.clienteId === cliente.id);
  const linhaTempo = historico.filter((h) => h.clienteId === cliente.id).sort((a, b) => String(b.data).localeCompare(String(a.data)));
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
          <button className="btn btn-leve" onClick={editar}><Icone nome="edit" tam={18} /> Editar</button>
          {podeExcluir && <button className="btn btn-leve btn-texto-perigo" onClick={excluir}><Icone nome="trash" tam={18} /></button>}
        </div>
      </header>

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

        <section className="trilha-passo trilha-futuro">
          <h2>Agendamentos e serviços</h2>
          <p className="texto-suave">Aparecem aqui a partir da etapa 2 (Agenda).</p>
        </section>
        <section className="trilha-passo trilha-futuro">
          <h2>Propostas e pagamentos</h2>
          <p className="texto-suave">Aparecem aqui a partir da etapa 3 (Propostas e Financeiro).</p>
        </section>

        <section className="trilha-passo">
          <h2>Observações</h2>
          <p className="observacoes">{cliente.observacoes || <span className="texto-suave">Sem observações.</span>}</p>
        </section>

        <section className="trilha-passo">
          <h2>Linha do tempo</h2>
          {linhaTempo.length === 0 ? <p className="texto-suave">Sem registros ainda.</p> : (
            <ol className="linha-tempo">
              {linhaTempo.map((h) => (
                <li key={h.id}>
                  <span className="lt-data">{fmtDataHora(h.data)}</span>
                  <span>{h.descricao}{h.usuario ? <span className="texto-suave"> — {h.usuario}</span> : null}</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
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

function FichaPet({ pet, cliente, historico, aoFechar, editar, excluir, abrirCliente, podeExcluir }) {
  const registros = historico.filter((h) => h.petId === pet.id).sort((a, b) => String(b.data).localeCompare(String(a.data)));
  return (
    <Modal titulo={`Ficha · ${pet.codigo || ""}`} aoFechar={aoFechar} largo
      rodape={<>
        {podeExcluir && <button className="btn btn-leve btn-texto-perigo" onClick={excluir}><Icone nome="trash" tam={18} /> Excluir</button>}
        <button className="btn btn-ouro" onClick={editar}><Icone nome="edit" tam={18} /> Editar</button>
      </>}>
      <div className="ficha">
        <div className="ficha-foto">
          {pet.foto ? <img src={pet.foto} alt={pet.nome} /> : <div className="ficha-foto-vazia"><Icone nome="paw" tam={64} /></div>}
        </div>
        <div className="ficha-cab">
          <h2>{pet.nome}</h2>
          <p>{[pet.especie, pet.raca, pet.sexo].filter(Boolean).join(" · ")}</p>
          {cliente && (
            <button className="link" onClick={() => abrirCliente(cliente.id)}>Tutor: {cliente.nome} ({cliente.codigo})</button>
          )}
          <div className="ficha-chips">
            {pet.nascimento && <span className="chip">{idadeTexto(pet.nascimento)}</span>}
            {pet.peso && <span className="chip">{pet.peso} kg</span>}
            {pet.porte && <span className="chip">Porte {pet.porte.toLowerCase()}</span>}
            {pet.temperamento && <span className="chip chip-ouro">{pet.temperamento}</span>}
          </div>
        </div>
      </div>

      {(pet.alergias || "").trim() && (
        <div className="alerta alerta-erro"><Icone nome="alert" tam={18} /> <b>Alergia:</b> {pet.alergias}</div>
      )}
      {(pet.cuidados || "").trim() && (
        <div className="alerta alerta-info"><Icone nome="heart" tam={18} /> <b>Cuidados especiais:</b> {pet.cuidados}</div>
      )}

      <dl className="dados dados-ficha">
        <div><dt>Nascimento</dt><dd>{fmtData(pet.nascimento)}</dd></div>
        <div><dt>Cor</dt><dd>{pet.cor || "—"}</dd></div>
        <div><dt>Último banho</dt><dd>{fmtData(pet.ultimoBanho)}</dd></div>
        <div><dt>Última tosa</dt><dd>{fmtData(pet.ultimaTosa)}</dd></div>
        <div><dt>Próximo atendimento</dt><dd>{fmtData(pet.proximoAtendimento)}</dd></div>
        <div className="dados-largo"><dt>Vacinação</dt><dd>{pet.vacinacao || "—"}</dd></div>
        <div className="dados-largo"><dt>Observações</dt><dd>{pet.observacoes || "—"}</dd></div>
      </dl>

      <h3 className="form-secao">Histórico</h3>
      <p className="texto-suave peq">Banhos, tosas, hidratação, produtos usados e fotos de antes/depois entram aqui automaticamente a partir da etapa 2.</p>
      {registros.length > 0 && (
        <ol className="linha-tempo">
          {registros.map((h) => (
            <li key={h.id}><span className="lt-data">{fmtDataHora(h.data)}</span><span>{h.descricao}</span></li>
          ))}
        </ol>
      )}
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
//  PÁGINA "EM BREVE"
// =====================================================================
const DESCRICAO_ETAPAS = {
  agenda: "Agenda com visão de dia, semana, mês e lista, bloqueio de conflito de horários por profissional, cadastro de serviços e lembrete automático pelo WhatsApp.",
  propostas: "Propostas e orçamentos com número automático, PDF com o logo, status (rascunho, enviada, aprovada…) e botão de enviar pelo WhatsApp.",
  financeiro: "Contas a receber e a pagar, pagamento parcial com saldo calculado sozinho, atrasados e painel com saldo, entradas, saídas e lucro.",
  marketing: "Campanhas por WhatsApp, e-mail e Instagram, modelos de mensagem com nome do cliente e do pet preenchidos sozinhos.",
  relatorios: "Relatórios de faturamento, serviços, clientes novos e recorrentes, cancelamentos, com exportação para PDF e Excel.",
  configuracoes: "Dados da empresa, serviços e preços, profissionais, usuários e permissões, mensagens automáticas e liga/desliga da Mimi.",
};
function EmBreve({ modulo }) {
  return (
    <div className="pagina">
      <header className="pagina-topo"><div><h1>{modulo.nome}</h1></div></header>
      <div className="embreve">
        <div className="embreve-mimi"><MimiDesenho modo="dormindo" /></div>
        <span className="chip chip-ouro">Etapa {modulo.etapa}</span>
        <h2>Essa parte ainda está sendo preparada</h2>
        <p>{DESCRICAO_ETAPAS[modulo.id]}</p>
      </div>
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
//  ESTRUTURA PRINCIPAL (menu, topo, botão + Novo)
// =====================================================================
function Sistema({ usuario }) {
  const [clientes, setClientes] = useState([]);
  const [pets, setPets] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [pagina, setPagina] = useState("dashboard");
  const [clienteAberto, setClienteAberto] = useState(null);
  const [petAberto, setPetAberto] = useState(null);
  const [formCliente, setFormCliente] = useState(null);
  const [formPet, setFormPet] = useState(null);
  const [confirmacao, setConfirmacao] = useState(null);
  const [menuMovel, setMenuMovel] = useState(false);
  const [fabAberto, setFabAberto] = useState(false);
  const [toast, setToast] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const mimi = useMimi();

  const permitidos = modulosDoUsuario(usuario);
  const pode = (m) => permitidos.includes(m);
  const podeExcluir = usuario.papel === "administrador";

  useEffect(() => {
    const u1 = db.ouvir("clientes", setClientes);
    const u2 = db.ouvir("pets", setPets);
    const u3 = db.ouvir("historico", setHistorico);
    const u4 = db.ouvir("pedidos_site", setPedidos);
    return () => { u1(); u2(); u3(); u4(); };
  }, []);

  const avisar = useCallback((texto, tipo = "ok") => {
    setToast({ texto, tipo, id: Date.now() });
    setTimeout(() => setToast(null), 3200);
  }, []);

  const irPara = (id) => {
    if (!pode(id)) return;
    setPagina(id); setClienteAberto(null); setMenuMovel(false); setFabAberto(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const abrirCliente = (id) => { setPetAberto(null); setPagina("clientes"); setClienteAberto(id); setMenuMovel(false); window.scrollTo({ top: 0 }); };
  const abrirPet = (id) => setPetAberto(id);

  // ---- Salvar / excluir ----
  const salvarCliente = async (dadosForm) => {
    const { _pedidoId, ...dados } = dadosForm;
    if (_pedidoId) {
      try { await db.atualizar("pedidos_site", _pedidoId, { clienteCadastrado: true }); } catch (e) { console.error(e); }
    }
    if (dados.id) {
      const { id, ...resto } = dados;
      await db.atualizar("clientes", id, resto);
      await registrarHistorico(usuario, "cliente", `Dados do cliente atualizados`, { clienteId: id });
      avisar("Cliente atualizado");
      mimi.comemorar("Prontinho, atualizei os dados! ✅");
    } else {
      const n = await db.proximoNumero("clientes");
      const novo = { ...dados, codigo: codigo("CLI", n), dataCadastro: hojeISO() };
      const id = await db.adicionar("clientes", novo);
      await registrarHistorico(usuario, "cliente", `Cliente ${novo.nome} cadastrado (${novo.codigo})`, { clienteId: id });
      avisar(`Cliente ${novo.codigo} cadastrado`);
      mimi.comemorar(`Oba! ${primeiroNome(novo.nome)} agora faz parte da família Mimi! 🎉`);
    }
    setFormCliente(null);
  };

  const salvarPet = async (dados) => {
    const { clienteIdFixo, ...limpo } = dados;
    if (limpo.id) {
      const { id, ...resto } = limpo;
      await db.atualizar("pets", id, resto);
      await registrarHistorico(usuario, "pet", `Ficha do ${resto.nome} atualizada`, { clienteId: resto.clienteId, petId: id });
      avisar("Pet atualizado");
      mimi.comemorar(`Ficha do ${resto.nome} atualizada! 🐾`);
    } else {
      const n = await db.proximoNumero("pets");
      const novo = { ...limpo, codigo: codigo("PET", n) };
      const id = await db.adicionar("pets", novo);
      await registrarHistorico(usuario, "pet", `Pet ${novo.nome} cadastrado (${novo.codigo})`, { clienteId: novo.clienteId, petId: id });
      avisar(`${novo.nome} cadastrado`);
      mimi.comemorar(`Au au! Bem-vindo, ${novo.nome}! 🐶💙`);
    }
    setFormPet(null);
  };

  const pedirExclusaoCliente = (c) => {
    const n = pets.filter((p) => p.clienteId === c.id).length;
    setConfirmacao({
      titulo: "Excluir cliente?",
      texto: `Isso vai apagar ${c.nome} (${c.codigo})${n ? ` e ${n === 1 ? "o pet dele" : `os ${n} pets dele`}` : ""}. Essa ação não pode ser desfeita.`,
      acao: async () => {
        for (const p of pets.filter((x) => x.clienteId === c.id)) await db.remover("pets", p.id);
        await db.remover("clientes", c.id);
        await registrarHistorico(usuario, "exclusao", `Cliente ${c.nome} (${c.codigo}) excluído`);
        setConfirmacao(null); setClienteAberto(null);
        avisar("Cliente excluído");
      },
    });
  };

  const pedirExclusaoPet = (p) => {
    setConfirmacao({
      titulo: "Excluir pet?",
      texto: `Isso vai apagar a ficha de ${p.nome} (${p.codigo}). Essa ação não pode ser desfeita.`,
      acao: async () => {
        await db.remover("pets", p.id);
        await registrarHistorico(usuario, "exclusao", `Pet ${p.nome} (${p.codigo}) excluído`, { clienteId: p.clienteId });
        setConfirmacao(null); setPetAberto(null);
        avisar("Pet excluído");
      },
    });
  };

  const novoPet = (clienteId) => {
    setFabAberto(false);
    if (!clientes.length) { avisar("Cadastre um cliente antes do pet", "aviso"); return; }
    setFormPet(clienteId ? { clienteId, clienteIdFixo: true } : {});
  };

  // ---- Conteúdo ----
  const moduloAtual = MODULOS.find((m) => m.id === pagina);
  const clienteSel = clientes.find((c) => c.id === clienteAberto);
  const petSel = pets.find((p) => p.id === petAberto);

  let conteudo;
  if (!pode(pagina)) conteudo = <EmBreve modulo={{ ...moduloAtual, etapa: "—" }} />;
  else if (moduloAtual?.etapa) conteudo = <EmBreve modulo={moduloAtual} />;
  else if (pagina === "dashboard") conteudo = (
    <Dashboard usuario={usuario} clientes={clientes} pets={pets} pedidos={pode("clientes") ? pedidos : []} irPara={irPara} abrirPet={abrirPet}
      painelPedidos={pode("clientes") ? (
        <PainelPedidos pedidos={pedidos} clientes={clientes}
          mudarStatus={async (pd, status) => {
            await db.atualizar("pedidos_site", pd.id, { status });
            await registrarHistorico(usuario, "site", `Pedido do site de ${pd.nome} marcado como ${status}`);
            avisar(status === "confirmado" ? "Pedido confirmado" : "Pedido arquivado");
            if (status === "confirmado") mimi.comemorar(`Oba! ${pd.pet || "O pet"} vem nos visitar! 🛁`);
          }}
          cadastrar={(pd) => setFormCliente({ nome: pd.nome, whatsapp: pd.whatsapp, origem: "Site", observacoes: pd.observacoes || "", _pedidoId: pd.id })} />
      ) : null} />
  );
  else if (pagina === "clientes" && clienteSel) conteudo = (
    <DetalheCliente cliente={clienteSel} pets={pets} historico={historico} voltar={() => setClienteAberto(null)}
      editar={() => setFormCliente(clienteSel)} excluir={() => pedirExclusaoCliente(clienteSel)}
      novoPet={() => novoPet(clienteSel.id)} abrirPet={abrirPet} podeExcluir={podeExcluir} />
  );
  else if (pagina === "clientes") conteudo = (
    <ListaClientes clientes={clientes} pets={pets} abrirCliente={abrirCliente} novoCliente={() => setFormCliente({})}
      editarCliente={(c) => setFormCliente(c)} excluirCliente={pedirExclusaoCliente} podeExcluir={podeExcluir} />
  );
  else if (pagina === "pets") conteudo = <ListaPets pets={pets} clientes={clientes} abrirPet={abrirPet} novoPet={novoPet} />;

  const modulosMenu = MODULOS.filter((m) => pode(m.id));
  const navInferior = modulosMenu.slice(0, 4);
  const podeCadastrar = pode("clientes");

  const itensNovo = [
    { rotulo: "Novo cliente", icone: "users", acao: () => { setFabAberto(false); setFormCliente({}); } },
    { rotulo: "Novo pet", icone: "paw", acao: () => novoPet() },
    { rotulo: "Novo agendamento", icone: "calendar", etapa: 2 },
    { rotulo: "Nova proposta", icone: "file", etapa: 3 },
    { rotulo: "Novo lançamento financeiro", icone: "wallet", etapa: 3 },
  ];

  return (
    <div className="app">
      <aside className={`menu-lateral ${menuMovel ? "aberto" : ""}`}>
        <div className="menu-marca">
          <img src={LOGO} alt="" />
          <div><strong>Mimi Dog's</strong><span>Pet Shop</span></div>
        </div>
        <nav className="menu-nav">
          {modulosMenu.map((m) => (
            <button key={m.id} className={`menu-item ${pagina === m.id ? "ativo" : ""}`} onClick={() => irPara(m.id)}>
              <Icone nome={m.icone} tam={20} />
              <span>{m.nome}</span>
              {m.etapa && <em>em breve</em>}
            </button>
          ))}
        </nav>
        <a className="menu-item menu-site" href="#/" target="_blank" rel="noreferrer">
          <Icone nome="globo" tam={20} /><span>Ver o site</span>
        </a>
        <div className="menu-usuario">
          <div className="menu-avatar">{primeiroNome(usuario.nome).slice(0, 1).toUpperCase()}</div>
          <div className="menu-usuario-info">
            <strong>{usuario.nome}</strong>
            <span>{NOME_PAPEL[usuario.papel] || usuario.papel}</span>
          </div>
          <button className="btn-icone claro" onClick={() => autenticacao.sair()} aria-label="Sair"><Icone nome="logout" tam={18} /></button>
        </div>
      </aside>
      {menuMovel && <div className="menu-fundo" onClick={() => setMenuMovel(false)} />}

      <main className="principal">
        <div className="topo">
          <button className="btn-icone so-movel" onClick={() => setMenuMovel(true)} aria-label="Abrir menu"><Icone nome="menu" /></button>
          <img src={LOGO} alt="" className="topo-logo so-movel" />
          <BuscaGlobal clientes={clientes} pets={pets} abrirCliente={abrirCliente} abrirPet={abrirPet} podeClientes={pode("clientes")} />
        </div>
        {MODO_DEMO && <div className="faixa-demo">Modo de teste: os dados ficam só neste navegador até a configuração do Firebase ser colada no sistema.</div>}
        {conteudo}
      </main>

      <nav className="nav-inferior">
        {navInferior.map((m) => (
          <button key={m.id} className={pagina === m.id ? "ativo" : ""} onClick={() => irPara(m.id)}>
            <Icone nome={m.icone} tam={22} /><span>{m.curto}</span>
          </button>
        ))}
        <button onClick={() => setMenuMovel(true)}><Icone nome="menu" tam={22} /><span>Mais</span></button>
      </nav>

      {podeCadastrar && (
        <div className={`fab ${fabAberto ? "aberto" : ""}`}>
          {fabAberto && (
            <div className="fab-menu">
              {itensNovo.map((it) => (
                <button key={it.rotulo} onClick={it.acao} disabled={Boolean(it.etapa)}>
                  <Icone nome={it.icone} tam={18} /><span>{it.rotulo}</span>
                  {it.etapa && <em>etapa {it.etapa}</em>}
                </button>
              ))}
            </div>
          )}
          <button className="fab-botao" onClick={() => setFabAberto((x) => !x)} aria-expanded={fabAberto}>
            <Icone nome={fabAberto ? "x" : "plus"} tam={22} /><span>Novo</span>
          </button>
        </div>
      )}
      {fabAberto && <div className="fab-fundo" onClick={() => setFabAberto(false)} />}

      {formCliente && <FormCliente inicial={formCliente} aoFechar={() => setFormCliente(null)} aoSalvar={salvarCliente} />}
      {formPet && <FormPet inicial={formPet} clientes={clientes} aoFechar={() => setFormPet(null)} aoSalvar={salvarPet} />}
      {petSel && !formPet && (
        <FichaPet pet={petSel} cliente={clientes.find((c) => c.id === petSel.clienteId)} historico={historico}
          aoFechar={() => setPetAberto(null)} editar={() => setFormPet(petSel)} excluir={() => pedirExclusaoPet(petSel)}
          abrirCliente={abrirCliente} podeExcluir={podeExcluir} />
      )}
      {confirmacao && <Confirmar titulo={confirmacao.titulo} texto={confirmacao.texto} aoConfirmar={confirmacao.acao} aoFechar={() => setConfirmacao(null)} />}
      <Toast msg={toast} />
    </div>
  );
}

// =====================================================================
//  PEDIDOS DE AGENDAMENTO QUE CHEGAM PELO SITE (painel do sistema)
// =====================================================================
function PainelPedidos({ pedidos, clientes, mudarStatus, cadastrar }) {
  const hoje = hojeISO();
  const lista = pedidos
    .filter((p) => p.status === "novo" || (p.status === "confirmado" && (p.data || "") >= hoje))
    .sort((a, b) => (a.status === b.status ? `${a.data}${a.horario}`.localeCompare(`${b.data}${b.horario}`) : a.status === "novo" ? -1 : 1));
  const whatsDe = new Set(clientes.map((c) => soDigitos(c.whatsapp || c.telefone)).filter(Boolean));
  return (
    <section className="painel painel-pedidos">
      <div className="painel-topo">
        <h2>Pedidos pelo site</h2>
        <Icone nome="globo" />
      </div>
      {lista.length === 0 ? (
        <p className="texto-suave">Nenhum pedido novo. Quando alguém pedir horário pelo site, aparece aqui na hora.</p>
      ) : (
        <ul className="pedidos">
          {lista.map((p) => {
            const jaCliente = p.clienteCadastrado || whatsDe.has(soDigitos(p.whatsapp));
            const msg = `Olá, ${primeiroNome(p.nome)}! Aqui é do ${EMPRESA.nome} 🐶\nRecebemos seu pedido de ${(p.servicos || []).join(", ")} para o(a) ${p.pet} no dia ${fmtData(p.data)} às ${p.horario}. Podemos confirmar?`;
            return (
              <li key={p.id} className={`pedido pedido-${p.status}`}>
                <div className="pedido-info">
                  <div className="pedido-linha1">
                    <strong>{p.nome}</strong>
                    <span className={`chip ${p.status === "novo" ? "chip-ouro" : ""}`}>{p.status === "novo" ? "novo" : "confirmado"}</span>
                  </div>
                  <span>🐾 {p.pet}{p.especie ? ` (${p.especie}${p.porte ? ", " + p.porte.toLowerCase() : ""})` : ""} · {(p.servicos || []).join(", ")}</span>
                  <span className="texto-suave peq">📅 {fmtData(p.data)} às {p.horario} · {fmtTel(p.whatsapp)}</span>
                  {p.observacoes && <span className="texto-suave peq">“{p.observacoes}”</span>}
                </div>
                <div className="pedido-acoes">
                  <a className="btn btn-whats btn-peq" href={linkWhats(p.whatsapp, msg)} target="_blank" rel="noreferrer"><Icone nome="whats" tam={15} /> WhatsApp</a>
                  {p.status === "novo" && <button className="btn btn-ouro btn-peq" onClick={() => mudarStatus(p, "confirmado")}><Icone nome="check" tam={15} /> Confirmar</button>}
                  {!jaCliente && <button className="btn btn-leve btn-peq" onClick={() => cadastrar(p)}><Icone nome="plus" tam={15} /> Cadastrar cliente</button>}
                  <button className="btn-icone" title="Arquivar pedido" aria-label="Arquivar pedido" onClick={() => mudarStatus(p, "arquivado")}><Icone nome="x" tam={16} /></button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <p className="texto-suave peq pedidos-nota">Quando a Agenda (etapa 2) ficar pronta, o pedido confirmado vira um agendamento de verdade.</p>
    </section>
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
const HORARIOS_SITE = (() => {
  const l = [];
  for (let h = 8; h <= 18; h++) { l.push(`${String(h).padStart(2, "0")}:00`); if (h < 18) l.push(`${String(h).padStart(2, "0")}:30`); }
  return l;
})();

function AgendarSite({ aoFechar, servicoInicial }) {
  const mimi = useMimi();
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
    if (!f.horario) return setErro("Escolha o horário.");
    setErro(""); setOcupado(true);
    let salvo = false;
    try {
      const gravacao = db.adicionar("pedidos_site", { ...f, nome: f.nome.trim(), pet: f.pet.trim(), whatsapp: fmtTel(f.whatsapp), status: "novo", origem: "site" });
      const limite = new Promise((_, rej) => setTimeout(() => rej(new Error("tempo esgotado")), 8000));
      await Promise.race([gravacao, limite]);
      salvo = true;
    } catch (e) { console.error("Não foi possível salvar o pedido", e); }
    const msg = `Olá! Gostaria de agendar no ${EMPRESA.nome} 🐶\nNome: ${f.nome.trim()}\nPet: ${f.pet.trim()} (${f.especie}, porte ${f.porte.toLowerCase()})\nServiço: ${f.servicos.join(", ")}\nData: ${fmtData(f.data)} às ${f.horario}${f.observacoes ? `\nObs.: ${f.observacoes}` : ""}`;
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
          <a className="btn btn-whats btn-cheio" href={linkWhats(EMPRESA.whatsapp, enviado.msg)} target="_blank" rel="noreferrer">
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
        {SERVICOS_SITE.map((s) => (
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
            <option value="">Escolha…</option>{HORARIOS_SITE.map((h) => <option key={h}>{h}</option>)}
          </select>
        </Campo>
      </div>
      <Campo rotulo="Algo que a gente precise saber?" largo><textarea rows={2} value={f.observacoes} onChange={mudar("observacoes")} placeholder="Ex.: tem alergia, fica nervoso com secador…" /></Campo>
      <p className="texto-suave peq">O horário é confirmado pela nossa equipe pelo WhatsApp.</p>
    </Modal>
  );
}

function Site() {
  const [agendar, setAgendar] = useState(null);
  const irPara = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  const abrirAgenda = (servico) => setAgendar({ servico: servico || "" });
  const msgWhats = `Olá! Vim pelo site do ${EMPRESA.nome} 🐶`;

  return (
    <div className="site">
      <header className="site-topo">
        <button className="site-marca" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <img src={LOGO} alt="" />
          <span><strong>Mimi Dog's</strong><em>Pet Shop</em></span>
        </button>
        <nav className="site-nav">
          <button onClick={() => irPara("servicos")}>Serviços</button>
          <button onClick={() => irPara("sobre")}>Sobre</button>
          <button onClick={() => irPara("contato")}>Contato</button>
        </nav>
        <button className="btn btn-ouro" onClick={() => abrirAgenda()}>Agendar horário</button>
      </header>

      <section className="site-hero">
        <div className="site-bolhas" aria-hidden="true"><i /><i /><i /><i /><i /></div>
        <div className="site-hero-texto">
          <span className="site-selo">Agenda da semana aberta!</span>
          <h1>Cuidado e carinho que seu dog merece</h1>
          <p>Banho, tosa, hidratação e escovação com muito amor. Aqui seu pet sai sempre limpo, cheiroso e feliz.</p>
          <div className="site-hero-acoes">
            <button className="btn btn-ouro btn-grande" onClick={() => abrirAgenda()}><Icone nome="calendar" tam={20} /> Agende seu horário</button>
            <a className="btn btn-contorno btn-grande" href={linkWhats(EMPRESA.whatsapp, msgWhats)} target="_blank" rel="noreferrer"><Icone nome="whats" tam={20} /> {fmtTel(EMPRESA.whatsapp)}</a>
          </div>
        </div>
        <div className="site-hero-logo"><img src={LOGO} alt="Logo Mimi Dog's Pet Shop" /></div>
        <svg className="site-onda" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true"><path d="M0 40c240 40 480 40 720 20s480-50 720-10v30H0z" fill="var(--ceu)" /></svg>
      </section>

      <section className="site-secao" id="servicos">
        <h2 className="site-titulo">Nossos serviços</h2>
        <p className="site-sub">Toque em um serviço para já pedir o seu horário.</p>
        <div className="site-servicos">
          {SERVICOS_SITE.map((s) => (
            <button key={s.nome} className="site-servico" onClick={() => abrirAgenda(s.nome)}>
              <span className="site-servico-icone"><Icone nome={s.icone} tam={30} /></span>
              <strong>{s.nome}</strong>
              <span>{s.texto}</span>
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
          <a className="site-contato" href={linkWhats(EMPRESA.whatsapp, msgWhats)} target="_blank" rel="noreferrer">
            <span className="site-contato-icone"><Icone nome="whats" tam={26} /></span>
            <div><em>Agende já!</em><strong>{fmtTel(EMPRESA.whatsapp)}</strong></div>
          </a>
          <a className="site-contato" href={linkMapa()} target="_blank" rel="noreferrer">
            <span className="site-contato-icone"><Icone nome="map" tam={26} /></span>
            <div><em>Localização</em><strong>{EMPRESA.endereco}</strong></div>
          </a>
          <div className="site-contato">
            <span className="site-contato-icone"><Icone nome="heart" tam={26} /></span>
            <div><em>Atendimento</em><strong>com muito amor</strong></div>
          </div>
        </div>
      </section>

      <footer className="site-rodape">
        <img src={LOGO} alt="" />
        <p className="site-obrigado">Obrigado pela confiança! 💙</p>
        <p className="site-rodape-info">{EMPRESA.nome} · {EMPRESA.endereco} · {fmtTel(EMPRESA.whatsapp)}</p>
        <a href="#/sistema" className="site-area">Área do pet shop</a>
      </footer>

      <a className="site-whats-flutuante" href={linkWhats(EMPRESA.whatsapp, msgWhats)} target="_blank" rel="noreferrer" aria-label="Falar no WhatsApp">
        <Icone nome="whats" tam={28} />
      </a>

      {agendar && <AgendarSite servicoInicial={agendar.servico} aoFechar={() => setAgendar(null)} />}
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
  const dadosDicas = useRef({ clientes: 0, pets: 0 });
  const [rota, setRota] = useState(lerRota);

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
  }, [rota]);

  useEffect(() => {
    if (!usuario || rota !== "sistema") return undefined;
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
        <div className="site-raiz">
          <MimiProvider ativa={mimiAtiva} dicas={DICAS_SITE}>
            <Site />
            {botaoMimi}
          </MimiProvider>
        </div>
      </>
    );
  }

  if (usuario === undefined) {
    return (<><style>{CSS}</style><div className="carregando"><img src={LOGO} alt="Carregando" /></div></>);
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
@media (prefers-reduced-motion:reduce){
  *,*::before,*::after{animation-duration:.01ms !important;animation-iteration-count:1 !important;transition-duration:.01ms !important}
}
`;
