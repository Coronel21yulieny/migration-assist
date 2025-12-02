"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 🔥 MODO DEMO:
    // No llama a ningún servidor, no hace fetch, no valida nada.
    // Solo muestra un pequeño delay y redirige a /opciones.
    setTimeout(() => {
      setLoading(false);
      router.push("/opciones");
    }, 800);
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

          <button type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p style={{ marginTop: 12 }}>
          ¿No tienes cuenta?{" "}
          <a href="/auth/register">Crear cuenta (solo visual)</a>
        </p>
      </div>
    </main>
  );
}
