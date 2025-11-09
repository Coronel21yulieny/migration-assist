// app/auth/page.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const registerSchema = z.object({
  name: z.string().min(2, "Tu nombre es muy corto"),
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

export default function AuthPage() {
  const [tab, setTab] = useState<"login" | "register">("register");

  const reg = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
  });
  const log = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  async function onRegister(values: z.infer<typeof registerSchema>) {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "Error registrando");
    window.location.href = "/opciones";
  }

  async function onLogin(values: z.infer<typeof loginSchema>) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "Credenciales inválidas");
    window.location.href = "/opciones";
  }

  return (
    <div className="authWrap">
      <div className="card">
        <div className="tabs">
          <button
            className={`tab ${tab === "login" ? "active" : ""}`}
            onClick={() => setTab("login")}
          >
            Iniciar sesión
          </button>
          <button
            className={`tab ${tab === "register" ? "active" : ""}`}
            onClick={() => setTab("register")}
          >
            Crear cuenta
          </button>
        </div>

        <h1 className="title">
          {tab === "register" ? "Crear cuenta" : "Bienvenido de nuevo"}
        </h1>

        {tab === "register" ? (
          <form onSubmit={reg.handleSubmit(onRegister)} className="form">
            <label className="label">
              Nombre
              <input
                className="input"
                placeholder="Tu nombre"
                {...reg.register("name")}
              />
              <span className="error">{reg.formState.errors.name?.message}</span>
            </label>

            <label className="label">
              Correo electrónico
              <input
                className="input"
                placeholder="tucorreo@ejemplo.com"
                {...reg.register("email")}
              />
              <span className="error">{reg.formState.errors.email?.message}</span>
            </label>

            <label className="label">
              Contraseña
              <input
                type="password"
                className="input"
                placeholder="Mínimo 6 caracteres"
                {...reg.register("password")}
              />
              <span className="error">
                {reg.formState.errors.password?.message}
              </span>
            </label>

            <button className="primaryBtn" type="submit">
              Registrar
            </button>

            <p className="switch">
              ¿Ya tienes una cuenta?{" "}
              <a onClick={() => setTab("login")}>Inicia sesión</a>
            </p>
          </form>
        ) : (
          <form onSubmit={log.handleSubmit(onLogin)} className="form">
            <label className="label">
              Correo electrónico
              <input
                className="input"
                placeholder="tucorreo@ejemplo.com"
                {...log.register("email")}
              />
              <span className="error">{log.formState.errors.email?.message}</span>
            </label>

            <label className="label">
              Contraseña
              <input
                type="password"
                className="input"
                placeholder="Tu contraseña"
                {...log.register("password")}
              />
              <span className="error">
                {log.formState.errors.password?.message}
              </span>
            </label>

            <button className="primaryBtn" type="submit">
              Entrar
            </button>

            <p className="switch">
              ¿No tienes cuenta? <a onClick={() => setTab("register")}>Crear cuenta</a>
            </p>
          </form>
        )}
      </div>

      {/* 🎨 Estilos: fondo translúcido más oscuro, se ve más la estatua */}
      <style jsx>{`
        .authWrap {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 24px;
        }

        .card {
          width: 100%;
          max-width: 460px;
          /* 🔸 Ajuste clave: menos blanco, más transparencia, más contraste */
          background: rgba(255, 255, 255, 0.55);
          backdrop-filter: blur(12px) brightness(0.9) contrast(1.05);
          border-radius: 22px;
          box-shadow: 0 20px 60px rgba(15, 23, 42, 0.4);
          padding: 28px 26px 32px;
          border: 1px solid rgba(15, 23, 42, 0.12);
          transition: all 0.25s ease;
        }
        .card:hover {
          background: rgba(255, 255, 255, 0.65);
          box-shadow: 0 26px 70px rgba(15, 23, 42, 0.45);
        }

        .tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 12px;
        }
        .tab {
          padding: 11px 12px;
          border-radius: 12px;
          border: 1px solid rgba(15, 23, 42, 0.14);
          background: rgba(255, 255, 255, 0.86);
          font-weight: 800;
          color: #0f172a;
          transition: all 0.18s ease;
        }
        .tab:hover {
          box-shadow: 0 10px 20px rgba(2, 6, 23, 0.08);
          transform: translateY(-1px);
        }
        .tab.active {
          background: linear-gradient(90deg, #1e3a8a, #3b82f6, #1d4ed8);
          color: #fff;
          border-color: transparent;
          box-shadow: 0 12px 24px rgba(37, 99, 235, 0.25);
        }

        .title {
          margin: 6px 0 14px;
          font-size: clamp(1.35rem, 2.4vw, 1.6rem);
          font-weight: 900;
          text-align: center;
          color: #0f172a;
        }

        .form {
          display: grid;
          gap: 12px;
        }
        .label {
          font-size: 0.95rem;
          font-weight: 700;
          color: #0f172a;
          display: grid;
          gap: 6px;
        }
        .input {
          border: 1px solid rgba(15, 23, 42, 0.18);
          border-radius: 12px;
          padding: 12px 14px;
          font-size: 1rem;
          outline: none;
          background: rgba(255, 255, 255, 0.95);
          color: #0f172a;
          transition: box-shadow 0.18s ease, border-color 0.18s ease, background 0.18s ease;
        }
        .input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.16);
          background: #fff;
        }
        .error {
          color: #dc2626;
          font-size: 0.82rem;
          min-height: 1.1em;
        }

        .primaryBtn {
          margin-top: 8px;
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          font-weight: 900;
          color: #fff;
          background: linear-gradient(90deg, #1e3a8a, #3b82f6, #1d4ed8);
          border: none;
          cursor: pointer;
          box-shadow: 0 14px 28px rgba(37, 99, 235, 0.28);
          transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }
        .primaryBtn:hover {
          transform: translateY(-1px);
          box-shadow: 0 18px 34px rgba(37, 99, 235, 0.34);
          filter: brightness(1.02);
        }

        .switch {
          margin-top: 10px;
          text-align: center;
          color: #475569;
          font-size: 0.95rem;
        }
        .switch a {
          color: #1e40af;
          font-weight: 900;
          cursor: pointer;
        }
        .switch a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
