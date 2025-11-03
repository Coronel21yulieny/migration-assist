"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Inter } from "next/font/google";
// Si tienes una función de login:
// import { loginUser } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"] });

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    try {
      // await loginUser(email, password);
      router.push("/dashboard");
    } catch (e: any) {
      setErr(e?.message || "Error al iniciar sesión");
    }
  };

  return (
    <main className={`hero ${inter.className}`}>
      <div className="auth-card">
        <header className="card-header">
          <div className="logo-badge">MA</div>
          <h1 className="title">Iniciar sesión</h1>
          <p className="subtitle">Bienvenido de vuelta a <b>Migration Assist</b>.</p>
        </header>

        <form onSubmit={onSubmit} className="form">
          <label className="field">
            <span>Correo electrónico</span>
            <input
              className="input"
              type="email"
              placeholder="tucorreo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label className="field">
            <span>Contraseña</span>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          {err && <p className="error">{err}</p>}

          <div className="actions">
            <button type="submit" className="btn btn-primary btn-sm w-full">
              Entrar
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm w-full"
              onClick={() => router.push("/register")}
            >
              Crear una cuenta
            </button>
          </div>

          <div className="links">
            <a href="#" className="link">¿Olvidaste tu contraseña?</a>
          </div>
        </form>

        <footer className="card-footer">
          <p>
            Protegemos tus datos con buenas prácticas de seguridad.
          </p>
        </footer>
      </div>

      {/* ======= ESTILOS GLOBALES (UI Pro) ======= */}
      <style jsx global>{`
        :root {
          --brand-700: #083b6c;
          --brand-600: #0a467f;
          --brand-500: #0b4c8c;
          --ink-900: #0f172a;
          --ink-700: #334155;
          --ink-600: #475569;
          --ink-500: #64748b;
          --paper: #ffffff;
          --paper-muted: #f8fafc;
          --border: #e5e7eb;
          --ring: #93c5fd;
        }

        /* ===== Fondo clarito con overlay blanco que atenúa la imagen ===== */
        .hero {
          position: relative;
          min-height: 100svh;
          display: grid;
          place-items: center;
          padding: 24px;

          /* Opción A (sin imagen): */
          background:
            radial-gradient(1200px 600px at 15% -10%, rgba(11, 76, 140, 0.12), transparent 60%),
            radial-gradient(1200px 600px at 115% 110%, rgba(11, 76, 140, 0.10), transparent 60%),
            #eef2f7;

          /* Opción B (con imagen, súper atenuada):
             background: url('/usa-flag.jpg') center/cover no-repeat; */
        }
        .hero::before {
          content: "";
          position: absolute;
          inset: 0;
          /* overlay que "blanquea" bastante la imagen */
          background: linear-gradient(180deg, rgba(255,255,255,.78), rgba(255,255,255,.58));
          backdrop-filter: blur(5px);
          z-index: 1;
        }
        .hero > * { position: relative; z-index: 2; }

        /* ===== Card ===== */
        .auth-card {
          width: 100%;
          max-width: 430px;
          border-radius: 20px;
          background: rgba(255,255,255,.92);
          border: 1px solid var(--border);
          box-shadow: 0 14px 40px rgba(2,6,23,.08);
          backdrop-filter: blur(6px);
          padding: 24px 22px 18px;
        }

        .card-header { text-align: center; margin-bottom: 8px; }
        .logo-badge {
          width: 48px; height: 48px; margin: 0 auto 10px; border-radius: 9999px;
          display: grid; place-items: center; font-weight: 800; color: #fff;
          background: linear-gradient(180deg, var(--brand-500), var(--brand-700));
          box-shadow: 0 8px 22px rgba(11,76,140,.28);
        }
        .title { margin: 0; font-size: 1.55rem; font-weight: 900; color: var(--ink-900); }
        .subtitle { margin: 6px 0 0; font-size: .95rem; color: var(--ink-600); }

        /* ===== Form ===== */
        .form { display: grid; gap: 12px; margin-top: 10px; }
        .field { display: grid; gap: 6px; }
        .field > span { font-size: .85rem; color: var(--ink-700); font-weight: 600; }

        .input {
          width: 100%;
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 10px 12px;
          font-size: .95rem;
          color: var(--ink-900);
          transition: border-color .18s ease, box-shadow .18s ease, transform .06s ease;
        }
        .input::placeholder { color: var(--ink-500); }
        .input:focus-visible {
          outline: none; border-color: var(--brand-500); box-shadow: 0 0 0 3px var(--ring);
        }

        .error { color: #dc2626; font-size: .9rem; text-align: center; }

        .actions { display: grid; gap: 8px; margin-top: 4px; }

        .links { margin-top: 6px; text-align: center; }
        .link { color: var(--brand-600); font-weight: 700; text-decoration: none; font-size: .9rem; }
        .link:hover { text-decoration: underline; }

        /* ===== Botones pequeños profesionales ===== */
        .btn {
          display: inline-block;
          padding: .62rem 1rem;
          border-radius: 9999px;
          border: 0;
          font-weight: 800;
          font-size: .9rem;
          letter-spacing: .2px;
          line-height: 1;
          transition: all .18s ease;
          cursor: pointer;
          text-align: center;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }
        .btn-sm { padding: .55rem .9rem; font-size: .88rem; }
        .w-full { width: 100%; }

        .btn-primary {
          background: linear-gradient(180deg, var(--brand-500), var(--brand-700));
          color: #fff;
          box-shadow: 0 8px 18px rgba(11,76,140,.24);
        }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 12px 26px rgba(11,76,140,.30); }
        .btn-primary:focus-visible { outline: none; box-shadow: 0 0 0 3px var(--ring); }

        .btn-outline {
          background: #fff;
          color: var(--brand-700);
          border: 1px solid #dbe2ea;
          box-shadow: 0 1px 2px rgba(2,6,23,.04);
        }
        .btn-outline:hover { background: var(--paper-muted); border-color: #cfd8e3; transform: translateY(-1px); }
        .btn-outline:focus-visible { outline: none; box-shadow: 0 0 0 3px var(--ring); }

        .card-footer { margin-top: 10px; text-align: center; color: var(--ink-500); font-size: .85rem; }
      `}</style>
    </main>
  );
}
