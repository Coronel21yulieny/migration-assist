"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Credenciales inválidas");
      // aquí ya viene la cookie 'session'
      router.push("/opciones"); // o a donde quieras
    } catch (err: any) {
      setError(err?.message || "Error al iniciar sesión");
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
            <span>Correo</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </label>
          <label>
            <span>Contraseña</span>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          </label>
          {error && <p className="error">{error}</p>}
          <button disabled={loading}>{loading ? "Entrando..." : "Entrar"}</button>
        </form>
        <p style={{ marginTop: 12 }}>
          ¿No tienes cuenta? <a href="/auth/register">Crear cuenta</a>
        </p>
      </div>
    </main>
  );
}
