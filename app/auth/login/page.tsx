"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/auth"; // 👈 usa tu auth de localStorage

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 🔑 login directo en localStorage: NO fetch, NO servidor
      loginUser(email, password);

      // si todo va bien, redirigimos a opciones (o donde quieras)
      router.push("/opciones");
    } catch (err: any) {
      // loginUser lanza "Credenciales inválidas." si no coincide
      setError(err?.message || "Credenciales inválidas.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="hero">
      <div className="auth-card">
        <h1>Iniciar sesión</h1>

        <form onSubmit={onSubmit} className="form">
          <label>
            <span>Correo electrónico</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label>
            <span>Contraseña</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error && <p className="error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p style={{ marginTop: 12 }}>
          ¿No tienes cuenta?{" "}
          <a href="/auth/register">Crear cuenta</a>
        </p>
      </div>
    </main>
  );
}
