"use client";

export type DocType = "I-589";
export type Doc = {
  id: string;
  userId: string;
  type: DocType;
  title: string;
  createdAt: number;   // fecha de creación
  expiresAt: number;   // fecha de vencimiento (30 días)
  updatedAt: number;   // última vez que se modificó
  data: any;           // aquí se guarda el contenido del formulario
  status: "draft" | "completed" | "expired";
};

const DOCS_KEY = "ma:docs";
const DAYS_30 = 30 * 24 * 60 * 60 * 1000;

const now = () => Date.now();
const uid = () => crypto.randomUUID();

function readDocs(): Doc[] {
  try {
    return JSON.parse(localStorage.getItem(DOCS_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeDocs(docs: Doc[]) {
  localStorage.setItem(DOCS_KEY, JSON.stringify(docs));
}

// Verifica si un documento ya está vencido
function applyExpiry(doc: Doc): Doc {
  if (now() > doc.expiresAt && doc.status !== "expired") {
    doc.status = "expired";
  }
  return doc;
}

// Crear un nuevo documento (ej. I-589)
export function createDoc(userId: string, type: DocType, title?: string): Doc {
  const createdAt = now();
  const doc: Doc = {
    id: uid(),
    userId,
    type,
    title: title || `${type} — ${new Date(createdAt).toLocaleDateString()}`,
    createdAt,
    expiresAt: createdAt + DAYS_30,
    updatedAt: createdAt,
    data: {},
    status: "draft",
  };
  const docs = readDocs();
  docs.push(doc);
  writeDocs(docs);
  return doc;
}

// Listar documentos del usuario
export function listDocs(userId: string): Doc[] {
  return readDocs().map(applyExpiry).filter(d => d.userId === userId);
}

// Obtener un documento por id
export function getDoc(userId: string, docId: string): Doc | null {
  const d = readDocs().find(d => d.userId === userId && d.id === docId);
  return d ? applyExpiry(d) : null;
}

// Guardar cambios (editar formulario)
export function saveDoc(userId: string, docId: string, data: any) {
  const docs = readDocs();
  const i = docs.findIndex(d => d.userId === userId && d.id === docId);
  if (i === -1) throw new Error("Documento no encontrado");
  docs[i].data = data;
  docs[i].updatedAt = now();
  docs[i] = applyExpiry(docs[i]);
  writeDocs(docs);
}

// Marcar documento como completado
export function completeDoc(userId: string, docId: string) {
  const docs = readDocs();
  const i = docs.findIndex(d => d.userId === userId && d.id === docId);
  if (i === -1) throw new Error("Documento no encontrado");
  docs[i].status = "completed";
  docs[i].updatedAt = now();
  writeDocs(docs);
}

// Días restantes para expirar
export function daysLeft(doc: Doc): number {
  const ms = doc.expiresAt - now();
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}
