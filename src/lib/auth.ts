"use client";

/**
 * Auth en cliente (localStorage).
 * Se mantiene tu API tal cual y se anexan helpers para enviar x-user-id al backend.
 */

export type User = { id: string; name: string; email: string; password: string };

const USERS_KEY = "ma:users";
const CURRENT_KEY = "ma:currentUser";
const uid = () => crypto.randomUUID();

/* ====== utilidades internas ====== */
function hasWindow() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function readUsers(): User[] {
  if (!hasWindow()) return [];
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || "[]"); } catch { return []; }
}
function writeUsers(users: User[]) {
  if (!hasWindow()) return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/* ====== API pública original (sin cambios) ====== */
export function registerUser(name: string, email: string, password: string) {
  const users = readUsers();
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error("Este correo ya está registrado.");
  }
  const user: User = { id: uid(), name, email, password };
  users.push(user);
  writeUsers(users);
  if (hasWindow()) {
    localStorage.setItem(CURRENT_KEY, JSON.stringify({ id: user.id, name: user.name, email: user.email }));
  }
  return user;
}

export function loginUser(email: string, password: string) {
  const user = readUsers().find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!user) throw new Error("Credenciales inválidas.");
  if (hasWindow()) {
    localStorage.setItem(CURRENT_KEY, JSON.stringify({ id: user.id, name: user.name, email: user.email }));
  }
  return user;
}

export function logoutUser() { if (hasWindow()) localStorage.removeItem(CURRENT_KEY); }

export function getCurrentUser(): { id: string; name: string; email: string } | null {
  if (!hasWindow()) return null;
  try { return JSON.parse(localStorage.getItem(CURRENT_KEY) || "null"); } catch { return null; }
}

/* ====== ANEXOS (para arreglar el userId en el backend) ====== */

/** Igual que getCurrentUser, nombre explícito por si lo necesitas */
export function getCurrentUserClient():
  | { id: string; name: string; email: string }
  | null {
  if (!hasWindow()) return null;
  try { return JSON.parse(localStorage.getItem(CURRENT_KEY) || "null"); } catch { return null; }
}

/** Devuelve solo el ID actual (o null) */
export function getCurrentUserId(req: unknown): string | null {
  const u = getCurrentUserClient();
  return u?.id ?? null;
}

/** Construye headers con x-user-id para el backend (no pisa headers existentes) */
export function authHeaders(extra?: HeadersInit): HeadersInit {
  const base = new Headers(extra || {});
  const id = (typeof window !== 'undefined' ? getCurrentUser()?.id : null);
  if (id && !base.has('x-user-id')) base.set('x-user-id', id);
  return base;
}


/** fetch que ya manda x-user-id. Úsalo en lugar de fetch normal. */
export async function authedFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const headers = authHeaders(init.headers);
  return fetch(input, { ...init, headers });
}
// ======== KC enums (solo referencia) ==================================
// Úsalos en el cliente para mantener nombres consistentes en toda la app.
// Nota: estos son strings; son iguales a los valores que espera la BD.

export const KCType = {
  I589: 'I589',
  I765: 'I765',
} as const;
export type KCType = typeof KCType[keyof typeof KCType];

export const KCStatus = {
  DRAFT: 'DRAFT',
  READY_FOR_REVIEW: 'READY_FOR_REVIEW',
  FILED: 'FILED',
  REJECTED: 'REJECTED',
  APPROVED: 'APPROVED',
} as const;
export type KCStatus = typeof KCStatus[keyof typeof KCStatus];
