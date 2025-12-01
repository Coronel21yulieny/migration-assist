"use client";

/**
 * Auth en cliente (localStorage).
 * Mantiene tu API original y agrega helpers para enviar x-user-id al backend.
 */

export type User = { id: string; name: string; email: string; password: string };

const USERS_KEY = "ma:users";
const CURRENT_KEY = "ma:currentUser";

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

/* ====== ANEXOS ====== */

/** Igual que getCurrentUser, nombre explícito por si lo necesitas */
export function getCurrentUserClient():
  | { id: string; name: string; email: string }
  | null {
  if (!hasWindow()) return null;
  try { return JSON.parse(localStorage.getItem(CURRENT_KEY) || "null"); } catch { return null; }
}

/** Devuelve solo el ID actual (o null) */
export function getCurrentUserId(_req: unknown): string | null {
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

/** fetch que ya manda x-user-id si hay usuario logueado */
export async function authedFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const headers = authHeaders(init.headers);
  return fetch(input, { ...init, headers });
}

/* ====== mejoras MVP ====== */

/** Fallback de uuid para navegadores sin crypto.randomUUID */
const uid = () =>
  (typeof crypto !== "undefined" && (crypto as any).randomUUID?.()) ||
  `u_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;

/** Dev user automático (para demo/MVP sin exigir login previo) */
export function ensureDevUser() {
  if (!hasWindow()) return null;
  const current = getCurrentUser();
  if (current) return current;

  const users = readUsers();
  let u = users.find(x => x.email === "dev@example.com");
  if (!u) {
    u = { id: uid(), name: "Dev User", email: "dev@example.com", password: "dev" };
    users.push(u);
    writeUsers(users);
  }
  const minimal = { id: u.id, name: u.name, email: u.email };
  localStorage.setItem(CURRENT_KEY, JSON.stringify(minimal));
  return minimal;
}

/** Igual que authedFetch pero garantiza un x-user-id (login o dev) */
export async function authedFetchWithFallback(input: RequestInfo | URL, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});
  const current = getCurrentUser() || ensureDevUser();
  if (current && !headers.has("x-user-id")) headers.set("x-user-id", current.id);
  return fetch(input, { ...init, headers });
}

/* ======== Enums (referencia) ======== */
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
