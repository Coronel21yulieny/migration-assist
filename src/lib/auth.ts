"use client";

export type User = { id: string; name: string; email: string; password: string };

const USERS_KEY = "ma:users";
const CURRENT_KEY = "ma:currentUser";
const uid = () => crypto.randomUUID();

function readUsers(): User[] {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || "[]"); } catch { return []; }
}
function writeUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function registerUser(name: string, email: string, password: string) {
  const users = readUsers();
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error("Este correo ya está registrado.");
  }
  const user: User = { id: uid(), name, email, password };
  users.push(user);
  writeUsers(users);
  localStorage.setItem(CURRENT_KEY, JSON.stringify({ id: user.id, name: user.name, email: user.email }));
  return user;
}

export function loginUser(email: string, password: string) {
  const user = readUsers().find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!user) throw new Error("Credenciales inválidas.");
  localStorage.setItem(CURRENT_KEY, JSON.stringify({ id: user.id, name: user.name, email: user.email }));
  return user;
}

export function logoutUser() { localStorage.removeItem(CURRENT_KEY); }

export function getCurrentUser(): { id: string; name: string; email: string } | null {
  try { return JSON.parse(localStorage.getItem(CURRENT_KEY) || "null"); } catch { return null; }
}
